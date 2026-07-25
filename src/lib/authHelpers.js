import { supabase } from './supabaseClient';
import { checkRateLimit, recordAttempt, lockoutMessage } from './rateLimiter';

/**
 * Auth + access-control helpers. Every function returns a normalized shape:
 *   { data, error }  where `error` is a user-facing string (or null).
 */

// ---------------------------------------------------------------------------
// Password generation
// ---------------------------------------------------------------------------

/**
 * Generate a random 12-char temp password containing at least one lower,
 * upper, digit and symbol (satisfies typical Supabase password policies).
 */
export function generateTempPassword() {
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const symbols = '!@#$%&*?';
  const all = lower + upper + digits + symbols;

  const rand = (set) => set[Math.floor(cryptoRandom() * set.length)];

  const required = [rand(lower), rand(upper), rand(digits), rand(symbols)];
  const remaining = Array.from({ length: 8 }, () => rand(all));
  const chars = [...required, ...remaining];

  // Fisher–Yates shuffle so the required chars aren't always at the front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(cryptoRandom() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

function cryptoRandom() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / (0xffffffff + 1);
  }
  return Math.random();
}

// ---------------------------------------------------------------------------
// Error normalization
// ---------------------------------------------------------------------------

function friendlyAuthError(err) {
  if (!err) return 'An unexpected error occurred.';
  const msg = (err.message || String(err)).toLowerCase();

  if (msg.includes('invalid login credentials')) return 'Incorrect username or password.';
  if (msg.includes('email not confirmed')) return 'Your account is not active yet. Please try again shortly.';
  if (msg.includes('user already registered') || msg.includes('already been registered'))
    return 'Username already taken.';
  if (msg.includes('password should be at least'))
    return 'Password is too short. Use at least 6 characters.';
  if (msg.includes('rate limit') || msg.includes('too many'))
    return 'Too many requests. Please wait a moment and try again.';
  if (msg.includes('network') || msg.includes('fetch'))
    return 'Network error. Check your connection and try again.';
  return err.message || 'An unexpected error occurred.';
}

// ---------------------------------------------------------------------------
// Username handling
// ---------------------------------------------------------------------------

/**
 * Internal email domain — never shown to or typed by users. Internal emails are
 * random (UUID-based) so they can never be guessed and never collide, and no
 * real inbox exists (nothing is ever sent to them).
 */
const INTERNAL_EMAIL_DOMAIN = 'internal.local';

/** Normalize a username: trimmed + lowercased for consistent storage/lookup. */
export function normalizeUsername(username) {
  return (username || '').trim().toLowerCase();
}

/**
 * Generate a random UUID-based internal email used only for Supabase Auth.
 * This value is NEVER shown to or typed by users — it exists purely to satisfy
 * Supabase's email requirement for a login identity. Because it's random, no
 * email is ever sent anywhere and there are no rate limits to hit.
 * e.g. "550e8400-e29b-41d4-a716-446655440000@internal.local"
 */
export function generateInternalEmail() {
  let uuid;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    uuid = crypto.randomUUID();
  } else {
    // Fallback UUIDv4 generator.
    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.floor(cryptoRandom() * 16);
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  return `${uuid}@${INTERNAL_EMAIL_DOMAIN}`;
}

/**
 * Validate a username: 3–20 chars, letters/digits/underscore/dash only.
 * Returns an error string, or null when valid.
 */
export function validateUsername(username) {
  const u = normalizeUsername(username);
  if (!u) return 'Please enter a username.';
  if (u.length < 3 || u.length > 20)
    return 'Username must be between 3 and 20 characters.';
  if (!/^[a-z0-9_-]+$/.test(u))
    return 'Invalid username format. Use 3–20 letters, numbers, underscores or dashes.';
  return null;
}

/**
 * Check whether a username is already taken within an org. Uses the
 * `username_exists(org_name, u)` RPC (SECURITY DEFINER) so it works even for
 * anonymous callers, since RLS on user_profiles blocks direct reads.
 * Best-effort: if the RPC errors we return { taken: false } and let the signUp
 * call be the source of truth.
 */
export async function isUsernameTaken(orgName, username) {
  const u = normalizeUsername(username);
  try {
    const { data, error } = await supabase.rpc('username_exists', {
      org_name: (orgName || '').trim(),
      u,
    });
    if (error) return { taken: false, error: null };
    return { taken: !!data, error: null };
  } catch {
    return { taken: false, error: null };
  }
}

/**
 * Resolve (org name, username) to the internal login email via the
 * `email_for_username(org_name, u)` RPC (SECURITY DEFINER). Returns null when
 * there is no match. The internal email is used only internally for Supabase
 * sign-in — it is never surfaced to the user.
 */
export async function emailForUsername(orgName, username) {
  const u = normalizeUsername(username);
  try {
    const { data, error } = await supabase.rpc('email_for_username', {
      org_name: (orgName || '').trim(),
      u,
    });
    if (error) return null;
    return data || null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------

/**
 * Sign in by organization + username with rate limiting. The (org, username)
 * pair is resolved to its internal login email via an RPC (the email is never
 * shown to the user). Records an attempt regardless of outcome. This is a hard
 * cutover: there is no legacy username-derived email fallback — every account
 * now lives inside an org.
 */
export async function signIn(orgName, username, password) {
  const cleanOrg = (orgName || '').trim();
  const cleanUsername = normalizeUsername(username);
  // Namespace the rate-limit identifier by org so lockouts don't collide across
  // (future) orgs that happen to share a username.
  const rateLimitId = `${cleanOrg}:${cleanUsername}`;

  const limit = await checkRateLimit(rateLimitId, 'login');
  if (!limit.allowed) {
    return { data: null, error: lockoutMessage(limit.lockedUntil), lockedUntil: limit.lockedUntil };
  }

  // Resolve the internal email for this (org, username). No legacy fallback.
  const internalEmail = await emailForUsername(cleanOrg, cleanUsername);
  if (!internalEmail) {
    await recordAttempt(rateLimitId, 'login', false);
    const post = await checkRateLimit(rateLimitId, 'login');
    if (!post.allowed) {
      return { data: null, error: lockoutMessage(post.lockedUntil), lockedUntil: post.lockedUntil };
    }
    return { data: null, error: 'Incorrect username or password.', remainingAttempts: post.remainingAttempts };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: internalEmail,
      password,
    });

    if (error) {
      await recordAttempt(rateLimitId, 'login', false);
      // Re-check after recording so we can surface a lockout immediately.
      const post = await checkRateLimit(rateLimitId, 'login');
      if (!post.allowed) {
        return { data: null, error: lockoutMessage(post.lockedUntil), lockedUntil: post.lockedUntil };
      }
      const remaining = post.remainingAttempts;
      const base = friendlyAuthError(error);
      const hint =
        remaining > 0 && remaining <= 3
          ? ` ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : '';
      return { data: null, error: base + hint, remainingAttempts: remaining };
    }

    await recordAttempt(rateLimitId, 'login', true);
    return { data, error: null };
  } catch (err) {
    await recordAttempt(rateLimitId, 'login', false);
    return { data: null, error: friendlyAuthError(err) };
  }
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: friendlyAuthError(err) };
  }
}

// ---------------------------------------------------------------------------
// Current user / profile
// ---------------------------------------------------------------------------

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { data: data?.user || null, error: null };
  } catch (err) {
    return { data: null, error: friendlyAuthError(err) };
  }
}

/**
 * Load the user_profiles row for the current user. Used to detect whether a
 * first-login password change is required.
 */
export async function getUserProfile(userId) {
  if (!userId) return { data: null, error: null };
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Failed to load profile:', err);
    return { data: null, error: err.message };
  }
}

/**
 * True when the user must change their password before using the app.
 * Requires a change when the profile explicitly flags it, or (for invited
 * users) when the password has never been changed.
 */
export function isPasswordChangeRequired(profile) {
  if (!profile) return false;
  if (profile.password_change_required) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Change password (first login + normal)
// ---------------------------------------------------------------------------

/**
 * Change the current user's password. When `oldPassword` is provided we
 * re-authenticate first to verify it (Supabase updateUser doesn't check the
 * old password on its own).
 */
export async function changePassword(oldPassword, newPassword) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;

    if (oldPassword && email) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: oldPassword,
      });
      if (verifyError) {
        return { data: null, error: 'Current password is incorrect.' };
      }
    }

    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;

    // Clear the first-login flag.
    if (userData?.user?.id) {
      await supabase
        .from('user_profiles')
        .update({
          password_change_required: false,
          password_changed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userData.user.id);
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: friendlyAuthError(err) };
  }
}

// ---------------------------------------------------------------------------
// Team management (org members)
// ---------------------------------------------------------------------------

/**
 * Create a new member in the current admin's organization. Creates a real auth
 * account with a generated temp password; the new user's org_id/role are stamped
 * via signup metadata → handle_new_user() trigger, so the profile is born
 * correct (no follow-up UPDATE). The new user is forced to change their password
 * on first login. Returns the temp password to display once.
 *
 * Uses the public signUp flow (anon key) rather than the admin API, so it works
 * without a service-role key on the client — we snapshot and restore the admin's
 * session around the signUp call (which otherwise swaps the active session).
 */
export async function createOrgMember(username, role = 'viewer') {
  const cleanUsername = normalizeUsername(username);

  const validationError = validateUsername(cleanUsername);
  if (validationError) return { data: null, error: validationError };
  if (!['admin', 'editor', 'viewer'].includes(role)) return { data: null, error: 'Invalid role.' };

  const internalEmail = generateInternalEmail();
  const tempPassword = generateTempPassword();

  try {
    // Resolve the admin's own org from their profile.
    const { data: adminData } = await supabase.auth.getUser();
    const adminId = adminData?.user?.id;
    if (!adminId) return { data: null, error: 'You must be signed in to add members.' };

    const { data: adminProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', adminId)
      .single();
    if (profileError) throw profileError;
    const organizationId = adminProfile?.organization_id;
    if (!organizationId) return { data: null, error: 'Your account is not linked to an organization.' };

    // Preserve the current session — signUp swaps the active session to the
    // newly created user, so we snapshot and restore it afterwards.
    const { data: sessionData } = await supabase.auth.getSession();
    const currentSession = sessionData?.session;

    const { error: signUpError } = await supabase.auth.signUp({
      email: internalEmail,
      password: tempPassword,
      options: {
        data: {
          username: cleanUsername,
          organization_id: organizationId,
          role,
          password_change_required: true,
        },
      },
    });

    // Restore the admin's own session immediately.
    if (currentSession) {
      await supabase.auth.setSession({
        access_token: currentSession.access_token,
        refresh_token: currentSession.refresh_token,
      });
    }

    if (signUpError) throw signUpError;

    return {
      data: { username: cleanUsername, tempPassword, role },
      error: null,
    };
  } catch (err) {
    return { data: null, error: friendlyAuthError(err) };
  }
}

/**
 * List all members of the current user's organization. Relies on the
 * `org_members_select_profiles` RLS policy — no RPC needed.
 */
export async function listOrgMembers() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, username, role, created_at')
      .order('created_at');
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Failed to list org members:', err);
    return { data: [], error: err.message };
  }
}

/**
 * Update a member's role. Relies on the `admin_update_org_profiles` RLS policy
 * plus the role-escalation-guard trigger (which only lets admins change roles).
 */
export async function updateMemberRole(userId, role) {
  if (!['admin', 'editor', 'viewer'].includes(role)) return { error: 'Invalid role.' };
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('id', userId);
    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: friendlyAuthError(err) };
  }
}

/**
 * Delete an organization member (admin-only, cascades to all their data).
 * Uses the delete_org_member RPC which checks authorization server-side.
 */
export async function deleteOrgMember(userId) {
  try {
    const { error } = await supabase.rpc('delete_org_member', { target_user_id: userId });
    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: friendlyAuthError(err) };
  }
}

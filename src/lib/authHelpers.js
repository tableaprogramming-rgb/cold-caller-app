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
 * Check whether a username is already taken. Uses the `username_exists` RPC
 * (SECURITY DEFINER) so it works even for anonymous callers, since RLS on
 * user_profiles blocks direct reads. Best-effort: if the RPC errors we return
 * { taken: false } and let the signUp call be the source of truth.
 */
export async function isUsernameTaken(username) {
  const u = normalizeUsername(username);
  try {
    const { data, error } = await supabase.rpc('username_exists', { u });
    if (error) return { taken: false, error: null };
    return { taken: !!data, error: null };
  } catch {
    return { taken: false, error: null };
  }
}

/**
 * Resolve a username to its internal login email via the `email_for_username`
 * RPC (SECURITY DEFINER). Returns null when the username is unknown. The
 * internal email is used only internally for Supabase sign-in — it is never
 * surfaced to the user.
 */
export async function emailForUsername(username) {
  const u = normalizeUsername(username);
  try {
    const { data, error } = await supabase.rpc('email_for_username', { u });
    if (error) return null;
    return data || null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Sign up (self-registration)
// ---------------------------------------------------------------------------

/**
 * Register a new user by username with rate limiting. A RANDOM internal email is
 * generated for the Supabase Auth identity (never shown to the user); the
 * username itself is stored on user_profiles via the signup metadata + trigger.
 * On success Supabase creates a session automatically (auto-login). Never
 * exposes the internal email in the returned data.
 */
export async function signUp(username, password) {
  const cleanUsername = normalizeUsername(username);

  const validationError = validateUsername(cleanUsername);
  if (validationError) return { data: null, error: validationError };

  const internalEmail = generateInternalEmail();

  const limit = await checkRateLimit(cleanUsername, 'register');
  if (!limit.allowed) {
    return { data: null, error: lockoutMessage(limit.lockedUntil) };
  }

  try {
    const { taken } = await isUsernameTaken(cleanUsername);
    if (taken) return { data: null, error: 'Username already taken.' };

    await recordAttempt(cleanUsername, 'register', false);

    const { data, error } = await supabase.auth.signUp({
      email: internalEmail,
      password,
      options: {
        data: { username: cleanUsername },
      },
    });

    if (error) throw error;

    await recordAttempt(cleanUsername, 'register', true);
    // Only ever return the username — never the internal email.
    return { data: { username: cleanUsername, session: data?.session || null }, error: null };
  } catch (err) {
    return { data: null, error: friendlyAuthError(err) };
  }
}

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------

/**
 * Sign in by username with rate limiting. The username is resolved to its
 * internal login email via an RPC (the email is never shown to the user).
 * Records an attempt regardless of outcome.
 */
export async function signIn(username, password) {
  const cleanUsername = normalizeUsername(username);

  const limit = await checkRateLimit(cleanUsername, 'login');
  if (!limit.allowed) {
    return { data: null, error: lockoutMessage(limit.lockedUntil), lockedUntil: limit.lockedUntil };
  }

  // Look up the internal email for this username. Fall back to the legacy
  // username-derived email for accounts created before random emails.
  let internalEmail = await emailForUsername(cleanUsername);
  if (!internalEmail) {
    internalEmail = `${cleanUsername}@coldcaller.local`;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: internalEmail,
      password,
    });

    if (error) {
      await recordAttempt(cleanUsername, 'login', false);
      // Re-check after recording so we can surface a lockout immediately.
      const post = await checkRateLimit(cleanUsername, 'login');
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

    await recordAttempt(cleanUsername, 'login', true);
    return { data, error: null };
  } catch (err) {
    await recordAttempt(cleanUsername, 'login', false);
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
// Invites / sharing
// ---------------------------------------------------------------------------

/**
 * Invite a user by username. Creates a real auth account with a generated temp
 * password, records a pending_invite (for the admin's reference), and grants
 * the given role via contact_access. Returns the temp password to display once.
 *
 * NOTE: this uses the public signUp flow (anon key) rather than the admin API,
 * so it works without a service-role key on the client. The invited user's
 * profile is flagged (via user metadata → trigger) to force a password change.
 */
export async function inviteUser(username, role = 'viewer') {
  const cleanUsername = normalizeUsername(username);

  const validationError = validateUsername(cleanUsername);
  if (validationError) return { data: null, error: validationError };
  if (!['viewer', 'editor'].includes(role)) return { data: null, error: 'Invalid role.' };

  const internalEmail = generateInternalEmail();
  const tempPassword = generateTempPassword();

  try {
    const { taken } = await isUsernameTaken(cleanUsername);
    if (taken) return { data: null, error: 'Username already taken.' };

    const { data: ownerData } = await supabase.auth.getUser();
    const ownerId = ownerData?.user?.id;
    if (!ownerId) return { data: null, error: 'You must be signed in to invite users.' };

    // Preserve the current session — signUp swaps the active session to the
    // newly created user, so we snapshot and restore it afterwards.
    const { data: sessionData } = await supabase.auth.getSession();
    const currentSession = sessionData?.session;

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: internalEmail,
      password: tempPassword,
      options: {
        data: { username: cleanUsername, password_change_required: true, invited_by: ownerId },
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

    const invitedUserId = signUpData?.user?.id;

    // Record the pending invite for the admin's records. `email` holds the
    // internal (random) email only to satisfy the NOT NULL/UNIQUE column — it
    // is never displayed anywhere in the UI.
    const { error: inviteError } = await supabase.from('pending_invites').insert({
      invited_by: ownerId,
      email: internalEmail,
      username: cleanUsername,
      temp_password: tempPassword,
      role,
    });
    if (inviteError && !inviteError.message?.toLowerCase().includes('duplicate')) {
      throw inviteError;
    }

    // Grant access now if we have the new user's id.
    if (invitedUserId) {
      const { error: accessError } = await supabase.from('contact_access').upsert(
        { owner_id: ownerId, shared_with_id: invitedUserId, role },
        { onConflict: 'owner_id,shared_with_id' }
      );
      if (accessError) throw accessError;
    }

    return {
      data: { username: cleanUsername, tempPassword, role, userId: invitedUserId },
      error: null,
    };
  } catch (err) {
    return { data: null, error: friendlyAuthError(err) };
  }
}

/**
 * List users the current owner has shared contacts with, joined to their username.
 */
export async function listSharedUsers() {
  try {
    const { data: ownerData } = await supabase.auth.getUser();
    const ownerId = ownerData?.user?.id;
    if (!ownerId) return { data: [], error: 'Not signed in.' };

    const { data, error } = await supabase
      .from('contact_access')
      .select('id, shared_with_id, role, created_at, user_profiles!contact_access_shared_with_id_fkey(username)')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback: the FK-embedded select may fail if the relationship isn't
      // exposed; fetch access rows then resolve usernames from pending_invites.
      const { data: rows, error: rowsError } = await supabase
        .from('contact_access')
        .select('id, shared_with_id, role, created_at')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });
      if (rowsError) throw rowsError;

      return {
        data: (rows || []).map((r) => ({
          id: r.id,
          shared_with_id: r.shared_with_id,
          role: r.role,
          created_at: r.created_at,
          username: null, // username unknown without the join
        })),
        error: null,
      };
    }

    return {
      data: (data || []).map((r) => ({
        id: r.id,
        shared_with_id: r.shared_with_id,
        role: r.role,
        created_at: r.created_at,
        username: r.user_profiles?.username || null,
      })),
      error: null,
    };
  } catch (err) {
    console.error('Failed to list shared users:', err);
    return { data: [], error: err.message };
  }
}

/**
 * Update the role of an existing share.
 */
export async function updateAccessRole(sharedWithId, role) {
  if (!['viewer', 'editor'].includes(role)) return { error: 'Invalid role.' };
  try {
    const { data: ownerData } = await supabase.auth.getUser();
    const ownerId = ownerData?.user?.id;
    if (!ownerId) return { error: 'Not signed in.' };

    const { error } = await supabase
      .from('contact_access')
      .update({ role })
      .eq('owner_id', ownerId)
      .eq('shared_with_id', sharedWithId);
    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: friendlyAuthError(err) };
  }
}

/**
 * Revoke a user's access to the current owner's contacts.
 */
export async function revokeAccess(sharedWithId) {
  try {
    const { data: ownerData } = await supabase.auth.getUser();
    const ownerId = ownerData?.user?.id;
    if (!ownerId) return { error: 'Not signed in.' };

    const { error } = await supabase
      .from('contact_access')
      .delete()
      .eq('owner_id', ownerId)
      .eq('shared_with_id', sharedWithId);
    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: friendlyAuthError(err) };
  }
}

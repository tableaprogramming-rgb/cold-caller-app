import { supabase } from './supabaseClient';

/**
 * Rate limiting for auth actions, backed by the `auth_attempts` table.
 *
 * Rules (defaults): if there are >= maxAttempts recorded attempts within the
 * last windowMinutes, the identifier is locked out for lockoutMinutes measured
 * from the most recent attempt.
 */

/**
 * Check whether an identifier (email or IP) is allowed to attempt an auth action.
 * This is a read-only check — it does NOT record an attempt.
 *
 * @returns {Promise<{ allowed: boolean, remainingAttempts: number, lockedUntil: Date|null, error: string|null }>}
 */
export async function checkRateLimit(
  identifier,
  type,
  maxAttempts = 5,
  windowMinutes = 15,
  lockoutMinutes = 5
) {
  // TEMPORARILY DISABLED for testing
  return { allowed: true, remainingAttempts: maxAttempts, lockedUntil: null, error: null };

  // Original implementation (commented out for now):
  /*
  const id = (identifier || '').trim().toLowerCase();
  if (!id) {
    return { allowed: true, remainingAttempts: maxAttempts, lockedUntil: null, error: null };
  }

  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  try {
    const { data, error } = await supabase
      .from('auth_attempts')
      .select('timestamp')
      .eq('email_or_ip', id)
      .eq('attempt_type', type)
      .gte('timestamp', windowStart)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    const attempts = data || [];

    if (attempts.length >= maxAttempts) {
      const mostRecent = new Date(attempts[0].timestamp);
      const lockedUntil = new Date(mostRecent.getTime() + lockoutMinutes * 60 * 1000);

      if (lockedUntil.getTime() > Date.now()) {
        return { allowed: false, remainingAttempts: 0, lockedUntil, error: null };
      }
    }

    return {
      allowed: true,
      remainingAttempts: Math.max(0, maxAttempts - attempts.length),
      lockedUntil: null,
      error: null,
    };
  } catch (err) {
    console.error('Rate limit check failed:', err);
    // Fail open on infrastructure errors so a transient DB issue never locks
    // every user out of the app entirely.
    return { allowed: true, remainingAttempts: maxAttempts, lockedUntil: null, error: err.message };
  }
  */
}

/**
 * Record an auth attempt (success or failure).
 * @returns {Promise<{ error: string|null }>}
 */
export async function recordAttempt(identifier, type, success = false) {
  const id = (identifier || '').trim().toLowerCase();
  if (!id) return { error: null };

  try {
    const { error } = await supabase
      .from('auth_attempts')
      .insert({ email_or_ip: id, attempt_type: type, success });

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Failed to record auth attempt:', err);
    return { error: err.message };
  }
}

/**
 * Human-friendly lockout message.
 */
export function lockoutMessage(lockedUntil) {
  if (!lockedUntil) return '';
  const msLeft = new Date(lockedUntil).getTime() - Date.now();
  const minutes = Math.max(1, Math.ceil(msLeft / 60000));
  return `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}

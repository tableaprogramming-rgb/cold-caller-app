import { supabase } from './supabaseClient';

/**
 * Fetch full history of a single contact, newest first.
 * Returns the normalized { data, error } shape.
 */
export async function listContactHistory(contactId) {
  if (!contactId) return { data: [], error: null };
  try {
    const { data, error } = await supabase
      .from('contact_history')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Failed to load contact history:', err);
    return { data: [], error: err.message };
  }
}

/**
 * Fetch org-wide activity log, newest first.
 * Supports limit + pagination via before cursor.
 * @param {object} options { limit?: number, before?: string (timestamp cursor) }
 */
export async function listOrgActivity({ limit = 50, before = null } = {}) {
  try {
    let query = supabase
      .from('contact_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (before) {
      query = query.lt('created_at', before);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Failed to load org activity:', err);
    return { data: [], error: err.message };
  }
}

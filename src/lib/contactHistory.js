import { supabase } from './supabaseClient';

// Fields tracked by the audit trail — must match the log_contact_change RPC
// (supabase/log_contact_change_rpc.sql) and the old trigger it replaces.
const TRACKABLE_FIELDS = [
  'company',
  'contact_person',
  'prefix',
  'job_title',
  'contact_number',
  'email',
  'address',
  'area_code',
  'status',
  'comments',
];

/**
 * Pick only the trackable fields off a contact-shaped object, so callers can
 * pass a full row straight in without leaking unrelated columns (id,
 * timestamps, organization_id, etc.) into old_values/new_values.
 */
function pickTrackableFields(obj) {
  if (!obj) return null;
  const picked = {};
  for (const field of TRACKABLE_FIELDS) {
    if (field in obj) picked[field] = obj[field];
  }
  return picked;
}

/**
 * Application-level replacement for the old contact_history DB trigger.
 * Calls the log_contact_change RPC explicitly after a contact mutation
 * succeeds. Only include the fields that matter (see TRACKABLE_FIELDS) —
 * this function normalizes that for you.
 *
 * @param {string} contactId  the contact this event is about
 * @param {object|null} oldData  contact fields BEFORE the change; pass null for 'created'
 * @param {object|null} newData  contact fields AFTER the change; pass null for 'deleted'
 * @param {'created'|'updated'|'deleted'} action
 * @returns {Promise<{data: object|null, error: string|null}>}
 */
export async function logContactChange(contactId, oldData, newData, action) {
  if (!contactId) return { data: null, error: 'contactId is required' };
  try {
    const { data, error } = await supabase.rpc('log_contact_change', {
      p_contact_id: contactId,
      p_old_values: pickTrackableFields(oldData),
      p_new_values: pickTrackableFields(newData),
      p_action: action,
    });

    if (error) throw error;
    if (data && data.success === false) throw new Error(data.error || 'Unknown error logging contact change');

    return { data, error: null };
  } catch (err) {
    console.error('Failed to log contact change:', err);
    return { data: null, error: err.message };
  }
}

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

/**
 * Compute the current user's relationship to a contact.
 *
 * @param {object} contact  the contact row (has user_id)
 * @param {string} userId   current user's id
 * @param {Map<string,string>} sharedRoleByOwner
 *        map of owner_id -> role ('viewer'|'editor') for contacts shared *with*
 *        the current user.
 * @returns {{ isOwner: boolean, role: 'owner'|'editor'|'viewer', canEdit: boolean, label: string }}
 */
export function getContactAccess(contact, userId, sharedRoleByOwner) {
  if (!contact || !userId) {
    return { isOwner: false, role: 'viewer', canEdit: false, label: 'Read-only' };
  }

  // Owner (also covers legacy contacts assigned to the admin).
  if (contact.user_id === userId) {
    return { isOwner: true, role: 'owner', canEdit: true, label: 'Your contact' };
  }

  // Shared with the current user.
  const role = sharedRoleByOwner?.get?.(contact.user_id);
  if (role === 'editor') {
    return { isOwner: false, role: 'editor', canEdit: true, label: 'Shared • Editor' };
  }
  if (role === 'viewer') {
    return { isOwner: false, role: 'viewer', canEdit: false, label: 'Shared • Viewer' };
  }

  // Legacy/unowned contact (user_id NULL) — treat as read-only for safety.
  return { isOwner: false, role: 'viewer', canEdit: false, label: 'Read-only' };
}

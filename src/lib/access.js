/**
 * Compute the current user's access to a contact.
 *
 * Under the org model every member has uniform access to all of the org's
 * contacts, driven solely by their role (admin/editor/viewer). The `contact`
 * param is unused but retained for call-site stability (App.jsx passes it first
 * everywhere). Return shape is unchanged so consuming components need no changes.
 *
 * @param {object} contact  the contact row (unused — kept for call-site stability)
 * @param {string} userRole the current user's org role ('admin'|'editor'|'viewer')
 * @returns {{ isOwner: boolean, role: 'admin'|'editor'|'viewer', canEdit: boolean, label: string }}
 */
export function getContactAccess(contact, userRole) {
  if (!userRole) return { isOwner: false, role: 'viewer', canEdit: false, label: 'Read-only' };
  if (userRole === 'admin') return { isOwner: true, role: 'admin', canEdit: true, label: 'Admin' };
  if (userRole === 'editor') return { isOwner: false, role: 'editor', canEdit: true, label: 'Editor' };
  return { isOwner: false, role: 'viewer', canEdit: false, label: 'Viewer' };
}

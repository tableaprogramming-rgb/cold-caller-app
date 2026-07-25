import { useState, useEffect, useCallback } from 'react';
import { listOrgMembers, createOrgMember, updateMemberRole, deleteOrgMember } from '../lib/authHelpers';
import './AccountSettingsPage.css';

const ROLE_LABELS = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

/**
 * Team Management. Shows the organization roster with editable roles and an
 * add-member form. Admin-only actions are gated by the `role` prop; non-admins
 * see the roster read-only.
 *
 * NOTE: there is intentionally no "remove member" flow — the org model has no
 * per-user revoke concept. This is an accepted tradeoff for now.
 *
 * @param {'admin'|'editor'|'viewer'} role  the current user's org role
 * @param {() => void} onBack  return to the main app
 */
export default function AccountSettingsPage({ role, onBack }) {
  const isAdmin = role === 'admin';

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('viewer');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [newMember, setNewMember] = useState(null); // { username, tempPassword, role }
  const [copied, setCopied] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null); // { userId, username }
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setListError('');
    const { data, error } = await listOrgMembers();
    if (error) setListError(error);
    setMembers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  async function handleAddMember(e) {
    e.preventDefault();
    setAddError('');
    setNewMember(null);
    setCopied(false);

    if (!newUsername.trim()) {
      setAddError('Please enter a username.');
      return;
    }

    setAdding(true);
    try {
      const { data, error } = await createOrgMember(newUsername, newRole);
      if (error) {
        setAddError(error);
        return;
      }
      setNewMember(data);
      setNewUsername('');
      setNewRole('viewer');
      await loadMembers();
    } catch (err) {
      console.error('Add member error:', err);
      setAddError('Something went wrong. Please try again.');
    } finally {
      setAdding(false);
    }
  }

  async function handleRoleChange(userId, nextRole) {
    const { error } = await updateMemberRole(userId, nextRole);
    if (error) {
      setListError(error);
      return;
    }
    await loadMembers();
  }

  function openDeleteConfirm(userId, username) {
    setDeleteConfirm({ userId, username });
    setDeleteConfirmInput('');
  }

  function closeDeleteConfirm() {
    setDeleteConfirm(null);
    setDeleteConfirmInput('');
  }

  async function confirmDelete() {
    if (deleteConfirmInput !== deleteConfirm.username) {
      setListError('Username does not match.');
      return;
    }
    setDeleting(true);
    const { error } = await deleteOrgMember(deleteConfirm.userId);
    setDeleting(false);
    if (error) {
      setListError(error);
      return;
    }
    closeDeleteConfirm();
    await loadMembers();
  }

  function copyTempPassword() {
    if (!newMember?.tempPassword) return;
    navigator.clipboard?.writeText(newMember.tempPassword).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false)
    );
  }

  return (
    <div className="asp-wrapper">
      <div className="asp-topbar">
        <button className="asp-back" onClick={onBack}>
          ← Back to contacts
        </button>
        <h1>Team Management</h1>
      </div>

      <div className="asp-content">
        {/* Add team member (admin only) */}
        {isAdmin && (
          <section className="asp-card">
            <h2>Add team member</h2>
            <p className="asp-hint">
              Create an account in your organization. A temporary password is generated —
              copy it and send it to the user securely. They&apos;ll be required to set a new
              password on first login.
            </p>

            {addError && <div className="asp-error">{addError}</div>}

            <form className="asp-invite-form" onSubmit={handleAddMember}>
              <input
                type="text"
                placeholder="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                disabled={adding}
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                disabled={adding}
              >
                <option value="admin">Admin (full control)</option>
                <option value="editor">Editor (can edit)</option>
                <option value="viewer">Viewer (read-only)</option>
              </select>
              <button type="submit" disabled={adding}>
                {adding ? 'Adding…' : 'Add member'}
              </button>
            </form>

            {newMember && (
              <div className="asp-invite-result">
                <p>
                  Account created for <strong>{newMember.username}</strong> as{' '}
                  <strong>{ROLE_LABELS[newMember.role] || newMember.role}</strong>. Share this
                  temporary password:
                </p>
                <div className="asp-temp-pw">
                  <code>{newMember.tempPassword}</code>
                  <button type="button" onClick={copyTempPassword}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="asp-hint">
                  The user will be required to set a new password on first login.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Team members roster */}
        <section className="asp-card">
          <h2>Team members</h2>

          {listError && <div className="asp-error">{listError}</div>}

          {loading ? (
            <p className="asp-hint">Loading…</p>
          ) : members.length === 0 ? (
            <p className="asp-hint">No team members found.</p>
          ) : (
            <table className="asp-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>{m.username || m.id}</td>
                    <td>
                      {isAdmin ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        ROLE_LABELS[m.role] || m.role
                      )}
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="asp-delete-cell">
                          <button
                            className="asp-delete"
                            onClick={() => openDeleteConfirm(m.id, m.username || m.id)}
                            disabled={m.role === 'admin'}
                          >
                            Delete
                          </button>
                          {m.role === 'admin' && (
                            <span className="asp-tooltip-icon" data-tooltip="Cannot delete the last admin. Promote another member to Admin first.">
                              ⓘ
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="asp-modal-overlay" onClick={closeDeleteConfirm}>
          <div className="asp-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Member</h2>
            <p className="asp-modal-warning">
              ⚠️ This action cannot be undone. This will permanently delete{' '}
              <strong>{deleteConfirm.username}</strong> and all their data.
            </p>
            <p className="asp-modal-hint">
              Type the username to confirm:
            </p>
            <input
              type="text"
              className="asp-modal-input"
              placeholder="Type username here"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              disabled={deleting}
              autoFocus
            />
            <div className="asp-modal-actions">
              <button
                className="asp-modal-cancel"
                onClick={closeDeleteConfirm}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="asp-modal-delete"
                onClick={confirmDelete}
                disabled={deleting || deleteConfirmInput !== deleteConfirm.username}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

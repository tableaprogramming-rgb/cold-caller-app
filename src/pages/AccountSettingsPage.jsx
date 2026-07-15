import { useState, useEffect, useCallback } from 'react';
import {
  listSharedUsers,
  inviteUser,
  revokeAccess,
  updateAccessRole,
} from '../lib/authHelpers';
import './AccountSettingsPage.css';

/**
 * Manage who has access to the current user's contacts.
 * @param {() => void} onBack  return to the main app
 */
export default function AccountSettingsPage({ onBack }) {
  const [sharedUsers, setSharedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [newInvite, setNewInvite] = useState(null); // { username, tempPassword, role }
  const [copied, setCopied] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setListError('');
    const { data, error } = await listSharedUsers();
    if (error) setListError(error);
    setSharedUsers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleInvite(e) {
    e.preventDefault();
    setInviteError('');
    setNewInvite(null);
    setCopied(false);

    if (!inviteUsername.trim()) {
      setInviteError('Please enter a username.');
      return;
    }

    setInviting(true);
    try {
      const { data, error } = await inviteUser(inviteUsername, inviteRole);
      if (error) {
        setInviteError(error);
        return;
      }
      setNewInvite(data);
      setInviteUsername('');
      await loadUsers();
    } catch (err) {
      console.error('Invite error:', err);
      setInviteError('Something went wrong. Please try again.');
    } finally {
      setInviting(false);
    }
  }

  async function handleRevoke(sharedWithId) {
    if (!window.confirm('Revoke this user’s access to your contacts?')) return;
    const { error } = await revokeAccess(sharedWithId);
    if (error) {
      setListError(error);
      return;
    }
    await loadUsers();
  }

  async function handleRoleChange(sharedWithId, role) {
    const { error } = await updateAccessRole(sharedWithId, role);
    if (error) {
      setListError(error);
      return;
    }
    await loadUsers();
  }

  function copyTempPassword() {
    if (!newInvite?.tempPassword) return;
    navigator.clipboard?.writeText(newInvite.tempPassword).then(
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
        <h1>Account Settings</h1>
      </div>

      <div className="asp-content">
        {/* Invite section */}
        <section className="asp-card">
          <h2>Invite a user</h2>
          <p className="asp-hint">
            Create an account and share your contacts. A temporary password is generated —
            copy it and send it to the user securely.
          </p>

          {inviteError && <div className="asp-error">{inviteError}</div>}

          <form className="asp-invite-form" onSubmit={handleInvite}>
            <input
              type="text"
              placeholder="username"
              value={inviteUsername}
              onChange={(e) => setInviteUsername(e.target.value)}
              disabled={inviting}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              disabled={inviting}
            >
              <option value="viewer">Viewer (read-only)</option>
              <option value="editor">Editor (can edit)</option>
            </select>
            <button type="submit" disabled={inviting}>
              {inviting ? 'Inviting…' : 'Invite'}
            </button>
          </form>

          {newInvite && (
            <div className="asp-invite-result">
              <p>
                Account created for <strong>{newInvite.username}</strong> as{' '}
                <strong>{newInvite.role}</strong>. Share this temporary password:
              </p>
              <div className="asp-temp-pw">
                <code>{newInvite.tempPassword}</code>
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

        {/* Shared users list */}
        <section className="asp-card">
          <h2>Users with access</h2>

          {listError && <div className="asp-error">{listError}</div>}

          {loading ? (
            <p className="asp-hint">Loading…</p>
          ) : sharedUsers.length === 0 ? (
            <p className="asp-hint">You haven&apos;t shared your contacts with anyone yet.</p>
          ) : (
            <table className="asp-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sharedUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username || u.shared_with_id}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.shared_with_id, e.target.value)}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="asp-revoke"
                        onClick={() => handleRevoke(u.shared_with_id)}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

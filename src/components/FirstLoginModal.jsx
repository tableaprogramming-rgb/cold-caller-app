import { useState } from 'react';
import { changePassword } from '../lib/authHelpers';
import './FirstLoginModal.css';

/**
 * Forces an invited user to set a new password on first login.
 * Shown when the user's profile has password_change_required = true.
 * @param {() => void} onComplete  called after the password is changed
 */
export default function FirstLoginModal({ onComplete }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!oldPassword || !newPassword || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword === oldPassword) {
      setError('New password must be different from the temporary password.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: changeError } = await changePassword(oldPassword, newPassword);
      if (changeError) {
        setError(changeError);
        return;
      }
      onComplete?.();
    } catch (err) {
      console.error('Password change error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flm-overlay">
      <div className="flm-modal" role="dialog" aria-modal="true" aria-labelledby="flm-title">
        <h2 id="flm-title">Set a new password</h2>
        <p className="flm-subtitle">
          For security, please change your temporary password before continuing.
        </p>

        {error && <div className="flm-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="flm-field">
            <label htmlFor="flm-old">Temporary password</label>
            <input
              id="flm-old"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={submitting}
              autoComplete="current-password"
            />
          </div>

          <div className="flm-field">
            <label htmlFor="flm-new">New password</label>
            <input
              id="flm-new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={submitting}
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />
          </div>

          <div className="flm-field">
            <label htmlFor="flm-confirm">Confirm new password</label>
            <input
              id="flm-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={submitting}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="flm-btn" disabled={submitting}>
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}

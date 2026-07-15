import { useState } from 'react';
import { signUp, validateUsername } from '../lib/authHelpers';
import './AuthPages.css';

/**
 * Registration form (username + password) with rate limiting. Users only ever
 * see a username; a random internal identity is generated behind the scenes for
 * Supabase auth (never shown). On success the user is auto-logged-in when a
 * session is established.
 * @param {() => void} onSuccess    called when a session is established
 * @param {() => void} onGoToLogin  switch to the login view
 */
export default function RegisterPage({ onSuccess, onGoToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!username.trim() || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: signUpError } = await signUp(username, password);
      if (signUpError) {
        setError(signUpError);
        setSubmitting(false);
        return;
      }
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Register error:', err);
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  function handleSuccessModalClose() {
    setShowSuccessModal(false);
    onSuccess?.();
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="auth-subtitle">Get started with the Cold Calling Tracker</p>

        {error && <div className="auth-error" role="alert">{error}</div>}

        {showSuccessModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Account Created!</h2>
              <p>Welcome to Cold Calling Tracker. You're all set to get started.</p>
              <button className="modal-btn" onClick={handleSuccessModalClose}>
                Continue
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              autoComplete="username"
              placeholder="3–20 letters, numbers, _ or -"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-confirm">Confirm password</label>
            <input
              id="reg-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={submitting}
              autoComplete="new-password"
              placeholder="Re-enter your password"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <button type="button" className="auth-link" onClick={onGoToLogin} disabled={submitting}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

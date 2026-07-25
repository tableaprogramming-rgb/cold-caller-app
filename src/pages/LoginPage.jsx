import { useState } from 'react';
import { signIn } from '../lib/authHelpers';
import './AuthPages.css';

/**
 * Login form with built-in rate limiting (handled in signIn()).
 * Collects Organization + Username + Password. Self-registration has been
 * removed — accounts are created by an admin.
 *
 * @param {() => void} onSuccess  called after a successful sign in
 */
export default function LoginPage({ onSuccess }) {
  const [orgName, setOrgName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!orgName.trim() || !username.trim() || !password) {
      setError('Please enter your organization, username and password.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: signInError } = await signIn(orgName, username, password);
      if (signInError) {
        setError(signInError);
        return;
      }
      if (data?.session) {
        onSuccess?.();
      } else {
        setError('Sign in did not complete. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to the Cold Calling Tracker</p>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="login-org">Organization</label>
            <input
              id="login-org"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              disabled={submitting}
              autoComplete="organization"
              placeholder="Your organization"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              autoComplete="username"
              placeholder="Your username"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

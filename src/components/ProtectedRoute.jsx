/**
 * Route guard. Renders children only when a user is present; otherwise renders
 * the provided fallback (typically the login page).
 *
 * @param {object|null} user     current authenticated user (or null)
 * @param {React.ReactNode} fallback  what to render when not authenticated
 * @param {React.ReactNode} children  protected content
 */
export default function ProtectedRoute({ user, fallback, children }) {
  if (!user) {
    return fallback || null;
  }
  return children;
}

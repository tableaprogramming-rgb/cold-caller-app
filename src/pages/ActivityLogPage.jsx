import { useState, useEffect } from 'react';
import { listOrgActivity } from '../lib/contactHistory';
import ContactHistoryTimeline from '../components/ContactHistoryTimeline';
import './ActivityLogPage.css';

/**
 * Org-wide activity log. Shows all contact mutations (create/update/delete)
 * across the organization, newest first, with pagination.
 *
 * @param {'admin'|'editor'|'viewer'} role  the current user's role
 * @param {() => void} onBack  return to the main app
 */
export default function ActivityLogPage({ role, onBack }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadInitial();
  }, []);

  async function loadInitial() {
    setLoading(true);
    setError('');
    const { data, error: err } = await listOrgActivity({ limit: 50 });
    if (err) {
      setError(err);
    } else {
      setEvents(data || []);
      setHasMore((data?.length || 0) >= 50);
    }
    setLoading(false);
  }

  async function loadMore() {
    if (!events.length || loading) return;
    const lastEvent = events[events.length - 1];
    if (!lastEvent) return;

    setLoading(true);
    const { data, error: err } = await listOrgActivity({
      limit: 50,
      before: lastEvent.created_at,
    });
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    if (data && data.length > 0) {
      setEvents([...events, ...data]);
      setHasMore(data.length >= 50);
    } else {
      setHasMore(false);
    }
  }

  return (
    <div className="alp-wrapper">
      <div className="alp-topbar">
        <button className="alp-back" onClick={onBack}>
          ← Back to contacts
        </button>
        <h1>Activity Log</h1>
      </div>

      <div className="alp-content">
        <section className="alp-card">
          <h2>Organization Activity</h2>
          <p className="alp-hint">
            Timeline of all contact changes made by your team members.
          </p>

          {error && <div className="alp-error">{error}</div>}

          {loading && events.length === 0 ? (
            <p className="alp-hint">Loading activity…</p>
          ) : events.length === 0 ? (
            <p className="alp-hint">No activity yet.</p>
          ) : (
            <>
              <ContactHistoryTimeline events={events} />

              {hasMore && (
                <button
                  className="alp-load-more"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading…' : 'Load more'}
                </button>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

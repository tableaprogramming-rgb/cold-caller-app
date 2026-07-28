import { useState } from 'react';
import './ContactHistoryTimeline.css';

const FIELD_LABELS = {
  company: 'Company',
  contact_person: 'Contact Person',
  prefix: 'Prefix',
  job_title: 'Job Title',
  contact_number: 'Phone',
  email: 'Email',
  address: 'Address',
  area_code: 'Area Code',
  status: 'Status',
  comments: 'Notes',
};

const STATUS_COLORS = {
  'New': '#667eea',
  'To Call': '#764ba2',
  'Called': '#f093fb',
  'No Answer': '#4facfe',
  'For Demo': '#43e97b',
  'Done': '#38f9d7',
};

function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function truncateText(text, maxLen = 100) {
  if (!text) return '—';
  if (text.length <= maxLen) return text;
  return `${text.substring(0, maxLen)}…`;
}

export default function ContactHistoryTimeline({ events = [] }) {
  const [expandedIds, setExpandedIds] = useState(new Set());

  function toggleExpand(eventId) {
    const next = new Set(expandedIds);
    if (next.has(eventId)) {
      next.delete(eventId);
    } else {
      next.add(eventId);
    }
    setExpandedIds(next);
  }

  if (!events || events.length === 0) {
    return <div className="cht-empty">No history yet</div>;
  }

  return (
    <div className="cht-timeline">
      {events.map((event) => {
        const isExpanded = expandedIds.has(event.id);
        const actor = event.changed_by_username || 'System';
        const timestamp = formatTimestamp(event.created_at);

        return (
          <div key={event.id} className="cht-event">
            <div className="cht-header">
              <div className="cht-actor">{actor}</div>
              <div className="cht-time">{timestamp}</div>
            </div>

            {event.action === 'created' && (
              <div className="cht-action">Created this contact</div>
            )}

            {event.action === 'deleted' && (
              <div className="cht-action cht-delete">Deleted this contact</div>
            )}

            {event.action === 'updated' && event.changes && (
              <div className="cht-changes">
                {Object.entries(event.changes).map(([field, diff]) => {
                  if (!diff || typeof diff !== 'object' || !('old' in diff) || !('new' in diff)) {
                    return null;
                  }

                  const label = FIELD_LABELS[field] || field;
                  const oldVal = diff.old;
                  const newVal = diff.new;
                  const isStatus = field === 'status';
                  const isComment = field === 'comments';
                  const isTruncated = isComment && typeof newVal === 'string' && newVal.length > 100;

                  return (
                    <div key={field} className="cht-change">
                      <span className="cht-field">{label}</span>
                      {isStatus ? (
                        <span className="cht-status">
                          <span
                            className="cht-status-badge"
                            style={{ backgroundColor: STATUS_COLORS[oldVal] || '#ccc' }}
                          >
                            {oldVal || '—'}
                          </span>
                          <span className="cht-arrow">→</span>
                          <span
                            className="cht-status-badge"
                            style={{ backgroundColor: STATUS_COLORS[newVal] || '#ccc' }}
                          >
                            {newVal || '—'}
                          </span>
                        </span>
                      ) : (
                        <span className="cht-text">
                          <span className="cht-old">{truncateText(oldVal)}</span>
                          <span className="cht-arrow">→</span>
                          <span className="cht-new">{truncateText(newVal)}</span>
                        </span>
                      )}

                      {isTruncated && (
                        <button
                          className="cht-expand-btn"
                          onClick={() => toggleExpand(event.id)}
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                  );
                })}

                {isExpanded && event.changes.comments && (
                  <div className="cht-expanded-comment">
                    <div className="cht-exp-label">Previous notes:</div>
                    <p className="cht-exp-text">{event.changes.comments.old || '(empty)'}</p>
                    <div className="cht-exp-label">New notes:</div>
                    <p className="cht-exp-text">{event.changes.comments.new || '(empty)'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

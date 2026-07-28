import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { listContactHistory, logContactChange } from '../lib/contactHistory';
import ContactHistoryTimeline from './ContactHistoryTimeline';
import './DetailModal.css';

const STAGES = ['New', 'To Call', 'Called', 'No Answer', 'For Demo', 'Done'];

/**
 * Full-detail modal for a single contact. Comments + status are editable only
 * when access.canEdit is true.
 *
 * @param {object} contact
 * @param {object} access    { role, canEdit, label, isOwner }
 * @param {() => void} onClose
 * @param {(updated) => void} onUpdate
 */
export default function DetailModal({ contact, access, onClose, onUpdate }) {
  const [comments, setComments] = useState(contact?.comments || '');
  const [status, setStatus] = useState(contact?.status || 'New');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const canEdit = access ? access.canEdit : true;

  useEffect(() => {
    setComments(contact?.comments || '');
    setStatus(contact?.status || 'New');
    setError('');
  }, [contact]);

  useEffect(() => {
    if (contact?.id && history.length === 0 && !loadingHistory) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact?.id]);

  async function loadHistory() {
    if (!contact?.id) return;
    setLoadingHistory(true);
    const { data, error: histError } = await listContactHistory(contact.id);
    if (!histError) {
      setHistory(data);
    }
    setLoadingHistory(false);
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!contact) return null;

  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      const { data, error: updateError } = await supabase
        .from('contacts')
        .update({
          comments,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contact.id)
        .select()
        .single();

      if (updateError) throw updateError;
      onUpdate?.(data);

      // --- Application-level audit logging (replaces the old DB trigger) ---
      // Log status + comment changes made from this modal. Fire-and-forget:
      // logging failure shouldn't block the save the user already confirmed.
      logContactChange(contact.id, contact, data, 'updated');

      onClose?.();
    } catch (err) {
      console.error('Error saving contact:', err);
      setError('Failed to save. You may not have permission to edit this contact.');
    } finally {
      setSaving(false);
    }
  }

  const contactName = contact.prefix
    ? `${contact.prefix} ${contact.contact_person || 'N/A'}`
    : contact.contact_person || 'N/A';

  return (
    <div className="dm-overlay" onClick={onClose}>
      <div className="dm-modal dm-modal-wide" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="dm-header">
          <h2>{contact.company}</h2>
          <button className="dm-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {access && <span className={`dm-badge ${access.role}`}>{access.label}</span>}

        <div className="dm-content-wrapper">
          {/* Left side: Contact details */}
          <div className="dm-left-panel">
            <h3 className="dm-panel-title">Contact Details</h3>
            <div className="dm-body dm-details-scroll">
              <DetailRow label="Company" value={contact.company || '—'} />
              <DetailRow label="Contact" value={contactName} />
              <DetailRow label="Prefix" value={contact.prefix || '—'} />
              <DetailRow
                label="Phone"
                value={
                  contact.contact_number ? (
                    <a href={`tel:${contact.contact_number}`}>{contact.contact_number}</a>
                  ) : (
                    '—'
                  )
                }
              />
              <DetailRow
                label="Email"
                value={
                  contact.email ? (
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  ) : (
                    '—'
                  )
                }
              />
              <DetailRow label="Area Code" value={contact.area_code || '—'} />
              <DetailRow label="Address" value={contact.address || '—'} />

              <div className="dm-field">
                <label>Status</label>
                {canEdit ? (
                  <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={saving}>
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="dm-static">{contact.status}</span>
                )}
              </div>

              <div className="dm-field">
                <label>Comments</label>
                {canEdit ? (
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add comments about this contact…"
                    disabled={saving}
                  />
                ) : (
                  <p className="dm-static">{contact.comments || 'No comments'}</p>
                )}
              </div>

              {error && <div className="dm-error">{error}</div>}
            </div>
          </div>

          {/* Right side: History */}
          <div className="dm-right-panel">
            <h3 className="dm-panel-title">Activity History</h3>
            <div className="dm-body dm-history-scroll">
              {loadingHistory ? (
                <p className="dm-loading">Loading history…</p>
              ) : (
                <ContactHistoryTimeline events={history} />
              )}
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="dm-actions">
            <button className="dm-cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="dm-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="dm-row">
      <span className="dm-label">{label}</span>
      <span className="dm-value">{value}</span>
    </div>
  );
}

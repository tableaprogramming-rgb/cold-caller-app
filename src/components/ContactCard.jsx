import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { logContactChange } from '../lib/contactHistory';
import './ContactCard.css';

export default function ContactCard({ contact, onUpdate, access, onOpen }) {
  const [isEditingComments, setIsEditingComments] = useState(false);
  const [comments, setComments] = useState(contact.comments || '');
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = access ? access.canEdit : true;

  async function handleSaveComments() {
    if (comments === contact.comments) {
      setIsEditingComments(false);
      return;
    }

    try {
      setIsSaving(true);
      const { data, error } = await supabase
        .from('contacts')
        .update({
          comments,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contact.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);

      // --- Application-level audit logging (replaces the old DB trigger) ---
      // Fire-and-forget: logging failure shouldn't block the comment save
      // that already succeeded.
      logContactChange(contact.id, contact, data, 'updated');

      setIsEditingComments(false);
    } catch (error) {
      console.error('Error updating comments:', error);
      alert('Failed to save comments. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancelEdit() {
    setComments(contact.comments || '');
    setIsEditingComments(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveComments();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }

  const contactName = contact.prefix
    ? `${contact.prefix} ${contact.contact_person || 'N/A'}`
    : contact.contact_person || 'N/A';

  const badgeClass =
    access?.role === 'admin'
      ? 'admin'
      : access?.role === 'editor'
      ? 'editor'
      : 'viewer';

  return (
    <div className="contact-card">
      <div className="card-header">
        <h3
          className="company-name"
          onClick={onOpen ? () => onOpen(contact) : undefined}
          style={onOpen ? { cursor: 'pointer' } : undefined}
          title={onOpen ? 'View details' : undefined}
        >
          {contact.company}
        </h3>
        {access && (
          <span className={`access-badge ${badgeClass}`} title={access.label}>
            {access.label}
          </span>
        )}
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="label">Contact:</span>
          <span className="value">{contactName}</span>
        </div>

        <div className="info-row">
          <span className="label">Phone:</span>
          <a href={`tel:${contact.contact_number}`} className="phone-link">
            {contact.contact_number}
          </a>
        </div>

        {contact.email && (
          <div className="info-row">
            <span className="label">Email:</span>
            <a href={`mailto:${contact.email}`} className="email-link">
              {contact.email}
            </a>
          </div>
        )}

        {contact.area_code && (
          <div className="info-row">
            <span className="label">Area Code:</span>
            <span className="value">{contact.area_code}</span>
          </div>
        )}

        {contact.address && (
          <div className="info-row">
            <span className="label">Address:</span>
            <span className="value address-text">{contact.address}</span>
          </div>
        )}
      </div>

      <div className="card-comments">
        {!canEdit ? (
          <div className="comments-view comments-readonly">
            {contact.comments ? (
              <p className="comments-text">{contact.comments}</p>
            ) : (
              <p className="comments-placeholder">No comments</p>
            )}
          </div>
        ) : isEditingComments ? (
          <div className="comments-edit">
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add comments about this contact..."
              className="comments-textarea"
              autoFocus
            />
            <div className="comments-actions">
              <button
                onClick={handleSaveComments}
                disabled={isSaving}
                className="btn-save"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            className="comments-view"
            onClick={() => setIsEditingComments(true)}
          >
            {contact.comments ? (
              <p className="comments-text">{contact.comments}</p>
            ) : (
              <p className="comments-placeholder">Click to add comments...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

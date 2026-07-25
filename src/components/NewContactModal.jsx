import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './DetailModal.css';

const STAGES = ['New', 'To Call', 'Called', 'No Answer', 'For Demo', 'Done'];

/**
 * Modal for creating a new contact.
 *
 * @param {object} user  current user (for the informal user_id audit trail)
 * @param {string} organizationId  the org the contact belongs to (ownership key)
 * @param {() => void} onClose
 * @param {(newContact) => void} onContactAdded  called with the new contact
 */
export default function NewContactModal({ user, organizationId, onClose, onContactAdded }) {
  const [formData, setFormData] = useState({
    company: '',
    contact_person: '',
    prefix: '',
    contact_number: '',
    email: '',
    area_code: '',
    address: '',
    status: 'New',
    comments: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setError('');

    if (!formData.company.trim()) {
      setError('Company name is required.');
      return;
    }

    setSaving(true);
    try {
      const { data, error: insertError } = await supabase
        .from('contacts')
        .insert([
          {
            company: formData.company.trim(),
            contact_person: formData.contact_person.trim() || null,
            prefix: formData.prefix.trim() || null,
            contact_number: formData.contact_number.trim() || null,
            email: formData.email.trim() || null,
            area_code: formData.area_code.trim() || null,
            address: formData.address.trim() || null,
            status: formData.status,
            comments: formData.comments.trim() || null,
            organization_id: organizationId,
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      onContactAdded?.(data);
      onClose?.();
    } catch (err) {
      console.error('Error creating contact:', err);
      setError('Failed to create contact. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dm-overlay" onClick={onClose}>
      <div className="dm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="dm-header">
          <h2>Add New Contact</h2>
          <button className="dm-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="dm-body">
          <div className="dm-field">
            <label htmlFor="nc-company">Company *</label>
            <input
              id="nc-company"
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company name"
              disabled={saving}
            />
          </div>

          <div className="dm-field">
            <label htmlFor="nc-contact-person">Contact Person</label>
            <input
              id="nc-contact-person"
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              placeholder="Full name"
              disabled={saving}
            />
          </div>

          <div className="dm-field">
            <label htmlFor="nc-prefix">Prefix</label>
            <input
              id="nc-prefix"
              type="text"
              name="prefix"
              value={formData.prefix}
              onChange={handleChange}
              placeholder="Mr / Ms / Mrs"
              disabled={saving}
            />
          </div>

          <div className="dm-field">
            <label htmlFor="nc-phone">Phone</label>
            <input
              id="nc-phone"
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="Contact number"
              disabled={saving}
            />
          </div>

          <div className="dm-field">
            <label htmlFor="nc-email">Email</label>
            <input
              id="nc-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              disabled={saving}
            />
          </div>

          <div className="dm-field">
            <label htmlFor="nc-area-code">Area Code</label>
            <input
              id="nc-area-code"
              type="text"
              name="area_code"
              value={formData.area_code}
              onChange={handleChange}
              placeholder="Area code"
              disabled={saving}
            />
          </div>

          <div className="dm-field">
            <label htmlFor="nc-address">Address</label>
            <textarea
              id="nc-address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
              disabled={saving}
            />
          </div>

          <div className="dm-field">
            <label htmlFor="nc-status">Status</label>
            <select
              id="nc-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={saving}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="dm-field">
            <label htmlFor="nc-comments">Comments</label>
            <textarea
              id="nc-comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              placeholder="Add initial comments…"
              disabled={saving}
            />
          </div>

          {error && <div className="dm-error">{error}</div>}
        </div>

        <div className="dm-actions">
          <button className="dm-cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="dm-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Creating…' : 'Create contact'}
          </button>
        </div>
      </div>
    </div>
  );
}

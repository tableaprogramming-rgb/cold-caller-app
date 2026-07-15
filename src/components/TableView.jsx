import './TableView.css';

const STAGES = ['New', 'To Call', 'Called', 'No Answer', 'For Demo', 'Done'];

/**
 * Tabular view of contacts with owner + role columns. Status is editable inline
 * (via a <select>) only when the user has edit rights on that contact.
 *
 * @param {Array} contacts
 * @param {(contact) => object} getAccess   returns { role, canEdit, label, isOwner }
 * @param {(id, status) => void} onStatusChange
 * @param {(contact) => void} onOpen
 */
export default function TableView({ contacts, getAccess, onStatusChange, onOpen }) {
  if (!contacts.length) {
    return <div className="table-empty">No contacts to display.</div>;
  }

  return (
    <div className="table-view-wrapper">
      <table className="table-view">
        <thead>
          <tr>
            <th>Company</th>
            <th>Contact</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Access</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => {
            const access = getAccess ? getAccess(contact) : { role: 'owner', canEdit: true, label: '—' };
            const contactName = contact.prefix
              ? `${contact.prefix} ${contact.contact_person || 'N/A'}`
              : contact.contact_person || 'N/A';

            return (
              <tr key={contact.id}>
                <td className="cell-company">{contact.company}</td>
                <td>{contactName}</td>
                <td>
                  {contact.contact_number ? (
                    <a href={`tel:${contact.contact_number}`} className="table-phone">
                      {contact.contact_number}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  {access.canEdit ? (
                    <select
                      className="table-status-select"
                      value={
                        STAGES.find((s) => s.toLowerCase() === (contact.status || '').toLowerCase()) ||
                        'New'
                      }
                      onChange={(e) => onStatusChange?.(contact.id, e.target.value)}
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="table-status-static">{contact.status || 'New'}</span>
                  )}
                </td>
                <td>
                  <span className={`table-badge ${access.role}`}>{access.label}</span>
                </td>
                <td className="cell-role">{access.role}</td>
                <td>
                  <button className="table-action" onClick={() => onOpen?.(contact)}>
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

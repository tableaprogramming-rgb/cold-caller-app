// url=https://www.figma.com/design/PhfWVOOFvwPbtpHBUNa47V/cold-calling-tracking
// source=src/components/ContactCard.jsx
// component=ContactCard

import figma from 'figma'
const instance = figma.selectedInstance

// Extract contact card properties
const company = instance.getString('Company') || 'Company'
const contactPerson = instance.getString('Contact Person') || 'Contact'
const phone = instance.getString('Phone') || '(000) 000-0000'
const status = instance.getEnum('Status', {
  'New': 'New',
  'To Call': 'To Call',
  'Called': 'Called',
  'No Answer': 'No Answer',
  'For Demo': 'For Demo',
  'Done': 'Done',
}) || 'New'

export default {
  example: figma.code`
    <div className="contact-card" draggable>
      <div className="card-header">
        <h3>${company}</h3>
        <span className="status-badge">${status}</span>
      </div>
      <div className="card-body">
        <p className="contact-name">${contactPerson}</p>
        <a href="tel:${phone}" className="phone-link">${phone}</a>
      </div>
    </div>
  `,
  imports: [],
  id: 'contact-card',
  metadata: {
    nestable: true,
  },
}

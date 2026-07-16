// url=https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/Cold%20Caller%20App%20Design%20System?node-id=CONTACT_CARD_NODE_ID
// source=src/components/ContactCard.jsx
// component=ContactCard

import figma from 'figma'
const instance = figma.selectedInstance

// Extract contact card properties
const company = instance.getString('Company')
const contactPerson = instance.getString('Contact Person')
const phone = instance.getString('Phone')
const status = instance.getEnum('Status', {
  'New': 'New',
  'To Call': 'To Call',
  'Called': 'Called',
  'No Answer': 'No Answer',
  'For Demo': 'For Demo',
  'Done': 'Done',
})

export default {
  example: figma.code`
    <div className="contact-card">
      <div className="card-header">
        <h3>${company}</h3>
        <span className="badge badge-${status.toLowerCase().replace(' ', '-')}">${status}</span>
      </div>
      <div className="card-body">
        <p>${contactPerson}</p>
        <a href="tel:${phone}">${phone}</a>
      </div>
    </div>
  `,
  imports: [],
  id: 'contact-card',
  metadata: {
    nestable: true,
    props: {
      company,
      contactPerson,
      phone,
      status,
    },
  },
}

// url=https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/Cold%20Caller%20App%20Design%20System?node-id=DETAIL_MODAL_NODE_ID
// source=src/components/DetailModal.jsx
// component=DetailModal

import figma from 'figma'
const instance = figma.selectedInstance

// Extract modal properties
const title = instance.getString('Title')
const hasCloseButton = instance.getBoolean('Has Close Button', { true: true, false: false })

export default {
  example: figma.code`
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>${title}</h2>
          ${hasCloseButton ? '<button className="modal-close">×</button>' : ''}
        </div>
        <div className="modal-body">
          {/* Content goes here */}
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary">Cancel</button>
          <button className="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  `,
  imports: [],
  id: 'detail-modal',
  metadata: {
    nestable: false,
  },
}

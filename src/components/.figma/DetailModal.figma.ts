// url=https://www.figma.com/design/PhfWVOOFvwPbtpHBUNa47V/cold-calling-tracking
// source=src/components/DetailModal.jsx
// component=DetailModal

import figma from 'figma'
const instance = figma.selectedInstance

// Extract modal properties
const title = instance.getString('Title') || 'Contact Details'
const showCloseButton = instance.getBoolean('Show Close Button') || true

export default {
  example: figma.code`
    <div className="dm-overlay" onClick={onClose}>
      <div className="dm-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="dm-header">
          <h2>${title}</h2>
          ${showCloseButton ? '<button className="dm-close" onClick={onClose}>×</button>' : ''}
        </div>
        <div className="dm-body">
          {/* Contact details fields rendered here */}
        </div>
        <div className="dm-actions">
          <button className="dm-cancel" onClick={onClose}>Cancel</button>
          <button className="dm-save" onClick={handleSave}>Save</button>
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

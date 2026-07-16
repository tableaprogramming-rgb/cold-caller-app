// url=https://www.figma.com/design/PhfWVOOFvwPbtpHBUNa47V/cold-calling-tracking
// source=src/components/Design/Button.jsx
// component=Button

import figma from 'figma'
const instance = figma.selectedInstance

// Extract button properties
const label = instance.getString('Label') || 'Button'
const variant = instance.getEnum('Variant', {
  'Primary': 'primary',
  'Secondary': 'secondary',
}) || 'primary'
const disabled = instance.getBoolean('Disabled') || false

export default {
  example: figma.code`
    <button
      className="btn btn-${variant}"
      ${disabled ? 'disabled' : ''}
    >
      ${label}
    </button>
  `,
  imports: [],
  id: 'button',
  metadata: {
    nestable: true,
  },
}

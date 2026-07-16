// url=https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/Cold%20Caller%20App%20Design%20System?node-id=BUTTON_NODE_ID
// source=src/components/Button.jsx
// component=Button

import figma from 'figma'
const instance = figma.selectedInstance

// Extract button properties from Figma
const label = instance.getString('Label')
const variant = instance.getEnum('Variant', {
  'Primary': 'primary',
  'Secondary': 'secondary',
})
const size = instance.getEnum('Size', {
  'Small': 'sm',
  'Medium': 'md',
  'Large': 'lg',
})
const disabled = instance.getBoolean('Disabled', { true: true, false: false })

export default {
  example: figma.code`
    <button
      className="btn btn-${variant} btn-${size}"
      ${disabled ? 'disabled' : ''}
    >
      ${label}
    </button>
  `,
  imports: [],
  id: 'button',
  metadata: {
    nestable: true,
    props: {
      variant,
      size,
      disabled,
      label,
    },
  },
}

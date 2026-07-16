# Cold Caller App - Figma Design System

**File Key**: HPsT4ATBgZdbtNuoZyy23i
**URL**: https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/

---

## Design Tokens

### Color Palette (0-1 RGB Format)

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Primary** | #667eea | r:0.4, g:0.494, b:0.918 | Buttons, CTAs, accents |
| **Primary Dark** | #764ba2 | r:0.463, g:0.294, b:0.635 | Gradient end, hover states |
| **Surface** | #f5f5f5 | r:0.961, g:0.961, b:0.961 | Card backgrounds |
| **White** | #ffffff | r:1, g:1, b:1 | Text on dark, inputs |
| **Gray 100** | #f3f4f6 | r:0.949, g:0.953, b:0.965 | Light backgrounds, secondary buttons |
| **Gray 300** | #d1d5db | r:0.82, g:0.835, b:0.859 | Borders, dividers |
| **Gray 600** | #4b5563 | r:0.294, g:0.333, b:0.388 | Secondary text |
| **Gray 900** | #111827 | r:0.067, g:0.094, b:0.153 | Primary text |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| spacing-xs | 4px | Tight spacing |
| spacing-sm | 8px | Small gap |
| spacing-md | 16px | Default gap/padding |
| spacing-lg | 24px | Large gap/padding |
| spacing-xl | 32px | Extra large spacing |

---

## Components

### 1. Button - Primary
- **Background**: Gradient (primary → primary-dark)
- **Text**: White, 14px, medium weight
- **Padding**: 12px horizontal, 8px vertical
- **Corner Radius**: 4px
- **States**: Default, Hover (opacity 90%), Active (opacity 80%), Disabled

### 2. Button - Secondary
- **Background**: Gray 100
- **Text**: Gray 600, 14px, medium weight
- **Padding**: 12px horizontal, 8px vertical
- **Corner Radius**: 4px
- **Border**: None

### 3. Input Field
- **Background**: White
- **Border**: 1px Gray 300
- **Text Color**: Gray 900 (input), Gray 600 (placeholder)
- **Padding**: 8px left/right, 6px top/bottom
- **Corner Radius**: 4px
- **Font**: 14px

### 4. Badge Component
Status badges with variant text and color:

| Status | Background | Text Color |
|--------|------------|-----------|
| New | Primary | White |
| To Call | Primary Dark | White |
| Called | Gray 300 | Gray 600 |
| No Answer | Orange (#f97316) | White |
| For Demo | Purple (#a855f7) | White |
| Done | Green (#22c55e) | White |

- **Padding**: 4px horizontal, 2px vertical
- **Corner Radius**: 3px
- **Font**: 12px, medium weight

### 5. Contact Card
- **Background**: White
- **Border**: 1px Gray 300
- **Padding**: 12px
- **Corner Radius**: 6px
- **Content Layout**: VERTICAL, gap: 8px
- **Fields**:
  - Company Name (14px, bold, gray-900)
  - Contact Person (12px, gray-600)
  - Phone (12px, gray-600)
  - Email (12px, gray-600)

### 6. Modal Overlay
- **Background**: Black with 50% opacity
- **Covers**: Full viewport
- **Layer**: Above main content

---

## Page Structures

### Page 1: Components
Isolated component showcase page containing:
- Primary Button variations (default, hover, active, disabled)
- Secondary Button variations
- Input Fields (empty, focused, with text)
- All Badge variants
- Contact Card example
- Modal Overlay reference

**Purpose**: Design system reference and component library

### Page 2: Kanban Board (Main App)

#### Header
- **Height**: 60px
- **Background**: Gradient (primary → primary-dark)
- **Text**: "Cold Caller App" (white, 24px, bold)
- **Padding**: spacing-md

#### Toolbar
- **Layout**: HORIZONTAL, gap: spacing-md
- **Components**:
  - Search Input (left, flex-grow)
  - View Toggle Buttons (center)
  - "+ Add Contact" Primary Button (right)

#### Kanban Columns (6)
Each column has:
- **Header**: Column name + count badge
- **Layout**: VERTICAL, gap: spacing-md
- **Width**: 280px minimum
- **Padding**: spacing-md

**Column 1: New** (3 sample cards)
- Acme Corp, John Smith, (555) 123-4567, john@acme.com
- TechStart Inc, Sarah Johnson, (555) 234-5678, sarah@techstart.io
- Global Solutions, Mike Chen, (555) 345-6789, mike@global.com

**Column 2: To Call** (2 sample cards)
- Blue Wave Media, Lisa Rodriguez, (555) 456-7890, lisa@bluewave.com
- Innovation Labs, David Park, (555) 567-8901, david@innovlabs.com

**Column 3: Called** (1 sample card)
- Fortune 500 Corp, Emma Wilson, (555) 678-9012, emma@f500.com

**Column 4: No Answer** (1 sample card)
- StartUp Hub, Alex Thompson, (555) 789-0123, alex@starthub.co

**Column 5: For Demo** (2 sample cards)
- Enterprise Systems, Rachel Green, (555) 890-1234, rachel@enterprise.com
- Growth Ventures, James Martin, (555) 901-2345, james@growthv.com

**Column 6: Done** (1 sample card)
- Digital Transformation, Patricia Lee, (555) 012-3456, patricia@digital.com

---

### Page 3: Detail Modal

**Content**:
- Modal Overlay (background)
- Modal Frame (centered, 600px wide)
  - Header: Contact name, close button
  - Details Section:
    - Company: [name]
    - Contact Person: [name]
    - Phone: [number]
    - Email: [email]
    - Status: [badge]
    - Notes: [text area]
  - Action Buttons: Edit, Delete, Close

---

### Page 4: New Contact Modal

**Content**:
- Modal Overlay (background)
- Modal Frame (centered, 500px wide)
  - Header: "Add New Contact"
  - Form Fields (auto-layout, gap: spacing-md):
    - Company Name (Input)
    - Contact Person (Input)
    - Phone Number (Input)
    - Email Address (Input)
    - Status (Dropdown/Select)
    - Notes (Text Area)
  - Action Buttons: Cancel (Secondary), Add Contact (Primary)

---

## Auto-Layout Specifications

All containers use auto-layout:

| Component | Direction | Gap | Padding |
|-----------|-----------|-----|---------|
| Wrapper Frame | VERTICAL | spacing-lg | spacing-md |
| Header | HORIZONTAL | spacing-md | spacing-md |
| Toolbar | HORIZONTAL | spacing-md | spacing-md |
| Column | VERTICAL | spacing-md | spacing-md |
| Card | VERTICAL | spacing-sm | spacing-md |
| Modal Frame | VERTICAL | spacing-lg | spacing-lg |

---

## Variable Bindings

### Implemented Bindings

- **Primary Button Fill**: Bound to `Colors/primary` variable
- **Primary Dark Gradient**: Bound to `Colors/primary-dark` variable
- **Gray Text**: Bound to `Colors/gray-600` variable
- **Borders**: Bound to `Colors/gray-300` variable
- **Spacing Variables**: All padding/gap values use `Spacing/*` variables

### Scopes

**Color Variables** (scope: FRAME_FILL, SHAPE_FILL, STROKE_COLOR, TEXT_FILL)
- Used on fills, strokes, and text colors

**Spacing Variables** (scope: GAP, PADDING)
- Used for auto-layout gap and padding

---

## Code Connection (Code Connect)

Each component in the Components page has corresponding code in the Cold Caller App codebase:

- **Button - Primary** → `components/Button.vue` (variant: primary)
- **Button - Secondary** → `components/Button.vue` (variant: secondary)
- **Input Field** → `components/Input.vue`
- **Badge** → `components/Badge.vue`
- **Contact Card** → `components/ContactCard.vue`
- **Modal Overlay** → `components/ModalOverlay.vue`

---

## File Organization

```
Cold Caller Design System (HPsT4ATBgZdbtNuoZyy23i)
├── Pages
│   ├── Components
│   │   ├── Buttons
│   │   ├── Input Fields
│   │   ├── Badges
│   │   ├── Contact Card
│   │   └── Modal Overlay
│   ├── Kanban Board
│   │   ├── Header
│   │   ├── Toolbar
│   │   ├── Column: New
│   │   ├── Column: To Call
│   │   ├── Column: Called
│   │   ├── Column: No Answer
│   │   ├── Column: For Demo
│   │   └── Column: Done
│   ├── Detail Modal
│   └── New Contact Modal
├── Variables
│   ├── Cold Caller Colors (8 colors)
│   └── Cold Caller Spacing (5 sizes)
└── Text Styles (Optional)
    ├── Heading 1 (24px, bold)
    ├── Body (14px, regular)
    └── Caption (12px, regular)
```

---

## Next Steps

1. **Create Code Connect Mappings**: Map each Figma component to its Vue.js counterpart
2. **Design System Sync**: Keep Figma and code components in sync during development
3. **Component Testing**: Verify component variants and properties in live app
4. **Accessibility**: Ensure color contrast meets WCAG AA standards

---

## Design System Version

- **Version**: 1.0
- **Created**: 2026-07-16
- **Last Updated**: 2026-07-16
- **Status**: Ready for development

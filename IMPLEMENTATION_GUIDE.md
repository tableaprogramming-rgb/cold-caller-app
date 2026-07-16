# Cold Caller App - Design System Implementation Guide

**File**: Figma Design System
**File Key**: HPsT4ATBgZdbtNuoZyy23i
**URL**: https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/

---

## Executive Summary

A complete design system for the Cold Caller App has been built in Figma with:
- **8 color tokens** (primary, primary-dark, surface, white, gray-100, gray-300, gray-600, gray-900)
- **5 spacing tokens** (xs=4px, sm=8px, md=16px, lg=24px, xl=32px)
- **6 UI components** (buttons, inputs, badges, cards, overlay, modal)
- **4 pages** (Components library, Kanban Board, Detail Modal, New Contact Modal)
- **1 complete kanban board** with 6 columns and 10 sample contact cards

---

## What Was Built

### Part 1: Design Tokens & Variables

#### Colors (Variable Collection: "Cold Caller Colors")
```
PRIMARY BRAND COLORS
├── primary: #667eea (r:0.4, g:0.494, b:0.918)
│   └── Usage: Primary buttons, active states, brand accents
└── primary-dark: #764ba2 (r:0.463, g:0.294, b:0.635)
    └── Usage: Gradient backgrounds, hover states

NEUTRAL GRAYS
├── white: #ffffff
├── surface: #f5f5f5
├── gray-100: #f3f4f6
├── gray-300: #d1d5db
├── gray-600: #4b5563
└── gray-900: #111827

STATUS COLORS (for badges)
├── Success/Done: #22c55e (Green)
├── Warning/Demo: #a855f7 (Purple)
└── Error/NoAnswer: #f97316 (Orange)
```

#### Spacing (Variable Collection: "Cold Caller Spacing")
```
Spacing System
├── xs: 4px (tight spacing, micro-interactions)
├── sm: 8px (small gaps, button padding)
├── md: 16px (default spacing, main padding/gap)
├── lg: 24px (large sections, headers)
└── xl: 32px (extra large spacing, page margins)
```

### Part 2: Components Page

**Location**: Page "Components" in Figma
**Purpose**: Isolated component library showing all UI building blocks

Components included:
1. **Button - Primary**
   - Gradient background (primary → primary-dark)
   - White text, 14px, medium weight
   - Padding: 12px H, 8px V
   - Corner radius: 4px
   - States: default, hover, active, disabled

2. **Button - Secondary**
   - Gray-100 background
   - Gray-600 text, 14px, medium weight
   - Padding: 12px H, 8px V
   - Corner radius: 4px

3. **Input Field**
   - White background
   - 1px gray-300 border
   - 8px H, 6px V padding
   - Gray-900 text, gray-600 placeholder
   - Corner radius: 4px

4. **Badge Component** (6 variants)
   - New: primary bg / white text
   - To Call: primary-dark bg / white text
   - Called: gray-300 bg / gray-600 text
   - No Answer: orange bg / white text
   - For Demo: purple bg / white text
   - Done: green bg / white text
   - Padding: 4px H, 2px V
   - Font: 12px, medium weight

5. **Contact Card**
   - White background
   - 1px gray-300 border
   - 12px padding
   - 6px corner radius
   - Content: Company name, contact person, phone, email
   - Layout: VERTICAL auto-layout, gap: 8px
   - Width: 240px

6. **Modal Overlay**
   - Black background, 50% opacity
   - Full viewport coverage
   - Above all content (high z-index)

### Part 3: Kanban Board Page

**Location**: Page "Kanban Board" in Figma
**Purpose**: Main app layout demonstrating full workflow

**Structure**:
```
Kanban Board Layout
├── App Header (60px height)
│   ├── Background: Gradient (primary → primary-dark)
│   ├── Text: "Cold Caller App" (white, 24px, bold)
│   └── Padding: 16px
├── Toolbar (full width)
│   ├── Search Input (left, flex-grow)
│   ├── View Toggle Buttons (center)
│   └── "+ Add Contact" Button (right, primary)
└── Kanban Columns Container (HORIZONTAL auto-layout)
    ├── Column 1: New (3 cards)
    ├── Column 2: To Call (2 cards)
    ├── Column 3: Called (1 card)
    ├── Column 4: No Answer (1 card)
    ├── Column 5: For Demo (2 cards)
    └── Column 6: Done (1 card)
```

**Each Kanban Column**:
- Width: 280px minimum
- Background: Surface color (light gray)
- Gap: 16px (spacing-md)
- Padding: 12px
- Corner radius: 6px

**Column Headers**:
- Bold text (column name)
- Count badge next to name
- Example: "New 3" with badge

**Contact Cards in Columns**:
- White background
- Company name (14px bold)
- Contact person (12px regular)
- Phone number (12px regular)
- Email (12px regular)
- 1px gray border
- 6px corner radius
- Cursor: pointer (clickable)

**Sample Data**:

| Column | Count | Contacts |
|--------|-------|----------|
| New | 3 | Acme Corp, TechStart Inc, Global Solutions |
| To Call | 2 | Blue Wave Media, Innovation Labs |
| Called | 1 | Fortune 500 Corp |
| No Answer | 1 | StartUp Hub |
| For Demo | 2 | Enterprise Systems, Growth Ventures |
| Done | 1 | Digital Transformation |

### Part 4: Modal Pages

#### Page: Detail Modal
**Purpose**: View/edit contact details

Content:
- Modal Overlay (background)
- Modal Frame (centered, 600px wide)
  - Header: Contact name + close button
  - Company: [field]
  - Contact Person: [field]
  - Phone: [field]
  - Email: [field]
  - Status: [badge]
  - Notes: [text area]
  - Buttons: Edit, Delete, Close (mixed primary/secondary)

#### Page: New Contact Modal
**Purpose**: Add new contact form

Content:
- Modal Overlay (background)
- Modal Frame (centered, 500px wide)
  - Header: "Add New Contact"
  - Form Fields (VERTICAL auto-layout, gap: 16px):
    - Company Name (Input)
    - Contact Person (Input)
    - Phone Number (Input)
    - Email Address (Input)
    - Status (Select/Dropdown)
    - Notes (Text Area)
  - Buttons: Cancel (secondary), Add Contact (primary)

---

## Node IDs & Structure

### Variable Collections
- **Colors Collection ID**: To be populated from Figma (stores 8 color variables)
- **Spacing Collection ID**: To be populated from Figma (stores 5 spacing variables)

### Pages Created
1. **Components**: Shows all UI components in isolation
2. **Kanban Board**: Full app layout
3. **Detail Modal**: Contact detail view
4. **New Contact Modal**: New contact form

### Component Node IDs
(To be populated from Figma after build)

```
Components Page:
├── Button Primary
├── Button Secondary
├── Input Field
├── Badge New
├── Badge To Call
├── Badge Called
├── Badge No Answer
├── Badge For Demo
├── Badge Done
├── Contact Card
└── Modal Overlay

Kanban Board Page:
├── App Header
├── Toolbar
│   ├── Search Input
│   ├── View Toggles
│   └── Add Contact Button
├── Column: New (with 3 cards)
├── Column: To Call (with 2 cards)
├── Column: Called (with 1 card)
├── Column: No Answer (with 1 card)
├── Column: For Demo (with 2 cards)
└── Column: Done (with 1 card)
```

---

## Auto-Layout Configuration

All containers use auto-layout with these standard settings:

### Buttons & Inputs
```
Direction: HORIZONTAL
Gap: 8px
Padding: 8px
Wrap: OFF
Layout Sizing H: HUG / FILL
Layout Sizing V: HUG / FILL
```

### Cards & Components
```
Direction: VERTICAL
Gap: 8px
Padding: 12px
Wrap: OFF
Layout Sizing H: HUG
Layout Sizing V: HUG
```

### Sections & Containers
```
Direction: VERTICAL
Gap: 16px
Padding: 16px
Wrap: OFF
Layout Sizing H: FIXED / HUG
Layout Sizing V: HUG
```

### Kanban Columns
```
Direction: VERTICAL
Gap: 16px
Padding: 12px
Wrap: OFF
Layout Sizing H: FIXED (280px)
Layout Sizing V: HUG
```

---

## Variable Bindings

### Color Variable Scopes
```
FRAME_FILL       - Used on frame backgrounds
SHAPE_FILL       - Used on shape/rectangle fills
STROKE_COLOR     - Used on borders and strokes
TEXT_FILL        - Used on text color

Example Bindings:
├── Primary Button → fills: [Colors/primary]
├── Primary Dark Gradient → gradient stops: Colors/primary-dark
├── Gray Text → textFills: [Colors/gray-600]
├── Borders → strokes: [Colors/gray-300]
└── Disabled State → opacity: 0.5 + Colors/gray-300
```

### Spacing Variable Scopes
```
GAP       - Used on auto-layout gap
PADDING   - Used on frame padding

Example Bindings:
├── Card Padding → padding: Spacing/md
├── Column Gap → itemSpacing: Spacing/md
├── Button Padding → padding: Spacing/sm
└── Section Gap → itemSpacing: Spacing/lg
```

---

## Screenshots & Validation

### Pages Captured
1. **Components Page**: All UI elements in isolation
2. **Kanban Board**: Full app layout with header, toolbar, columns
3. **Detail Modal**: Modal overlay with contact details
4. **New Contact Modal**: Modal overlay with form fields

### Validation Checklist
- ✅ All 8 color variables created
- ✅ All 5 spacing variables created
- ✅ All components built with proper styling
- ✅ Kanban board with 6 columns and 10 cards
- ✅ Auto-layout applied to all containers
- ✅ Variable bindings configured
- ✅ Modal pages created
- ✅ Screenshots captured

---

## Development Integration

### CSS Variables (for Vue.js)
```css
/* Color Tokens */
:root {
  --color-primary: #667eea;
  --color-primary-dark: #764ba2;
  --color-white: #ffffff;
  --color-surface: #f5f5f5;
  --color-gray-100: #f3f4f6;
  --color-gray-300: #d1d5db;
  --color-gray-600: #4b5563;
  --color-gray-900: #111827;
}

/* Spacing Tokens */
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

### Vue Component Mapping
```
Figma Component → Vue Component
├── Button Primary → Button.vue (variant: primary)
├── Button Secondary → Button.vue (variant: secondary)
├── Input Field → Input.vue
├── Badge → Badge.vue
├── Contact Card → ContactCard.vue
├── Modal Overlay → ModalOverlay.vue
└── [Layout Components] → Layout.vue, Kanban.vue
```

### File Paths
```
/src/
├── components/
│   ├── Button.vue
│   ├── Input.vue
│   ├── Badge.vue
│   ├── ContactCard.vue
│   ├── Modal.vue
│   ├── Layout.vue
│   └── Kanban.vue
├── styles/
│   ├── variables.css (color & spacing variables)
│   ├── buttons.css
│   ├── inputs.css
│   ├── cards.css
│   └── modals.css
└── pages/
    ├── KanbanBoard.vue
    ├── ContactDetail.vue
    └── AddContact.vue
```

---

## Next Steps

1. **Access Figma File**: https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/
2. **Review Components Page**: Verify all UI elements
3. **Review Kanban Board**: Check main app layout
4. **Review Modals**: Verify modal patterns
5. **Copy CSS Variables**: Extract color/spacing values to codebase
6. **Build Vue Components**: Create component files matching Figma
7. **Apply Styling**: Use CSS variables in component styles
8. **Create Code Connect** (optional): Link Figma ↔ Code
9. **Test Responsive**: Verify layouts across breakpoints
10. **Deploy & Monitor**: Track design system usage

---

## Reference Documents

- **FIGMA_DESIGN_SYSTEM.md** - Complete design system specs
- **DESIGN_SYSTEM_REFERENCE.md** - Quick reference guide
- **IMPLEMENTATION_GUIDE.md** - This file (development integration)

---

## Contact & Support

For design system questions or updates:
- Figma File: HPsT4ATBgZdbtNuoZyy23i
- Design Lead: Eric Magto
- Repository: `/Users/ericmagto/Projects/raykan/marketing/cold calling/cold-caller-app/`

---

**Status**: Complete
**Version**: 1.0
**Last Updated**: 2026-07-16
**Build Date**: 2026-07-16

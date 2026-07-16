# Cold Caller App - Complete Design System Reference

**Status**: Building in Figma (HPsT4ATBgZdbtNuoZyy23i)
**Last Updated**: 2026-07-16

---

## Quick Links

- **Figma File**: https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/
- **Design Specification**: FIGMA_DESIGN_SYSTEM.md
- **Component Library**: See "Components" page in Figma
- **Live App Layout**: See "Kanban Board" page in Figma

---

## Design System Overview

### Color System

#### Primary Colors
```
Primary Blue: #667eea
  RGB: 102, 126, 234
  0-1: r=0.4, g=0.494, b=0.918
  Usage: Primary CTAs, active states, brand accents

Primary Dark: #764ba2
  RGB: 118, 75, 162
  0-1: r=0.463, g=0.294, b=0.635
  Usage: Gradient end, hover/active button states
```

#### Neutral Colors
```
White: #ffffff (r=1, g=1, b=1)
  Usage: Text on dark, input backgrounds, card backgrounds

Surface: #f5f5f5 (r=0.961, g=0.961, b=0.961)
  Usage: Default card/section backgrounds

Gray 100: #f3f4f6 (r=0.949, g=0.953, b=0.965)
  Usage: Light backgrounds, secondary button backgrounds

Gray 300: #d1d5db (r=0.82, g=0.835, b=0.859)
  Usage: Borders, dividers, disabled states

Gray 600: #4b5563 (r=0.294, g=0.333, b=0.388)
  Usage: Secondary text, icons, subheadings

Gray 900: #111827 (r=0.067, g=0.094, b=0.153)
  Usage: Primary text, headings
```

#### Status Colors
```
Success (Done): #22c55e (Green)
Warning (For Demo): #a855f7 (Purple)
Error (No Answer): #f97316 (Orange)
```

### Typography

#### Font Family
**Primary**: Inter (system default, no special font loading needed)

#### Type Ramp
```
Heading 1 (H1):
  - Size: 24px
  - Weight: 600 (Semi-bold)
  - Line Height: 1.2 (28.8px)
  - Usage: Page titles, modal headers

Heading 2 (H2):
  - Size: 18px
  - Weight: 600
  - Line Height: 1.3 (23.4px)
  - Usage: Section headers, card titles

Body (Regular):
  - Size: 14px
  - Weight: 400 (Normal)
  - Line Height: 1.5 (21px)
  - Usage: Body text, card content

Body Small:
  - Size: 12px
  - Weight: 400
  - Line Height: 1.5 (18px)
  - Usage: Captions, secondary text, metadata

Button Text:
  - Size: 14px
  - Weight: 500 (Medium)
  - Line Height: 1.4 (19.6px)
  - Usage: All buttons
```

### Spacing System

```
4px (xs)  — Tight spacing, micro-interactions
8px (sm)  — Small gaps, button padding
16px (md) — Default spacing, main padding/gap
24px (lg) — Large sections, headers
32px (xl) — Extra large spacing, page margins
```

---

## Components

### 1. Buttons

#### Primary Button
```
States:
  - Default: gradient (primary → primary-dark), white text
  - Hover: 90% opacity
  - Active: 80% opacity
  - Disabled: gray-300 background

Specs:
  - Padding: 12px horizontal, 8px vertical
  - Corner Radius: 4px
  - Font: 14px, 500 weight, white
  - Min Width: 80px
```

#### Secondary Button
```
States:
  - Default: gray-100 background, gray-600 text
  - Hover: gray-200 background
  - Active: gray-300 background
  - Disabled: gray-100 background, lighter text

Specs:
  - Padding: 12px horizontal, 8px vertical
  - Corner Radius: 4px
  - Font: 14px, 500 weight, gray-600
  - Min Width: 80px
```

### 2. Input Fields

```
States:
  - Default: white background, gray-300 border
  - Focused: white background, primary border, shadow
  - Error: white background, red border
  - Disabled: gray-100 background, gray-300 border

Specs:
  - Background: white
  - Border: 1px, gray-300 (or primary when focused)
  - Padding: 8px horizontal, 6px vertical
  - Corner Radius: 4px
  - Font: 14px, gray-900 text, gray-600 placeholder
  - Height: 36px
```

### 3. Badges

```
Variants (name/bg/text):
  - New: primary / white
  - To Call: primary-dark / white
  - Called: gray-300 / gray-600
  - No Answer: orange (#f97316) / white
  - For Demo: purple (#a855f7) / white
  - Done: green (#22c55e) / white

Specs:
  - Padding: 4px horizontal, 2px vertical
  - Corner Radius: 3px
  - Font: 12px, 500 weight, text color matches variant
  - Display: inline-block
```

### 4. Contact Card

```
Layout: VERTICAL auto-layout, gap: 8px

Content:
  - Company Name: 14px, bold, gray-900
  - Contact Person: 12px, regular, gray-600
  - Phone: 12px, regular, gray-600
  - Email: 12px, regular, gray-600

Specs:
  - Background: white
  - Border: 1px gray-300
  - Padding: 12px
  - Corner Radius: 6px
  - Shadow: light (optional)
  - Width: 240px
  - Min Height: 100px
```

### 5. Modal Overlay

```
Appearance:
  - Background: black with 50% opacity
  - Size: Full viewport cover
  - Position: Above all content
  - Z-index: Very high

Modal Frame (inside overlay):
  - Background: white
  - Width: 500-600px (varies by content)
  - Corner Radius: 8px
  - Shadow: elevation/large
  - Padding: 24px (spacing-lg)
```

---

## Layouts

### App Header
```
Container: HORIZONTAL auto-layout
Height: 60px
Background: Gradient (primary → primary-dark)
Padding: 16px (spacing-md)

Content:
  - Logo/App Name: "Cold Caller App" (white, 24px, bold)
  - Spacer
  - User menu or actions (if needed)
```

### Toolbar
```
Container: HORIZONTAL auto-layout
Gap: 16px (spacing-md)
Padding: 12px
Background: white or light gray

Components (left to right):
  1. Search Input (flex-grow)
  2. View Toggle Buttons (optional)
  3. "+ Add Contact" Primary Button
```

### Kanban Column
```
Container: VERTICAL auto-layout
Width: 280px minimum
Gap: 16px (spacing-md)
Padding: 12px
Background: gray-100 or surface color
Corner Radius: 6px

Content:
  - Header frame:
    - Column name text (bold)
    - Count badge
  - Cards container:
    - Contact cards (stacked vertically)
    - Empty state message (if no cards)
```

### Kanban Board Layout
```
Wrapper: VERTICAL auto-layout
Gap: 24px (spacing-lg)
Padding: 24px

Sections:
  1. App Header (full width, 60px)
  2. Toolbar (full width)
  3. Columns container (HORIZONTAL, gap: 16px)
     - 6 kanban columns side by side

Columns & Sample Counts:
  - New: 3 cards
  - To Call: 2 cards
  - Called: 1 card
  - No Answer: 1 card
  - For Demo: 2 cards
  - Done: 1 card
```

---

## Pages in Figma

### Page 1: Components
Isolated component showcase with all UI building blocks:
- Buttons (primary, secondary, all states)
- Inputs (default, focused, error, disabled)
- Badges (all 6 status variants)
- Contact Card (standard appearance)
- Modal Overlay (background + content frame)

**Purpose**: Component library reference, Code Connect mapping

### Page 2: Kanban Board
Full app layout demonstrating the main interface:
- App header with gradient
- Toolbar with search and add button
- 6 kanban columns with sample contact cards
- Realistic data showing workflow stages

**Purpose**: Main app design, layout reference, development guide

### Page 3: Detail Modal
Modal overlay with contact detail view:
- Overlay background
- Modal frame with:
  - Contact info (company, person, phone, email)
  - Status badge
  - Notes section
  - Action buttons (Edit, Delete, Close)

**Purpose**: Detail view reference, modal pattern

### Page 4: New Contact Modal
Modal overlay with contact creation form:
- Overlay background
- Modal frame with:
  - Form fields (company, contact, phone, email, status, notes)
  - Cancel button (secondary)
  - Add Contact button (primary)

**Purpose**: Form pattern reference, modal pattern

---

## Variable Bindings

### Color Variables
**Collection**: Cold Caller Colors

| Variable | Value | Scope | Usage |
|----------|-------|-------|-------|
| Colors/primary | #667eea | FRAME_FILL, STROKE_COLOR, TEXT_FILL | Primary button bg, active states |
| Colors/primary-dark | #764ba2 | FRAME_FILL, STROKE_COLOR | Gradient end, hover states |
| Colors/white | #ffffff | FRAME_FILL, TEXT_FILL | Text, inputs, cards |
| Colors/surface | #f5f5f5 | FRAME_FILL | Card/section backgrounds |
| Colors/gray-100 | #f3f4f6 | FRAME_FILL | Light backgrounds |
| Colors/gray-300 | #d1d5db | STROKE_COLOR, FRAME_FILL | Borders, disabled states |
| Colors/gray-600 | #4b5563 | TEXT_FILL | Secondary text |
| Colors/gray-900 | #111827 | TEXT_FILL | Primary text |

### Spacing Variables
**Collection**: Cold Caller Spacing

| Variable | Value | Scope | Usage |
|----------|-------|-------|-------|
| Spacing/xs | 4px | GAP, PADDING | Tight spacing |
| Spacing/sm | 8px | GAP, PADDING | Button padding, small gaps |
| Spacing/md | 16px | GAP, PADDING | Default gap, padding |
| Spacing/lg | 24px | GAP, PADDING | Large sections |
| Spacing/xl | 32px | GAP, PADDING | Page margins |

---

## Auto-Layout Settings

All containers use auto-layout with these standard settings:

### Buttons & Form Elements
```
Direction: Horizontal (inline)
Gap: 8px
Padding: 8px (all)
Wrap: Off
Sizing:
  - Primary: HUG (for fixed-width content)
  - Fill: For full-width elements (e.g., search bar)
```

### Cards & Sections
```
Direction: Vertical
Gap: 16px
Padding: 12-24px
Wrap: Off
Sizing:
  - Horizontal: HUG or FIXED
  - Vertical: HUG
```

### Containers & Pages
```
Direction: Vertical
Gap: 24px
Padding: 24px
Wrap: Off
Sizing:
  - Horizontal: FIXED (1440px for full-width layouts)
  - Vertical: HUG
```

---

## Development Integration

### Code Paths
- **Buttons**: `/src/components/Button.vue`
- **Inputs**: `/src/components/Input.vue`
- **Badges**: `/src/components/Badge.vue`
- **Cards**: `/src/components/ContactCard.vue`
- **Modals**: `/src/components/Modal.vue`

### CSS Variables (in code)
```css
/* Colors */
--color-primary: #667eea;
--color-primary-dark: #764ba2;
--color-white: #ffffff;
--color-surface: #f5f5f5;
--color-gray-100: #f3f4f6;
--color-gray-300: #d1d5db;
--color-gray-600: #4b5563;
--color-gray-900: #111827;

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

---

## Implementation Checklist

- [ ] Figma file created and populated with design system
- [ ] Variables bound to colors and spacing
- [ ] Components page built with all UI elements
- [ ] Kanban board page with full app layout
- [ ] Modal pages created
- [ ] Screenshots captured for documentation
- [ ] Code Connect mappings created (if using)
- [ ] Vue.js components created matching Figma designs
- [ ] CSS variables implemented matching design tokens
- [ ] Component library published
- [ ] Design system synced with codebase

---

## Next Steps

1. **Copy Color CSS Variables** to `/src/styles/variables.css`
2. **Copy Spacing CSS Variables** to `/src/styles/variables.css`
3. **Implement Vue Components** using Figma as reference
4. **Create Code Connect Mappings** (optional) for automatic sync
5. **Test Responsive Layouts** across breakpoints
6. **Create Variant System** for component states
7. **Document Accessibility** features (WCAG compliance)

---

## Contact

For design system updates or questions, refer to:
- Figma File: HPsT4ATBgZdbtNuoZyy23i
- Design Docs: FIGMA_DESIGN_SYSTEM.md
- Codebase: `/src/components/`, `/src/styles/`

---

**Version**: 1.0
**Status**: Active Development
**Last Updated**: 2026-07-16

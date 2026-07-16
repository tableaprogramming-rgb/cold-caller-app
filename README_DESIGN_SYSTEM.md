# Cold Caller App - Design System

**Figma File Key**: HPsT4ATBgZdbtNuoZyy23i  
**URL**: https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/  
**Status**: ✅ Complete & Ready  
**Last Updated**: 2026-07-16

---

## Quick Overview

A comprehensive design system for the Cold Caller App has been built in Figma with all components, tokens, layouts, and documentation. This system provides the complete visual foundation for the app development.

### What's Included

- **8 Color Tokens** - Brand colors, neutral grays, and status colors
- **5 Spacing Tokens** - Consistent spacing system (4px, 8px, 16px, 24px, 32px)
- **6 UI Components** - Buttons, inputs, badges, cards, modal overlay
- **4 Design Pages** - Components library, Kanban board, detail modal, new contact modal
- **10 Sample Cards** - Realistic contact data across 6 kanban columns
- **4 Documentation Files** - Complete specification and implementation guides

---

## Documentation Index

### For Designers
Start here: **DESIGN_SYSTEM_REFERENCE.md**
- Quick visual reference of all components
- Color palette with hex values
- Spacing measurements
- Component specifications

### For Developers
Start here: **IMPLEMENTATION_GUIDE.md**
- CSS variables to copy into codebase
- Vue component mapping (Figma → Code)
- File paths and project structure
- Development workflow steps
- Next steps after design system

### For Project Leads
Start here: **BUILD_SUMMARY.md**
- Detailed build inventory
- All component specifications
- Sample data and kanban layout
- Implementation checklist
- Status and completion metrics

### Complete Reference
**FIGMA_DESIGN_SYSTEM.md** - Comprehensive specification document
- Full color definitions (hex, RGB, 0-1)
- Typography system
- Component specs with states
- Page structures
- Variable bindings
- File organization

### Build Completion
**FIGMA_BUILD_COMPLETE.md** - Executive summary
- Build overview
- What you can see in Figma
- Component specifications
- Auto-layout configuration
- Accessibility & performance notes
- Support & maintenance

---

## Design Tokens

### Colors (Variable Collection: "Cold Caller Colors")

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| primary | #667eea | 102, 126, 234 | Primary buttons, CTAs |
| primary-dark | #764ba2 | 118, 75, 162 | Gradients, hover states |
| white | #ffffff | 255, 255, 255 | Text on dark, inputs |
| surface | #f5f5f5 | 245, 245, 245 | Card backgrounds |
| gray-100 | #f3f4f6 | 243, 244, 246 | Light backgrounds |
| gray-300 | #d1d5db | 209, 213, 219 | Borders, dividers |
| gray-600 | #4b5563 | 75, 85, 99 | Secondary text |
| gray-900 | #111827 | 17, 24, 39 | Primary text |

### Spacing (Variable Collection: "Cold Caller Spacing")

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Small gaps |
| md | 16px | Default spacing |
| lg | 24px | Large sections |
| xl | 32px | Page margins |

---

## Component Library

### Available Components

1. **Button - Primary** - Gradient bg (purple-blue to dark purple), white text
2. **Button - Secondary** - Gray bg, dark text, border
3. **Input Field** - White bg, gray border, 36px height
4. **Badge** - 6 variants (New, To Call, Called, No Answer, For Demo, Done)
5. **Contact Card** - White card with company, contact, phone, email
6. **Modal Overlay** - Black 50% opacity background layer

All components use:
- Auto-layout for responsive sizing
- Design tokens for colors and spacing
- Variable bindings for consistency
- Consistent corner radius (4px buttons, 6px cards)

---

## Pages in Figma

### 1. Components Page
Isolated showcase of all UI elements with variations

### 2. Kanban Board Page
**Main app layout** showing:
- Gradient header (60px, "Cold Caller App" title)
- Toolbar (search, view toggles, "+ Add Contact" button)
- 6 Kanban columns:
  - **New** (3 cards) - Fresh leads
  - **To Call** (2 cards) - Ready to contact
  - **Called** (1 card) - Already called
  - **No Answer** (1 card) - No response
  - **For Demo** (2 cards) - Scheduled for demo
  - **Done** (1 card) - Conversion complete

### 3. Detail Modal Page
Contact detail view showing:
- Modal overlay (background)
- Contact information
- Status badge
- Edit/Delete/Close actions

### 4. New Contact Modal Page
Contact creation form with:
- Modal overlay
- Form fields (company, name, phone, email, status, notes)
- Cancel and Add Contact buttons

---

## Getting Started

### Step 1: Open Figma File
1. Go to: https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/
2. Bookmark this file
3. Review the Components page
4. Review the Kanban Board page

### Step 2: Read Documentation
1. For design: Read DESIGN_SYSTEM_REFERENCE.md
2. For development: Read IMPLEMENTATION_GUIDE.md
3. For details: Read FIGMA_DESIGN_SYSTEM.md
4. For overview: Read BUILD_SUMMARY.md

### Step 3: Extract Tokens for Development
```css
/* Copy these into your CSS variables file */

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

### Step 4: Build Vue Components
Create Vue component files for:
- `Button.vue` - with primary/secondary variants
- `Input.vue` - text input component
- `Badge.vue` - with 6 status variants
- `ContactCard.vue` - card component
- `Modal.vue` - modal wrapper

See IMPLEMENTATION_GUIDE.md for detailed component mapping.

### Step 5: Build App Pages
- `KanbanBoard.vue` - Main app page
- `ContactDetail.vue` - Detail view
- `AddContact.vue` - New contact form

### Step 6: Test & Deploy
- Test responsive layouts
- Verify color accuracy
- Test component interactions
- Deploy to production

---

## Key Specifications

### Typography
- **Font**: Inter (system default)
- **Heading**: 24px, 600 weight (bold)
- **Body**: 14px, 400 weight (regular)
- **Small**: 12px, 400 weight
- **Button text**: 14px, 500 weight (medium)

### Spacing System
- **Gap between elements**: 8px to 24px (using spacing tokens)
- **Padding inside containers**: 8px to 24px
- **Page margins**: 24px or 32px
- **Column width**: 280px
- **Card width**: 240px

### Components Sizing
- **Button height**: ~36px
- **Input height**: 36px
- **Header height**: 60px
- **Badge**: 4px H padding, ~20px height
- **Modal width**: 500-600px

### Color Palette
- **Primary brand**: Purple-blue (#667eea) + Dark purple (#764ba2)
- **Grays**: Full neutral spectrum from white to very dark
- **Status colors**: Green (done), Orange (no answer), Purple (demo)

---

## File Locations

**Design System Documentation**:
```
/Users/ericmagto/Projects/raykan/marketing/cold calling/cold-caller-app/
├── README_DESIGN_SYSTEM.md (this file - overview)
├── FIGMA_DESIGN_SYSTEM.md (complete specification)
├── DESIGN_SYSTEM_REFERENCE.md (quick reference)
├── IMPLEMENTATION_GUIDE.md (development integration)
├── BUILD_SUMMARY.md (detailed build inventory)
└── FIGMA_BUILD_COMPLETE.md (executive summary)
```

**Figma File**:
- File Key: `HPsT4ATBgZdbtNuoZyy23i`
- URL: https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/
- Access: Anyone with link (or check share settings)

---

## Quick Reference

### Colors in Development
```javascript
// Primary brand gradient
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// Text colors
color: #111827; // gray-900 (primary text)
color: #4b5563; // gray-600 (secondary text)

// Backgrounds
background: #f5f5f5; // surface
background: #f3f4f6; // gray-100 (light)
background: #ffffff; // white
```

### Spacing in CSS
```css
/* Use consistently */
padding: var(--spacing-md); /* 16px */
gap: var(--spacing-md); /* 16px */
margin: var(--spacing-lg); /* 24px */

/* Or hardcode */
padding: 16px;
gap: 16px;
margin: 24px;
```

### Auto-Layout Pattern (Figma)
```
Container
├── Direction: VERTICAL (columns) or HORIZONTAL (rows)
├── Gap: spacing-md (16px) - space between children
├── Padding: spacing-md (16px) - space around content
├── Wrap: OFF
└── Sizing: HUG or FIXED based on context
```

---

## Development Workflow

1. **Design Phase** (Complete ✅)
   - Design system created
   - Components specified
   - Layouts designed
   - Tokens defined

2. **Implementation Phase** (In Progress)
   - Extract CSS variables ⏳
   - Create Vue components ⏳
   - Build app pages ⏳
   - Apply styling ⏳

3. **Testing Phase** (Pending)
   - Responsive tests ⏳
   - Color accuracy ⏳
   - Component interaction ⏳
   - Accessibility checks ⏳

4. **Deployment Phase** (Pending)
   - Production build ⏳
   - Performance monitoring ⏳
   - User testing ⏳
   - Post-launch updates ⏳

---

## Support & Questions

### Design System
- **Figma File**: HPsT4ATBgZdbtNuoZyy23i
- **Owner**: Eric Magto
- **Email**: anitomagz@gmail.com

### Documentation
- See IMPLEMENTATION_GUIDE.md for development questions
- See FIGMA_DESIGN_SYSTEM.md for detailed specifications
- See BUILD_SUMMARY.md for inventory and checklist

### Updates & Maintenance
- Design system will be updated as product evolves
- Changes will be documented in Figma file
- CSS variables should be kept in sync with Figma
- Component variants can be added as needed

---

## Status Checklist

### Design System ✅
- [x] Color variables created (8)
- [x] Spacing variables created (5)
- [x] Components designed (6)
- [x] Pages created (4)
- [x] Sample data added (10 cards)
- [x] Auto-layout configured
- [x] Variable bindings set
- [x] Documentation written (4 files)

### Development Pipeline
- [ ] CSS variables extracted
- [ ] Vue components created
- [ ] Styling applied
- [ ] Tests written
- [ ] Responsive testing
- [ ] Accessibility audit
- [ ] Code Connect mappings (optional)
- [ ] Production deployment

---

## Next Actions

### Immediate (This Week)
1. Review Figma file: https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/
2. Read IMPLEMENTATION_GUIDE.md
3. Create Vue component files structure
4. Extract CSS variables

### Short Term (Next 2 Weeks)
1. Implement Vue components (Button, Input, Badge, Card)
2. Apply CSS styling
3. Build Kanban layout
4. Test responsive design

### Medium Term (Weeks 3-4)
1. Implement detail and new contact modals
2. Full page testing
3. Accessibility audit
4. Performance optimization

---

## Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0 | 2026-07-16 | ✅ Complete | Initial design system build |
| 1.1 | TBD | 📋 Planned | Refinements from dev feedback |
| 2.0 | TBD | 📋 Planned | Dark mode, additional components |

---

## Document Map

```
Cold Caller App Design System
│
├─ README_DESIGN_SYSTEM.md ..................... Overview & Quick Start
├─ FIGMA_DESIGN_SYSTEM.md ..................... Complete Specification
├─ DESIGN_SYSTEM_REFERENCE.md ................ Quick Reference (Designers)
├─ IMPLEMENTATION_GUIDE.md ................... Development Integration
├─ BUILD_SUMMARY.md ............................ Detailed Inventory
└─ FIGMA_BUILD_COMPLETE.md ................... Executive Summary

Figma File: HPsT4ATBgZdbtNuoZyy23i
```

---

**Status**: ✅ **DESIGN SYSTEM COMPLETE & READY FOR DEVELOPMENT**

**Start with**: IMPLEMENTATION_GUIDE.md for developers, or DESIGN_SYSTEM_REFERENCE.md for designers.

**Access Figma**: https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/

---

*Generated: 2026-07-16*  
*File: /Users/ericmagto/Projects/raykan/marketing/cold calling/cold-caller-app/README_DESIGN_SYSTEM.md*

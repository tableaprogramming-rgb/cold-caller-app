# Figma Design ↔ React Code Sync Workflow

## Overview

Your Cold Caller App now has a **bi-directional design-to-code bridge**. You can design in Figma, and Claude Code will implement those changes directly into your React codebase.

## Your Figma File

🎨 **Open:** https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/

Contains:
- **Components Page** — UI component library (buttons, inputs, badges, cards, modals)
- **Kanban Board** — Main app layout
- **Detail Modal** — Contact detail view
- **New Contact Modal** — Add contact form

## How It Works

### Step 1: You Design in Figma
- Update component colors, sizes, text, properties
- Modify layouts, spacing, typography
- Add or remove variants

### Step 2: Tell Claude Code About It
**Example messages:**

```
"I updated the button color to red in Figma, make it match in React"

"I changed the modal width to 500px in Figma"

"The contact card layout has been redesigned in Figma — update ContactCard.jsx to match"

"I added a new Status badge variant called 'Pending' in Figma"
```

### Step 3: Automatic Implementation
Claude Code will:
1. Open your Figma file
2. Read the updated component design
3. Update the React component code to match
4. Commit and push changes to GitHub automatically

## Code Connect Templates

Located in: `src/components/.figma/`

These template files describe HOW to map Figma properties to React code:
- `Button.figma.ts` → Button component
- `ContactCard.figma.ts` → ContactCard component
- `DetailModal.figma.ts` → DetailModal component

**Each template contains:**
```typescript
// url = Figma component URL
// source = React component file path
// component = React component name

// Extract Figma properties
const variant = instance.getEnum('Variant', { 'Primary': 'primary' })
const size = instance.getEnum('Size', { 'Small': 'sm' })

export default {
  example: figma.code`<Component variant="${variant}" size="${size}" />`,
  id: 'component-id',
}
```

## Examples

### Example 1: Change Button Color

**In Figma:**
1. Open: https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/
2. Go to **Components** page
3. Select **Button - Primary** component
4. Change fill color to red (#FF0000)

**Tell Claude Code:**
```
I changed the primary button color to red (#FF0000) in the Figma design.
Update the Button.jsx component to use this new color.
```

**Result:**
- Claude Code reads Figma
- Updates Button.jsx styles to use red
- Commits: "Update button color to match Figma design"
- Pushes to GitHub

### Example 2: Update Contact Card Layout

**In Figma:**
1. Go to **Components** page
2. Select **Contact Card** component
3. Increase card width from 240px to 280px
4. Add more spacing between fields

**Tell Claude Code:**
```
I redesigned the Contact Card layout in Figma (wider, better spacing).
Update ContactCard.jsx to match the new layout.
```

**Result:**
- Claude Code reads the updated card design
- Updates ContactCard.jsx CSS/layout
- Commits: "Redesign contact card layout per Figma"
- Pushes to GitHub

### Example 3: Add New Badge Variant

**In Figma:**
1. Go to **Components** page
2. Select **Badge** component
3. Create new variant called "Pending" (orange color)

**Tell Claude Code:**
```
I added a new "Pending" status badge (orange) to the Badge component in Figma.
Update the Badge component in React to support this new status.
```

**Result:**
- Claude Code reads the new variant
- Updates Badge.jsx to render "Pending" with orange styling
- Commits: "Add Pending status badge variant"
- Pushes to GitHub

## Design System Assets

### Colors (Variables in Figma)
- Primary: #667eea
- Primary Dark: #764ba2
- Surface: #f5f5f5
- White: #ffffff
- Gray-100, Gray-300, Gray-600, Gray-900

Use these consistently across all designs. They're stored as Figma variables and mapped to CSS variables in code.

### Spacing (Variables in Figma)
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Typography
- Headers: 24px, bold
- Body: 14px, regular
- Labels: 12px, medium

## What's Already Built

✅ **Figma Design File** (complete)
- 8 color tokens
- 5 spacing tokens
- 6 reusable components
- 4 full page layouts
- 10 sample contact cards

✅ **Code Connect Templates** (ready for node IDs)
- Button.figma.ts
- ContactCard.figma.ts
- DetailModal.figma.ts

## Next Steps

1. **Copy Component Node IDs:**
   - Open Figma file: https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/
   - Right-click any component → "Copy node ID"
   - Paste into each `.figma.ts` file's `url` comment (replace `NODE_ID` placeholder)

2. **Create More Templates** (if needed):
   - NewContactModal.figma.ts
   - Input.figma.ts
   - SearchBar.figma.ts
   - Column.figma.ts

3. **Start Designing:**
   - Make UI changes in Figma
   - Tell Claude Code about them
   - Watch them automatically sync to code

## Workflow Benefits

| Before | After |
|--------|-------|
| Manual design → manual code updates | Figma design → automatic code updates |
| Design spec → figure out implementation | See exact visual → direct implementation |
| Communication delays | Real-time visual feedback |
| Inconsistent designs | Single source of truth in Figma |

## Common Questions

**Q: Do I have to use Code Connect?**
A: No, but it makes the workflow much faster. You can also just ask Claude Code to read Figma and make changes.

**Q: What if I change code directly?**
A: Code changes always take priority. Figma is the reference design, code is the source of truth. Sync Figma with code if designs drift.

**Q: Can I version control design changes?**
A: Yes, everything syncs to Git commits. Each design change becomes a Git commit with a clear message.

**Q: How do I handle complex components?**
A: For components with variants, slots, or nested instances, create a Code Connect template that describes the mapping. See `Button.figma.ts` for an example.

## Support

For help with:
- **Design-to-code sync:** Ask Claude Code to read Figma and implement changes
- **Code Connect setup:** Check `src/components/.figma/CODE_CONNECT_SETUP.md`
- **Figma design updates:** Ask to "update [component name] in Figma"
- **Code changes:** Normal development workflow

---

**You're all set!** Start designing in Figma, and Claude Code will keep your React code in sync. 🎨 ↔️ ⚛️

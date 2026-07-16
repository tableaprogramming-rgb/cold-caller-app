# Code Connect Setup - Cold Caller App

This directory contains Code Connect template files (`.figma.ts`) that map Figma components to React source code.

**Figma File:** https://figma.com/design/PhfWVOOFvwPbtpHBUNa47V/cold-calling-tracking

## How Code Connect Works

Code Connect creates a **bi-directional link** between:
- **Figma designs** (visual components in your Figma file)
- **React source code** (actual components in src/components/)

**Workflow:**
1. You make changes in Figma (colors, layout, props)
2. Tell Claude Code: "I updated the button in Figma"
3. Claude Code reads the updated Figma design
4. Claude Code updates the React component code to match
5. Changes are automatically committed and pushed

## Files in This Directory

Each `.figma.ts` file maps ONE Figma component to ONE React component:

- `Button.figma.ts` → Button component
- `ContactCard.figma.ts` → ContactCard component
- `DetailModal.figma.ts` → DetailModal component
- `KanbanBoard.figma.ts` → KanbanBoard component
- `SearchBar.figma.ts` → SearchBar component

## Template Structure

```typescript
// url=https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/File?node-id=XXXX-XXXX
// source=src/components/ComponentName.jsx
// component=ComponentName

import figma from 'figma'
const instance = figma.selectedInstance

// Extract Figma properties
const variant = instance.getEnum('Variant', { 'Primary': 'primary' })
const size = instance.getEnum('Size', { 'Small': 'sm' })

export default {
  example: figma.code`<Button variant="${variant}" size="${size}">Click me</Button>`,
  imports: ['import { Button } from "@/components"'],
  id: 'button',
}
```

## Next Steps

1. **Get Component Node IDs** from Figma:
   - Open: https://figma.com/design/HPsT4ATBgZdbtNuoZyy23i/
   - Right-click each component → Copy node ID
   - Paste into the `node-id` parameter in each `.figma.ts` file

2. **Create Code Connect Files** for these React components:
   - Button.jsx
   - ContactCard.jsx
   - DetailModal.jsx
   - NewContactModal.jsx
   - Input.jsx
   - SearchBar.jsx

3. **Set up figma.config.json** in project root:
   ```json
   {
     "outDir": "./src/components/.figma",
     "include": ["src/components/**/*.figma.ts"],
     "parser": "react"
   }
   ```

## Usage Pattern

Once set up, you can:

**Design changes in Figma** → Tell Claude Code about it → **Automatic React code updates**

Example:
- User: "I changed the button color to red in Figma"
- Claude: Reads Figma, updates Button.jsx, commits and pushes

## Learn More

- Code Connect Docs: https://figma.com/developers/api#code-connect
- Read the skill: `/figma-code-connect` (loaded in Claude Code)

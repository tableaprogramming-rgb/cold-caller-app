# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cold Calling Tracker** — A React + Vite SPA for managing ~1,900 sales contacts through a 6-stage kanban board. Contacts move through stages (New → To Call → Called → No Answer → For Demo → Done) as calls are made, with persistent storage in Supabase and deployment on Vercel.

## Architecture

### High-Level Data Flow

```
Supabase PostgreSQL (contacts table)
         ↓
App.jsx (root state: contacts[], filteredContacts[])
  ├─ SearchBar → filters by company/contact/phone
  └─ KanbanBoard → renders 6 stages
      └─ Column (per stage) → groups contacts by status
          └─ ContactCard (per contact) → drag-enabled card with comment editor
```

### Key Design Decisions

1. **State Management**: Contacts fetched once on mount, cached in React state. Filtering is client-side (1,900 rows fit in memory). Updates via Supabase return full contact object, which re-syncs local state.

2. **Drag-and-Drop**: Uses `@hello-pangea/dnd` (React DnD fork). `handleDragEnd` immediately updates Supabase status, then syncs back to local state via `onCardUpdate`.

3. **Status Filtering (Important)**: Line 50 in `KanbanBoard.jsx` uses **case-insensitive** comparison (`status?.toLowerCase() === stage.toLowerCase()`). This is critical because Supabase data may have inconsistent casing. Do NOT change this to strict equality.

4. **Comments**: Edited via inline modal on `ContactCard`, saves individually to Supabase without changing status.

### Component Structure

- **App.jsx** — Root component, owns `contacts` state, orchestrates fetch/search/update
- **SearchBar.jsx** — Input field, calls parent's `handleSearch()` 
- **KanbanBoard.jsx** — Wraps 6 `Column`s in `DragDropContext`, handles drag-end logic
- **Column.jsx** — Renders one stage's cards, passes down to draggable `ContactCard` items
- **ContactCard.jsx** — Individual card with company/contact/phone info + comment editor

## Database Schema

**Table: `contacts`**

```sql
id              uuid PK, auto-generated
company         text NOT NULL
contact_person  text
prefix          text (Mr/Ms/Mrs)
contact_number  text
email           text (nullable, set to NULL if "0" from CSV)
address         text
area_code       text
status          text NOT NULL DEFAULT 'New', CHECK constraint: must be in (New, To Call, Called, No Answer, For Demo, Done)
comments        text (nullable)
created_at      timestamptz auto-now
updated_at      timestamptz auto-now
```

**Index**: `contacts(status)` for fast filtering by stage.

**Critical**: Row Level Security (RLS) **MUST be disabled** on this table for the anon key to read/write. If RLS is enabled, all queries return empty arrays silently.

## Common Commands

```bash
npm run dev        # Start Vite dev server (http://localhost:5173)
npm run build      # Build for production (output: dist/)
npm run preview    # Preview production build locally
npm run lint       # Run Oxlint (syntax/style checks)

node scripts/import-csv.mjs  # One-time: import ~1,900 contacts from CSVs into Supabase
```

## Environment Variables

**.env** (local, never committed):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (import script only)
```

**Vercel Environment Variables** (Settings → Environment Variables):
- Only add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Production + Preview)
- Never add `SUPABASE_SERVICE_ROLE_KEY` (it's secret, stays local-only)

## Deployment

**Live URL**: https://cold-caller-app-omega.vercel.app/

Vercel is linked to GitHub repo. Any push to `main` triggers auto-deploy.

**Deployment Checklist**:
1. Code changes pushed to GitHub
2. Vercel builds (check Deployments tab for ✅ status)
3. Env vars set in Vercel project settings
4. Supabase RLS disabled on `contacts` table

## Known Issues & Fixes

### Issue: Empty kanban board despite 1,900+ rows in Supabase

**Root Cause**: Row Level Security (RLS) enabled on `contacts` table blocks anon key.

**Fix**: 
1. Supabase → Authentication → Policies
2. Click `contacts` table
3. Disable RLS (toggle "Enable insecure mode") OR add permissive policy allowing all reads/writes

### Issue: Contacts disappear after drag-and-drop

**Root Cause**: Status case mismatch in filter (should be fixed, but included for reference).

**Solution**: KanbanBoard.jsx line 50 uses case-insensitive comparison. Do not change to strict equality.

### Issue: Import script fails with "Invalid API key"

**Solution**: Use `SUPABASE_SERVICE_ROLE_KEY` (secret key) in `.env`, not the anon key. Anon key is read-only for client-side.

## Testing

No automated test suite. Manual QA checklist:

1. **Fetch**: Page loads, shows "Total contacts: 1912" in header
2. **Search**: Type "CEBU" in search bar, only matching companies appear
3. **Drag**: Click and drag a card from New → To Call, verify Supabase updates, refresh page confirms persistence
4. **Comments**: Click a card, add comment, click Save, refresh page, comment persists
5. **All stages**: Verify all 6 column headers render with correct counts

## Key Files to Modify

- **src/App.jsx** — Data flow, fetch logic, search handler
- **src/components/KanbanBoard.jsx** — Stage filtering, drag-end handler (line 50 is critical)
- **src/components/ContactCard.jsx** — Card layout, comment editor logic
- **scripts/import-csv.mjs** — CSV import pipeline (one-time, rarely modified)
- **.env** — Local credentials (never commit)

## Vercel Deployment Notes

- **Build command**: Auto-detected as `vite build`
- **Output directory**: `dist/`
- **Framework**: Vite (React)
- **Static site**: No custom backend API routes, all traffic routed to SPA

## Future Enhancements

- User authentication (Supabase Auth) to support multi-user access
- Call history/timeline (append comments instead of overwrite)
- Follow-up date reminders
- Priority/tag system for contacts
- Export to CSV or reports

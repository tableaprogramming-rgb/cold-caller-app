# Cold Calling Tracker

A kanban-style web app for managing cold call leads with drag-and-drop status tracking, comments, and Supabase backend storage.

## Features

- **6 Kanban Stages**: New → To Call → Called → No Answer → For Demo → Done
- **Drag & Drop**: Move contacts between stages to track progress
- **Search**: Filter contacts by company name, contact person, or phone number
- **Comments**: Add and edit notes for each contact
- **Persistent Storage**: All data saved to Supabase (free tier)
- **Responsive UI**: Works on desktop and tablet

## Setup

### 1. Clone and Install

```bash
cd cold-caller-app
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Go to **SQL Editor** and run this query to create the `contacts` table:

```sql
create table contacts (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact_person text,
  prefix text,
  contact_number text,
  email text,
  address text,
  area_code text,
  status text not null default 'New'
    check (status in ('New','To Call','Called','No Answer','For Demo','Done')),
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on contacts (status);
```

3. **Disable RLS** (Row Level Security):
   - Go to **Authentication** → **Policies**
   - Click on the `contacts` table
   - Enable **"Enable insecure mode"** (safe since this is a personal project)
   - Or add one permissive policy: `CREATE POLICY "Allow all" ON contacts FOR ALL USING (true) WITH CHECK (true);`

### 3. Set Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase credentials from **Settings** → **API**:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = Anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` = Service Role key (for import script only)

3. Update `.env` with your credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### 4. Import CSV Data

Run the one-time import script to load all contacts from the CSV files:

```bash
node scripts/import-csv.mjs
```

Expected output:
```
Reading CSV files...
Total records to import: 1913
Inserted 500/1913
Inserted 1000/1913
Inserted 1500/1913
Inserted 1913/1913
✅ Successfully imported 1913 contacts!
Total contacts in database: 1913
```

### 5. Run Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

### Moving Contacts

1. Click and drag any card to move it between columns
2. The status updates automatically in Supabase

### Adding Comments

1. Click on a card to focus it
2. Click "Click to add comments..." or the existing comment area
3. Type your note
4. Click **Save** or press Ctrl+Enter
5. Press Escape to cancel

### Searching

1. Type in the search box at the top
2. Filters by company name, contact person, or phone number
3. Click **Clear** to reset

## Deployment (Vercel)

### Prepare for Deployment

1. Create a GitHub repo (don't commit `.env`):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Cold calling tracker"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and import your GitHub repo

3. In Vercel settings, add Environment Variables (Production + Preview):
   - `VITE_SUPABASE_URL=https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=your-anon-key`

4. **Do NOT add** `SUPABASE_SERVICE_ROLE_KEY` to Vercel (it's only for local import)

5. Deploy! Vercel auto-detects Vite and builds with `vite build`

**Alternative**: Use the [Supabase × Vercel Integration](https://vercel.com/marketplace/supabase) to auto-sync credentials.

## Project Structure

```
cold-caller-app/
├── src/
│   ├── components/
│   │   ├── Column.jsx
│   │   ├── Column.css
│   │   ├── ContactCard.jsx
│   │   ├── ContactCard.css
│   │   ├── KanbanBoard.jsx
│   │   ├── KanbanBoard.css
│   │   ├── SearchBar.jsx
│   │   └── SearchBar.css
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── scripts/
│   └── import-csv.mjs
├── .env.example
├── .env (local, git-ignored)
├── vite.config.js
├── package.json
└── README.md
```

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Supabase JS** - Database & authentication
- **@hello-pangea/dnd** - Drag and drop
- **Vercel** - Hosting

## Troubleshooting

### "Missing Supabase environment variables"
- Check that `.env` file exists and has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after editing `.env`

### Import script fails
- Ensure `.env` has `SUPABASE_SERVICE_ROLE_KEY` (not ANON_KEY)
- Check that CSV files are in the project root
- Verify the `contacts` table exists in Supabase

### Drag and drop not working
- Clear browser cache and hard-refresh (Ctrl+Shift+R)
- Try a different browser

### Deployed site shows loading spinner forever
- Check browser console (F12) for errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel Environment Variables
- Make sure RLS is disabled or policies allow anon access

## Next Steps

- Implement authentication (Supabase Auth) to restrict access per user
- Add follow-up date reminders
- Export reports/analytics
- Add priority tags to contacts
- Implement contact notes history/timeline

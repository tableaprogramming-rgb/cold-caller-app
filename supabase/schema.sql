-- ============================================================================
-- Cold Calling Tracker — Authentication & Access Control Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS guards.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. contacts.user_id  (ownership — nullable so existing 1,900 rows survive)
-- ----------------------------------------------------------------------------
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts(user_id);

-- ----------------------------------------------------------------------------
-- 2. user_profiles  (mirror of auth.users + first-login tracking)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
  id                       uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                    text NOT NULL UNIQUE,
  username                 text UNIQUE,             -- login handle (email is internal only)
  password_changed_at      timestamptz,             -- NULL => first login, force change
  password_change_required boolean NOT NULL DEFAULT false,
  created_at               timestamptz DEFAULT now(),
  updated_at               timestamptz DEFAULT now()
);

-- Add username to existing installs (safe to re-run).
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Helper: build the internal login email from a username. The `@coldcaller.local`
-- domain is never shown to or typed by users; it just satisfies Supabase's email
-- requirement so we can authenticate with a username instead.
--
-- NOTE: New accounts now use a RANDOM UUID-based internal email (see
-- generateInternalEmail() in the client). This helper is retained only for
-- legacy accounts created before that change.
CREATE OR REPLACE FUNCTION public.username_to_email(u text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN lower(trim(u)) || '@coldcaller.local';
END;
$$;

-- ----------------------------------------------------------------------------
-- Username-only auth support functions
--
-- Because internal emails are now RANDOM (not derived from the username), the
-- client can no longer compute a user's login email from their username. Login
-- must look it up. RLS on user_profiles blocks anonymous (pre-login) reads, so
-- we expose two SECURITY DEFINER functions that safely answer just the two
-- questions the login/registration flow needs — without leaking the table.
-- ----------------------------------------------------------------------------

-- Resolve a username to its internal login email (for sign-in). Returns NULL
-- when the username doesn't exist. SECURITY DEFINER so it runs regardless of
-- RLS; it deliberately returns ONLY the internal email, nothing else.
CREATE OR REPLACE FUNCTION public.email_for_username(u text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result text;
BEGIN
  SELECT email INTO result
  FROM public.user_profiles
  WHERE username = lower(trim(u))
  LIMIT 1;
  RETURN result;
END;
$$;

-- Check whether a username is already taken (for registration/invite). Returns
-- a boolean and leaks nothing else about the account.
CREATE OR REPLACE FUNCTION public.username_exists(u text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles WHERE username = lower(trim(u))
  );
END;
$$;

-- Allow anonymous + authenticated callers to invoke the two helpers above.
GRANT EXECUTE ON FUNCTION public.email_for_username(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.username_exists(text) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. contact_access  (sharing: owner shares all their contacts with a user)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_access (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role           text NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')),
  created_at     timestamptz DEFAULT now(),
  UNIQUE(owner_id, shared_with_id)
);

CREATE INDEX IF NOT EXISTS contact_access_shared_with_idx ON contact_access(shared_with_id);
CREATE INDEX IF NOT EXISTS contact_access_owner_idx ON contact_access(owner_id);

-- ----------------------------------------------------------------------------
-- 4. auth_attempts  (rate limiting)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_attempts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_or_ip  text NOT NULL,
  attempt_type text NOT NULL CHECK (attempt_type IN ('login', 'register')),
  success      boolean NOT NULL DEFAULT false,
  timestamp    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_attempts_email_timestamp
  ON auth_attempts(email_or_ip, timestamp);

-- ----------------------------------------------------------------------------
-- 5. pending_invites  (admin invites with temp passwords)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pending_invites (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invited_by    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text NOT NULL UNIQUE,
  username      text,
  temp_password text NOT NULL,
  role          text NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')),
  created_at    timestamptz DEFAULT now(),
  expires_at    timestamptz DEFAULT (now() + interval '7 days'),
  used_at       timestamptz
);

ALTER TABLE pending_invites
  ADD COLUMN IF NOT EXISTS username text;

-- ============================================================================
-- Auto-provision a user_profiles row whenever an auth user is created.
-- This keeps profiles in sync without client round-trips and works for
-- both self-registration and admin invites.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, username, password_change_required, password_changed_at)
  VALUES (
    NEW.id,
    NEW.email,
    -- Username supplied via signup metadata; fall back to the local-part of the
    -- internal email (everything before @coldcaller.local) if absent.
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'username', ''),
      split_part(NEW.email, '@', 1)
    ),
    -- If the user was created from a pending invite, force a password change.
    COALESCE((NEW.raw_user_meta_data ->> 'password_change_required')::boolean, false),
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Row Level Security
-- ============================================================================

-- ---- contacts --------------------------------------------------------------
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own contacts" ON contacts;
CREATE POLICY "Users can view own contacts" ON contacts
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view shared contacts" ON contacts;
CREATE POLICY "Users can view shared contacts" ON contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contact_access
      WHERE contact_access.owner_id = contacts.user_id
        AND contact_access.shared_with_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own contacts" ON contacts;
CREATE POLICY "Users can update own contacts" ON contacts
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Editors can update shared contacts" ON contacts;
CREATE POLICY "Editors can update shared contacts" ON contacts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM contact_access
      WHERE contact_access.owner_id = contacts.user_id
        AND contact_access.shared_with_id = auth.uid()
        AND contact_access.role = 'editor'
    )
  );

DROP POLICY IF EXISTS "Users can insert own contacts" ON contacts;
CREATE POLICY "Users can insert own contacts" ON contacts
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own contacts" ON contacts;
CREATE POLICY "Users can delete own contacts" ON contacts
  FOR DELETE USING (user_id = auth.uid());

-- ---- user_profiles ---------------------------------------------------------
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

-- Allow an owner to look up profiles of users they've shared with, and
-- users who share with them, so the UI can show emails/roles.
DROP POLICY IF EXISTS "Users can view related profiles" ON user_profiles;
CREATE POLICY "Users can view related profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contact_access
      WHERE (contact_access.owner_id = auth.uid() AND contact_access.shared_with_id = user_profiles.id)
         OR (contact_access.shared_with_id = auth.uid() AND contact_access.owner_id = user_profiles.id)
    )
  );

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

-- ---- contact_access --------------------------------------------------------
ALTER TABLE contact_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage their shares" ON contact_access;
CREATE POLICY "Owners can manage their shares" ON contact_access
  FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Shared users can view their access" ON contact_access;
CREATE POLICY "Shared users can view their access" ON contact_access
  FOR SELECT USING (shared_with_id = auth.uid());

-- ---- pending_invites -------------------------------------------------------
ALTER TABLE pending_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create invites" ON pending_invites;
CREATE POLICY "Users can create invites" ON pending_invites
  FOR INSERT WITH CHECK (invited_by = auth.uid());

DROP POLICY IF EXISTS "Users can view their invites" ON pending_invites;
CREATE POLICY "Users can view their invites" ON pending_invites
  FOR SELECT USING (invited_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete their invites" ON pending_invites;
CREATE POLICY "Users can delete their invites" ON pending_invites
  FOR DELETE USING (invited_by = auth.uid());

-- ---- auth_attempts ---------------------------------------------------------
-- Rate limiting must work for anonymous (pre-login) users, so this table is
-- readable/writable by the anon role. It stores no sensitive data (only an
-- email/ip identifier + timestamp). RLS stays OFF here intentionally.
ALTER TABLE auth_attempts DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- OPTIONAL: assign all existing (pre-auth) contacts to a specific owner so
-- they don't vanish under RLS. Replace the UUID with your admin user id
-- (find it in Dashboard → Authentication → Users after you register).
-- ============================================================================
-- UPDATE contacts SET user_id = 'PASTE-ADMIN-USER-UUID-HERE' WHERE user_id IS NULL;

-- ============================================================================
-- Cold Calling Tracker — Authentication & Access Control Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS guards.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. organizations  (org-based ownership — all contacts belong to an org)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 1. contacts.user_id  (ownership — nullable so existing 1,900 rows survive)
--    Retained as an informal "created_by" audit trail. NOT used by RLS going
--    forward — org-based RLS uses contacts.organization_id (below).
-- ----------------------------------------------------------------------------
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts(user_id);

-- contacts.organization_id — the real ownership key under the org model.
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS contacts_organization_id_idx ON contacts(organization_id);

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

-- Org membership + uniform role. Users belong to exactly one org (flat columns,
-- no junction table). Role drives access uniformly across all org contacts.
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('admin', 'editor', 'viewer'));

-- Username uniqueness moves from global to per-org (NULLs don't collide in a
-- unique index, so orphaned NULL-org profiles are fine).
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_username_key;
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_org_username_idx
  ON user_profiles (organization_id, username);

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

-- Username lookups are now org-scoped: the login flow supplies the org name so
-- the same username can exist in different orgs. Drop the old 1-arg overloads
-- (hard cutover — old clients will fail to log in, which is intended).
DROP FUNCTION IF EXISTS public.email_for_username(text);
DROP FUNCTION IF EXISTS public.username_exists(text);

-- Resolve (org name, username) to the internal login email (for sign-in).
-- Returns NULL when no match. SECURITY DEFINER so it runs regardless of RLS;
-- it deliberately returns ONLY the internal email, nothing else.
CREATE OR REPLACE FUNCTION public.email_for_username(org_name text, u text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result text;
BEGIN
  SELECT up.email INTO result
  FROM public.user_profiles up
  JOIN public.organizations o ON o.id = up.organization_id
  WHERE lower(o.name) = lower(trim(org_name)) AND up.username = lower(trim(u))
  LIMIT 1;
  RETURN result;
END;
$$;

-- Check whether a username is already taken within an org (for add-member).
-- Returns a boolean and leaks nothing else about the account.
CREATE OR REPLACE FUNCTION public.username_exists(org_name text, u text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.organizations o ON o.id = up.organization_id
    WHERE lower(o.name) = lower(trim(org_name)) AND up.username = lower(trim(u))
  );
END;
$$;

-- Allow anonymous + authenticated callers to invoke the two helpers above.
GRANT EXECUTE ON FUNCTION public.email_for_username(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.username_exists(text, text) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- Current-user org/role helpers (SECURITY DEFINER to avoid RLS self-recursion
-- when user_profiles policies need to read the caller's own org/role).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_org_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT organization_id FROM public.user_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.current_user_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;

-- ----------------------------------------------------------------------------
-- Role-escalation guard: RLS UPDATE policies OR together, so the self-update
-- policy would otherwise let a non-admin change their own role/organization_id.
-- This trigger blocks that at the row level.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.organization_id IS DISTINCT FROM OLD.organization_id)
     AND public.current_user_role() <> 'admin' THEN
    RAISE EXCEPTION 'Only admins can change role or organization.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_role_change_authz ON user_profiles;
CREATE TRIGGER enforce_role_change_authz
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_escalation();

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
  INSERT INTO public.user_profiles (id, email, username, organization_id, role, password_change_required, password_changed_at)
  VALUES (
    NEW.id,
    NEW.email,
    -- Username supplied via signup metadata; fall back to the local-part of the
    -- internal email if absent.
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'username', ''),
      split_part(NEW.email, '@', 1)
    ),
    -- Org + role supplied via signup metadata (admin-created accounts are born
    -- correct, no follow-up UPDATE needed).
    NULLIF(NEW.raw_user_meta_data ->> 'organization_id', '')::uuid,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'role', ''), 'viewer'),
    -- If the user was created by an admin, force a password change.
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
-- Org-scoped RLS. All visibility/edit rights derive from the caller's org + role
-- (see current_user_org_id() / current_user_role()). The legacy per-owner and
-- share-based policies are dropped.
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can view shared contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON contacts;
DROP POLICY IF EXISTS "Editors can update shared contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON contacts;

CREATE POLICY "org_members_select_contacts" ON contacts
  FOR SELECT USING (organization_id = current_user_org_id());

CREATE POLICY "org_editors_insert_contacts" ON contacts
  FOR INSERT WITH CHECK (
    organization_id = current_user_org_id() AND current_user_role() IN ('admin', 'editor')
  );

CREATE POLICY "org_editors_update_contacts" ON contacts
  FOR UPDATE USING (
    organization_id = current_user_org_id() AND current_user_role() IN ('admin', 'editor')
  );

CREATE POLICY "org_admins_delete_contacts" ON contacts
  FOR DELETE USING (
    organization_id = current_user_org_id() AND current_user_role() = 'admin'
  );

-- ---- user_profiles ---------------------------------------------------------
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view related profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "org_members_select_profiles" ON user_profiles
  FOR SELECT USING (organization_id = current_user_org_id());

CREATE POLICY "self_update_profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "admin_update_org_profiles" ON user_profiles
  FOR UPDATE USING (
    organization_id = current_user_org_id() AND current_user_role() = 'admin'
  );

-- ---- organizations ---------------------------------------------------------
-- Members read their own org's name (for the header).
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_members_select_own_org" ON organizations;
CREATE POLICY "org_members_select_own_org" ON organizations
  FOR SELECT USING (id = current_user_org_id());

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
-- Data migration (run AFTER the schema + RLS above, in this order).
-- Creates the Raykan org, backfills all contacts into it, and assigns the
-- existing test accounts. Idempotent — safe to re-run.
-- ============================================================================
INSERT INTO organizations (name) VALUES ('Raykan') ON CONFLICT (name) DO NOTHING;

UPDATE contacts
SET organization_id = (SELECT id FROM organizations WHERE name = 'Raykan')
WHERE organization_id IS NULL;

UPDATE user_profiles
SET organization_id = (SELECT id FROM organizations WHERE name = 'Raykan'), role = 'admin'
WHERE username = 'evmagto';

UPDATE user_profiles
SET organization_id = (SELECT id FROM organizations WHERE name = 'Raykan'), role = 'editor'
WHERE username IN ('evm', 'alice', 'rbsesican');

-- 3 NULL-username profiles are intentionally left with organization_id = NULL
-- (orphaned, can't log in under the org-scoped scheme). No cleanup needed.

-- ---- Verification (must both pass before deploying client code) ------------
-- SELECT username, role, organization_id FROM user_profiles ORDER BY username;
-- SELECT count(*) FROM contacts WHERE organization_id IS NULL;  -- must be 0

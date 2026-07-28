-- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- -------
-- Contact History / Audit Trail
-- Immutable, tamper-resistant log of every action taken on a contact (create/update/delete).
-- Trigger-based: automatically captures all mutations regardless of code path.
-- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- -------

-- 1. contact_history table
CREATE TABLE IF NOT EXISTS public.contact_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL,  -- not FK'd; audit trail must survive contact deletion
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  company_snapshot text,  -- denormalized from contacts.company at event time
  action text NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  changes jsonb,  -- {field: {old, new}}, null for 'created'/'deleted'
  changed_by uuid,  -- auth.uid() at event time, null for system/service-role
  changed_by_username text,  -- denormalized, survives user deletion
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes: (1) per-contact history, (2) org-wide activity feed
CREATE INDEX IF NOT EXISTS contact_history_contact_id_idx
  ON public.contact_history(contact_id, created_at DESC);

CREATE INDEX IF NOT EXISTS contact_history_org_id_idx
  ON public.contact_history(organization_id, created_at DESC);

-- 2. Trigger function: log_contact_history
CREATE OR REPLACE FUNCTION public.log_contact_history()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_action text;
  v_changes jsonb;
  v_actor_id uuid;
  v_actor_username text;
  v_organization_id uuid;
  v_company_snapshot text;
BEGIN
  -- Resolve the organization_id from the contact row (NEW on insert/update, OLD on delete)
  v_organization_id := COALESCE(NEW.organization_id, OLD.organization_id);
  v_actor_id := auth.uid();

  -- Resolve actor username
  IF v_actor_id IS NOT NULL THEN
    SELECT username INTO v_actor_username
    FROM public.user_profiles
    WHERE id = v_actor_id;
  ELSE
    v_actor_username := NULL;  -- system/service-role
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    v_company_snapshot := NEW.company;
    v_changes := NULL;

    INSERT INTO public.contact_history
      (contact_id, organization_id, company_snapshot, action, changes, changed_by, changed_by_username, created_at)
    VALUES (NEW.id, v_organization_id, v_company_snapshot, v_action, v_changes, v_actor_id, v_actor_username, now());

  ELSIF TG_OP = 'UPDATE' THEN
    v_company_snapshot := NEW.company;

    -- Build changes object: only include fields that actually changed
    -- Trackable fields: company, contact_person, prefix, job_title, contact_number, email, address, area_code, status, comments
    v_changes := jsonb_build_object(
      'company', CASE WHEN OLD.company IS DISTINCT FROM NEW.company THEN jsonb_build_object('old', OLD.company, 'new', NEW.company) ELSE NULL END,
      'contact_person', CASE WHEN OLD.contact_person IS DISTINCT FROM NEW.contact_person THEN jsonb_build_object('old', OLD.contact_person, 'new', NEW.contact_person) ELSE NULL END,
      'prefix', CASE WHEN OLD.prefix IS DISTINCT FROM NEW.prefix THEN jsonb_build_object('old', OLD.prefix, 'new', NEW.prefix) ELSE NULL END,
      'job_title', CASE WHEN OLD.job_title IS DISTINCT FROM NEW.job_title THEN jsonb_build_object('old', OLD.job_title, 'new', NEW.job_title) ELSE NULL END,
      'contact_number', CASE WHEN OLD.contact_number IS DISTINCT FROM NEW.contact_number THEN jsonb_build_object('old', OLD.contact_number, 'new', NEW.contact_number) ELSE NULL END,
      'email', CASE WHEN OLD.email IS DISTINCT FROM NEW.email THEN jsonb_build_object('old', OLD.email, 'new', NEW.email) ELSE NULL END,
      'address', CASE WHEN OLD.address IS DISTINCT FROM NEW.address THEN jsonb_build_object('old', OLD.address, 'new', NEW.address) ELSE NULL END,
      'area_code', CASE WHEN OLD.area_code IS DISTINCT FROM NEW.area_code THEN jsonb_build_object('old', OLD.area_code, 'new', NEW.area_code) ELSE NULL END,
      'status', CASE WHEN OLD.status IS DISTINCT FROM NEW.status THEN jsonb_build_object('old', OLD.status, 'new', NEW.status) ELSE NULL END,
      'comments', CASE WHEN OLD.comments IS DISTINCT FROM NEW.comments THEN jsonb_build_object('old', OLD.comments, 'new', NEW.comments) ELSE NULL END
    );

    -- Remove null entries (fields that didn't change)
    v_changes := v_changes - (SELECT jsonb_agg(key) FROM jsonb_each(v_changes) WHERE value IS NULL);

    -- Only log if something actually changed (skip no-op updates like updated_at-only touches)
    IF v_changes IS NOT NULL AND v_changes::text != '{}' THEN
      v_action := 'updated';
      INSERT INTO public.contact_history
        (contact_id, organization_id, company_snapshot, action, changes, changed_by, changed_by_username, created_at)
      VALUES (NEW.id, v_organization_id, v_company_snapshot, v_action, v_changes, v_actor_id, v_actor_username, now());
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
    v_company_snapshot := OLD.company;

    -- Snapshot all trackable fields on delete so final state is preserved
    v_changes := jsonb_build_object(
      'company', OLD.company,
      'contact_person', OLD.contact_person,
      'prefix', OLD.prefix,
      'job_title', OLD.job_title,
      'contact_number', OLD.contact_number,
      'email', OLD.email,
      'address', OLD.address,
      'area_code', OLD.area_code,
      'status', OLD.status,
      'comments', OLD.comments
    );

    INSERT INTO public.contact_history
      (contact_id, organization_id, company_snapshot, action, changes, changed_by, changed_by_username, created_at)
    VALUES (OLD.id, v_organization_id, v_company_snapshot, v_action, v_changes, v_actor_id, v_actor_username, now());
  END IF;

  RETURN NULL;  -- trigger is AFTER, return value ignored
END;
$$;

-- Drop old trigger if it exists (safe idempotent pattern)
DROP TRIGGER IF EXISTS on_contact_history ON public.contacts;

-- Create trigger
CREATE TRIGGER on_contact_history
  AFTER INSERT OR UPDATE OR DELETE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.log_contact_history();

-- 3. RLS: Enable row-level security
ALTER TABLE public.contact_history ENABLE ROW LEVEL SECURITY;

-- Policy: org members can SELECT their org's history (read-only from app perspective)
DROP POLICY IF EXISTS "org_members_select_contact_history" ON public.contact_history;
CREATE POLICY "org_members_select_contact_history" ON public.contact_history
  FOR SELECT
  USING (organization_id = current_user_org_id());

-- No INSERT/UPDATE/DELETE policies — trigger writes bypass RLS (SECURITY DEFINER),
-- and the table is append-only at the app layer.

-- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- -------
-- Application-level contact audit logging (replaces the DB trigger).
-- The app now calls public.log_contact_change(...) explicitly, right after a
-- successful insert/update/delete on `contacts`, instead of relying on
-- on_contact_history to fire automatically.
--
-- SECURITY INVOKER (default) — runs with the calling user's own privileges.
-- This is safe because:
--   - contact_history INSERT policy (added below) allows org members to
--     insert rows for their own organization_id.
--   - auth.uid() inside the function still resolves to the real caller,
--     since SECURITY INVOKER does not change the session's auth context.
-- Safe to re-run (CREATE OR REPLACE + IF EXISTS / IF NOT EXISTS guards).
-- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- -------

-- 1. RPC function: log_contact_change
--    Params:
--      p_contact_id  uuid   - the contact this event is about
--      p_old_values  jsonb  - map of trackable fields BEFORE the change (NULL for 'created')
--      p_new_values  jsonb  - map of trackable fields AFTER the change (NULL for 'deleted')
--      p_action      text   - 'created' | 'updated' | 'deleted'
--
--    Trackable fields (same set as the old trigger):
--      company, contact_person, prefix, job_title, contact_number, email,
--      address, area_code, status, comments
--
--    Behavior mirrors the old trigger exactly:
--      - 'created': changes = NULL, company_snapshot = new company
--      - 'updated': changes = {field: {old, new}} for changed fields only;
--                   if nothing changed, no row is inserted (no-op skip)
--      - 'deleted': changes = full snapshot of old field values,
--                   company_snapshot = old company
CREATE OR REPLACE FUNCTION public.log_contact_change(
  p_contact_id uuid,
  p_old_values jsonb,
  p_new_values jsonb,
  p_action text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_changes jsonb;
  v_actor_id uuid;
  v_actor_username text;
  v_organization_id uuid;
  v_company_snapshot text;
  v_key text;
  v_old_val jsonb;
  v_new_val jsonb;
BEGIN
  IF p_action NOT IN ('created', 'updated', 'deleted') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid action: ' || COALESCE(p_action, 'null'));
  END IF;

  IF p_contact_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'contact_id is required');
  END IF;

  v_actor_id := auth.uid();

  IF v_actor_id IS NOT NULL THEN
    SELECT username INTO v_actor_username
    FROM public.user_profiles
    WHERE id = v_actor_id;
  ELSE
    v_actor_username := NULL; -- system/service-role caller
  END IF;

  -- Resolve organization_id: prefer the still-existing contact row; fall back
  -- to the caller's own org (covers 'deleted', where the row is already gone).
  SELECT organization_id INTO v_organization_id
  FROM public.contacts
  WHERE id = p_contact_id;

  IF v_organization_id IS NULL THEN
    v_organization_id := public.current_user_org_id();
  END IF;

  IF v_organization_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Could not resolve organization_id');
  END IF;

  IF p_action = 'created' THEN
    v_company_snapshot := p_new_values ->> 'company';
    v_changes := NULL;

    INSERT INTO public.contact_history
      (contact_id, organization_id, company_snapshot, action, changes, changed_by, changed_by_username, created_at)
    VALUES (p_contact_id, v_organization_id, v_company_snapshot, p_action, v_changes, v_actor_id, v_actor_username, now());

    RETURN jsonb_build_object('success', true, 'logged', true);

  ELSIF p_action = 'updated' THEN
    v_company_snapshot := COALESCE(p_new_values ->> 'company', p_old_values ->> 'company');
    v_changes := '{}'::jsonb;

    -- Only compare the trackable fields; ignore anything else callers might pass.
    FOREACH v_key IN ARRAY ARRAY[
      'company', 'contact_person', 'prefix', 'job_title', 'contact_number',
      'email', 'address', 'area_code', 'status', 'comments'
    ]
    LOOP
      v_old_val := p_old_values -> v_key;
      v_new_val := p_new_values -> v_key;
      IF v_old_val IS DISTINCT FROM v_new_val THEN
        v_changes := v_changes || jsonb_build_object(v_key, jsonb_build_object('old', v_old_val, 'new', v_new_val));
      END IF;
    END LOOP;

    -- Skip no-op updates (nothing actually changed).
    IF v_changes = '{}'::jsonb THEN
      RETURN jsonb_build_object('success', true, 'logged', false, 'reason', 'no changes');
    END IF;

    INSERT INTO public.contact_history
      (contact_id, organization_id, company_snapshot, action, changes, changed_by, changed_by_username, created_at)
    VALUES (p_contact_id, v_organization_id, v_company_snapshot, p_action, v_changes, v_actor_id, v_actor_username, now());

    RETURN jsonb_build_object('success', true, 'logged', true);

  ELSIF p_action = 'deleted' THEN
    v_company_snapshot := p_old_values ->> 'company';

    -- Snapshot all trackable fields on delete so final state is preserved.
    v_changes := jsonb_build_object(
      'company', p_old_values -> 'company',
      'contact_person', p_old_values -> 'contact_person',
      'prefix', p_old_values -> 'prefix',
      'job_title', p_old_values -> 'job_title',
      'contact_number', p_old_values -> 'contact_number',
      'email', p_old_values -> 'email',
      'address', p_old_values -> 'address',
      'area_code', p_old_values -> 'area_code',
      'status', p_old_values -> 'status',
      'comments', p_old_values -> 'comments'
    );

    INSERT INTO public.contact_history
      (contact_id, organization_id, company_snapshot, action, changes, changed_by, changed_by_username, created_at)
    VALUES (p_contact_id, v_organization_id, v_company_snapshot, p_action, v_changes, v_actor_id, v_actor_username, now());

    RETURN jsonb_build_object('success', true, 'logged', true);
  END IF;

  -- Unreachable (action already validated above), kept for safety.
  RETURN jsonb_build_object('success', false, 'error', 'Unhandled action');

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Allow authenticated org members to call the RPC (RLS + INSERT policy below
-- still constrain what actually gets written).
GRANT EXECUTE ON FUNCTION public.log_contact_change(uuid, jsonb, jsonb, text) TO authenticated;

-- 2. RLS: allow org members to INSERT their own org's history rows.
--    Required now that inserts run as SECURITY INVOKER (the calling user),
--    instead of bypassing RLS via a SECURITY DEFINER trigger.
DROP POLICY IF EXISTS "org_members_insert_contact_history" ON public.contact_history;
CREATE POLICY "org_members_insert_contact_history" ON public.contact_history
  FOR INSERT
  WITH CHECK (organization_id = current_user_org_id());

-- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- -------
-- NOTE: This script does NOT touch the existing trigger
-- (public.log_contact_history / on_contact_history). Remove that separately
-- once the app-level logging above is verified in production, to avoid
-- double-logging in the meantime.
-- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- -------

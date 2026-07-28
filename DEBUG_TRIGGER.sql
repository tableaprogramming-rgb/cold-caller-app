-- Debug version of log_contact_history trigger with RAISE NOTICE statements
-- Paste this entire script into Supabase SQL Editor and run it

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
  -- DEBUG: Log that trigger fired
  RAISE NOTICE 'TRIGGER FIRED: op=%, contact_id=%', TG_OP, COALESCE(NEW.id, OLD.id);

  v_organization_id := COALESCE(NEW.organization_id, OLD.organization_id);
  v_actor_id := auth.uid();

  IF v_actor_id IS NOT NULL THEN
    SELECT username INTO v_actor_username
    FROM public.user_profiles
    WHERE id = v_actor_id;
  ELSE
    v_actor_username := NULL;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    v_company_snapshot := NEW.company;
    v_changes := NULL;

    INSERT INTO public.contact_history
      (contact_id, organization_id, company_snapshot, action, changes, changed_by, changed_by_username, created_at)
    VALUES (NEW.id, v_organization_id, v_company_snapshot, v_action, v_changes, v_actor_id, v_actor_username, now());
    RAISE NOTICE 'INSERT: created record for contact %', NEW.id;

  ELSIF TG_OP = 'UPDATE' THEN
    v_company_snapshot := NEW.company;

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

    RAISE NOTICE 'UPDATE: v_changes before filter = %', v_changes;

    v_changes := v_changes - (SELECT array_agg(key)::text[] FROM jsonb_each(v_changes) WHERE value IS NULL);

    RAISE NOTICE 'UPDATE: v_changes after filter = %', v_changes;

    IF v_changes IS NOT NULL AND v_changes::text != '{}' THEN
      v_action := 'updated';
      RAISE NOTICE 'UPDATE: Inserting history record';
      INSERT INTO public.contact_history
        (contact_id, organization_id, company_snapshot, action, changes, changed_by, changed_by_username, created_at)
      VALUES (NEW.id, v_organization_id, v_company_snapshot, v_action, v_changes, v_actor_id, v_actor_username, now());
      RAISE NOTICE 'UPDATE: History record inserted for contact %', NEW.id;
    ELSE
      RAISE NOTICE 'UPDATE: Skipping insert - v_changes is empty or null';
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
    v_company_snapshot := OLD.company;

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

  RETURN NULL;
END;
$$;

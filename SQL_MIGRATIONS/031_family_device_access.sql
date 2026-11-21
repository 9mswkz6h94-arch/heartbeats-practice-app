BEGIN;
SET LOCAL lock_timeout = '4s';

-- These existing routines use unqualified practice table names. Pin their
-- resolution when invoking them from the new empty-search-path functions.
DO $$ BEGIN
  IF has_schema_privilege('authenticated','public','CREATE') OR has_schema_privilege('anon','public','CREATE')
    THEN RAISE EXCEPTION 'Public must be an owner-controlled schema'; END IF;
END $$;
ALTER FUNCTION public.create_family(text) SET search_path=pg_catalog,public,pg_temp;
ALTER FUNCTION public.default_teacher_id() SET search_path=pg_catalog,public,pg_temp;
ALTER FUNCTION public.set_default_teacher() SET search_path=pg_catalog,public,pg_temp;

CREATE TABLE hb_private.guardian_keys (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash text, setup_hash bytea, setup_until timestamptz,
  failures integer NOT NULL DEFAULT 0, blocked_until timestamptz
);
CREATE TABLE hb_private.family_devices (
  session_id uuid PRIMARY KEY REFERENCES auth.sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved_until timestamptz NOT NULL, revision bigint NOT NULL DEFAULT 0,
  space text NOT NULL DEFAULT 'chooser' CHECK (space IN ('chooser','parent','student')),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  scope_hash bytea, scope_until timestamptz
);
CREATE INDEX hb_devices_by_guardian ON hb_private.family_devices(user_id);
CREATE TABLE hb_private.student_setup_codes (
  student_id uuid PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  code_hash bytea UNIQUE NOT NULL, expires timestamptz NOT NULL
);
REVOKE ALL ON hb_private.student_setup_codes FROM PUBLIC,anon,authenticated;
REVOKE ALL ON hb_private.guardian_keys,hb_private.family_devices FROM PUBLIC,anon,authenticated;

CREATE FUNCTION hb_private.session_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT s.id FROM auth.sessions s WHERE s.user_id=auth.uid()
    AND s.id=nullif(auth.jwt()->>'session_id','')::uuid;
$$;
CREATE FUNCTION hb_private.is_family_account() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT auth.uid() IS NOT NULL AND NOT hb_private.is_teacher()
    AND NOT EXISTS (SELECT FROM public.students WHERE auth_user_id=auth.uid())
    AND (EXISTS (SELECT FROM public.families WHERE created_by=auth.uid())
      OR EXISTS (SELECT FROM public.parent_students WHERE parent_auth_user_id=auth.uid()));
$$;
-- Resolve the opaque, per-space credential on each request. The device's
-- Supabase session alone only authorizes the chooser after parent approval.
CREATE FUNCTION hb_private.active_space() RETURNS SETOF hb_private.family_devices
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT d.* FROM hb_private.family_devices d
  WHERE d.session_id=hb_private.session_id() AND d.user_id=auth.uid()
    AND d.approved_until>now() AND d.scope_until>now()
    AND d.scope_hash=extensions.digest(nullif(current_setting('request.headers',true),'')::jsonb->>'x-hb-space','sha256')
    AND hb_private.is_family_account();
$$;
REVOKE ALL ON FUNCTION hb_private.active_space() FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION hb_private.guardian_session() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT EXISTS (SELECT FROM hb_private.active_space() WHERE space='parent');
$$;
CREATE FUNCTION hb_private.selected_student() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT s.id FROM hb_private.active_space() d JOIN public.students s ON s.id=d.student_id
  JOIN public.parent_students p ON p.student_id=s.id AND p.parent_auth_user_id=d.user_id
  WHERE d.space='student' AND s.status='active' AND p.can_manage_family;
$$;
CREATE FUNCTION hb_private.practice_actor() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT coalesce((SELECT id FROM public.students WHERE auth_user_id=auth.uid()), hb_private.selected_student());
$$;

CREATE FUNCTION public.hb_family_state() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE device hb_private.family_devices; approved boolean;
BEGIN
  IF NOT hb_private.is_family_account() THEN RETURN jsonb_build_object('family',false); END IF;
  SELECT * INTO device FROM hb_private.family_devices WHERE session_id=hb_private.session_id() AND user_id=auth.uid();
  approved := coalesce(device.approved_until>now(),false);
  RETURN jsonb_build_object('family',true, 'approved',approved,'revision',coalesce(device.revision,0),
    'setup',NOT EXISTS(SELECT FROM hb_private.guardian_keys WHERE user_id=auth.uid() AND pin_hash IS NOT NULL),
    'students',CASE WHEN approved THEN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'status',s.status)
      ORDER BY s.name,s.id),'[]') FROM public.students s JOIN public.parent_students p ON p.student_id=s.id
      WHERE p.parent_auth_user_id=auth.uid() AND p.can_manage_family) ELSE '[]'::jsonb END);
END $$;

CREATE FUNCTION hb_private.set_space(kind text, sid uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE secret text; until_time timestamptz; version bigint;
BEGIN
  IF kind<>'chooser' THEN secret:=encode(extensions.gen_random_bytes(32),'hex'); END IF;
  UPDATE hb_private.family_devices SET space=kind, student_id=sid,
    scope_hash=extensions.digest(secret,'sha256'), revision=revision+1,
    scope_until=least(approved_until, now()+CASE WHEN kind='parent' THEN interval '10 minutes' ELSE interval '4 hours' END)
    WHERE session_id=hb_private.session_id() AND user_id=auth.uid() AND approved_until>now()
    RETURNING revision,scope_until INTO version,until_time;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ask your parent to approve this device again'; END IF;
  RETURN jsonb_build_object('token',secret,'revision',version,'expires',until_time);
END $$;
REVOKE ALL ON FUNCTION hb_private.set_space(text,uuid) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.hb_issue_parent_setup(p_student uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE guardian uuid; code text;
BEGIN
  IF NOT public.is_teacher_of(p_student) THEN RAISE EXCEPTION 'Guardian setup unavailable'; END IF;
  SELECT f.created_by INTO guardian FROM public.students s JOIN public.families f ON f.id=s.family_id
    JOIN public.parent_students p ON p.student_id=s.id AND p.parent_auth_user_id=f.created_by AND p.can_manage_family
    WHERE s.id=p_student;
  IF guardian IS NULL OR EXISTS (SELECT FROM public.parent_students p JOIN public.students s ON s.id=p.student_id
      WHERE p.parent_auth_user_id=guardian AND s.teacher_id IS DISTINCT FROM auth.uid())
    OR EXISTS (SELECT FROM public.students s WHERE s.auth_user_id=guardian) THEN
    RAISE EXCEPTION 'Ask the studio to verify the family link'; END IF;
  code:=upper(encode(extensions.gen_random_bytes(8),'hex'));
  INSERT INTO hb_private.guardian_keys(user_id,setup_hash,setup_until) VALUES
    (guardian,extensions.digest(code,'sha256'),now()+interval '1 day')
    ON CONFLICT(user_id) DO UPDATE SET setup_hash=excluded.setup_hash, setup_until=excluded.setup_until;
  RETURN code;
END $$;

CREATE FUNCTION public.hb_unlock_family(p_pin text,p_parent boolean,p_setup_code text DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE k hb_private.guardian_keys; valid boolean:=false; sid uuid:=hb_private.session_id();
BEGIN
  IF sid IS NULL OR NOT hb_private.is_family_account() THEN RAISE EXCEPTION 'Sign in to your family first'; END IF;
  SELECT * INTO k FROM hb_private.guardian_keys WHERE user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','Ask your teacher for a parent setup code.'); END IF;
  IF k.blocked_until>now() THEN RETURN jsonb_build_object('error','Please try again in 15 minutes.'); END IF;
  IF p_pin ~ '^[0-9]{6,10}$' THEN
    IF p_setup_code IS NOT NULL THEN
      valid:=k.setup_until>now() AND k.setup_hash=extensions.digest(upper(replace(trim(p_setup_code),'-','')),'sha256');
    ELSE valid:=k.pin_hash IS NOT NULL AND k.pin_hash=extensions.crypt(p_pin,k.pin_hash); END IF;
  END IF;
  IF valid IS NOT TRUE THEN
    UPDATE hb_private.guardian_keys SET failures=(failures+1)%5,
      blocked_until=CASE WHEN failures>=4 THEN now()+interval '15 minutes' END WHERE user_id=auth.uid();
    RETURN jsonb_build_object('error','Check your parent PIN or setup code and try again.');
  END IF;
  IF p_setup_code IS NOT NULL THEN
    UPDATE hb_private.guardian_keys SET pin_hash=extensions.crypt(p_pin,extensions.gen_salt('bf',10)),
      setup_hash=NULL,setup_until=NULL WHERE user_id=auth.uid();
    DELETE FROM hb_private.family_devices WHERE user_id=auth.uid();
  END IF;
  UPDATE hb_private.guardian_keys SET failures=0,blocked_until=NULL WHERE user_id=auth.uid();
  INSERT INTO hb_private.family_devices(session_id,user_id,approved_until) VALUES(sid,auth.uid(),now()+interval '7 days')
    ON CONFLICT(session_id) DO UPDATE SET approved_until=excluded.approved_until;
  RETURN hb_private.set_space(CASE WHEN p_parent THEN 'parent' ELSE 'chooser' END,NULL);
END $$;
CREATE FUNCTION public.hb_choose_space(p_student uuid,p_revision bigint) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  PERFORM FROM hb_private.family_devices WHERE session_id=hb_private.session_id() AND user_id=auth.uid()
    AND revision=p_revision AND approved_until>now() FOR UPDATE;
  IF NOT FOUND OR NOT hb_private.is_family_account() THEN RAISE EXCEPTION 'Your family space changed. Choose again.'; END IF;
  IF p_student IS NOT NULL AND NOT EXISTS(SELECT FROM public.parent_students p JOIN public.students s ON s.id=p.student_id
    WHERE s.id=p_student AND s.status='active' AND p.parent_auth_user_id=auth.uid() AND p.can_manage_family) THEN
    RAISE EXCEPTION 'This practice space is unavailable'; END IF;
  RETURN hb_private.set_space(CASE WHEN p_student IS NULL THEN 'chooser' ELSE 'student' END,p_student);
END $$;
CREATE FUNCTION public.hb_forget_device() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
  DELETE FROM hb_private.family_devices WHERE session_id=hb_private.session_id() AND user_id=auth.uid();
$$;
-- An empty, new household chooses a PIN during signup. Established accounts
-- can only enroll or recover with a code delivered by their studio teacher.
CREATE FUNCTION public.hb_create_family(p_display_name text,p_pin text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE f record; grant_data jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text,7246));
  IF hb_private.session_id() IS NULL OR hb_private.is_teacher() OR p_pin IS NULL OR p_pin !~ '^[0-9]{6,10}$'
    OR EXISTS(SELECT FROM public.students WHERE auth_user_id=auth.uid() OR lower(email)=lower(auth.email()))
    OR EXISTS(SELECT FROM public.parent_students WHERE parent_auth_user_id=auth.uid() OR lower(parent_email)=lower(auth.email()))
    OR EXISTS(SELECT FROM public.families WHERE created_by=auth.uid())
    THEN RAISE EXCEPTION 'Use family sign-in for an existing account, or ask your teacher for help'; END IF;
  SELECT * INTO f FROM public.create_family(left(p_display_name,120));
  INSERT INTO hb_private.guardian_keys(user_id,pin_hash)
    VALUES(auth.uid(),extensions.crypt(p_pin,extensions.gen_salt('bf',10)));
  INSERT INTO hb_private.family_devices(session_id,user_id,approved_until)
    VALUES(hb_private.session_id(),auth.uid(),now()+interval '7 days');
  grant_data:=hb_private.set_space('parent',NULL);
  RETURN grant_data||jsonb_build_object('family_id',f.family_id,'family_code',f.family_code);
END $$;
REVOKE ALL ON FUNCTION public.create_family(text) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.hb_register_family_student(p_family uuid,p_student uuid,p_account uuid,p_profile jsonb,p_contact jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE kid_email text:='kid-'||p_student||'@kids.heartbeats.app';
BEGIN
  IF NOT hb_private.guardian_session() OR NOT EXISTS (SELECT FROM public.families WHERE id=p_family AND created_by=auth.uid())
    OR NOT EXISTS (SELECT FROM auth.users WHERE id=p_account AND email=kid_email)
    OR nullif(trim(p_profile->>'name'),'') IS NULL THEN RAISE EXCEPTION 'Family setup could not be verified'; END IF;
  IF EXISTS (SELECT FROM public.students s JOIN public.parent_students p ON p.student_id=s.id
    WHERE s.id=p_student AND s.auth_user_id=p_account AND s.family_id=p_family AND p.parent_auth_user_id=auth.uid())
    THEN RETURN; END IF;
  INSERT INTO public.students(id,name,email,auth_user_id,family_id,avatar,instrument,preferred_name,birthday,pronouns,school_grade,status)
    VALUES(p_student,trim(p_profile->>'name'),kid_email,p_account,p_family,p_profile->>'avatar',p_profile->>'instrument',
    p_profile->>'preferred_name',nullif(p_profile->>'birthday','')::date,p_profile->>'pronouns',p_profile->>'school_grade','pending');
  INSERT INTO public.parent_students(student_id,parent_email,parent_auth_user_id,parent_name,parent_phone,relationship,can_manage_family)
    VALUES(p_student,lower(auth.email()),auth.uid(),p_contact->>'name',p_contact->>'phone',p_contact->>'relationship',true);
END $$;

DO $$ DECLARE tab text;
BEGIN
  FOREACH tab IN ARRAY ARRAY['students','assignments','completions','daily_practice_status','repertoire',
     'sightreading_attempts','student_badges','teacher_badge_awards','pets','pet_creatures','student_zoo_preferences','lessons']
  LOOP
    EXECUTE format('CREATE POLICY family_practice_read ON public.%I FOR SELECT TO authenticated USING (%I = (SELECT hb_private.selected_student()))',
      tab,CASE WHEN tab='students' THEN 'id' ELSE 'student_id' END);
  END LOOP;
  FOREACH tab IN ARRAY ARRAY['student_badges','sightreading_attempts'] LOOP
    EXECUTE format('CREATE POLICY family_practice_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (student_id = (SELECT hb_private.selected_student()))',tab);
  END LOOP;
END $$;
CREATE POLICY family_steps_read ON public.practice_steps FOR SELECT TO authenticated USING (
  EXISTS (SELECT FROM public.assignments a WHERE a.id=practice_steps.assignment_id AND a.student_id=(SELECT hb_private.selected_student())));
CREATE POLICY family_practice_zoo ON public.student_zoo_preferences FOR ALL TO authenticated
  USING (student_id=(SELECT hb_private.selected_student())) WITH CHECK (student_id=(SELECT hb_private.selected_student()));

-- The existing guard_active_practice_write BEFORE trigger additionally locks
-- the assignment and checks the actual assignment/step/student combination.
DO $$ BEGIN
  IF (SELECT count(*) FROM pg_trigger WHERE tgfoid='public.guard_active_practice_write()'::regprocedure
    AND tgrelid IN ('public.completions'::regclass,'public.daily_practice_status'::regclass)
    AND tgenabled IN ('O','A'))<>2 THEN RAISE EXCEPTION 'Missing practice assignment guards'; END IF;
END $$;
CREATE POLICY family_complete ON public.completions FOR INSERT TO authenticated
  WITH CHECK (student_id=(SELECT hb_private.selected_student()));
CREATE POLICY family_status_insert ON public.daily_practice_status FOR INSERT TO authenticated
  WITH CHECK (student_id=(SELECT hb_private.selected_student()) AND status IN ('pending','completed','skipped'));
CREATE POLICY family_status_update ON public.daily_practice_status FOR UPDATE TO authenticated
  USING (student_id=(SELECT hb_private.selected_student()))
  WITH CHECK (student_id=(SELECT hb_private.selected_student()) AND status IN ('pending','completed','skipped'));
CREATE POLICY family_status_delete ON public.daily_practice_status FOR DELETE TO authenticated
  USING (student_id=(SELECT hb_private.selected_student()));

-- Keep the installed egg/species rules. Change only their caller lookup and
-- abort on an unfamiliar implementation instead of overwriting newer rules.
DO $$
DECLARE fn regprocedure; original text; revised text; varname text;
BEGIN
  FOREACH fn IN ARRAY ARRAY['public.hatch_egg(uuid)'::regprocedure,'public.merge_creatures(uuid,uuid)'::regprocedure,
    'public.set_pet_name(text)'::regprocedure,'public.choose_pet_species(text)'::regprocedure] LOOP
    original:=pg_get_functiondef(fn);
    varname:=CASE WHEN original LIKE '%SELECT id INTO v_caller_student FROM students%' THEN 'v_caller_student' ELSE 'v_student_id' END;
    revised:=replace(original,'SELECT id INTO '||varname||' FROM students WHERE auth_user_id = auth.uid();',
      varname||' := hb_private.practice_actor();');
    IF original=revised THEN RAISE EXCEPTION 'Unexpected practice function %',fn; END IF;
    EXECUTE revised;
    EXECUTE format('ALTER FUNCTION %s SET search_path = pg_catalog, public, pg_temp',fn);
  END LOOP;
END $$;
CREATE FUNCTION public.hb_can_reset_kid(p_student uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT public.is_teacher_of(p_student) OR (public.is_parent_of(p_student) AND EXISTS (
    SELECT FROM public.parent_students WHERE student_id=p_student AND parent_auth_user_id=auth.uid() AND can_manage_family));
$$;
CREATE FUNCTION public.hb_issue_student_setup(p_student uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE code text;
BEGIN
  IF NOT public.is_teacher_of(p_student) OR NOT EXISTS (SELECT FROM public.students
    WHERE id=p_student AND family_id IS NULL AND auth_user_id IS NULL) THEN
    RAISE EXCEPTION 'This individual login does not need a setup code'; END IF;
  code:=upper(encode(extensions.gen_random_bytes(10),'hex'));
  INSERT INTO hb_private.student_setup_codes VALUES(p_student,extensions.digest(code,'sha256'),now()+interval '1 day')
    ON CONFLICT(student_id) DO UPDATE SET code_hash=excluded.code_hash,expires=excluded.expires;
  RETURN code;
END $$;
CREATE FUNCTION public.hb_claim_student_code(p_code text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE target uuid;
BEGIN
  IF hb_private.session_id() IS NULL OR hb_private.is_teacher() OR hb_private.is_family_account()
    THEN RAISE EXCEPTION 'Use the email your teacher has on file'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text,7246));
  IF EXISTS(SELECT FROM public.students WHERE auth_user_id=auth.uid()) THEN RAISE EXCEPTION 'A student is already connected'; END IF;
  SELECT c.student_id INTO target FROM hb_private.student_setup_codes c JOIN public.students s ON s.id=c.student_id
    WHERE c.code_hash=extensions.digest(upper(trim(p_code)),'sha256') AND c.expires>now()
    AND s.family_id IS NULL AND s.auth_user_id IS NULL AND lower(s.email)=lower(auth.email()) FOR UPDATE OF c,s;
  IF NOT FOUND THEN RAISE EXCEPTION 'Check the email and code with your teacher'; END IF;
  UPDATE public.students SET auth_user_id=auth.uid() WHERE id=target;
  DELETE FROM hb_private.student_setup_codes WHERE student_id=target;
  RETURN target;
END $$;
DO $$
DECLARE fn regprocedure;
BEGIN
  FOREACH fn IN ARRAY ARRAY['public.hb_family_state()'::regprocedure,'public.hb_issue_parent_setup(uuid)'::regprocedure,
    'public.hb_unlock_family(text,boolean,text)'::regprocedure,'public.hb_choose_space(uuid,bigint)'::regprocedure,
    'public.hb_forget_device()'::regprocedure,'public.hb_create_family(text,text)'::regprocedure,
    'public.hb_register_family_student(uuid,uuid,uuid,jsonb,jsonb)'::regprocedure,'public.hb_can_reset_kid(uuid)'::regprocedure,
    'public.hb_issue_student_setup(uuid)'::regprocedure,'public.hb_claim_student_code(text)'::regprocedure] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC,anon,authenticated',fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated',fn);
  END LOOP;
END $$;
NOTIFY pgrst,'reload schema';
COMMIT;

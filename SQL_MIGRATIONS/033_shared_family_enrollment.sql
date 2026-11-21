-- A child can practice on a guardian-approved device without a separate login.
BEGIN;
SET LOCAL lock_timeout = '4s';

CREATE OR REPLACE FUNCTION public.hb_register_family_student(
  p_family uuid, p_student uuid, p_account uuid, p_profile jsonb, p_contact jsonb
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  guardian_email text := lower(auth.email());
  student_email text := guardian_email;
BEGIN
  IF p_student IS NULL OR guardian_email IS NULL OR NOT hb_private.guardian_session()
    OR NOT EXISTS (SELECT FROM public.families WHERE id=p_family AND created_by=auth.uid())
    OR nullif(trim(p_profile->>'name'),'') IS NULL THEN
    RAISE EXCEPTION 'Family setup could not be verified';
  END IF;
  IF p_account IS NOT NULL THEN
    student_email := 'kid-'||p_student||'@kids.heartbeats.app';
    IF NOT EXISTS (SELECT FROM auth.users WHERE id=p_account AND email=student_email) THEN
      RAISE EXCEPTION 'Independent student login could not be verified';
    END IF;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_student::text,7247));
  IF EXISTS (SELECT FROM public.students s JOIN public.parent_students p ON p.student_id=s.id
    WHERE s.id=p_student AND s.auth_user_id IS NOT DISTINCT FROM p_account
      AND s.family_id=p_family AND p.parent_auth_user_id=auth.uid()) THEN RETURN; END IF;

  INSERT INTO public.students(id,name,email,auth_user_id,family_id,avatar,instrument,preferred_name,birthday,pronouns,school_grade,status)
    VALUES(p_student,trim(p_profile->>'name'),student_email,p_account,p_family,p_profile->>'avatar',p_profile->>'instrument',
      p_profile->>'preferred_name',nullif(p_profile->>'birthday','')::date,p_profile->>'pronouns',p_profile->>'school_grade','pending');
  INSERT INTO public.parent_students(student_id,parent_email,parent_auth_user_id,parent_name,parent_phone,relationship,can_manage_family)
    VALUES(p_student,guardian_email,auth.uid(),p_contact->>'name',p_contact->>'phone',p_contact->>'relationship',true);
END $$;
REVOKE ALL ON FUNCTION public.hb_register_family_student(uuid,uuid,uuid,jsonb,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.hb_register_family_student(uuid,uuid,uuid,jsonb,jsonb) TO authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;

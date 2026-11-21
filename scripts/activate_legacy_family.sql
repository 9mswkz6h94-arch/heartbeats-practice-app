-- Operator supplies the reviewed identifiers as transaction-local hb_repair
-- settings. Can be rerun after a lost response. Never infer identity by name.
DO $$
DECLARE
  guardian uuid:=current_setting('hb_repair.parent')::uuid;
  family uuid:=current_setting('hb_repair.family')::uuid;
  existing_child uuid:=current_setting('hb_repair.linked_student')::uuid;
  legacy_child uuid:=current_setting('hb_repair.legacy_student')::uuid;
  excluded uuid:=current_setting('hb_repair.excluded_student')::uuid;
  mailbox text:=lower(current_setting('hb_repair.mailbox'));
  linked public.parent_students; legacy public.students;
BEGIN
  IF guardian IS NULL OR existing_child=legacy_child OR excluded IN(existing_child,legacy_child) THEN
    RAISE EXCEPTION 'Identifiers do not match the reviewed repair'; END IF;
  PERFORM FROM public.families WHERE id=family AND created_by=guardian FOR UPDATE;
  IF NOT FOUND OR NOT EXISTS (SELECT FROM auth.users WHERE id=guardian AND lower(email)=mailbox AND email_confirmed_at IS NOT NULL)
    OR EXISTS(SELECT FROM public.users WHERE id=guardian AND type='teacher') THEN RAISE EXCEPTION 'Guardian identity changed'; END IF;
  PERFORM FROM public.students WHERE id IN(existing_child,legacy_child,excluded) ORDER BY id FOR UPDATE;
  SELECT * INTO STRICT linked FROM public.parent_students WHERE student_id=existing_child AND parent_auth_user_id=guardian
    AND lower(parent_email)=mailbox AND can_manage_family FOR UPDATE;
  SELECT * INTO STRICT legacy FROM public.students WHERE id=legacy_child AND family_id=family AND lower(email)=mailbox;
  IF (SELECT count(*) FROM public.students WHERE family_id=family)<>2 OR legacy.status<>'active'
    OR NOT EXISTS (SELECT FROM public.students WHERE id=existing_child AND family_id=family AND teacher_id=legacy.teacher_id
      AND status='active' AND lower(email)=mailbox AND auth_user_id IS NULL)
    OR NOT EXISTS (SELECT FROM public.students WHERE id=excluded AND family_id IS DISTINCT FROM family
      AND auth_user_id IS NOT NULL AND auth_user_id<>guardian)
    OR EXISTS (SELECT FROM public.students WHERE auth_user_id=guardian AND id<>legacy_child)
    OR EXISTS (SELECT FROM public.parent_students WHERE (parent_auth_user_id=guardian OR lower(parent_email)=mailbox)
      AND student_id NOT IN(existing_child,legacy_child))
    THEN RAISE EXCEPTION 'Household links changed since review'; END IF;
  IF legacy.auth_user_id IS NULL AND EXISTS (SELECT FROM public.parent_students WHERE student_id=legacy_child
    AND parent_auth_user_id=guardian AND lower(parent_email)=mailbox AND can_manage_family) THEN RETURN; END IF;
  IF legacy.auth_user_id IS DISTINCT FROM guardian OR EXISTS (SELECT FROM public.parent_students WHERE student_id=legacy_child)
    THEN RAISE EXCEPTION 'Unexpected legacy account binding'; END IF;

  -- A shared student browser may still hold this account's old refresh token.
  -- End its previous sessions as part of the one-time identity transition.
  DELETE FROM auth.sessions WHERE user_id=guardian;
  UPDATE public.students SET auth_user_id=NULL WHERE id=legacy_child AND auth_user_id=guardian;
  INSERT INTO public.parent_students(student_id,parent_auth_user_id,parent_email,parent_name,relationship,can_manage_family,notify_email,notify_sms)
    VALUES(legacy_child,guardian,linked.parent_email,linked.parent_name,linked.relationship,true,linked.notify_email,false);
  IF (SELECT count(*) FROM public.parent_students WHERE parent_auth_user_id=guardian AND student_id IN(existing_child,legacy_child)
    AND can_manage_family)<>2 OR EXISTS(SELECT FROM public.students WHERE auth_user_id=guardian)
    THEN RAISE EXCEPTION 'Family activation did not meet its postconditions'; END IF;
END $$;

-- Narrow the existing access paths before enabling shared-device practice.
BEGIN;
SET LOCAL lock_timeout = '4s';
CREATE SCHEMA IF NOT EXISTS hb_private;
REVOKE ALL ON SCHEMA hb_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA hb_private TO anon, authenticated;

CREATE OR REPLACE FUNCTION hb_private.is_teacher() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT FROM public.users WHERE id = auth.uid() AND type = 'teacher');
$$;
CREATE OR REPLACE FUNCTION public.is_teacher_of(sid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT hb_private.is_teacher() AND EXISTS (
    SELECT FROM public.students WHERE id = sid AND teacher_id = auth.uid());
$$;
CREATE OR REPLACE FUNCTION hb_private.guardian_session() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT auth.uid() IS NOT NULL AND NOT hb_private.is_teacher()
    AND NOT EXISTS (SELECT FROM public.students WHERE auth_user_id = auth.uid());
$$;
CREATE OR REPLACE FUNCTION public.is_parent_of(sid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT hb_private.guardian_session() AND EXISTS (SELECT FROM public.parent_students
    WHERE student_id = sid AND parent_auth_user_id = auth.uid());
$$;

-- A roster row includes the identities which control every downstream policy.
-- Only a studio teacher may edit it directly.
DROP POLICY IF EXISTS students_select ON public.students;
CREATE POLICY students_select ON public.students FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid() OR public.is_teacher_of(id));
DROP POLICY IF EXISTS students_update ON public.students;
CREATE POLICY students_update ON public.students FOR UPDATE TO authenticated
  USING (public.is_teacher_of(id)) WITH CHECK (teacher_id = auth.uid() AND hb_private.is_teacher());
DROP POLICY IF EXISTS students_insert ON public.students;
CREATE POLICY students_insert ON public.students FOR INSERT TO authenticated
  WITH CHECK (teacher_id = auth.uid() AND hb_private.is_teacher());
DROP POLICY IF EXISTS students_delete ON public.students;
CREATE POLICY students_delete ON public.students FOR DELETE TO authenticated USING (public.is_teacher_of(id));

-- The signup routine in 031 creates the student and guardian link together.
DROP POLICY IF EXISTS parent_insert_kids ON public.students;
DROP POLICY IF EXISTS parent_insert_own_links ON public.parent_students;
DROP POLICY IF EXISTS parent_update_own_links ON public.parent_students;
DROP POLICY IF EXISTS parent_read_own_links ON public.parent_students;
CREATE POLICY parent_read_own_links ON public.parent_students FOR SELECT TO authenticated
  USING (parent_auth_user_id = auth.uid() AND public.is_parent_of(student_id));

DROP POLICY IF EXISTS family_creator_read ON public.families;
CREATE POLICY family_creator_read ON public.families FOR SELECT TO authenticated
  USING (created_by = auth.uid() AND hb_private.guardian_session());
CREATE OR REPLACE FUNCTION hb_private.teaches_family(fid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT hb_private.is_teacher() AND EXISTS (SELECT FROM public.students
    WHERE family_id = fid AND teacher_id = auth.uid());
$$;
DROP POLICY IF EXISTS family_teacher_read ON public.families;
CREATE POLICY family_teacher_read ON public.families FOR SELECT TO authenticated
  USING (hb_private.teaches_family(id));
DROP POLICY IF EXISTS teacher_read_family_guardians ON public.family_guardians;
CREATE POLICY teacher_read_family_guardians ON public.family_guardians FOR SELECT TO authenticated
  USING (hb_private.teaches_family(family_guardians.family_id));

-- A teacher can create work and lessons for their own roster.
DROP POLICY IF EXISTS assignments_insert ON public.assignments;
CREATE POLICY assignments_insert ON public.assignments FOR INSERT TO authenticated
  WITH CHECK (teacher_id = auth.uid() AND public.is_teacher_of(student_id));
DROP POLICY IF EXISTS assignments_update ON public.assignments;
CREATE POLICY assignments_update ON public.assignments FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid() AND public.is_teacher_of(student_id))
  WITH CHECK (teacher_id = auth.uid() AND public.is_teacher_of(student_id));
DROP POLICY IF EXISTS teacher_manage_lessons ON public.lessons;
CREATE POLICY teacher_manage_lessons ON public.lessons FOR ALL TO authenticated
  USING (teacher_id = auth.uid() AND public.is_teacher_of(student_id))
  WITH CHECK (teacher_id = auth.uid() AND public.is_teacher_of(student_id));

DROP POLICY IF EXISTS reads_own ON public.comm_thread_reads;
CREATE POLICY reads_own ON public.comm_thread_reads FOR ALL TO authenticated
  USING (user_id = auth.uid() AND (public.is_teacher_of(student_id) OR public.is_parent_of(student_id)))
  WITH CHECK (user_id = auth.uid() AND (public.is_teacher_of(student_id) OR public.is_parent_of(student_id)));
DROP POLICY IF EXISTS parent_cancel_own_reschedule ON public.reschedule_requests;
DROP POLICY IF EXISTS parent_insert_reschedule ON public.reschedule_requests;
CREATE POLICY parent_insert_reschedule ON public.reschedule_requests FOR INSERT TO authenticated
  WITH CHECK (requested_by = auth.uid() AND public.is_parent_of(student_id)
    AND status = 'pending' AND teacher_note IS NULL AND resolved_at IS NULL);

CREATE OR REPLACE FUNCTION public.hb_cancel_reschedule(p_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  UPDATE public.reschedule_requests SET status = 'cancelled' WHERE id = p_id
    AND requested_by = auth.uid() AND public.is_parent_of(student_id) AND status = 'pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'This request can no longer be cancelled'; END IF;
END $$;
CREATE OR REPLACE FUNCTION public.hb_save_contact_preferences(p_link uuid, p_phone text, p_sms boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF length(p_phone) > 50 THEN RAISE EXCEPTION 'Phone number is too long'; END IF;
  UPDATE public.parent_students SET parent_phone = nullif(trim(p_phone), ''), notify_sms = p_sms
    WHERE id = p_link AND parent_auth_user_id = auth.uid() AND public.is_parent_of(student_id);
  IF NOT FOUND THEN RAISE EXCEPTION 'Family contact unavailable'; END IF;
END $$;

-- A bare family code only lists profiles actually set up for independent PIN login.
CREATE OR REPLACE FUNCTION public.get_family_kids(p_code text)
RETURNS TABLE(student_id uuid, name text, avatar text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT s.id, s.name, s.avatar FROM public.students s
  JOIN public.families f ON f.id = s.family_id
  JOIN auth.users u ON u.id = s.auth_user_id AND u.email = 'kid-' || s.id || '@kids.heartbeats.app'
  WHERE f.code = upper(trim(p_code)) ORDER BY s.created_at;
$$;
REVOKE ALL ON FUNCTION public.hb_cancel_reschedule(uuid), public.hb_save_contact_preferences(uuid,text,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.hb_cancel_reschedule(uuid), public.hb_save_contact_preferences(uuid,text,boolean) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;

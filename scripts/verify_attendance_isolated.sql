-- Disposable synthetic PostgreSQL only. Never run against live data.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
GRANT USAGE ON SCHEMA public, auth TO authenticated, anon;
CREATE TABLE public.students (id uuid PRIMARY KEY, teacher_id uuid NOT NULL);
INSERT INTO public.students VALUES ('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000002');
GRANT SELECT ON public.students TO authenticated;
\i /work/028.sql
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
INSERT INTO public.lesson_attendance (teacher_id, student_id, lesson_date, lesson_time, status, billing_status) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','2026-10-01','16:30','no_show','undecided');
UPDATE public.lesson_attendance SET billing_status='bill' WHERE student_id='00000000-0000-0000-0000-000000000011';
DO $$ BEGIN
 IF (SELECT count(*) FROM public.lesson_attendance WHERE billing_status='bill') <> 1 THEN RAISE EXCEPTION 'Owner cannot read or update'; END IF;
 BEGIN
  INSERT INTO public.lesson_attendance (teacher_id,student_id,lesson_date,lesson_time,status) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000022','2026-10-01','17:00','missed');
  RAISE EXCEPTION 'Cross-student insert allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.lesson_attendance) <> 0 THEN RAISE EXCEPTION 'Cross-teacher read allowed'; END IF;
 UPDATE public.lesson_attendance SET note='bad' WHERE true;
 IF FOUND THEN RAISE EXCEPTION 'Cross-teacher update allowed'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000011',true);
DO $$ BEGIN IF (SELECT count(*) FROM public.lesson_attendance) <> 0 THEN RAISE EXCEPTION 'Student read allowed'; END IF; END $$;
RESET ROLE;
SET LOCAL ROLE anon;
DO $$ BEGIN
 BEGIN PERFORM * FROM public.lesson_attendance; RAISE EXCEPTION 'Anonymous read allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
ROLLBACK;

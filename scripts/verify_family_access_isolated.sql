-- Use a disposable PostgreSQL database with the practice schema and synthetic
-- auth.users/auth.sessions. Exercise only the remediated policies and functions.
BEGIN;
DO $$ BEGIN
  IF current_database()<>'postgres' OR inet_server_port()<>55476
     OR EXISTS(SELECT FROM public.students) OR EXISTS(SELECT FROM auth.users) THEN
    RAISE EXCEPTION 'Requires the empty local family rehearsal database'; END IF;
END $$;
CREATE FUNCTION pg_temp.ident(n int) RETURNS uuid IMMUTABLE LANGUAGE sql AS $$
  SELECT ('10000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
CREATE FUNCTION pg_temp.login(n int, device int) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claims',json_build_object('sub',pg_temp.ident(n),'session_id',pg_temp.ident(device),
    'role','authenticated','email','member'||n||'@example.test')::text,true);
  PERFORM set_config('request.headers','{}',true);
END $$;
CREATE FUNCTION pg_temp.scope(t text) RETURNS void LANGUAGE sql AS $$
  SELECT set_config('request.headers',jsonb_build_object('x-hb-space',t)::text,true)::text::void;
$$;
CREATE FUNCTION pg_temp.check_it(ok boolean, description text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF ok IS DISTINCT FROM TRUE THEN RAISE EXCEPTION 'Verification failed: %',description; END IF; END $$;

INSERT INTO auth.users(id,email) SELECT pg_temp.ident(n),'member'||n||'@example.test' FROM generate_series(1,8) n;
INSERT INTO public.users(id,email,type) SELECT id,email,CASE WHEN id IN(pg_temp.ident(1),pg_temp.ident(2)) THEN 'teacher' ELSE 'student' END FROM auth.users;
INSERT INTO auth.sessions(id,user_id) SELECT pg_temp.ident(100+n),pg_temp.ident(n) FROM generate_series(1,8) n;
INSERT INTO auth.sessions(id,user_id) VALUES(pg_temp.ident(203),pg_temp.ident(3));
INSERT INTO public.families(id,code,created_by) VALUES(pg_temp.ident(10),'TEST-HOUSE-01',pg_temp.ident(3)),(pg_temp.ident(20),'TEST-HOUSE-02',pg_temp.ident(4));
INSERT INTO public.students(id,name,email,teacher_id,family_id,auth_user_id) VALUES
 (pg_temp.ident(11),'Sam','member3@example.test',pg_temp.ident(1),pg_temp.ident(10),NULL),
 (pg_temp.ident(12),'Alex','member3@example.test',pg_temp.ident(1),pg_temp.ident(10),NULL),
 (pg_temp.ident(21),'River','member5@example.test',pg_temp.ident(2),pg_temp.ident(20),pg_temp.ident(5)),
 (pg_temp.ident(22),'First login','member6@example.test',pg_temp.ident(2),NULL,NULL);
INSERT INTO public.parent_students(student_id,parent_email,parent_auth_user_id,can_manage_family) VALUES
 (pg_temp.ident(11),'member3@example.test',pg_temp.ident(3),true),
 (pg_temp.ident(12),'member3@example.test',pg_temp.ident(3),true),
 (pg_temp.ident(21),'member4@example.test',pg_temp.ident(4),true);
INSERT INTO public.family_guardians(family_id,created_by,name,email) VALUES
 (pg_temp.ident(10),pg_temp.ident(3),'First guardian','first@example.test'),
 (pg_temp.ident(20),pg_temp.ident(4),'Second guardian','second@example.test');
INSERT INTO public.assignments(id,teacher_id,student_id,title) VALUES(pg_temp.ident(31),pg_temp.ident(1),pg_temp.ident(11),'A piece'),
 (pg_temp.ident(32),pg_temp.ident(1),pg_temp.ident(12),'A scale');
INSERT INTO public.practice_steps(id,assignment_id,title) VALUES(pg_temp.ident(41),pg_temp.ident(31),'A bar'),(pg_temp.ident(42),pg_temp.ident(32),'A note');
INSERT INTO public.communication_log(student_id,author_id,author_role,body) VALUES(pg_temp.ident(11),pg_temp.ident(1),'teacher','Private fixture');

SET LOCAL ROLE authenticated;
SELECT pg_temp.login(1,101);
SELECT pg_temp.check_it((SELECT count(*)=2 FROM public.students),'teacher roster');
SELECT pg_temp.check_it((SELECT count(*)=1 FROM public.family_guardians),'teacher caregiver scope');
SELECT set_config('qa.parent_code',public.hb_issue_parent_setup(pg_temp.ident(11)),true);
SELECT pg_temp.login(2,102);
SELECT set_config('qa.student_code',public.hb_issue_student_setup(pg_temp.ident(22)),true);
SELECT pg_temp.login(6,106);
SELECT pg_temp.check_it(public.hb_claim_student_code(current_setting('qa.student_code'))=pg_temp.ident(22),'individual first sign-in');
SELECT pg_temp.check_it((SELECT count(*)=1 FROM public.students),'individual student read');
SELECT pg_temp.login(3,103);
SELECT pg_temp.check_it(public.hb_family_state()->'students'='[]','device needs adult approval');
SELECT pg_temp.check_it((SELECT count(*)=0 FROM public.communication_log),'bare household session');
DO $$
DECLARE setup_result jsonb; a jsonb; b jsonb; parent_space jsonb; newcode text; failed jsonb;
BEGIN
  setup_result:=public.hb_unlock_family('456789',false,current_setting('qa.parent_code'));
  PERFORM pg_temp.check_it(setup_result ? 'revision','parent enrollment');
  PERFORM pg_temp.check_it(jsonb_array_length(public.hb_family_state()->'students')=2,'approved household roster');
  a:=public.hb_choose_space(pg_temp.ident(11),(setup_result->>'revision')::bigint);
  PERFORM pg_temp.scope(a->>'token');
  PERFORM pg_temp.check_it((SELECT array_agg(id) FROM public.students)=ARRAY[pg_temp.ident(11)],'first child only');
  PERFORM pg_temp.check_it((SELECT count(*)=0 FROM public.parent_students),'parent links private');
  PERFORM pg_temp.check_it((SELECT count(*)=0 FROM public.family_guardians),'caregiver contacts private');
  PERFORM pg_temp.check_it((SELECT count(*)=0 FROM public.communication_log),'family messages private');
  PERFORM pg_temp.check_it(NOT public.hb_can_reset_kid(pg_temp.ident(11)),'child cannot reset credentials');
  PERFORM pg_temp.check_it((SELECT count(*)=1 FROM public.assignments) AND (SELECT count(*)=1 FROM public.practice_steps),'practice reads scoped');
  INSERT INTO public.daily_practice_status(student_id,practice_step_id,date,status) VALUES(pg_temp.ident(11),pg_temp.ident(41),current_date,'completed');
  INSERT INTO public.completions(student_id,practice_step_id,assignment_id) VALUES(pg_temp.ident(11),pg_temp.ident(41),pg_temp.ident(31));
  INSERT INTO public.student_zoo_preferences(student_id) VALUES(pg_temp.ident(11));
  PERFORM public.set_pet_name('Tempo');
  PERFORM pg_temp.check_it((SELECT name='Tempo' AND xp=1 FROM public.pets WHERE student_id=pg_temp.ident(11)),'practice rewards stay on first child');
  b:=public.hb_choose_space(pg_temp.ident(12),(a->>'revision')::bigint);
  PERFORM pg_temp.check_it((SELECT count(*)=0 FROM public.assignments),'old scope revoked');
  PERFORM pg_temp.scope(b->>'token');
  PERFORM pg_temp.check_it((SELECT array_agg(id) FROM public.students)=ARRAY[pg_temp.ident(12)] AND (SELECT count(*)=0 FROM public.completions),'second child own history');
  PERFORM pg_temp.login(3,203); PERFORM pg_temp.scope(b->>'token');
  PERFORM pg_temp.check_it((SELECT count(*)=0 FROM public.students),'scope cannot transfer between devices');
  PERFORM pg_temp.login(3,103); PERFORM pg_temp.scope(b->>'token');
  BEGIN
    PERFORM public.hb_choose_space(pg_temp.ident(21),(b->>'revision')::bigint);
    RAISE EXCEPTION 'outside family';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM='outside family' THEN RAISE; END IF; END;
  BEGIN
    INSERT INTO public.completions(student_id,practice_step_id,assignment_id) VALUES(pg_temp.ident(11),pg_temp.ident(41),pg_temp.ident(31));
    RAISE EXCEPTION 'unexpected sibling write';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.parent_students(parent_auth_user_id,parent_email,student_id) VALUES(pg_temp.ident(3),'member3@example.test',pg_temp.ident(21));
    RAISE EXCEPTION 'unexpected direct guardian insertion';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.check_it(public.hb_unlock_family('000000',true,NULL) ? 'error','incorrect PIN denied');
  parent_space:=public.hb_unlock_family('456789',true,NULL);
  PERFORM pg_temp.check_it((SELECT count(*)=0 FROM public.assignments),'student credential cannot open parent view');
  PERFORM pg_temp.scope(parent_space->>'token');
  PERFORM pg_temp.check_it((SELECT count(*)=1 FROM public.communication_log) AND (SELECT count(*)=2 FROM public.students),'private parent view');
  PERFORM pg_temp.check_it(public.hb_can_reset_kid(pg_temp.ident(11)) AND NOT public.hb_can_reset_kid(pg_temp.ident(21)),'reset permission boundaries');
  PERFORM public.hb_save_contact_preferences((SELECT id FROM public.parent_students WHERE student_id=pg_temp.ident(11)),NULL,false);
  PERFORM public.hb_choose_space(NULL,(parent_space->>'revision')::bigint);
  PERFORM pg_temp.check_it((SELECT count(*)=0 FROM public.communication_log),'parent re-entry required');
  PERFORM public.hb_forget_device();
  PERFORM pg_temp.check_it(public.hb_family_state()->'approved'='false','sign out revokes device');
  FOR i IN 1..5 LOOP failed:=public.hb_unlock_family('000000',true,NULL); END LOOP;
  PERFORM pg_temp.check_it(public.hb_unlock_family('456789',true,NULL)->>'error' LIKE '%15 minutes%','shared attempt limit');
END $$;
RESET ROLE;
SELECT pg_temp.check_it((SELECT count(*)=1 FROM public.completions),'one completion retained on original record');

-- New-family onboarding and an independently signed-in student.
SET LOCAL ROLE authenticated;
SELECT pg_temp.login(7,107);
DO $$ DECLARE newfam jsonb; kid uuid:=pg_temp.ident(81); BEGIN
  newfam:=public.hb_create_family('Sample family','765432');
  PERFORM pg_temp.scope(newfam->>'token');
  PERFORM pg_temp.check_it(public.hb_family_state()->>'family'='true','new family recognized');
END $$;
RESET ROLE;
UPDATE auth.users SET email='kid-'||pg_temp.ident(81)||'@kids.heartbeats.app' WHERE id=pg_temp.ident(8);
SET LOCAL ROLE authenticated;
SELECT pg_temp.login(7,107);
DO $$ DECLARE parent_space jsonb; fid uuid; BEGIN
  parent_space:=public.hb_unlock_family('765432',true,NULL); PERFORM pg_temp.scope(parent_space->>'token');
  SELECT id INTO fid FROM public.families WHERE created_by=pg_temp.ident(7);
  PERFORM public.hb_register_family_student(fid,pg_temp.ident(81),pg_temp.ident(8),'{"name":"New student"}','{"name":"Grown-up"}');
  PERFORM public.hb_register_family_student(fid,pg_temp.ident(81),pg_temp.ident(8),'{"name":"New student"}','{"name":"Grown-up"}');
  PERFORM pg_temp.check_it((SELECT count(*)=1 FROM public.students WHERE status='pending'),'atomic signup retry');
  PERFORM public.hb_register_family_student(fid,pg_temp.ident(82),NULL,'{"name":"Shared student"}','{"name":"Grown-up"}');
  PERFORM public.hb_register_family_student(fid,pg_temp.ident(82),NULL,'{"name":"Shared student"}','{"name":"Grown-up"}');
  PERFORM pg_temp.check_it((SELECT count(*)=1 FROM public.students WHERE id=pg_temp.ident(82) AND email=auth.email()
    AND auth_user_id IS NULL AND family_id=fid AND status='pending'),'shared enrollment with original guardian email');
  PERFORM pg_temp.check_it((SELECT jsonb_array_length(public.hb_family_state()->'students')=2),'one shared chooser for both login types');
END $$;
RESET ROLE;
UPDATE hb_private.family_devices SET scope_until=now()-interval '1 second' WHERE session_id=pg_temp.ident(107);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_it((SELECT count(*)=0 FROM public.parent_students),'expired adult credential');
RESET ROLE;
UPDATE hb_private.family_devices SET approved_until=now()-interval '1 second' WHERE session_id=pg_temp.ident(107);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_it(public.hb_family_state()->'students'='[]','expired device approval');
SELECT pg_temp.login(5,105);
SELECT pg_temp.check_it((SELECT array_agg(id) FROM public.students)=ARRAY[pg_temp.ident(21)],'existing student login');
RESET ROLE;
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims','{}',true),set_config('request.headers','{}',true);
SELECT pg_temp.check_it((SELECT count(*)=0 FROM public.students),'anonymous roster privacy');
ROLLBACK;

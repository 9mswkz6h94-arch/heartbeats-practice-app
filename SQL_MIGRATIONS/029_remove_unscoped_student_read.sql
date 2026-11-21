-- Remove the legacy policy that grants every signed-in user access to every
-- student row. The separately scoped students_select and parent_read_students
-- policies keep ordinary student, teacher and guardian access available.
BEGIN;
SET LOCAL lock_timeout = '3s';
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE schemaname = 'public'
      AND tablename = 'students' AND policyname = 'students_select')
    OR NOT EXISTS (SELECT FROM pg_policies WHERE schemaname = 'public'
      AND tablename = 'students' AND policyname = 'parent_read_students') THEN
    RAISE EXCEPTION 'Expected scoped policies are missing';
  END IF;
END $$;
DROP POLICY IF EXISTS "Allow student to see own data" ON public.students;
COMMIT;

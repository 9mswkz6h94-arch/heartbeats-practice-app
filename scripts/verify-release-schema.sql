-- Verify release schema and access-control invariants after migrations 016-021.
-- Run only in an isolated Supabase clone. This script makes no persistent changes.

BEGIN;

DO $$
DECLARE
  table_name TEXT;
  protected_tables CONSTANT TEXT[] := ARRAY[
    'lesson_sessions',
    'lesson_notes',
    'assignment_drafts',
    'family_guardians',
    'student_zoo_preferences',
    'teacher_badge_awards'
  ];
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'assignments'
       AND column_name = 'archived_at'
  ) THEN
    RAISE EXCEPTION 'assignments.archived_at is missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'students'
       AND column_name IN ('preferred_name', 'birthday', 'pronouns', 'school_grade')
     GROUP BY table_schema, table_name
    HAVING count(*) = 4
  ) THEN
    RAISE EXCEPTION 'one or more private student profile columns are missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'parent_students'
       AND column_name IN ('relationship', 'can_manage_family')
     GROUP BY table_schema, table_name
    HAVING count(*) = 2
  ) THEN
    RAISE EXCEPTION 'one or more parent_students relationship columns are missing';
  END IF;

  FOREACH table_name IN ARRAY protected_tables LOOP
    IF to_regclass(format('public.%I', table_name)) IS NULL THEN
      RAISE EXCEPTION 'required release table public.% is missing', table_name;
    END IF;

    IF NOT EXISTS (
      SELECT 1
        FROM pg_class relation
        JOIN pg_namespace namespace ON namespace.oid = relation.relnamespace
       WHERE namespace.nspname = 'public'
         AND relation.relname = table_name
         AND relation.relrowsecurity
    ) THEN
      RAISE EXCEPTION 'row-level security is disabled on public.%', table_name;
    END IF;

    IF has_table_privilege('anon', format('public.%I', table_name), 'SELECT')
       OR has_table_privilege('anon', format('public.%I', table_name), 'INSERT')
       OR has_table_privilege('anon', format('public.%I', table_name), 'UPDATE')
       OR has_table_privilege('anon', format('public.%I', table_name), 'DELETE') THEN
      RAISE EXCEPTION 'anon retains a direct data privilege on public.%', table_name;
    END IF;
  END LOOP;

  IF to_regprocedure('public.resolve_practice_assignment(uuid,text,date)') IS NULL THEN
    RAISE EXCEPTION 'resolve_practice_assignment(uuid,text,date) is missing';
  END IF;

  IF to_regprocedure('public.guard_active_practice_write()') IS NULL THEN
    RAISE EXCEPTION 'guard_active_practice_write() is missing';
  END IF;

  IF to_regprocedure('public.wrap_lesson_memory(uuid,text,text,jsonb)') IS NULL THEN
    RAISE EXCEPTION 'wrap_lesson_memory(uuid,text,text,jsonb) is missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'teacher_badge_awards'
       AND column_name = 'order_status'
       AND column_default LIKE '%not-requested%'
  ) THEN
    RAISE EXCEPTION 'teacher badge awards are missing their non-ordering default';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename IN ('lesson_sessions', 'lesson_notes', 'assignment_drafts')
       AND policyname NOT LIKE 'teacher_%'
  ) THEN
    RAISE EXCEPTION 'lesson-memory tables expose a non-teacher policy';
  END IF;

  RAISE NOTICE 'Release schema, function, RLS, and anon-grant checks passed.';
END;
$$;

ROLLBACK;

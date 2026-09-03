-- ============================================================
-- 017 — Safe assignment lifecycle controls
--
-- Teachers need to resolve no-deadline assignments during lesson prep
-- without deleting practice/completion history. `archived_at` is a soft
-- removal marker; due dates continue to describe automatic student-side
-- visibility. This migration also makes the existing teacher reassign
-- action capable of clearing a student's saved step status. Practice writes
-- are also guarded against stale tabs after an assignment is resolved.
-- ============================================================

BEGIN;

ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

COMMENT ON COLUMN public.assignments.archived_at IS
  'Teacher-controlled soft removal from current practice; history is retained.';

CREATE INDEX IF NOT EXISTS assignments_student_active_idx
  ON public.assignments (student_id, archived_at, deadline);

CREATE UNIQUE INDEX IF NOT EXISTS repertoire_student_assignment_idx
  ON public.repertoire (student_id, assignment_id);

-- Repertoire writes are teacher decisions. The previous policy also let a
-- student pair their own student_id with an unrelated assignment_id.
DROP POLICY IF EXISTS repertoire_insert ON public.repertoire;

CREATE POLICY repertoire_insert
  ON public.repertoire
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.assignments
      WHERE assignments.id = repertoire.assignment_id
        AND assignments.student_id = repertoire.student_id
        AND assignments.teacher_id = auth.uid()
    )
  );

DROP FUNCTION IF EXISTS public.resolve_practice_assignment(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.resolve_practice_assignment(
  p_assignment_id UUID,
  p_action TEXT,
  p_deadline DATE DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_student_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT student_id
  INTO v_student_id
  FROM public.assignments
  WHERE id = p_assignment_id
    AND teacher_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assignment not found or not owned by this teacher'
      USING ERRCODE = '42501';
  END IF;

  CASE p_action
    WHEN 'reassign' THEN
      IF p_deadline IS NULL THEN
        RAISE EXCEPTION 'Reassign requires a due date'
          USING ERRCODE = '22023';
      END IF;

      IF p_deadline < (NOW() AT TIME ZONE 'America/Chicago')::DATE THEN
        RAISE EXCEPTION 'Reassign due date cannot be in the past'
          USING ERRCODE = '22023';
      END IF;

      DELETE FROM public.daily_practice_status AS status
      USING public.practice_steps AS step
      WHERE step.assignment_id = p_assignment_id
        AND status.practice_step_id = step.id
        AND status.student_id = v_student_id;

      DELETE FROM public.repertoire
      WHERE assignment_id = p_assignment_id
        AND student_id = v_student_id;

      UPDATE public.assignments
      SET deadline = p_deadline,
          archived_at = NULL,
          memorized = FALSE
      WHERE id = p_assignment_id;

    WHEN 'repertoire' THEN
      INSERT INTO public.repertoire (student_id, assignment_id)
      VALUES (v_student_id, p_assignment_id)
      ON CONFLICT (student_id, assignment_id) DO NOTHING;

      UPDATE public.assignments
      SET memorized = TRUE,
          archived_at = NOW()
      WHERE id = p_assignment_id;

    WHEN 'remove' THEN
      UPDATE public.assignments
      SET archived_at = NOW()
      WHERE id = p_assignment_id;

    ELSE
      RAISE EXCEPTION 'Unsupported assignment action: %', p_action
        USING ERRCODE = '22023';
  END CASE;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_practice_assignment(UUID, TEXT, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_practice_assignment(UUID, TEXT, DATE) TO authenticated;

-- A stale student tab must not be able to write practice against an expired,
-- archived, or repertoire assignment. These policies also verify that the
-- supplied student, assignment, and step actually belong together.
DROP POLICY IF EXISTS completions_insert ON public.completions;
CREATE POLICY completions_insert
  ON public.completions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.students AS student
      JOIN public.assignments AS assignment
        ON assignment.student_id = student.id
      JOIN public.practice_steps AS step
        ON step.assignment_id = assignment.id
      WHERE student.id = completions.student_id
        AND student.auth_user_id = auth.uid()
        AND assignment.id = completions.assignment_id
        AND step.id = completions.practice_step_id
        AND assignment.archived_at IS NULL
        AND assignment.memorized IS NOT TRUE
        AND (
          assignment.deadline IS NULL
          OR assignment.deadline >= (NOW() AT TIME ZONE 'America/Chicago')::DATE
        )
    )
  );

DROP POLICY IF EXISTS daily_practice_status_insert ON public.daily_practice_status;
CREATE POLICY daily_practice_status_insert
  ON public.daily_practice_status
  FOR INSERT
  TO authenticated
  WITH CHECK (
    status IN ('pending', 'completed', 'skipped')
    AND EXISTS (
      SELECT 1
      FROM public.students AS student
      JOIN public.assignments AS assignment
        ON assignment.student_id = student.id
      JOIN public.practice_steps AS step
        ON step.assignment_id = assignment.id
      WHERE student.id = daily_practice_status.student_id
        AND student.auth_user_id = auth.uid()
        AND step.id = daily_practice_status.practice_step_id
        AND assignment.archived_at IS NULL
        AND assignment.memorized IS NOT TRUE
        AND (
          assignment.deadline IS NULL
          OR assignment.deadline >= (NOW() AT TIME ZONE 'America/Chicago')::DATE
        )
    )
  );

DROP POLICY IF EXISTS daily_practice_status_update ON public.daily_practice_status;
CREATE POLICY daily_practice_status_update
  ON public.daily_practice_status
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.students AS student
      JOIN public.assignments AS assignment
        ON assignment.student_id = student.id
      JOIN public.practice_steps AS step
        ON step.assignment_id = assignment.id
      WHERE student.id = daily_practice_status.student_id
        AND student.auth_user_id = auth.uid()
        AND step.id = daily_practice_status.practice_step_id
        AND assignment.archived_at IS NULL
        AND assignment.memorized IS NOT TRUE
        AND (
          assignment.deadline IS NULL
          OR assignment.deadline >= (NOW() AT TIME ZONE 'America/Chicago')::DATE
        )
    )
  )
  WITH CHECK (
    status IN ('pending', 'completed', 'skipped')
    AND EXISTS (
      SELECT 1
      FROM public.students AS student
      JOIN public.assignments AS assignment
        ON assignment.student_id = student.id
      JOIN public.practice_steps AS step
        ON step.assignment_id = assignment.id
      WHERE student.id = daily_practice_status.student_id
        AND student.auth_user_id = auth.uid()
        AND step.id = daily_practice_status.practice_step_id
        AND assignment.archived_at IS NULL
        AND assignment.memorized IS NOT TRUE
        AND (
          assignment.deadline IS NULL
          OR assignment.deadline >= (NOW() AT TIME ZONE 'America/Chicago')::DATE
        )
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint
    WHERE conname = 'daily_practice_status_status_check'
      AND conrelid = 'public.daily_practice_status'::regclass
  ) THEN
    ALTER TABLE public.daily_practice_status
      ADD CONSTRAINT daily_practice_status_status_check
      CHECK (status IN ('pending', 'completed', 'skipped')) NOT VALID;
  END IF;
END;
$$;

ALTER TABLE public.daily_practice_status
  VALIDATE CONSTRAINT daily_practice_status_status_check;

-- Lock the assignment row while accepting a practice write. This closes the
-- small race where a student taps Complete at the same instant a teacher
-- archives the assignment; the resolver's FOR UPDATE lock serializes with it.
CREATE OR REPLACE FUNCTION public.guard_active_practice_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_expected_assignment UUID := NULLIF(to_jsonb(NEW) ->> 'assignment_id', '')::UUID;
BEGIN
  PERFORM 1
  FROM public.practice_steps AS step
  JOIN public.assignments AS assignment
    ON assignment.id = step.assignment_id
  WHERE step.id = NEW.practice_step_id
    AND assignment.student_id = NEW.student_id
    AND (
      v_expected_assignment IS NULL
      OR assignment.id = v_expected_assignment
    )
    AND assignment.archived_at IS NULL
    AND assignment.memorized IS NOT TRUE
    AND (
      assignment.deadline IS NULL
      OR assignment.deadline >= (NOW() AT TIME ZONE 'America/Chicago')::DATE
    )
  FOR SHARE OF assignment;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assignment is no longer active or practice step does not match'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_active_practice_write() FROM PUBLIC;

DROP TRIGGER IF EXISTS completions_active_assignment_guard ON public.completions;
CREATE TRIGGER completions_active_assignment_guard
  BEFORE INSERT ON public.completions
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_active_practice_write();

DROP TRIGGER IF EXISTS daily_status_active_assignment_guard
  ON public.daily_practice_status;
CREATE TRIGGER daily_status_active_assignment_guard
  BEFORE INSERT OR UPDATE ON public.daily_practice_status
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_active_practice_write();

NOTIFY pgrst, 'reload schema';

COMMIT;

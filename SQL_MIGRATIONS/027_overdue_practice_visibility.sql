-- Due dates remain useful reminders, but no longer make practice writes
-- ineligible. Archive/repertoire resolution and all ownership/step matching
-- protections remain unchanged from 017_assignment_lifecycle.sql.
BEGIN;

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
    )
  );

-- Keep the race-safe assignment lock and explicit assignment/step match, but
-- let an overdue assignment through. The trigger is shared by completions and
-- daily status writes, so it remains the final protection after RLS.
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
  FOR SHARE OF assignment;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assignment is no longer active or practice step does not match'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_active_practice_write() FROM PUBLIC;

NOTIFY pgrst, 'reload schema';

COMMIT;

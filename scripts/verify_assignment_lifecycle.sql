-- Transactional smoke test for SQL_MIGRATIONS/017_assignment_lifecycle.sql.
-- It uses an existing teacher/student relationship, creates only temporary
-- test rows, and rolls every change back.

BEGIN;

DO $$
DECLARE
  v_teacher_id UUID;
  v_student_id UUID;
  v_assignment_id UUID;
  v_step_id UUID;
  v_due_date DATE := (NOW() AT TIME ZONE 'America/Chicago')::DATE + 7;
BEGIN
  SELECT teacher_id, id
  INTO v_teacher_id, v_student_id
  FROM public.students
  WHERE teacher_id IS NOT NULL
  ORDER BY created_at
  LIMIT 1;

  IF v_teacher_id IS NULL OR v_student_id IS NULL THEN
    RAISE EXCEPTION 'Lifecycle smoke test needs one existing teacher/student relationship';
  END IF;

  INSERT INTO public.assignments (teacher_id, student_id, title, category)
  VALUES (v_teacher_id, v_student_id, '__assignment_lifecycle_smoke_test__', 'pieces')
  RETURNING id INTO v_assignment_id;

  INSERT INTO public.practice_steps (assignment_id, title, step_number)
  VALUES (v_assignment_id, '__lifecycle_step__', 1)
  RETURNING id INTO v_step_id;

  INSERT INTO public.completions (student_id, assignment_id, practice_step_id)
  VALUES (v_student_id, v_assignment_id, v_step_id);

  INSERT INTO public.daily_practice_status (
    student_id,
    practice_step_id,
    date,
    status
  )
  VALUES (
    v_student_id,
    v_step_id,
    (NOW() AT TIME ZONE 'America/Chicago')::DATE,
    'completed'
  );

  PERFORM set_config('request.jwt.claim.sub', v_teacher_id::TEXT, TRUE);

  BEGIN
    PERFORM public.resolve_practice_assignment(v_assignment_id, 'reassign', NULL);
    RAISE EXCEPTION 'Reassign unexpectedly accepted a null due date';
  EXCEPTION
    WHEN invalid_parameter_value THEN NULL;
  END;

  PERFORM public.resolve_practice_assignment(
    v_assignment_id,
    'reassign',
    v_due_date
  );

  IF NOT EXISTS (
    SELECT 1
    FROM public.assignments
    WHERE id = v_assignment_id
      AND deadline = v_due_date
      AND archived_at IS NULL
      AND memorized IS FALSE
  ) THEN
    RAISE EXCEPTION 'Reassign did not reactivate the assignment through its new due date';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.daily_practice_status
    WHERE practice_step_id = v_step_id
  ) THEN
    RAISE EXCEPTION 'Reassign did not clear saved daily status';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.completions
    WHERE assignment_id = v_assignment_id
      AND practice_step_id = v_step_id
  ) THEN
    RAISE EXCEPTION 'Reassign removed completion history';
  END IF;

  PERFORM public.resolve_practice_assignment(v_assignment_id, 'repertoire', NULL);
  PERFORM public.resolve_practice_assignment(v_assignment_id, 'repertoire', NULL);

  IF (
    SELECT COUNT(*)
    FROM public.repertoire
    WHERE assignment_id = v_assignment_id
      AND student_id = v_student_id
  ) <> 1 THEN
    RAISE EXCEPTION 'Repertoire resolution was not idempotent';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.assignments
    WHERE id = v_assignment_id
      AND archived_at IS NOT NULL
      AND memorized IS TRUE
  ) THEN
    RAISE EXCEPTION 'Repertoire resolution did not close the active assignment';
  END IF;

  PERFORM public.resolve_practice_assignment(v_assignment_id, 'reassign', v_due_date);
  PERFORM public.resolve_practice_assignment(v_assignment_id, 'remove', NULL);

  IF NOT EXISTS (
    SELECT 1
    FROM public.assignments
    WHERE id = v_assignment_id
      AND archived_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Remove did not archive the assignment';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.completions
    WHERE assignment_id = v_assignment_id
  ) THEN
    RAISE EXCEPTION 'Remove deleted completion history';
  END IF;

  BEGIN
    INSERT INTO public.completions (student_id, assignment_id, practice_step_id)
    VALUES (v_student_id, v_assignment_id, v_step_id);
    RAISE EXCEPTION 'Archived assignment unexpectedly accepted a completion';
  EXCEPTION
    WHEN check_violation THEN NULL;
  END;

  PERFORM set_config('request.jwt.claim.sub', gen_random_uuid()::TEXT, TRUE);
  BEGIN
    PERFORM public.resolve_practice_assignment(v_assignment_id, 'remove', NULL);
    RAISE EXCEPTION 'Unrelated teacher unexpectedly resolved the assignment';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;
END;
$$;

ROLLBACK;

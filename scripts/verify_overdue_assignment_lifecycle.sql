-- Transactional rehearsal for SQL_MIGRATIONS/027_overdue_practice_visibility.sql.
-- Run only against a sanitized staging clone with at least two fixture students
-- that have auth_user_id values. Every assignment, step, completion, and daily
-- status row is rolled back before the script returns.

BEGIN;

DO $$
DECLARE
  v_teacher_id UUID;
  v_student_id UUID;
  v_student_auth UUID;
  v_other_student_id UUID;
  v_other_student_auth UUID;
  v_assignment_id UUID;
  v_other_assignment_id UUID;
  v_step_id UUID;
  v_other_step_id UUID;
  v_today DATE := (NOW() AT TIME ZONE 'America/Chicago')::DATE;
  v_completion_count INTEGER;
  v_status TEXT;
BEGIN
  SELECT s.teacher_id, s.id, s.auth_user_id
  INTO v_teacher_id, v_student_id, v_student_auth
  FROM public.students AS s
  WHERE s.auth_user_id IS NOT NULL
  ORDER BY s.created_at, s.id
  LIMIT 1;

  SELECT s.id, s.auth_user_id
  INTO v_other_student_id, v_other_student_auth
  FROM public.students AS s
  WHERE s.auth_user_id IS NOT NULL
    AND s.id <> v_student_id
  ORDER BY s.created_at, s.id
  LIMIT 1;

  IF v_teacher_id IS NULL OR v_student_id IS NULL OR v_student_auth IS NULL OR v_other_student_id IS NULL OR v_other_student_auth IS NULL THEN
    RAISE EXCEPTION 'Overdue lifecycle rehearsal needs two sanitized students with auth_user_id and one teacher relationship';
  END IF;

  INSERT INTO public.assignments (teacher_id, student_id, title, category, deadline)
  VALUES (v_teacher_id, v_student_id, '__overdue_visibility_smoke__', 'pieces', v_today - 7)
  RETURNING id INTO v_assignment_id;

  INSERT INTO public.practice_steps (assignment_id, title, step_number)
  VALUES (v_assignment_id, '__overdue_step__', 1)
  RETURNING id INTO v_step_id;

  INSERT INTO public.assignments (teacher_id, student_id, title, category, deadline)
  VALUES (v_teacher_id, v_student_id, '__mismatched_step_smoke__', 'pieces', v_today - 7)
  RETURNING id INTO v_other_assignment_id;

  INSERT INTO public.practice_steps (assignment_id, title, step_number)
  VALUES (v_other_assignment_id, '__other_step__', 1)
  RETURNING id INTO v_other_step_id;

  -- The owning student can still create an overdue completion and all three
  -- daily states; this is the deliberate behavior change in migration 027.
  SET LOCAL ROLE authenticated;
  PERFORM set_config('request.jwt.claim.sub', v_student_auth::TEXT, TRUE);

  INSERT INTO public.completions (student_id, assignment_id, practice_step_id)
  VALUES (v_student_id, v_assignment_id, v_step_id);

  INSERT INTO public.daily_practice_status (student_id, practice_step_id, date, status)
  VALUES (v_student_id, v_step_id, v_today, 'pending');

  UPDATE public.daily_practice_status
  SET status = 'completed'
  WHERE student_id = v_student_id
    AND practice_step_id = v_step_id
    AND date = v_today;

  UPDATE public.daily_practice_status
  SET status = 'skipped'
  WHERE student_id = v_student_id
    AND practice_step_id = v_step_id
    AND date = v_today;

  RESET ROLE;

  SELECT COUNT(*) INTO v_completion_count
  FROM public.completions
  WHERE assignment_id = v_assignment_id
    AND practice_step_id = v_step_id;
  IF v_completion_count <> 1 THEN
    RAISE EXCEPTION 'Overdue completion history was not written exactly once';
  END IF;

  SELECT status INTO v_status
  FROM public.daily_practice_status
  WHERE student_id = v_student_id
    AND practice_step_id = v_step_id
    AND date = v_today;
  IF v_status <> 'skipped' THEN
    RAISE EXCEPTION 'Overdue daily status did not preserve the final skipped state';
  END IF;

  -- A different authenticated student cannot use the overdue assignment or
  -- alter the owning student's daily status. This uses the second fixture's
  -- auth UID, not merely a spoofed student_id.
  SET LOCAL ROLE authenticated;
  PERFORM set_config('request.jwt.claim.sub', v_other_student_auth::TEXT, TRUE);
  BEGIN
    INSERT INTO public.completions (student_id, assignment_id, practice_step_id)
    VALUES (v_student_id, v_assignment_id, v_step_id);
    RAISE EXCEPTION 'Cross-student completion unexpectedly succeeded';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO public.daily_practice_status (student_id, practice_step_id, date, status)
    VALUES (v_student_id, v_step_id, v_today + 1, 'pending');
    RAISE EXCEPTION 'Cross-student daily insert unexpectedly succeeded';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN NULL;
  END;

  BEGIN
    UPDATE public.daily_practice_status
    SET status = 'completed'
    WHERE student_id = v_student_id
      AND practice_step_id = v_step_id
      AND date = v_today;
    IF FOUND THEN
      RAISE EXCEPTION 'Cross-student daily update unexpectedly succeeded';
    END IF;
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN NULL;
  END;
  RESET ROLE;

  -- A step from another assignment cannot be paired with this assignment.
  SET LOCAL ROLE authenticated;
  PERFORM set_config('request.jwt.claim.sub', v_student_auth::TEXT, TRUE);
  BEGIN
    INSERT INTO public.completions (student_id, assignment_id, practice_step_id)
    VALUES (v_student_id, v_assignment_id, v_other_step_id);
    RAISE EXCEPTION 'Mismatched-step completion unexpectedly succeeded';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN NULL;
  END;
  RESET ROLE;

  UPDATE public.assignments
  SET archived_at = NOW()
  WHERE id = v_assignment_id;

  SET LOCAL ROLE authenticated;
  PERFORM set_config('request.jwt.claim.sub', v_student_auth::TEXT, TRUE);
  BEGIN
    INSERT INTO public.completions (student_id, assignment_id, practice_step_id)
    VALUES (v_student_id, v_assignment_id, v_step_id);
    RAISE EXCEPTION 'Archived assignment unexpectedly accepted a completion';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN NULL;
  END;
  RESET ROLE;

  UPDATE public.assignments
  SET archived_at = NULL, memorized = TRUE
  WHERE id = v_assignment_id;

  SET LOCAL ROLE authenticated;
  PERFORM set_config('request.jwt.claim.sub', v_student_auth::TEXT, TRUE);
  BEGIN
    INSERT INTO public.daily_practice_status (student_id, practice_step_id, date, status)
    VALUES (v_student_id, v_step_id, v_today + 1, 'pending');
    RAISE EXCEPTION 'Memorized assignment unexpectedly accepted a daily status';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN NULL;
  END;
  RESET ROLE;

  -- No attempted rejection may delete the valid history created above.
  SELECT COUNT(*) INTO v_completion_count
  FROM public.completions
  WHERE assignment_id = v_assignment_id
    AND practice_step_id = v_step_id;
  IF v_completion_count <> 1 THEN
    RAISE EXCEPTION 'Rejected writes changed completion history';
  END IF;
END;
$$;

ROLLBACK;

-- 022 — Atomic approved-draft assignment publishing.
--
-- Assignment creation used to insert the assignment, insert practice steps,
-- and then mark the lesson draft as published in three separate requests.
-- This function keeps the database writes in one transaction. Attachment
-- storage remains outside the database transaction; the client removes an
-- uploaded file if the function fails.

BEGIN;

CREATE OR REPLACE FUNCTION public.publish_assignment_draft(
  p_draft_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_instrument_type TEXT,
  p_category TEXT,
  p_deadline DATE,
  p_attachment_url TEXT,
  p_steps JSONB
)
RETURNS public.assignments
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  draft_row public.assignment_drafts;
  assignment_row public.assignments;
  steps_json JSONB := COALESCE(p_steps, '[]'::jsonb);
  inserted_step_count INTEGER := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF jsonb_typeof(steps_json) <> 'array' THEN
    RAISE EXCEPTION 'Assignment steps must be a JSON array'
      USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO draft_row
  FROM public.assignment_drafts
  WHERE id = p_draft_id
    AND teacher_id = auth.uid()
    AND status = 'approved'
  FOR UPDATE;

  IF draft_row.id IS NULL THEN
    RAISE EXCEPTION 'Approved assignment draft not found or not accessible'
      USING ERRCODE = '42501';
  END IF;

  IF char_length(btrim(COALESCE(p_title, ''))) = 0 THEN
    RAISE EXCEPTION 'Assignment title is required'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.assignments (
    teacher_id,
    student_id,
    title,
    description,
    instrument_type,
    category,
    deadline,
    attachment_url
  )
  VALUES (
    draft_row.teacher_id,
    draft_row.student_id,
    btrim(p_title),
    NULLIF(btrim(COALESCE(p_description, '')), ''),
    NULLIF(btrim(COALESCE(p_instrument_type, '')), ''),
    COALESCE(NULLIF(btrim(COALESCE(p_category, '')), ''), 'pieces'),
    p_deadline,
    p_attachment_url
  )
  RETURNING * INTO assignment_row;

  INSERT INTO public.practice_steps (
    assignment_id,
    step_number,
    title,
    description,
    sequence_order
  )
  SELECT
    assignment_row.id,
    step.ordinality::INTEGER,
    btrim(step.value ->> 'title'),
    NULLIF(btrim(COALESCE(step.value ->> 'description', '')), ''),
    step.ordinality::INTEGER
  FROM jsonb_array_elements(steps_json) WITH ORDINALITY AS step(value, ordinality)
  WHERE char_length(btrim(COALESCE(step.value ->> 'title', ''))) > 0;

  GET DIAGNOSTICS inserted_step_count = ROW_COUNT;

  IF inserted_step_count = 0 THEN
    INSERT INTO public.practice_steps (
      assignment_id,
      step_number,
      title,
      description,
      sequence_order
    )
    VALUES (
      assignment_row.id,
      1,
      btrim(p_title),
      NULLIF(btrim(COALESCE(p_description, '')), ''),
      1
    );
  END IF;

  UPDATE public.assignment_drafts
  SET status = 'published',
      assignment_id = assignment_row.id
  WHERE id = draft_row.id;

  RETURN assignment_row;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_assignment_draft(UUID, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_assignment_draft(UUID, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, JSONB) TO authenticated;

COMMENT ON FUNCTION public.publish_assignment_draft(UUID, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, JSONB) IS
  'Atomically publishes an approved teacher lesson draft as an assignment with practice steps.';

NOTIFY pgrst, 'reload schema';
COMMIT;

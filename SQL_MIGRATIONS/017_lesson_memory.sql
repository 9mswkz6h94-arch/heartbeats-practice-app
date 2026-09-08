-- 017 — Teacher-only lesson memory and assignment suggestions.
--
-- This stores short, teacher-entered notes only. It does not store audio,
-- recordings, transcripts, or student-facing chat. Students and parents get
-- no policies on these tables; RLS limits every row to the student's teacher.

CREATE TABLE IF NOT EXISTS public.lesson_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  wrapped_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'wrapped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (status = 'open' AND wrapped_at IS NULL)
    OR (status = 'wrapped' AND wrapped_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lesson_sessions_one_open
  ON public.lesson_sessions(student_id, teacher_id)
  WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_lesson_sessions_student_recent
  ON public.lesson_sessions(student_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_sessions_teacher_recent
  ON public.lesson_sessions(teacher_id, started_at DESC);

CREATE TABLE IF NOT EXISTS public.lesson_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_session_id UUID NOT NULL
    REFERENCES public.lesson_sessions(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL CHECK (
    category_id IN (
      'worked-on',
      'clicked',
      'keep-exploring',
      'student-voice',
      'next-time',
      'family-admin'
    )
  ),
  body TEXT NOT NULL CHECK (
    char_length(btrim(body)) BETWEEN 1 AND 2000
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_notes_session_time
  ON public.lesson_notes(lesson_session_id, created_at);

CREATE TABLE IF NOT EXISTS public.assignment_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_session_id UUID NOT NULL UNIQUE
    REFERENCES public.lesson_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 240),
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(steps) = 'array'),
  status TEXT NOT NULL DEFAULT 'suggested'
    CHECK (status IN ('suggested', 'approved', 'published', 'archived')),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignment_drafts_teacher_status
  ON public.assignment_drafts(teacher_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_assignment_drafts_student_recent
  ON public.assignment_drafts(student_id, updated_at DESC);

CREATE OR REPLACE FUNCTION public.set_lesson_memory_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lesson_sessions_updated_at ON public.lesson_sessions;
CREATE TRIGGER trg_lesson_sessions_updated_at
  BEFORE UPDATE ON public.lesson_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_lesson_memory_updated_at();

DROP TRIGGER IF EXISTS trg_lesson_notes_updated_at ON public.lesson_notes;
CREATE TRIGGER trg_lesson_notes_updated_at
  BEFORE UPDATE ON public.lesson_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_lesson_memory_updated_at();

DROP TRIGGER IF EXISTS trg_assignment_drafts_updated_at ON public.assignment_drafts;
CREATE TRIGGER trg_assignment_drafts_updated_at
  BEFORE UPDATE ON public.assignment_drafts
  FOR EACH ROW EXECUTE FUNCTION public.set_lesson_memory_updated_at();

ALTER TABLE public.lesson_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS teacher_manage_lesson_sessions ON public.lesson_sessions;
CREATE POLICY teacher_manage_lesson_sessions ON public.lesson_sessions
  FOR ALL
  TO authenticated
  USING (
    teacher_id = auth.uid()
    AND public.is_teacher_of(student_id)
  )
  WITH CHECK (
    teacher_id = auth.uid()
    AND public.is_teacher_of(student_id)
  );

DROP POLICY IF EXISTS teacher_manage_lesson_notes ON public.lesson_notes;
CREATE POLICY teacher_manage_lesson_notes ON public.lesson_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.lesson_sessions session
      WHERE session.id = lesson_session_id
        AND session.teacher_id = auth.uid()
        AND public.is_teacher_of(session.student_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.lesson_sessions session
      WHERE session.id = lesson_session_id
        AND session.teacher_id = auth.uid()
        AND public.is_teacher_of(session.student_id)
    )
  );

DROP POLICY IF EXISTS teacher_manage_assignment_drafts ON public.assignment_drafts;
CREATE POLICY teacher_manage_assignment_drafts ON public.assignment_drafts
  FOR ALL
  TO authenticated
  USING (
    teacher_id = auth.uid()
    AND public.is_teacher_of(student_id)
    AND EXISTS (
      SELECT 1
      FROM public.lesson_sessions session
      WHERE session.id = lesson_session_id
        AND session.teacher_id = assignment_drafts.teacher_id
        AND session.student_id = assignment_drafts.student_id
    )
  )
  WITH CHECK (
    teacher_id = auth.uid()
    AND public.is_teacher_of(student_id)
    AND EXISTS (
      SELECT 1
      FROM public.lesson_sessions session
      WHERE session.id = lesson_session_id
        AND session.teacher_id = assignment_drafts.teacher_id
        AND session.student_id = assignment_drafts.student_id
    )
  );

-- Wrap the lesson and preserve its suggestion together, so a connection
-- failure cannot leave one saved without the other.
CREATE OR REPLACE FUNCTION public.wrap_lesson_memory(
  p_lesson_session_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_steps JSONB
)
RETURNS public.assignment_drafts
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  session_row public.lesson_sessions;
  draft_row public.assignment_drafts;
BEGIN
  IF jsonb_typeof(COALESCE(p_steps, '[]'::jsonb)) <> 'array' THEN
    RAISE EXCEPTION 'Assignment draft steps must be a JSON array';
  END IF;

  UPDATE public.lesson_sessions
  SET status = 'wrapped', wrapped_at = now()
  WHERE id = p_lesson_session_id
    AND status = 'open'
  RETURNING * INTO session_row;

  IF session_row.id IS NULL THEN
    RAISE EXCEPTION 'Open lesson session not found or not accessible';
  END IF;

  INSERT INTO public.assignment_drafts (
    lesson_session_id,
    student_id,
    teacher_id,
    title,
    description,
    steps,
    status
  )
  VALUES (
    session_row.id,
    session_row.student_id,
    session_row.teacher_id,
    btrim(p_title),
    NULLIF(btrim(COALESCE(p_description, '')), ''),
    COALESCE(p_steps, '[]'::jsonb),
    'suggested'
  )
  ON CONFLICT (lesson_session_id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    steps = EXCLUDED.steps,
    status = CASE
      WHEN assignment_drafts.status = 'published' THEN assignment_drafts.status
      ELSE 'suggested'
    END
  RETURNING * INTO draft_row;

  RETURN draft_row;
END;
$$;

REVOKE ALL ON public.lesson_sessions FROM anon;
REVOKE ALL ON public.lesson_notes FROM anon;
REVOKE ALL ON public.assignment_drafts FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignment_drafts TO authenticated;
GRANT EXECUTE ON FUNCTION public.wrap_lesson_memory(UUID, TEXT, TEXT, JSONB)
  TO authenticated;

COMMENT ON TABLE public.lesson_sessions IS
  'Teacher-only lesson continuity records; never exposed to student or parent roles.';
COMMENT ON TABLE public.lesson_notes IS
  'Short teacher-entered notes only; no audio, recording, or transcript storage.';
COMMENT ON TABLE public.assignment_drafts IS
  'Private teacher suggestions that require deliberate approval before assignment publishing.';

-- After applying in a sandbox, verify that only teacher policies exist:
-- SELECT tablename, policyname, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN ('lesson_sessions', 'lesson_notes', 'assignment_drafts')
-- ORDER BY tablename, policyname;

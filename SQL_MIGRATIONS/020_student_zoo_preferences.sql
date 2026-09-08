-- 020 — Student-owned Musical Zoo preferences.
--
-- This table stores arrangement and companion choices only. Practice history,
-- streaks, XP, pets, creatures, assignments, and unlock eligibility remain in
-- their existing tables and are never copied or rewritten here.

BEGIN;

CREATE TABLE IF NOT EXISTS public.student_zoo_preferences (
  student_id UUID PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  selected_companion_id TEXT,
  habitat_residency JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(habitat_residency) = 'object'),
  meadow_placements JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(meadow_placements) = 'object'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_student_zoo_preferences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_student_zoo_preferences_updated_at
  ON public.student_zoo_preferences;
CREATE TRIGGER trg_student_zoo_preferences_updated_at
  BEFORE UPDATE ON public.student_zoo_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_student_zoo_preferences_updated_at();

ALTER TABLE public.student_zoo_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS student_manage_own_zoo_preferences
  ON public.student_zoo_preferences;
CREATE POLICY student_manage_own_zoo_preferences
  ON public.student_zoo_preferences
  FOR ALL
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    student_id IN (
      SELECT id FROM public.students WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS teacher_read_student_zoo_preferences
  ON public.student_zoo_preferences;
CREATE POLICY teacher_read_student_zoo_preferences
  ON public.student_zoo_preferences
  FOR SELECT
  TO authenticated
  USING (public.is_teacher_of(student_id));

REVOKE ALL ON public.student_zoo_preferences FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.student_zoo_preferences TO authenticated;

COMMENT ON TABLE public.student_zoo_preferences IS
  'Student-owned Zoo arrangement preferences only; no practice or reward ledger data.';

NOTIFY pgrst, 'reload schema';
COMMIT;

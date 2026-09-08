-- 019 — Privacy-scoped family and student profile details.
--
-- Apply only after the matching FamilySignup UI is approved. Age is derived
-- from birthday in the app and is intentionally not stored as a second value.
-- Additional guardians are contact records, not login accounts.

BEGIN;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS preferred_name TEXT,
  ADD COLUMN IF NOT EXISTS birthday DATE,
  ADD COLUMN IF NOT EXISTS pronouns TEXT,
  ADD COLUMN IF NOT EXISTS school_grade TEXT;

ALTER TABLE public.parent_students
  ADD COLUMN IF NOT EXISTS relationship TEXT,
  ADD COLUMN IF NOT EXISTS can_manage_family BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS public.family_guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 160),
  relationship TEXT,
  email TEXT,
  phone TEXT,
  receives_studio_contact BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_family_guardians_family
  ON public.family_guardians(family_id);

CREATE OR REPLACE FUNCTION public.set_family_guardians_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_family_guardians_updated_at
  ON public.family_guardians;
CREATE TRIGGER trg_family_guardians_updated_at
  BEFORE UPDATE ON public.family_guardians
  FOR EACH ROW EXECUTE FUNCTION public.set_family_guardians_updated_at();

ALTER TABLE public.family_guardians ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS family_creator_manage_guardians
  ON public.family_guardians;
CREATE POLICY family_creator_manage_guardians
  ON public.family_guardians
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.families family
      WHERE family.id = family_id
        AND family.created_by = auth.uid()
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.families family
      WHERE family.id = family_id
        AND family.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS teacher_read_family_guardians
  ON public.family_guardians;
CREATE POLICY teacher_read_family_guardians
  ON public.family_guardians
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students student
      WHERE student.family_id = family_id
        AND student.teacher_id = auth.uid()
    )
  );

REVOKE ALL ON public.family_guardians FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_guardians TO authenticated;

COMMENT ON TABLE public.family_guardians IS
  'Private caregiver contacts. Records do not create authentication accounts.';
COMMENT ON COLUMN public.students.birthday IS
  'Private profile detail. Age is derived at display time and is not stored.';

NOTIFY pgrst, 'reload schema';
COMMIT;

-- 021 — Teacher-created, strength-based digital badge awards.
--
-- These live beside the existing automatic student_badges ledger so the
-- established badge history is never rewritten. Physical formats are saved
-- only as a keepsake idea; this table cannot create or fulfill an order.

BEGIN;

CREATE TABLE IF NOT EXISTS public.teacher_badge_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  template_id TEXT NOT NULL,
  title TEXT NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 44),
  message TEXT NOT NULL CHECK (char_length(btrim(message)) BETWEEN 1 AND 180),
  character_id TEXT NOT NULL,
  physical_format_id TEXT NOT NULL DEFAULT 'digital'
    CHECK (physical_format_id IN ('digital', 'embroidered-patch-3', 'pinback-2-25')),
  order_status TEXT NOT NULL DEFAULT 'not-requested'
    CHECK (order_status = 'not-requested'),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_badge_awards_student_earned
  ON public.teacher_badge_awards(student_id, earned_at DESC);

CREATE INDEX IF NOT EXISTS idx_teacher_badge_awards_teacher
  ON public.teacher_badge_awards(teacher_id, earned_at DESC);

ALTER TABLE public.teacher_badge_awards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS teacher_create_badge_awards
  ON public.teacher_badge_awards;
CREATE POLICY teacher_create_badge_awards
  ON public.teacher_badge_awards
  FOR INSERT
  TO authenticated
  WITH CHECK (
    teacher_id = auth.uid()
    AND public.is_teacher_of(student_id)
    AND order_status = 'not-requested'
  );

DROP POLICY IF EXISTS teacher_read_badge_awards
  ON public.teacher_badge_awards;
CREATE POLICY teacher_read_badge_awards
  ON public.teacher_badge_awards
  FOR SELECT
  TO authenticated
  USING (
    teacher_id = auth.uid()
    AND public.is_teacher_of(student_id)
  );

DROP POLICY IF EXISTS student_read_teacher_badge_awards
  ON public.teacher_badge_awards;
CREATE POLICY student_read_teacher_badge_awards
  ON public.teacher_badge_awards
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS parent_read_teacher_badge_awards
  ON public.teacher_badge_awards;
CREATE POLICY parent_read_teacher_badge_awards
  ON public.teacher_badge_awards
  FOR SELECT
  TO authenticated
  USING (public.is_parent_of(student_id));

REVOKE ALL ON public.teacher_badge_awards FROM anon;
GRANT SELECT, INSERT ON public.teacher_badge_awards TO authenticated;

COMMENT ON TABLE public.teacher_badge_awards IS
  'Teacher-created digital celebrations. Physical format is planning metadata only; order_status cannot initiate fulfillment.';

NOTIFY pgrst, 'reload schema';
COMMIT;

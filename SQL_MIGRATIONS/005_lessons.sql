-- 005 — Minimal lesson schedule, backing the "add to calendar" feature.
-- One row per recurring weekly lesson slot (day_of_week + time), not a
-- full booking system — that's a future phase per the wishlist.

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time TIME NOT NULL,
  duration_minutes SMALLINT NOT NULL DEFAULT 30,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (student_id)
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS teacher_manage_lessons ON lessons;
CREATE POLICY teacher_manage_lessons ON lessons
  FOR ALL USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS student_read_own_lesson ON lessons;
CREATE POLICY student_read_own_lesson ON lessons
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS parent_read_lesson ON lessons;
CREATE POLICY parent_read_lesson ON lessons
  FOR SELECT USING (is_parent_of(student_id));

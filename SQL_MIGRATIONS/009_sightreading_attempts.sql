-- Sight Reading module: stores one row per completed exercise (not per note).
-- Deliberately its own table rather than reusing `completions` — a sight-reading
-- session isn't tied to a teacher-assigned practice_step/assignment the way
-- every other completion is, and forcing a fake assignment into existence just
-- to satisfy that FK would pollute the student's real assignment list.
-- Streak/"days practiced" credit is folded in at the query layer
-- (see src/lib/studentStats.js) by unioning this table's dates with completions'.

CREATE TABLE IF NOT EXISTS sightreading_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  instrument TEXT,
  level TEXT NOT NULL DEFAULT 'beginner',
  input_mode TEXT NOT NULL DEFAULT 'manual', -- 'mic' or 'manual'
  notes_correct INT NOT NULL DEFAULT 0,
  notes_total INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sightreading_attempts_student
  ON sightreading_attempts(student_id, completed_at);

-- award_pet_xp() (from 007_practice_pet.sql) only reads NEW.student_id, so it
-- works unmodified as a trigger on this table too — one completed exercise
-- earns the same +1 XP as one completed practice step, keeping the pet as a
-- single shared reward pipeline instead of a parallel one per module.
DROP TRIGGER IF EXISTS trg_award_pet_xp_sightreading ON sightreading_attempts;
CREATE TRIGGER trg_award_pet_xp_sightreading
  AFTER INSERT ON sightreading_attempts
  FOR EACH ROW EXECUTE FUNCTION award_pet_xp();

ALTER TABLE sightreading_attempts ENABLE ROW LEVEL SECURITY;

-- Mirrors the completions_insert / completions_select / parent_read_completions
-- policies in 000_live_policies_snapshot.sql so the same three roles
-- (student, teacher, parent) get the same access shape.
DROP POLICY IF EXISTS sightreading_attempts_insert ON sightreading_attempts;
CREATE POLICY sightreading_attempts_insert ON sightreading_attempts
  FOR INSERT
  WITH CHECK (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS sightreading_attempts_select ON sightreading_attempts;
CREATE POLICY sightreading_attempts_select ON sightreading_attempts
  FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
    OR student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid())
  );

DROP POLICY IF EXISTS parent_read_sightreading_attempts ON sightreading_attempts;
CREATE POLICY parent_read_sightreading_attempts ON sightreading_attempts
  FOR SELECT
  USING (is_parent_of(student_id));

-- 007 — The practice pet: growth, never survival. No health/decay column
-- by design (per the wishlist's hard rule) — a missed day just means the
-- pet naps and waits, happy to see them whenever they return.

CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  stage SMALLINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pet_read ON pets;
CREATE POLICY pet_read ON pets
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
    OR is_teacher_of(student_id)
    OR is_parent_of(student_id)
  );

-- 5 stages, +1 XP per completed practice step. No writes from clients —
-- the trigger below is the only path, so XP can't be gamed from the app.
CREATE OR REPLACE FUNCTION stage_for_xp(p_xp INTEGER) RETURNS SMALLINT AS $$
  SELECT CASE
    WHEN p_xp >= 100 THEN 4
    WHEN p_xp >= 50 THEN 3
    WHEN p_xp >= 20 THEN 2
    WHEN p_xp >= 5 THEN 1
    ELSE 0
  END;
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION award_pet_xp() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pets (student_id, xp, stage)
  VALUES (NEW.student_id, 1, 0)
  ON CONFLICT (student_id) DO UPDATE
    SET xp = pets.xp + 1,
        stage = stage_for_xp(pets.xp + 1),
        updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_award_pet_xp ON completions;
CREATE TRIGGER trg_award_pet_xp
  AFTER INSERT ON completions
  FOR EACH ROW EXECUTE FUNCTION award_pet_xp();

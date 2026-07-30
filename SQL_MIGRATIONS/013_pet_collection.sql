-- Pet Collection: a side layer on top of the existing single growing pet
-- (pets table, untouched). Every 5 XP the main pet earns (same cadence as
-- its first stage threshold), the student also gets a mystery egg into this
-- collection. Eggs hatch into a random species; two creatures of the same
-- species + stage can be merged into one of the next stage.
--
-- Stages here are intentionally just 3 (Baby -> Grown -> Elder) rather than
-- mirroring the main pet's 5 — merge costs double at each step (2 eggs -> 1
-- baby... -> 1 baby, 2 babies -> 1 grown, 2 grown -> 1 elder = 4 eggs total
-- per elder), and eggs are already a slow trickle, so more tiers would make
-- the collection feel unreachable rather than a fun side goal.
--
-- All mutation (hatch/merge) goes through SECURITY DEFINER functions rather
-- than direct table writes — same anti-gaming principle as award_pet_xp():
-- no client-side path exists to fabricate eggs, pick your own species, or
-- merge mismatched/unowned creatures.

CREATE TABLE IF NOT EXISTS pet_creatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  species TEXT, -- NULL until hatched
  stage SMALLINT NOT NULL DEFAULT 0, -- 0 = unhatched egg, 1 = baby, 2 = grown, 3 = elder
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pet_creatures_student ON pet_creatures(student_id);

ALTER TABLE pet_creatures ENABLE ROW LEVEL SECURITY;

-- Read-only for everyone who can already see this student's pet — no
-- INSERT/UPDATE/DELETE policies at all; those only happen inside the
-- SECURITY DEFINER functions below.
DROP POLICY IF EXISTS pet_creatures_read ON pet_creatures;
CREATE POLICY pet_creatures_read ON pet_creatures
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
    OR is_teacher_of(student_id)
    OR is_parent_of(student_id)
  );

-- Extend award_pet_xp() (from 007_practice_pet.sql) to also drop a mystery
-- egg into the collection every 5th XP point, in the same trigger-only path.
CREATE OR REPLACE FUNCTION award_pet_xp() RETURNS TRIGGER AS $$
DECLARE
  new_xp INTEGER;
BEGIN
  INSERT INTO pets (student_id, xp, stage)
  VALUES (NEW.student_id, 1, 0)
  ON CONFLICT (student_id) DO UPDATE
    SET xp = pets.xp + 1,
        stage = stage_for_xp(pets.xp + 1),
        updated_at = now()
  RETURNING xp INTO new_xp;

  IF new_xp % 5 = 0 THEN
    INSERT INTO pet_creatures (student_id, species, stage) VALUES (NEW.student_id, NULL, 0);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reveals a random species for an owned, unhatched egg.
CREATE OR REPLACE FUNCTION hatch_egg(p_egg_id UUID) RETURNS pet_creatures AS $$
DECLARE
  v_caller_student UUID;
  v_egg pet_creatures;
  v_species TEXT;
  species_pool TEXT[] := ARRAY['dragon','capybara','giraffe','fox','panda','owl','koala','bunny','cat','dolphin'];
BEGIN
  SELECT id INTO v_caller_student FROM students WHERE auth_user_id = auth.uid();
  IF v_caller_student IS NULL THEN
    RAISE EXCEPTION 'No student profile for this session';
  END IF;

  SELECT * INTO v_egg FROM pet_creatures
    WHERE id = p_egg_id AND student_id = v_caller_student AND stage = 0 AND species IS NULL;
  IF v_egg.id IS NULL THEN
    RAISE EXCEPTION 'Egg not found, not yours, or already hatched';
  END IF;

  v_species := species_pool[1 + floor(random() * array_length(species_pool, 1))::int];

  UPDATE pet_creatures SET species = v_species, stage = 1
    WHERE id = p_egg_id
    RETURNING * INTO v_egg;

  RETURN v_egg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Merges two owned creatures of the same species + stage into one of the
-- next stage. Validates ownership and matching explicitly server-side so a
-- crafted client request can't merge mismatched or someone else's creatures.
CREATE OR REPLACE FUNCTION merge_creatures(p_id_a UUID, p_id_b UUID) RETURNS pet_creatures AS $$
DECLARE
  v_caller_student UUID;
  a pet_creatures;
  b pet_creatures;
  v_result pet_creatures;
BEGIN
  SELECT id INTO v_caller_student FROM students WHERE auth_user_id = auth.uid();
  IF v_caller_student IS NULL THEN
    RAISE EXCEPTION 'No student profile for this session';
  END IF;

  IF p_id_a = p_id_b THEN
    RAISE EXCEPTION 'Cannot merge a creature with itself';
  END IF;

  SELECT * INTO a FROM pet_creatures WHERE id = p_id_a AND student_id = v_caller_student;
  SELECT * INTO b FROM pet_creatures WHERE id = p_id_b AND student_id = v_caller_student;

  IF a.id IS NULL OR b.id IS NULL THEN
    RAISE EXCEPTION 'Creature not found or not yours';
  END IF;
  IF a.species IS DISTINCT FROM b.species OR a.stage IS DISTINCT FROM b.stage THEN
    RAISE EXCEPTION 'Creatures must match species and stage to merge';
  END IF;
  IF a.stage < 1 THEN
    RAISE EXCEPTION 'Hatch these eggs before merging';
  END IF;
  IF a.stage >= 3 THEN
    RAISE EXCEPTION 'Already at the top stage';
  END IF;

  DELETE FROM pet_creatures WHERE id IN (p_id_a, p_id_b);

  INSERT INTO pet_creatures (student_id, species, stage)
  VALUES (v_caller_student, a.species, a.stage + 1)
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Lets a student name their pet and, once ever, pick its species from the
-- same roster as the collection creatures. Existing pets already have an
-- implicit "chicken" identity they've been growing for a while — this
-- backfills species_chosen=true for all of them so nobody gets a surprise
-- species picker retroactively; only pets created after this migration
-- start with species_chosen=false and see the picker.
--
-- Both actions go through SECURITY DEFINER functions rather than direct
-- table writes, same pattern as hatch_egg/merge_creatures: validates
-- ownership, validates the species is a real option, and the species pick
-- can only ever happen once (guarded by the WHERE species_chosen = false).

ALTER TABLE pets ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS species TEXT NOT NULL DEFAULT 'chicken';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS species_chosen BOOLEAN NOT NULL DEFAULT false;

UPDATE pets SET species_chosen = true WHERE species_chosen = false;

CREATE OR REPLACE FUNCTION set_pet_name(p_name TEXT) RETURNS pets AS $$
DECLARE
  v_student_id UUID;
  v_result pets;
  v_clean TEXT;
BEGIN
  SELECT id INTO v_student_id FROM students WHERE auth_user_id = auth.uid();
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'No student profile for this session';
  END IF;

  v_clean := trim(p_name);
  IF length(v_clean) = 0 OR length(v_clean) > 24 THEN
    RAISE EXCEPTION 'Name must be 1-24 characters';
  END IF;

  UPDATE pets SET name = v_clean, updated_at = now()
    WHERE student_id = v_student_id
    RETURNING * INTO v_result;

  IF v_result.student_id IS NULL THEN
    RAISE EXCEPTION 'No pet found for this student yet';
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION choose_pet_species(p_species TEXT) RETURNS pets AS $$
DECLARE
  v_student_id UUID;
  v_result pets;
  valid_species TEXT[] := ARRAY[
    'chicken','dragon','capybara','giraffe','fox','panda','owl','koala','bunny','cat','dolphin'
  ];
BEGIN
  SELECT id INTO v_student_id FROM students WHERE auth_user_id = auth.uid();
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'No student profile for this session';
  END IF;
  IF NOT (p_species = ANY(valid_species)) THEN
    RAISE EXCEPTION 'Unknown species';
  END IF;

  UPDATE pets SET species = p_species, species_chosen = true, updated_at = now()
    WHERE student_id = v_student_id AND species_chosen = false
    RETURNING * INTO v_result;

  IF v_result.student_id IS NULL THEN
    RAISE EXCEPTION 'Species already chosen, or no pet found yet';
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

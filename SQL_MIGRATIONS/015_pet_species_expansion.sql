-- Adds cheetah, robot, and poop to the species roster (src/lib/petSpecies.js).
-- Both functions hardcode the species list server-side as a guardrail
-- against a crafted client request picking an arbitrary/unknown species, so
-- the allowed-list has to be updated here too whenever the roster changes.

CREATE OR REPLACE FUNCTION hatch_egg(p_egg_id UUID) RETURNS pet_creatures AS $$
DECLARE
  v_caller_student UUID;
  v_egg pet_creatures;
  v_species TEXT;
  species_pool TEXT[] := ARRAY[
    'dragon','capybara','giraffe','fox','panda','owl','koala','bunny','cat','dolphin',
    'cheetah','robot','poop'
  ];
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

CREATE OR REPLACE FUNCTION choose_pet_species(p_species TEXT) RETURNS pets AS $$
DECLARE
  v_student_id UUID;
  v_result pets;
  valid_species TEXT[] := ARRAY[
    'chicken','dragon','capybara','giraffe','fox','panda','owl','koala','bunny','cat','dolphin',
    'cheetah','robot','poop'
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

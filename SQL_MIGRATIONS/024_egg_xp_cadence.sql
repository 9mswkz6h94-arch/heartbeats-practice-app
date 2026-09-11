-- 024 — Keep collection eggs XP-earned, with a calm two-week cadence.
--
-- Ten XP is approximately two weeks for a student completing five practice
-- steps per week. Existing eggs remain untouched, and no missed-day or decay
-- rule is introduced. The starter pet's stage thresholds are unchanged.

BEGIN;

CREATE OR REPLACE FUNCTION public.award_pet_xp() RETURNS TRIGGER AS $$
DECLARE
  new_xp INTEGER;
BEGIN
  INSERT INTO public.pets (student_id, xp, stage)
  VALUES (NEW.student_id, 1, 0)
  ON CONFLICT (student_id) DO UPDATE
    SET xp = public.pets.xp + 1,
        stage = public.stage_for_xp(public.pets.xp + 1),
        updated_at = now()
  RETURNING xp INTO new_xp;

  IF new_xp % 10 = 0 THEN
    INSERT INTO public.pet_creatures (student_id, species, stage)
    VALUES (NEW.student_id, NULL, 0);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.award_pet_xp() IS
  'Awards one practice XP and one collection egg every ten XP; missed days never remove progress.';

NOTIFY pgrst, 'reload schema';
COMMIT;

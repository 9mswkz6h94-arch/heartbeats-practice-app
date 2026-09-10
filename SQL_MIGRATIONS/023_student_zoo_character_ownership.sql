-- 023 — Explicit student-owned Musical Zoo character IDs.
--
-- This is an ownership/presentation seam only. It does not mint rewards,
-- rewrite practice history, or decide when a character should arrive.

BEGIN;

ALTER TABLE public.student_zoo_preferences
  ADD COLUMN IF NOT EXISTS owned_character_ids JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(owned_character_ids) = 'array');

COMMENT ON COLUMN public.student_zoo_preferences.owned_character_ids IS
  'Explicitly granted Musical Zoo registry character IDs; arrival policy is owned by the app, not this preference row.';

NOTIFY pgrst, 'reload schema';
COMMIT;

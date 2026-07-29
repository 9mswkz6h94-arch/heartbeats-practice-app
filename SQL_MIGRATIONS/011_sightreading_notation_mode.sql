-- Tracks whether a logged sight-reading session used standard notation or
-- guitar/bass tab, now that fretted instruments support both.
ALTER TABLE sightreading_attempts ADD COLUMN IF NOT EXISTS notation_mode TEXT NOT NULL DEFAULT 'staff';

-- Lets a teacher turn the Sight Reading module on/off per student and set
-- their starting difficulty, editable from StudentManager.js the same way
-- lesson times already are. The level here is a *default/starting point*,
-- not a hard lock — the student can still switch levels in-session, same
-- as before. A full teacher-assigns-specific-exercises system (tied into
-- assignments/practice_steps) is a bigger lift and deliberately out of
-- scope here.

ALTER TABLE students ADD COLUMN IF NOT EXISTS sightreading_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE students ADD COLUMN IF NOT EXISTS sightreading_level TEXT NOT NULL DEFAULT 'beginner';

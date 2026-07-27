-- 008 — SMS notifications for flagged teacher messages (plan Phase 6, Twilio).
-- notify_sms already existed on parent_students (added in migration 002); this
-- adds the phone number that column needs to actually be actionable.

ALTER TABLE parent_students ADD COLUMN IF NOT EXISTS parent_phone TEXT;

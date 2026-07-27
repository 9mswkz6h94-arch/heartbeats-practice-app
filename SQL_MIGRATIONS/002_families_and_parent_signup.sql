-- ============================================================
-- 002 — Families, parent-driven signup, kid PIN login
-- Run in the Supabase dashboard SQL editor.
--
-- ALSO REQUIRED (dashboard, not SQL):
--   Authentication → Sign In / Up → Email → turn OFF "Confirm email".
--   Kid accounts use synthetic emails (kid-<id>@kids.heartbeats.app)
--   that can never receive a confirmation link, and the parent wizard
--   needs an immediate session after signup.
-- ============================================================

-- ---------- Families ----------
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_by UUID NOT NULL,              -- auth.uid() of the parent who signed up
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_families_code ON families(code);

-- ---------- Students: family columns ----------
ALTER TABLE students ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE SET NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS instrument TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('pending', 'active'));

-- ---------- Parent ↔ student links (matches PARENT_DASHBOARD_PLAN shape) ----------
CREATE TABLE IF NOT EXISTS parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_email TEXT NOT NULL,
  parent_name TEXT,
  parent_auth_user_id UUID,
  notify_email BOOLEAN DEFAULT TRUE,
  notify_sms BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_email, student_id)
);
CREATE INDEX IF NOT EXISTS idx_parent_students_email ON parent_students(parent_email);
CREATE INDEX IF NOT EXISTS idx_parent_students_student ON parent_students(student_id);

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_students ENABLE ROW LEVEL SECURITY;

-- ---------- Helpers ----------
-- Single-teacher studio: every new family's kids attach to the first teacher account.
CREATE OR REPLACE FUNCTION default_teacher_id() RETURNS UUID AS $$
  SELECT id FROM users WHERE type = 'teacher' LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_parent_of(sid UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM parent_students ps
    WHERE ps.student_id = sid
      AND (ps.parent_auth_user_id = auth.uid()
           OR ps.parent_email = auth.jwt()->>'email')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_teacher_of(sid UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM students s WHERE s.id = sid AND s.teacher_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Auto-attach: fill teacher_id on any student insert that doesn't set one.
CREATE OR REPLACE FUNCTION set_default_teacher() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.teacher_id IS NULL THEN
    NEW.teacher_id := default_teacher_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_students_default_teacher ON students;
CREATE TRIGGER trg_students_default_teacher
  BEFORE INSERT ON students
  FOR EACH ROW EXECUTE FUNCTION set_default_teacher();

-- ---------- RPC: create a family with a unique friendly code ----------
-- SECURITY DEFINER so the insert bypasses RLS; caller must be signed in.
CREATE OR REPLACE FUNCTION create_family(p_display_name TEXT)
RETURNS TABLE(family_id UUID, family_code TEXT) AS $$
DECLARE
  adjectives TEXT[] := ARRAY['BLUE','GOLD','JAZZY','MELLOW','BRAVE','SUNNY','COSMIC','LUCKY','ROYAL','WILD','SWIFT','HAPPY'];
  animals TEXT[] := ARRAY['TIGER','PANDA','OTTER','FALCON','DOLPHIN','KOALA','WOLF','FOX','EAGLE','BEAR','LYNX','HERON'];
  candidate TEXT;
  new_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be signed in to create a family';
  END IF;
  LOOP
    candidate := adjectives[1 + floor(random() * array_length(adjectives, 1))::int]
      || '-' || animals[1 + floor(random() * array_length(animals, 1))::int]
      || '-' || lpad(floor(random() * 100)::text, 2, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM families f WHERE f.code = candidate);
  END LOOP;
  INSERT INTO families (code, display_name, created_by)
  VALUES (candidate, p_display_name, auth.uid())
  RETURNING id INTO new_id;
  RETURN QUERY SELECT new_id, candidate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------- RPC: kid login lookup (anon-callable, minimal data) ----------
-- Given a family code, return just enough to render the "tap your name" picker.
CREATE OR REPLACE FUNCTION get_family_kids(p_code TEXT)
RETURNS TABLE(student_id UUID, name TEXT, avatar TEXT) AS $$
  SELECT s.id, s.name, s.avatar
  FROM students s
  JOIN families f ON f.id = s.family_id
  WHERE f.code = upper(trim(p_code))
  ORDER BY s.created_at;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_family_kids(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_family(TEXT) TO authenticated;

-- ---------- Policies ----------
-- families: creator reads own; any teacher reads all (for the HUD approve view).
DROP POLICY IF EXISTS family_creator_read ON families;
CREATE POLICY family_creator_read ON families
  FOR SELECT USING (created_by = auth.uid());
DROP POLICY IF EXISTS family_teacher_read ON families;
CREATE POLICY family_teacher_read ON families
  FOR SELECT USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.type = 'teacher'));

-- parent_students: teacher manages; parent reads/creates own links, updates notify prefs.
DROP POLICY IF EXISTS teacher_manage_parent_links ON parent_students;
CREATE POLICY teacher_manage_parent_links ON parent_students
  FOR ALL USING (is_teacher_of(student_id)) WITH CHECK (is_teacher_of(student_id));
DROP POLICY IF EXISTS parent_read_own_links ON parent_students;
CREATE POLICY parent_read_own_links ON parent_students
  FOR SELECT USING (parent_auth_user_id = auth.uid() OR parent_email = auth.jwt()->>'email');
DROP POLICY IF EXISTS parent_insert_own_links ON parent_students;
CREATE POLICY parent_insert_own_links ON parent_students
  FOR INSERT WITH CHECK (parent_auth_user_id = auth.uid() OR parent_email = auth.jwt()->>'email');
DROP POLICY IF EXISTS parent_update_own_links ON parent_students;
CREATE POLICY parent_update_own_links ON parent_students
  FOR UPDATE USING (parent_auth_user_id = auth.uid() OR parent_email = auth.jwt()->>'email');

-- students: parents may create kids inside their own family (always 'pending'),
-- and read their own kids.
DROP POLICY IF EXISTS parent_insert_kids ON students;
CREATE POLICY parent_insert_kids ON students
  FOR INSERT WITH CHECK (
    status = 'pending'
    AND family_id IN (SELECT id FROM families WHERE created_by = auth.uid())
  );
DROP POLICY IF EXISTS parent_read_students ON students;
CREATE POLICY parent_read_students ON students
  FOR SELECT USING (is_parent_of(id));

-- ============================================================
-- Verify after running:
--   select tablename, policyname, cmd from pg_policies
--   where schemaname='public' and tablename in ('families','parent_students','students');
-- ============================================================

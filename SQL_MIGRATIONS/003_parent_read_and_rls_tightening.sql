-- ============================================================
-- 003 — Parent read-only access + close the wide-open RLS holes
--
-- Live-policy audit (2026-07-27) found permissive `USING (true)` /
-- `WITH CHECK (true)` policies letting ANY signed-in user read every
-- student's completions, repertoire, badges, and daily status — and
-- insert repertoire/badges for anyone. With parent self-signup now
-- live, that hole gets closed here.
--
-- completions + daily_practice_status already have properly-scoped
-- student/teacher policies alongside the permissive ones (safe to just
-- drop the latter). repertoire + student_badges ONLY had permissive
-- policies, so they get proper replacements.
-- ============================================================

-- ---------- Parent read-only access (uses is_parent_of from 002) ----------
DROP POLICY IF EXISTS parent_read_assignments ON assignments;
CREATE POLICY parent_read_assignments ON assignments
  FOR SELECT USING (is_parent_of(student_id));

DROP POLICY IF EXISTS parent_read_steps ON practice_steps;
CREATE POLICY parent_read_steps ON practice_steps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assignments a WHERE a.id = assignment_id AND is_parent_of(a.student_id))
  );

DROP POLICY IF EXISTS parent_read_completions ON completions;
CREATE POLICY parent_read_completions ON completions
  FOR SELECT USING (is_parent_of(student_id));

DROP POLICY IF EXISTS parent_read_daily ON daily_practice_status;
CREATE POLICY parent_read_daily ON daily_practice_status
  FOR SELECT USING (is_parent_of(student_id));

DROP POLICY IF EXISTS parent_read_repertoire ON repertoire;
CREATE POLICY parent_read_repertoire ON repertoire
  FOR SELECT USING (is_parent_of(student_id));

DROP POLICY IF EXISTS parent_read_sbadges ON student_badges;
CREATE POLICY parent_read_sbadges ON student_badges
  FOR SELECT USING (is_parent_of(student_id));

-- ---------- Proper replacements for repertoire / student_badges ----------
-- (student sees/writes own via auth link; teacher sees/writes their students')
DROP POLICY IF EXISTS repertoire_select ON repertoire;
CREATE POLICY repertoire_select ON repertoire
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
    OR student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid())
  );
DROP POLICY IF EXISTS repertoire_insert ON repertoire;
CREATE POLICY repertoire_insert ON repertoire
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
    OR student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid())
  );

DROP POLICY IF EXISTS student_badges_select ON student_badges;
CREATE POLICY student_badges_select ON student_badges
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
    OR student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid())
  );
DROP POLICY IF EXISTS student_badges_insert ON student_badges;
CREATE POLICY student_badges_insert ON student_badges
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
    OR student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid())
  );

-- ---------- Drop the wide-open policies ----------
DROP POLICY IF EXISTS "Allow students to log completions" ON completions;
DROP POLICY IF EXISTS "Allow students to see own completions" ON completions;
DROP POLICY IF EXISTS "Allow students to manage own daily status" ON daily_practice_status;
DROP POLICY IF EXISTS "Allow repertoire insertion" ON repertoire;
DROP POLICY IF EXISTS "Allow students to see own repertoire" ON repertoire;
DROP POLICY IF EXISTS "Allow badge insertion" ON student_badges;
DROP POLICY IF EXISTS "Allow students to see own badges" ON student_badges;

-- ============================================================
-- Post-run check: no `true` quals should remain on these tables.
--   select tablename, policyname, cmd, qual, with_check from pg_policies
--   where schemaname='public' and (qual = 'true' or with_check = 'true');
-- MUST re-test the student practice flow after running (completion +
-- daily status writes, repertoire/badge inserts) — those now go through
-- the scoped policies only.
-- ============================================================

-- 004 — Teacher<->parent communication log (plan Phase 4).
-- Students NEVER get policies on these tables (intentional).

CREATE TABLE IF NOT EXISTS communication_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('teacher','parent')),
  author_name TEXT,
  body TEXT NOT NULL,
  notify BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comm_log_student ON communication_log(student_id, created_at);

CREATE TABLE IF NOT EXISTS comm_thread_reads (
  user_id UUID NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, student_id)
);

ALTER TABLE communication_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE comm_thread_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS comm_read ON communication_log;
CREATE POLICY comm_read ON communication_log
  FOR SELECT USING (is_teacher_of(student_id) OR is_parent_of(student_id));
DROP POLICY IF EXISTS comm_write ON communication_log;
CREATE POLICY comm_write ON communication_log
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
    AND ((author_role = 'teacher' AND is_teacher_of(student_id))
      OR (author_role = 'parent'  AND is_parent_of(student_id)))
  );

DROP POLICY IF EXISTS reads_own ON comm_thread_reads;
CREATE POLICY reads_own ON comm_thread_reads
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

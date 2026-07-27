-- 006 — Parent-initiated reschedule requests against the fixed weekly lesson slot.
-- Not a full booking system: parent proposes a one-off new day/time,
-- teacher approves or declines. No conflict-checking across students (v1).

CREATE TABLE IF NOT EXISTS reschedule_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL,           -- parent's auth.uid()
  original_date DATE,                   -- which lesson occurrence, if known
  proposed_date DATE NOT NULL,
  proposed_time TIME NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','declined','cancelled')),
  teacher_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_reschedule_student ON reschedule_requests(student_id, created_at);

ALTER TABLE reschedule_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS teacher_manage_reschedule ON reschedule_requests;
CREATE POLICY teacher_manage_reschedule ON reschedule_requests
  FOR ALL USING (is_teacher_of(student_id)) WITH CHECK (is_teacher_of(student_id));

DROP POLICY IF EXISTS parent_read_own_reschedule ON reschedule_requests;
CREATE POLICY parent_read_own_reschedule ON reschedule_requests
  FOR SELECT USING (is_parent_of(student_id));

DROP POLICY IF EXISTS parent_insert_reschedule ON reschedule_requests;
CREATE POLICY parent_insert_reschedule ON reschedule_requests
  FOR INSERT WITH CHECK (is_parent_of(student_id) AND requested_by = auth.uid());

-- Parent can cancel their own still-pending request.
DROP POLICY IF EXISTS parent_cancel_own_reschedule ON reschedule_requests;
CREATE POLICY parent_cancel_own_reschedule ON reschedule_requests
  FOR UPDATE USING (requested_by = auth.uid() AND status = 'pending')
  WITH CHECK (requested_by = auth.uid());

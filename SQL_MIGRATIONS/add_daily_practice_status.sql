-- Create daily_practice_status table for tracking daily progress
CREATE TABLE IF NOT EXISTS daily_practice_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  practice_step_id UUID NOT NULL REFERENCES practice_steps(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'skipped'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, practice_step_id, date)
);

-- Create index for fast lookups by student and date
CREATE INDEX IF NOT EXISTS idx_daily_status_student_date
  ON daily_practice_status(student_id, date);

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_daily_status_status
  ON daily_practice_status(status);

-- Enable RLS
ALTER TABLE daily_practice_status ENABLE ROW LEVEL SECURITY;

-- Create policy to allow students to see/modify their own data
CREATE POLICY "Allow students to manage their own daily status"
  ON daily_practice_status
  FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

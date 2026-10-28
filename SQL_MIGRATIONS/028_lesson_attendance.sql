BEGIN;

-- One teacher-owned record per scheduled occurrence; changing a record never
-- changes a recurring lesson, a calendar event, or a student's practice data.
CREATE TABLE IF NOT EXISTS public.lesson_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  student_id uuid NOT NULL REFERENCES public.students(id),
  lesson_date date NOT NULL,
  lesson_time time NOT NULL,
  status text NOT NULL CHECK (status IN ('missed', 'rescheduled', 'no_show', 'cancelled')),
  billing_status text NOT NULL DEFAULT 'undecided' CHECK (billing_status IN ('undecided', 'bill', 'do_not_bill')),
  note text NOT NULL DEFAULT '',
  rescheduled_date date,
  rescheduled_time time,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, student_id, lesson_date, lesson_time)
);

ALTER TABLE public.lesson_attendance ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lesson_attendance FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.lesson_attendance TO authenticated;

DROP POLICY IF EXISTS lesson_attendance_teacher_select ON public.lesson_attendance;
CREATE POLICY lesson_attendance_teacher_select ON public.lesson_attendance FOR SELECT TO authenticated
  USING (teacher_id = auth.uid() AND EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.teacher_id = auth.uid()));
DROP POLICY IF EXISTS lesson_attendance_teacher_insert ON public.lesson_attendance;
CREATE POLICY lesson_attendance_teacher_insert ON public.lesson_attendance FOR INSERT TO authenticated
  WITH CHECK (teacher_id = auth.uid() AND EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.teacher_id = auth.uid()));
DROP POLICY IF EXISTS lesson_attendance_teacher_update ON public.lesson_attendance;
CREATE POLICY lesson_attendance_teacher_update ON public.lesson_attendance FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid() AND EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.teacher_id = auth.uid()))
  WITH CHECK (teacher_id = auth.uid() AND EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.teacher_id = auth.uid()));

CREATE INDEX IF NOT EXISTS lesson_attendance_month_idx ON public.lesson_attendance (teacher_id, lesson_date);
NOTIFY pgrst, 'reload schema';
COMMIT;


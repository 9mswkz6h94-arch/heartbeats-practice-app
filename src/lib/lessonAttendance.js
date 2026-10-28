import { supabase } from "./supabaseClient";

export const attendanceLabels = { missed: "Missed lesson", rescheduled: "Rescheduled", no_show: "No-show", cancelled: "Cancelled" };
export const billingLabels = { undecided: "Needs review", bill: "Bill", do_not_bill: "Do not bill" };

export function monthBounds(month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Choose a valid month.");
  const [year, m] = month.split("-").map(Number);
  const nextYear = m === 12 ? year + 1 : year;
  const nextMonth = m === 12 ? 1 : m + 1;
  return { start: `${month}-01`, end: `${nextYear}-${String(nextMonth).padStart(2, "0")}-01` };
}

export function createAttendanceApi(client = supabase) {
  return {
    async list(teacherId, month) {
      const { start, end } = monthBounds(month);
      const { data, error } = await client.from("lesson_attendance").select("id, student_id, lesson_date, lesson_time, status, billing_status, note, rescheduled_date, rescheduled_time")
        .eq("teacher_id", teacherId).gte("lesson_date", start).lt("lesson_date", end).order("lesson_date", { ascending: true }).order("lesson_time", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    async save(teacherId, record) {
      const { error } = await client.from("lesson_attendance").upsert({ ...record, teacher_id: teacherId, updated_at: new Date().toISOString() }, { onConflict: "teacher_id,student_id,lesson_date,lesson_time" });
      if (error) throw error;
    },
  };
}

export const attendanceApi = createAttendanceApi();


import { supabase } from "./supabaseClient";

// Categories that stay completed across days instead of resetting daily.
// Currently just Theory: once done, it stays done until the teacher
// explicitly clears it at the next lesson (see resetStepsForNextLesson).
export const THEORY_CATEGORY = "theory";

export const todayStr = () => new Date().toISOString().split("T")[0];

export function isPersistentCategory(category) {
  return (category || "").toLowerCase() === THEORY_CATEGORY;
}

// Given a flat list of steps (each with .id and .category), fetch their
// current status in one query per category-type instead of one per step:
//   - Daily categories (everything but Theory): status comes ONLY from
//     TODAY's daily_practice_status row. No row for today = pending. This
//     is what makes the reset correct for any gap since the last visit —
//     a day, a week, a month — it never does day-counting math, it just
//     asks "does today have a row yet."
//   - Theory: status comes from its MOST RECENT row ever, any date, so it
//     stays completed across days until a teacher resets it at the next
//     lesson via resetStepsForNextLesson.
export async function fetchStepStatusMap(studentId, steps) {
  const dailyIds = steps.filter((s) => !isPersistentCategory(s.category)).map((s) => s.id);
  const theoryIds = steps.filter((s) => isPersistentCategory(s.category)).map((s) => s.id);
  const map = {};

  if (dailyIds.length) {
    const { data, error } = await supabase
      .from("daily_practice_status")
      .select("practice_step_id, status")
      .eq("student_id", studentId)
      .eq("date", todayStr())
      .in("practice_step_id", dailyIds);
    if (error) throw error;
    (data || []).forEach((r) => { map[r.practice_step_id] = r.status; });
  }

  if (theoryIds.length) {
    // Rows for theory steps are only written on complete/skip/reset (never
    // a daily default), so history per step stays small — no pagination
    // risk here the way the old unbounded "every step, every day" query had.
    const { data, error } = await supabase
      .from("daily_practice_status")
      .select("practice_step_id, status, date")
      .eq("student_id", studentId)
      .in("practice_step_id", theoryIds)
      .order("date", { ascending: false });
    if (error) throw error;
    (data || []).forEach((r) => {
      if (!(r.practice_step_id in map)) map[r.practice_step_id] = r.status;
    });
  }

  return map;
}

// Bulk-create today's "pending" rows for any daily-category step that
// doesn't already have one — a single upsert instead of one insert per
// step, so returning after a long gap doesn't mean dozens of sequential
// round-trips. Theory steps are skipped entirely (no daily row needed).
export async function ensureTodayRows(studentId, steps, statusMap) {
  const missing = steps
    .filter((s) => !isPersistentCategory(s.category) && !(s.id in statusMap))
    .map((s) => ({
      student_id: studentId,
      practice_step_id: s.id,
      date: todayStr(),
      status: "pending",
    }));
  if (!missing.length) return;
  const { error } = await supabase
    .from("daily_practice_status")
    .upsert(missing, { onConflict: "student_id,practice_step_id,date" });
  if (error) throw error;
  missing.forEach((m) => { statusMap[m.practice_step_id] = "pending"; });
}

// Housekeeping: clear out past-dated rows for daily-category steps in one
// call. Only today's row is ever read for those categories, so anything
// older is pure clutter — this replaces the old per-record delete loop
// that could re-issue the same delete dozens of times and never bounded
// its own lookback query. Theory rows are left alone; that's the
// intentional persisted history. Best-effort: never blocks the UI.
export async function cleanupOldDailyRows(studentId, steps) {
  const dailyIds = steps.filter((s) => !isPersistentCategory(s.category)).map((s) => s.id);
  if (!dailyIds.length) return;
  const { error } = await supabase
    .from("daily_practice_status")
    .delete()
    .eq("student_id", studentId)
    .lt("date", todayStr())
    .in("practice_step_id", dailyIds);
  if (error) throw error;
}

// Mark a step complete/skipped right now. Always upserts today's row, so
// it works whether or not a row already existed — true for daily steps
// (row was pre-created) and for theory steps (row is only ever created
// on an action like this one).
export async function setStepStatus(studentId, stepId, status) {
  const { error } = await supabase
    .from("daily_practice_status")
    .upsert(
      [{ student_id: studentId, practice_step_id: stepId, date: todayStr(), status }],
      { onConflict: "student_id,practice_step_id,date" }
    );
  if (error) throw error;
}

// Teacher action at the next lesson: clears a Theory step's persisted
// status back to pending by deleting its history. Safe to call on
// daily-category steps too (they reset on their own, but this just gives
// an immediate reset instead of waiting for tomorrow).
export async function resetStepsForNextLesson(studentId, stepIds) {
  if (!stepIds.length) return;
  const { error } = await supabase
    .from("daily_practice_status")
    .delete()
    .eq("student_id", studentId)
    .in("practice_step_id", stepIds);
  if (error) throw error;
}

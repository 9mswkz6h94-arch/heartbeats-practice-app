import { supabase } from "./supabaseClient";
import { computeStreak, dayStr, daysBetween, parseDay } from "./rewardMath";

export { computeStreak, dayStr, daysBetween, parseDay } from "./rewardMath";

// Shared per-student practice stats, used by the teacher lesson-prep
// dashboard and the parent dashboard. Extracted from
// TeacherLessonPrepDashboard so the two can't drift.

export function buildRecentActivity(completions = [], today = new Date()) {
  const counts = new Map();
  completions.forEach((completion) => {
    const key = String(completion.completed_at || "").split("T")[0];
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return counts.get(dayStr(date)) || 0;
  });
}

export async function fetchStudentStats(studentId) {
  try {
    const { data: completions, error: completionsError } = await supabase
      .from("completions")
      .select("completed_at")
      .eq("student_id", studentId);
    if (completionsError) throw completionsError;

    const { data: repertoire, error: repertoireError } = await supabase
      .from("repertoire")
      .select("id, memorized_at, assignments(title)")
      .eq("student_id", studentId);
    if (repertoireError) throw repertoireError;

    const { data: assignments, error: assignmentsError } = await supabase
      .from("assignments")
      .select(
        `
        id, title, description, instrument_type, category, created_at, deadline, memorized, archived_at,
        practice_steps(id)
      `
      )
      .eq("student_id", studentId)
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    if (assignmentsError) throw assignmentsError;

    const { data: sightreadingSessions, error: sightreadingError } = await supabase
      .from("sightreading_attempts")
      .select("completed_at")
      .eq("student_id", studentId);
    if (sightreadingError) throw sightreadingError;

    const completionList = completions || [];
    const sightReadingList = sightreadingSessions || [];
    const activityList = [...completionList, ...sightReadingList];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeek = completionList.filter(
      (c) => new Date(c.completed_at) >= weekAgo
    ).length;
    const lastWeek = completionList.filter((c) => {
      const d = new Date(c.completed_at);
      return d >= twoWeeksAgo && d < weekAgo;
    }).length;

    const daySet = new Set(activityList.map((activity) => activity.completed_at.split("T")[0]));
    const everPracticed = daySet.size > 0;
    const streak = computeStreak(daySet);

    let lastDaysAgo = Infinity;
    if (everPracticed) {
      const latest = [...daySet].sort().pop();
      lastDaysAgo = Math.max(0, daysBetween(parseDay(latest), parseDay(dayStr(new Date()))));
    }

    return {
      completions: completionList.length,
      thisWeek,
      lastWeek,
      sightReadingSessions: sightReadingList.length,
      songsMemorized: repertoire?.length || 0,
      streak,
      everPracticed,
      lastDaysAgo,
      assignments: (assignments || []).filter(
        (assignment) => assignment.memorized !== true
      ),
      repertoire: (repertoire || [])
        .map((entry) => entry.assignments?.title)
        .filter(Boolean),
      recentActivity: buildRecentActivity(activityList),
    };
  } catch (err) {
    console.error("Error fetching student stats:", err);
    throw err;
  }
}

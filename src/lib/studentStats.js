import { supabase } from "./supabaseClient";
import { computeStreak, dayStr, daysBetween, parseDay } from "./rewardMath";

export { computeStreak, dayStr, daysBetween, parseDay } from "./rewardMath";

// Shared per-student practice stats, used by the teacher lesson-prep
// dashboard and the parent dashboard. Extracted from
// TeacherLessonPrepDashboard so the two can't drift.

// ── Date helpers (local-day based; timezone-aware refinement is Phase 0c backlog) ──
const EMPTY_STATS = {
  completions: 0,
  thisWeek: 0,
  lastWeek: 0,
  songsMemorized: 0,
  streak: 0,
  everPracticed: false,
  lastDaysAgo: Infinity,
  assignments: [],
  repertoire: [],
  recentActivity: [0, 0, 0, 0, 0, 0, 0],
};

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
    const { data: completions } = await supabase
      .from("completions")
      .select("completed_at")
      .eq("student_id", studentId);

    const { data: repertoire } = await supabase
      .from("repertoire")
      .select("id, memorized_at, assignments(title)")
      .eq("student_id", studentId);

    const { data: assignments } = await supabase
      .from("assignments")
      .select(
        `
        id, title, instrument_type, category, created_at,
        practice_steps(id)
      `
      )
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    const completionList = completions || [];
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

    const daySet = new Set(completionList.map((c) => c.completed_at.split("T")[0]));
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
      songsMemorized: repertoire?.length || 0,
      streak,
      everPracticed,
      lastDaysAgo,
      assignments: assignments || [],
      repertoire: (repertoire || [])
        .map((entry) => entry.assignments?.title)
        .filter(Boolean),
      recentActivity: buildRecentActivity(completionList),
    };
  } catch (err) {
    console.error("Error fetching student stats:", err);
    return { ...EMPTY_STATS };
  }
}

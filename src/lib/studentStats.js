import { supabase } from "./supabaseClient";

// Shared per-student practice stats, used by the teacher lesson-prep
// dashboard and the parent dashboard. Extracted from
// TeacherLessonPrepDashboard so the two can't drift.

// ── Date helpers (local-day based; timezone-aware refinement is Phase 0c backlog) ──
export const dayStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const parseDay = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const daysBetween = (a, b) => Math.round((b - a) / 86400000);

// Real consecutive-day streak: walk backwards from today (or yesterday as anchor).
export function computeStreak(daySet) {
  if (daySet.size === 0) return 0;
  const cursor = new Date();
  if (!daySet.has(dayStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!daySet.has(dayStr(cursor))) return 0;
  }
  let streak = 0;
  while (daySet.has(dayStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const EMPTY_STATS = {
  completions: 0,
  thisWeek: 0,
  lastWeek: 0,
  songsMemorized: 0,
  streak: 0,
  everPracticed: false,
  lastDaysAgo: Infinity,
  assignments: [],
};

export async function fetchStudentStats(studentId) {
  try {
    const { data: completions } = await supabase
      .from("completions")
      .select("completed_at")
      .eq("student_id", studentId);

    const { data: repertoire } = await supabase
      .from("repertoire")
      .select("id")
      .eq("student_id", studentId);

    const { data: assignments } = await supabase
      .from("assignments")
      .select(
        `
        id, title, instrument_type, created_at,
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
    };
  } catch (err) {
    console.error("Error fetching student stats:", err);
    return { ...EMPTY_STATS };
  }
}

import { supabase } from "./supabaseClient";
import { dayName } from "./calendarLink";
import { normalizeAssignmentDraft } from "./lessonMemory";
import { fetchStudentStats } from "./studentStats";
import {
  isMissingPerformanceSource,
  normalizePerformanceEvents,
  SELECTED_PERFORMANCE_SOURCE,
} from "./performanceCalendar";

function shortName(name = "Student") {
  return name.trim().split(/\s+/)[0] || "Student";
}

export function initialsFor(name = "Student") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words[words.length - 1][0]}` : words[0]?.slice(0, 2) || "ST").toUpperCase();
}

export function assignmentAge(createdAt, now = new Date()) {
  if (!createdAt) return "New";
  const days = Math.max(0, Math.floor((now - new Date(createdAt)) / 86400000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  if (days < 14) return `${days} days`;
  const weeks = Math.floor(days / 7);
  return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
}

function formatTime(time = "") {
  const [hours = "0", minutes = "00"] = time.slice(0, 5).split(":");
  const date = new Date(2000, 0, 1, Number(hours), Number(minutes));
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function lessonScheduleLabel(lesson) {
  if (!lesson) return "Lesson time not set";
  return `${dayName(lesson.day_of_week)}s at ${formatTime(lesson.start_time)}`;
}

export function nextLessonLabel(lesson, now = new Date()) {
  if (!lesson) return "Lesson time not set";
  const daysAhead = (lesson.day_of_week - now.getDay() + 7) % 7;
  const day = daysAhead === 0 ? "Today" : daysAhead === 1 ? "Tomorrow" : dayName(lesson.day_of_week);
  return `${day} · ${formatTime(lesson.start_time)}`;
}

function studentStatus(stats) {
  if (!stats.everPracticed || stats.lastDaysAgo >= 4) {
    return { status: "Needs a gentle check-in", tone: "open" };
  }
  if (stats.streak >= 3) return { status: "On a roll", tone: "steady" };
  if (stats.lastDaysAgo === 0) return { status: "Practiced today", tone: "next" };
  return { status: "Steady", tone: "open" };
}

function titleCase(value = "Practice") {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");
}

export function isMissingOptionalRelation(error, relationName) {
  if (!error) return false;
  const message = `${error.message || ""} ${error.details || ""} ${error.hint || ""}`.toLowerCase();
  return (
    ["42P01", "PGRST205"].includes(error.code)
    || message.includes(`relation "public.${relationName.toLowerCase()}" does not exist`)
    || message.includes(`table '${relationName.toLowerCase()}'`)
    || message.includes(`table "${relationName.toLowerCase()}"`)
  );
}

function mapStudent(student, lesson, familyLink, stats, draft, guardians = []) {
  const practiceCount = stats.thisWeek || 0;
  const status = studentStatus(stats);
  const assignments = (stats.assignments || []).map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    description: assignment.description || "",
    category: titleCase(assignment.category || "pieces"),
    categoryKey: assignment.category,
    age: assignmentAge(assignment.created_at),
    deadline: assignment.deadline,
    stage: "Active",
    progress: `${assignment.practice_steps?.length || 1} practice ${assignment.practice_steps?.length === 1 ? "step" : "steps"}`,
    instrumentType: assignment.instrument_type || student.instrument || "Music",
  }));
  const activeAssignment = assignments[0];
  const name = student.name || "Student";
  const normalizedDraft = normalizeAssignmentDraft(draft);

  return {
    id: student.id,
    name,
    avatar: student.avatar,
    accountStatus: student.status,
    shortName: shortName(name),
    initials: initialsFor(name),
    instrument: student.instrument || "Music",
    nextLesson: nextLessonLabel(lesson),
    practiceLabel: `${practiceCount} ${practiceCount === 1 ? "session" : "sessions"} this week`,
    ...status,
    lesson,
    memory: {
      activeWorkTitle: activeAssignment?.title || "No current assignment",
      activeWorkAge: activeAssignment?.age || "Ready when you are",
      activeWorkStatus: activeAssignment ? "currently active" : "no active work yet",
      draft: normalizedDraft || {
        title: activeAssignment?.title || `${shortName(name)}’s next musical step`,
        description: "Continue from today’s lesson notes.",
        steps: [],
        status: "suggested",
      },
    },
    assignments,
    stats: {
      sessions: practiceCount,
      streak: stats.streak || 0,
      songs: stats.songsMemorized || 0,
      completions: stats.completions || 0,
      recentActivity: stats.recentActivity || [0, 0, 0, 0, 0, 0, 0],
    },
    repertoire: stats.repertoire || [],
    family: familyLink
      ? `${familyLink.parent_name || familyLink.parent_email} · guardian`
      : "No guardian link yet",
    familyContact: familyLink ? {
      name: familyLink.parent_name || familyLink.parent_email,
      email: familyLink.parent_email,
      phone: familyLink.parent_phone,
    } : null,
    guardians,
    schedule: lessonScheduleLabel(lesson),
  };
}

export function createTeacherWorkspaceApi(client = supabase, fetchStats = fetchStudentStats) {
  const load = async (teacherId) => {
    const { data: studentRows, error: studentError } = await client
      .from("students")
      .select("id, name, email, created_at, status, avatar, instrument, family_id")
      .eq("teacher_id", teacherId)
      .neq("status", "pending")
      .order("name");

    if (studentError) throw studentError;
    const rows = studentRows || [];
    if (!rows.length) return { students: [], todaySchedule: [], summary: { lessonSlots: 0, openLoops: 0 } };

    const studentIds = rows.map((student) => student.id);
    const familyIds = rows.map((student) => student.family_id).filter(Boolean);
    const [lessonResult, familyResult, guardianResult, draftResult, performanceResult, statsRows] = await Promise.all([
      client.from("lessons").select("id, student_id, day_of_week, start_time, duration_minutes, location").eq("teacher_id", teacherId),
      client.from("parent_students").select("student_id, parent_name, parent_email, parent_phone").in("student_id", studentIds),
      familyIds.length
        ? client.from("family_guardians").select("family_id, name, relationship, email, phone, receives_studio_contact").in("family_id", familyIds)
        : Promise.resolve({ data: [], error: null }),
      client
        .from("assignment_drafts")
        .select("id, student_id, title, description, steps, status, assignment_id, updated_at")
        .eq("teacher_id", teacherId)
        .in("status", ["suggested", "approved"])
        .order("updated_at", { ascending: false }),
      client
        .from("studio_performances")
        .select("id, title, starts_at, ends_at, venue, notes, source")
        .eq("teacher_id", teacherId)
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(6),
      Promise.all(rows.map((student) => fetchStats(student.id))),
    ]);

    if (lessonResult.error) throw lessonResult.error;
    if (familyResult.error) throw familyResult.error;
    if (guardianResult.error && !isMissingOptionalRelation(guardianResult.error, "family_guardians")) {
      throw guardianResult.error;
    }
    const lessonMemoryAvailable = !draftResult.error;
    if (draftResult.error && !isMissingOptionalRelation(draftResult.error, "assignment_drafts")) {
      throw draftResult.error;
    }
    if (performanceResult.error && !isMissingPerformanceSource(performanceResult.error)) {
      throw performanceResult.error;
    }

    const lessons = new Map((lessonResult.data || []).map((lesson) => [lesson.student_id, lesson]));
    const families = new Map();
    (familyResult.data || []).forEach((link) => {
      if (!families.has(link.student_id)) families.set(link.student_id, link);
    });
    const drafts = new Map();
    (draftResult.data || []).forEach((draft) => {
      if (!drafts.has(draft.student_id)) drafts.set(draft.student_id, draft);
    });
    const guardiansByFamily = new Map();
    (guardianResult.data || []).forEach((guardian) => {
      const current = guardiansByFamily.get(guardian.family_id) || [];
      guardiansByFamily.set(guardian.family_id, [...current, guardian]);
    });

    const students = rows.map((student, index) =>
      mapStudent(
        student,
        lessons.get(student.id),
        families.get(student.id),
        statsRows[index],
        drafts.get(student.id),
        guardiansByFamily.get(student.family_id) || [],
      )
    );
    const today = new Date().getDay();
    const todaySchedule = students
      .filter((student) => student.lesson?.day_of_week === today)
      .sort((a, b) => a.lesson.start_time.localeCompare(b.lesson.start_time))
      .map((student, index) => ({
        time: formatTime(student.lesson.start_time).replace(/\s?(AM|PM)$/i, ""),
        period: formatTime(student.lesson.start_time).match(/(AM|PM)$/i)?.[1] || "",
        label: student.name,
        detail: `${student.instrument} · ${student.lesson.duration_minutes} minutes`,
        studentId: student.id,
        kind: index === 0 ? "next" : "lesson",
      }));

    return {
      students,
      todaySchedule,
      performanceEvents: performanceResult.error ? [] : normalizePerformanceEvents(performanceResult.data || []),
      summary: {
        lessonSlots: (lessonResult.data || []).length,
        openLoops: (draftResult.data || []).length,
        lessonMemoryAvailable,
        performanceCalendarAvailable: !performanceResult.error,
        performanceCalendarSource: SELECTED_PERFORMANCE_SOURCE,
      },
    };
  };

  return { load };
}

export const teacherWorkspaceApi = createTeacherWorkspaceApi();

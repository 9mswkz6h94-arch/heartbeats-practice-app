import { supabase } from "./supabaseClient";

export const LESSON_NOTE_CATEGORY_IDS = [
  "worked-on",
  "clicked",
  "keep-exploring",
  "student-voice",
  "next-time",
  "family-admin",
];

export function normalizeLessonNote(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    text: row.body,
    createdAt: row.created_at,
  };
}

export function normalizeAssignmentDraft(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    steps: Array.isArray(row.steps) ? row.steps : [],
    status: row.status,
    assignmentId: row.assignment_id || null,
  };
}

export function normalizeLessonMemory(session) {
  if (!session) return null;

  const notes = (session.lesson_notes || [])
    .map(normalizeLessonNote)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const draftRow = Array.isArray(session.assignment_drafts)
    ? session.assignment_drafts[0]
    : session.assignment_drafts;

  return {
    id: session.id,
    studentId: session.student_id,
    teacherId: session.teacher_id,
    scheduledFor: session.scheduled_for,
    startedAt: session.started_at,
    wrappedAt: session.wrapped_at,
    status: session.status,
    notes,
    draft: normalizeAssignmentDraft(draftRow),
  };
}

export function createLessonMemoryApi(client = supabase) {
  const loadLatest = async ({ teacherId, studentId }) => {
    const { data, error } = await client
      .from("lesson_sessions")
      .select(`
        id,
        student_id,
        teacher_id,
        scheduled_for,
        started_at,
        wrapped_at,
        status,
        lesson_notes(id, category_id, body, created_at),
        assignment_drafts(id, title, description, steps, status, assignment_id)
      `)
      .eq("teacher_id", teacherId)
      .eq("student_id", studentId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return normalizeLessonMemory(data);
  };

  const start = async ({ teacherId, studentId, scheduledFor = null }) => {
    const { data, error } = await client
      .from("lesson_sessions")
      .insert({
        teacher_id: teacherId,
        student_id: studentId,
        scheduled_for: scheduledFor,
      })
      .select("id, student_id, teacher_id, scheduled_for, started_at, wrapped_at, status")
      .single();

    if (error?.code === "23505") {
      return loadLatest({ teacherId, studentId });
    }
    if (error) throw error;
    return normalizeLessonMemory(data);
  };

  const addNote = async ({ lessonSessionId, categoryId, text }) => {
    const trimmed = text.trim();
    if (!LESSON_NOTE_CATEGORY_IDS.includes(categoryId)) {
      throw new Error("Choose a valid lesson-note category.");
    }
    if (!trimmed) throw new Error("Write a short note before saving.");
    if (trimmed.length > 2000) {
      throw new Error("Lesson notes can be up to 2,000 characters.");
    }

    const { data, error } = await client
      .from("lesson_notes")
      .insert({
        lesson_session_id: lessonSessionId,
        category_id: categoryId,
        body: trimmed,
      })
      .select("id, category_id, body, created_at")
      .single();

    if (error) throw error;
    return normalizeLessonNote(data);
  };

  const removeNote = async ({ lessonSessionId, noteId }) => {
    const { error } = await client
      .from("lesson_notes")
      .delete()
      .eq("lesson_session_id", lessonSessionId)
      .eq("id", noteId);

    if (error) throw error;
  };

  const wrap = async ({ lessonSessionId, draft }) => {
    const { data, error } = await client.rpc("wrap_lesson_memory", {
      p_lesson_session_id: lessonSessionId,
      p_title: draft.title,
      p_description: draft.description || "",
      p_steps: draft.steps || [],
    });

    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return normalizeAssignmentDraft(row);
  };

  const approveDraft = async (draftId) => {
    const { data, error } = await client
      .from("assignment_drafts")
      .update({ status: "approved" })
      .eq("id", draftId)
      .select("id, title, description, steps, status, assignment_id")
      .single();

    if (error) throw error;
    return normalizeAssignmentDraft(data);
  };

  const markDraftPublished = async ({ draftId, assignmentId }) => {
    const { data, error } = await client
      .from("assignment_drafts")
      .update({ status: "published", assignment_id: assignmentId })
      .eq("id", draftId)
      .select("id, title, description, steps, status, assignment_id")
      .single();

    if (error) throw error;
    return normalizeAssignmentDraft(data);
  };

  return { loadLatest, start, addNote, removeNote, wrap, approveDraft, markDraftPublished };
}

export const lessonMemoryApi = createLessonMemoryApi();

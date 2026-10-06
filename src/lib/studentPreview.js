import { supabase } from "./supabaseClient";

const STUDENT_PREVIEW_COLUMNS = "id, name, instrument";

function requireScope(teacherId, studentId) {
  if (!teacherId || !studentId) {
    throw new Error("Student preview needs a teacher and student scope.");
  }
}

export function createStudentPreviewApi(client = supabase) {
  return {
    async getAuthorizedStudent(teacherId, studentId) {
      requireScope(teacherId, studentId);
      const { data, error } = await client
        .from("students")
        .select(STUDENT_PREVIEW_COLUMNS)
        .eq("teacher_id", teacherId)
        .eq("id", studentId)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Student preview is not available for this teacher.");
      return data;
    },

    async listAuthorizedStudents(teacherId) {
      if (!teacherId) throw new Error("Student preview needs a teacher scope.");
      const { data, error } = await client
        .from("students")
        .select(STUDENT_PREVIEW_COLUMNS)
        .eq("teacher_id", teacherId)
        .order("name");
      if (error) throw error;
      return data || [];
    },
  };
}

export function studentPreviewIsReadOnly() {
  return true;
}

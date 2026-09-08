import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { DAY_OPTIONS } from "../lib/calendarLink";
import "./StudentManager.css";

export default function StudentManager({ teacherId, onChanged }) {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [lessons, setLessons] = useState({}); // studentId -> lesson row
  const [editingLessonFor, setEditingLessonFor] = useState(null);
  const [lessonDraft, setLessonDraft] = useState({ day_of_week: 1, start_time: "16:00", duration_minutes: 30, location: "" });
  const [lessonSaving, setLessonSaving] = useState(false);

  const fetchLessons = useCallback(async () => {
    const { data } = await supabase.from("lessons").select("*").eq("teacher_id", teacherId);
    const byStudent = {};
    (data || []).forEach((l) => { byStudent[l.student_id] = l; });
    setLessons(byStudent);
  }, [teacherId]);

  const startEditLesson = (studentId) => {
    const existing = lessons[studentId];
    setLessonDraft(
      existing
        ? { day_of_week: existing.day_of_week, start_time: existing.start_time.slice(0, 5), duration_minutes: existing.duration_minutes, location: existing.location || "" }
        : { day_of_week: 1, start_time: "16:00", duration_minutes: 30, location: "" }
    );
    setEditingLessonFor(studentId);
  };

  const saveLesson = async (studentId) => {
    setLessonSaving(true);
    const { error: saveError } = await supabase.from("lessons").upsert({
      student_id: studentId,
      teacher_id: teacherId,
      day_of_week: Number(lessonDraft.day_of_week),
      start_time: lessonDraft.start_time,
      duration_minutes: Number(lessonDraft.duration_minutes),
      location: lessonDraft.location.trim() || null,
    }, { onConflict: "student_id" });
    setLessonSaving(false);
    if (saveError) {
      setError(saveError.message);
    } else {
      setEditingLessonFor(null);
      fetchLessons();
      onChanged?.();
    }
  };

  const fetchStudents = useCallback(async () => {
    setFetching(true);
    const { data, error: fetchError } = await supabase
      .from("students")
      .select(
        "id, name, email, auth_user_id, created_at, status, avatar, instrument, family_id"
      )
      .eq("teacher_id", teacherId)
      .order("name");

    if (fetchError) {
      setError("Could not load students");
    } else {
      setStudents(data || []);
    }
    setFetching(false);
  }, [teacherId]);

  useEffect(() => {
    fetchStudents();
    fetchLessons();
  }, [fetchLessons, fetchStudents]);

  const handleApproveStudent = async (studentId) => {
    const { error: approveError } = await supabase
      .from("students")
      .update({ status: "active" })
      .eq("id", studentId);
    if (approveError) {
      setError(approveError.message);
    } else {
      fetchStudents();
      onChanged?.();
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!name.trim() || !email.trim()) {
        throw new Error("Please enter a name and email");
      }

      const { error: insertError } = await supabase
        .from("students")
        .insert([{ teacher_id: teacherId, name: name.trim(), email: email.trim() }]);

      if (insertError) throw insertError;

      setName("");
      setEmail("");
      setSuccess(true);
      fetchStudents();
      onChanged?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Remove this student? Their assignments and history will also be deleted.")) {
      return;
    }
    await supabase.from("students").delete().eq("id", studentId);
    fetchStudents();
    onChanged?.();
  };

  const pendingStudents = students.filter((s) => s.status === "pending");
  const activeStudents = students.filter((s) => s.status !== "pending");

  return (
    <div className="student-manager-container">
      {pendingStudents.length > 0 && (
        <div className="student-manager-pending-section">
          <h2>New Families Waiting for Approval ({pendingStudents.length})</h2>
          <p className="section-info">
            These students signed up through the family wizard. Approve them to add them to
            your roster — remove anything that looks like junk.
          </p>
          <div className="student-manager-list">
            {pendingStudents.map((student) => (
              <div key={student.id} className="student-manager-row pending-row">
                <div className="student-manager-info">
                  <span className="student-manager-name">
                    {student.avatar ? `${student.avatar} ` : ""}{student.name}
                  </span>
                  <span className="student-manager-email">{student.instrument || "No instrument listed"}</span>
                </div>
                <button
                  className="btn-approve-student"
                  onClick={() => handleApproveStudent(student.id)}
                >
                  ✓ Approve
                </button>
                <button
                  className="btn-remove-student"
                  onClick={() => handleRemoveStudent(student.id)}
                  title="Remove student"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="student-manager-form-section">
        <h2>Add a Student</h2>
        <p className="section-info">
          Add the student's name and the email they'll use to log in. They can sign up with
          this email at rainbowheart.studio/login once you've added them here.
        </p>

        <form onSubmit={handleAddStudent} className="student-manager-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="student-name">Name *</label>
              <input
                id="student-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Emma Rodriguez"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="student-email">Email *</label>
              <input
                id="student-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                disabled={loading}
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Student added!</div>}

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Adding..." : "+ Add Student"}
            </button>
          </div>
        </form>
      </div>

      <div className="student-manager-list-section">
        <h3>Your Students ({activeStudents.length})</h3>

        {fetching && <p className="loading">Loading students...</p>}

        {!fetching && activeStudents.length === 0 && (
          <div className="empty-state">
            <p>No students yet. Add your first one above.</p>
          </div>
        )}

        {!fetching && activeStudents.length > 0 && (
          <div className="student-manager-list">
            {activeStudents.map((student) => (
              <div key={student.id} className="student-manager-row">
                <div className="student-manager-info">
                  <span className="student-manager-name">
                    {student.avatar ? `${student.avatar} ` : ""}{student.name}
                  </span>
                  <span className="student-manager-email">
                    {student.family_id ? student.instrument || "Family account" : student.email}
                  </span>
                </div>
                <span
                  className={`student-manager-status ${student.auth_user_id ? "linked" : "pending"}`}
                >
                  {student.auth_user_id ? "✓ Account linked" : "Awaiting first login"}
                </span>
                {editingLessonFor !== student.id && (
                  <button className="btn-edit-lesson" onClick={() => startEditLesson(student.id)}>
                    {lessons[student.id]
                      ? `${DAY_OPTIONS[lessons[student.id].day_of_week].name.slice(0, 3)} ${lessons[student.id].start_time.slice(0, 5)}`
                      : "Set lesson time"}
                  </button>
                )}
                <button
                  className="btn-remove-student"
                  onClick={() => handleRemoveStudent(student.id)}
                  title="Remove student"
                >
                  Remove
                </button>
                {editingLessonFor === student.id && (
                  <div className="lesson-editor">
                    <select
                      value={lessonDraft.day_of_week}
                      onChange={(e) => setLessonDraft({ ...lessonDraft, day_of_week: e.target.value })}
                    >
                      {DAY_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.name}</option>)}
                    </select>
                    <input
                      type="time"
                      value={lessonDraft.start_time}
                      onChange={(e) => setLessonDraft({ ...lessonDraft, start_time: e.target.value })}
                    />
                    <select
                      value={lessonDraft.duration_minutes}
                      onChange={(e) => setLessonDraft({ ...lessonDraft, duration_minutes: e.target.value })}
                    >
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Location (optional)"
                      value={lessonDraft.location}
                      onChange={(e) => setLessonDraft({ ...lessonDraft, location: e.target.value })}
                    />
                    <button className="btn-approve-student" disabled={lessonSaving} onClick={() => saveLesson(student.id)}>
                      {lessonSaving ? "Saving..." : "Save"}
                    </button>
                    <button className="btn-remove-student" onClick={() => setEditingLessonFor(null)}>Cancel</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

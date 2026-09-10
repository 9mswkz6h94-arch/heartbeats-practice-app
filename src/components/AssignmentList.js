import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { assignmentCategories } from "../lib/practiceTemplates";
import "./AssignmentList.css";

export default function AssignmentList({ teacherId, refresh }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duplicating, setDuplicating] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, [teacherId, refresh]);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("assignments")
        .select(
          `
          id,
          title,
          instrument_type,
          category,
          deadline,
          created_at,
          memorized,
          student_id,
          students(name, email)
        `
        )
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setAssignments(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (assignment) => {
    setDuplicating(assignment.id);
    let newAssignmentId = null;

    try {
      // Fetch all practice steps for this assignment
      const { data: stepsData, error: stepsError } = await supabase
        .from("practice_steps")
        .select("*")
        .eq("assignment_id", assignment.id);

      if (stepsError) throw stepsError;

      // Create new assignment with "Copy of" prefix
      const newTitle = `Copy of ${assignment.title}`;
      const { data: newAssignment, error: createError } = await supabase
        .from("assignments")
        .insert([
          {
            teacher_id: teacherId,
            student_id: assignment.student_id,
            title: newTitle,
            instrument_type: assignment.instrument_type,
            category: assignment.category || "pieces",
            deadline: null,
          },
        ])
        .select();

      if (createError) throw createError;

      newAssignmentId = newAssignment[0].id;

      // Copy all practice steps
      if (stepsData && stepsData.length > 0) {
        const copiedSteps = stepsData.map((step, index) => ({
          assignment_id: newAssignmentId,
          step_number: index + 1,
          title: step.title,
          description: step.description,
          sequence_order: index + 1,
        }));

        const { error: copyError } = await supabase
          .from("practice_steps")
          .insert(copiedSteps);

        if (copyError) throw copyError;
      }

      // Refresh the list
      await fetchAssignments();
    } catch (err) {
      const cleanupErrors = [];
      if (newAssignmentId) {
        try {
          const { error: stepsCleanupError } = await supabase
            .from("practice_steps")
            .delete()
            .eq("assignment_id", newAssignmentId);
          if (stepsCleanupError) cleanupErrors.push("practice steps could not be cleaned up");
        } catch {
          cleanupErrors.push("practice steps could not be cleaned up");
        }

        try {
          const { error: assignmentCleanupError } = await supabase
            .from("assignments")
            .delete()
            .eq("id", newAssignmentId)
            .eq("teacher_id", teacherId);
          if (assignmentCleanupError) cleanupErrors.push("the duplicate assignment could not be cleaned up");
        } catch {
          cleanupErrors.push("the duplicate assignment could not be cleaned up");
        }
      }

      const cleanupNotice = cleanupErrors.length
        ? ` ${cleanupErrors.join("; ")}.`
        : "";
      setError(`${err.message}${cleanupNotice}`);
    } finally {
      setDuplicating(null);
    }
  };

  const handleMarkMemoized = async (assignment) => {
    try {
      // Update assignment to mark as memorized
      const { error: updateError } = await supabase
        .from("assignments")
        .update({ memorized: !assignment.memorized })
        .eq("id", assignment.id);

      if (updateError) throw updateError;

      // If marking as memorized (not unmarking), add to repertoire
      if (!assignment.memorized) {
        const { error: repertoireError } = await supabase
          .from("repertoire")
          .insert([
            {
              student_id: assignment.student_id,
              assignment_id: assignment.id,
            },
          ]);

        // It's OK if this fails (might already exist), so we don't throw
        if (repertoireError && repertoireError.code !== "23505") {
          throw repertoireError;
        }
      }

      // Refresh the list
      await fetchAssignments();
    } catch (err) {
      setError(err.message);
    }
  };

  const openEdit = (assignment) => {
    setEditingAssignment({
      id: assignment.id,
      title: assignment.title || "",
      instrument_type: assignment.instrument_type || "",
      category: assignment.category || "pieces",
      deadline: assignment.deadline ? String(assignment.deadline).slice(0, 10) : "",
    });
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (!editingAssignment?.title.trim()) return;
    setSavingEdit(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("assignments")
        .update({
          title: editingAssignment.title.trim(),
          instrument_type: editingAssignment.instrument_type.trim() || null,
          category: editingAssignment.category,
          deadline: editingAssignment.deadline || null,
        })
        .eq("id", editingAssignment.id)
        .eq("teacher_id", teacherId);
      if (updateError) throw updateError;
      setEditingAssignment(null);
      await fetchAssignments();
    } catch (err) {
      setError(err.message || "The assignment could not be updated.");
    } finally {
      setSavingEdit(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "No deadline";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const getCategoryLabel = (categoryId) => {
    const category = assignmentCategories.find((c) => c.id === categoryId);
    return category?.label || "Pieces";
  };

  if (loading) {
    return (
      <div className="assignment-list">
        <p role="status">Loading assignments…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assignment-list">
        <p className="error" role="alert">Assignments could not load: {error}</p>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="assignment-list">
        <p className="empty-state">No assignments yet. Create one above!</p>
      </div>
    );
  }

  return (
    <div className="assignment-list">
      <h2>Recent assignments</h2>
      {editingAssignment && (
        <form className="assignment-edit-form" onSubmit={handleSaveEdit}>
          <div className="assignment-edit-heading">
            <div><span>Teacher edit</span><h3>Update assignment details</h3></div>
            <button type="button" onClick={() => setEditingAssignment(null)} disabled={savingEdit}>Cancel</button>
          </div>
          <label>
            Title
            <input value={editingAssignment.title} onChange={(event) => setEditingAssignment((current) => ({ ...current, title: event.target.value }))} required />
          </label>
          <div className="assignment-edit-grid">
            <label>
              Instrument
              <input value={editingAssignment.instrument_type} onChange={(event) => setEditingAssignment((current) => ({ ...current, instrument_type: event.target.value }))} />
            </label>
            <label>
              Category
              <select value={editingAssignment.category} onChange={(event) => setEditingAssignment((current) => ({ ...current, category: event.target.value }))}>
                {assignmentCategories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
              </select>
            </label>
            <label>
              Deadline
              <input type="date" value={editingAssignment.deadline} onChange={(event) => setEditingAssignment((current) => ({ ...current, deadline: event.target.value }))} />
            </label>
          </div>
          <button type="submit" className="assignment-edit-save" disabled={savingEdit || !editingAssignment.title.trim()}>{savingEdit ? "Saving…" : "Save assignment"}</button>
          <small>Practice steps and completed student work stay unchanged.</small>
        </form>
      )}
      <div className="assignments-grid">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="assignment-card">
            <div className="card-header">
              <div className="card-title-section">
                <h4>{assignment.title}</h4>
                <span className="category-badge">
                  {getCategoryLabel(assignment.category)}
                </span>
              </div>
              <span className="instrument-badge">
                {assignment.instrument_type}
              </span>
            </div>

            <div className="card-body">
              <div className="assignment-info">
                <label>Student:</label>
                <p>{assignment.students?.name || "Unknown"}</p>
              </div>

              <div className="assignment-info">
                <label>Deadline:</label>
                <p
                  className={isOverdue(assignment.deadline) ? "overdue" : ""}
                >
                  {formatDate(assignment.deadline)}
                </p>
              </div>

              <div className="assignment-info">
                <label>Created:</label>
                <p>{formatDate(assignment.created_at)}</p>
              </div>
            </div>

            <div className="card-actions">
              <button
                type="button"
                className={`btn-action btn-memorize ${
                  assignment.memorized ? "memorized" : ""
                }`}
                onClick={() => handleMarkMemoized(assignment)}
                title={assignment.memorized ? "Remove from repertoire" : "Mark as memorized"}
              >
                {assignment.memorized ? "Memorized" : "Mark memorized"}
              </button>
              <button type="button" className="btn-action btn-edit" onClick={() => openEdit(assignment)}>Edit</button>
              <button
                type="button"
                className="btn-action btn-duplicate"
                onClick={() => handleDuplicate(assignment)}
                disabled={duplicating === assignment.id}
              >
                {duplicating === assignment.id ? "Duplicating…" : "Duplicate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import useTeacherWorkspace from "../hooks/useTeacherWorkspace";
import { lessonMemoryApi } from "../lib/lessonMemory";
import { addLocalDays, localDateString } from "../lib/assignmentLifecycle";
import { assignmentCategories } from "../lib/practiceTemplates";
import AssignmentForm from "./AssignmentForm";
import BadgeStudio from "./BadgeStudio";
import CommLog from "./CommLog";
import LessonMemory from "./LessonMemory";
import ParentPreviewModal from "./ParentPreviewModal";
import RescheduleRequests from "./RescheduleRequests";
import StudentManager from "./StudentManager";
import { TeacherWorkspaceShell } from "./TeacherWorkspaceFixture";

function LiveAssignments({ teacherId, student, onRefresh, onGoLesson }) {
  const draft = student.memory.draft?.id ? student.memory.draft : null;
  const [composerSource, setComposerSource] = useState(null);
  const [status, setStatus] = useState(null);
  const [action, setAction] = useState(null);
  const [reassignDraft, setReassignDraft] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const resolveAssignment = async (assignment, nextAction, deadline, successText) => {
    setStatus(null);
    setAction({ assignmentId: assignment.id, name: nextAction });
    try {
      const { error } = await supabase.rpc("resolve_practice_assignment", {
        p_assignment_id: assignment.id,
        p_action: nextAction,
        p_deadline: deadline || null,
      });
      if (error) throw error;
      setReassignDraft(null);
      setStatus(successText);
      await onRefresh();
    } catch (assignmentError) {
      console.error(`Assignment ${nextAction} failed:`, assignmentError);
      setStatus(`Could not update ${assignment.title}: ${assignmentError.message}`);
    } finally {
      setAction(null);
    }
  };

  const submitReassign = async (event, assignment) => {
    event.preventDefault();
    const deadline = reassignDraft?.deadline;
    if (!deadline || deadline < localDateString()) {
      setStatus("Choose today or a future date before reassigning.");
      return;
    }
    await resolveAssignment(
      assignment,
      "reassign",
      deadline,
      `${assignment.title} was reassigned. Earlier completion history was kept.`,
    );
  };

  const openAssignmentEdit = (assignment) => {
    setStatus(null);
    setReassignDraft(null);
    setEditingAssignment({
      assignmentId: assignment.id,
      title: assignment.title || "",
      description: assignment.description || "",
      instrumentType: assignment.instrumentType || student.instrument || "Music",
      category: assignment.categoryKey || "pieces",
      deadline: assignment.deadline ? String(assignment.deadline).slice(0, 10) : "",
    });
  };

  const submitAssignmentEdit = async (event) => {
    event.preventDefault();
    const title = editingAssignment?.title?.trim();
    if (!editingAssignment?.assignmentId || !title) {
      setStatus("Add an assignment title before saving.");
      return;
    }
    if (editingAssignment.deadline && editingAssignment.deadline < localDateString()) {
      setStatus("Choose today or a future date, or clear the due date.");
      return;
    }

    const assignmentId = editingAssignment.assignmentId;
    setStatus(null);
    setAction({ assignmentId, name: "edit" });
    try {
      const { error: updateError } = await supabase
        .from("assignments")
        .update({
          title,
          description: editingAssignment.description.trim() || null,
          instrument_type: editingAssignment.instrumentType.trim() || null,
          category: editingAssignment.category || "pieces",
          deadline: editingAssignment.deadline || null,
        })
        .eq("id", assignmentId)
        .eq("teacher_id", teacherId);
      if (updateError) throw updateError;

      setEditingAssignment(null);
      setStatus(`${title} updated. Practice steps and completion history were kept.`);
      await onRefresh();
    } catch (error) {
      console.error("Assignment edit failed:", error);
      setStatus(`Could not update ${title}: ${error.message}`);
    } finally {
      setAction(null);
    }
  };

  const removeAssignment = async (assignment) => {
    const confirmed = window.confirm(
      `Remove “${assignment.title}” from ${student.name}'s current assignments? Past practice history will be kept.`,
    );
    if (!confirmed) return;
    await resolveAssignment(
      assignment,
      "remove",
      null,
      `${assignment.title} was removed from current practice. Earlier completion history was kept.`,
    );
  };

  const assignmentCreated = async (assignment, metadata = {}) => {
    if (composerSource === "draft" && draft?.id && !metadata.draftPublished) {
      try {
        await lessonMemoryApi.markDraftPublished({
          draftId: draft.id,
          assignmentId: assignment.id,
        });
      } catch (error) {
        console.error("Assignment created but draft status could not update:", error);
        setStatus("The assignment was created, but its lesson draft still needs review.");
        await onRefresh();
        return;
      }
    }
    setStatus("Assignment published to the student workspace.");
    await onRefresh();
  };

  return (
    <section className="teacher-student-section teacher-assignment-workspace" aria-labelledby="student-assignments-title">
      <header className="teacher-student-section-heading">
        <div><p>Student-scoped workspace</p><h2 id="student-assignments-title">Assignments for {student.shortName}</h2></div>
        <button type="button" onClick={() => setComposerSource((current) => current ? null : "new")}>
          {composerSource ? "Close new assignment" : "New assignment"}
        </button>
      </header>

      {status && <p className="teacher-workspace-status" role="status">{status}</p>}

      {composerSource && (
        <AssignmentForm
          key={`${student.id}-${composerSource}-${draft?.id || "new"}`}
          teacherId={teacherId}
          initialStudentId={student.id}
          studentName={student.name}
          lockStudent
          initialDraft={composerSource === "draft" ? draft : null}
          initialInstrumentType={student.instrument}
          onAssignmentCreated={assignmentCreated}
        />
      )}

      <div className="teacher-assignment-layout">
        <div>
          <div className="teacher-student-subheading"><h3>Current work</h3><span>{student.assignments.length} active</span></div>
          <div className="teacher-current-assignments">
            {student.assignments.length === 0 && <div className="teacher-studio-empty"><strong>No active assignments</strong><span>Add one when the lesson points toward a useful next step.</span></div>}
            {student.assignments.map((assignment) => {
              const busy = action?.assignmentId === assignment.id;
              const editingReassign = reassignDraft?.assignmentId === assignment.id;
              const editingDetails = editingAssignment?.assignmentId === assignment.id;
              return (
                <article key={assignment.id || assignment.title}>
                  <div><span>{assignment.category}</span><span>{assignment.stage}</span></div>
                  <h4>{assignment.title}</h4>
                  <p>{assignment.progress}</p>
                  <footer><strong>{assignment.age}</strong><span>working on this</span></footer>
                  <div className="teacher-assignment-card-actions">
                    <button
                      type="button"
                      disabled={Boolean(action)}
                      aria-expanded={editingReassign}
                      onClick={() => {
                        setEditingAssignment(null);
                        setReassignDraft({
                          assignmentId: assignment.id,
                          deadline: localDateString(addLocalDays(new Date(), 7)),
                        });
                      }}
                    >Reassign</button>
                    <button
                      type="button"
                      disabled={Boolean(action)}
                      aria-expanded={editingDetails}
                      onClick={() => (editingDetails ? setEditingAssignment(null) : openAssignmentEdit(assignment))}
                    >{editingDetails ? "Close edit" : "Edit details"}</button>
                    <button
                      type="button"
                      disabled={Boolean(action) || editingDetails}
                      onClick={() => resolveAssignment(assignment, "repertoire", null, `${assignment.title} moved to the repertoire.`)}
                    >{busy && action.name === "repertoire" ? "Saving…" : "To repertoire"}</button>
                    <button type="button" disabled={Boolean(action) || editingDetails} onClick={() => removeAssignment(assignment)}>
                      {busy && action.name === "remove" ? "Saving…" : "Remove"}
                    </button>
                  </div>
                  {editingReassign && (
                    <form className="teacher-assignment-reassign" onSubmit={(event) => submitReassign(event, assignment)}>
                      <label htmlFor={`workspace-reassign-${assignment.id}`}>New due date</label>
                      <input
                        id={`workspace-reassign-${assignment.id}`}
                        type="date"
                        required
                        min={localDateString()}
                        value={reassignDraft.deadline}
                        disabled={Boolean(action)}
                        onChange={(event) => setReassignDraft((current) => ({ ...current, deadline: event.target.value }))}
                      />
                      <div>
                        <button type="button" disabled={Boolean(action)} onClick={() => setReassignDraft(null)}>Cancel</button>
                        <button type="submit" disabled={Boolean(action)}>{busy && action.name === "reassign" ? "Saving…" : "Confirm reassign"}</button>
                      </div>
                    </form>
                  )}
                  {editingDetails && (
                    <form className="teacher-assignment-edit" onSubmit={submitAssignmentEdit}>
                      <div className="teacher-assignment-edit-heading">
                        <div><strong>Edit assignment details</strong><span>Practice steps and completion history stay unchanged.</span></div>
                        <button type="button" disabled={Boolean(action)} onClick={() => setEditingAssignment(null)}>Cancel</button>
                      </div>
                      <label htmlFor={`workspace-edit-title-${assignment.id}`}>
                        Assignment title
                        <input
                          id={`workspace-edit-title-${assignment.id}`}
                          type="text"
                          required
                          value={editingAssignment.title}
                          disabled={Boolean(action)}
                          autoFocus
                          onChange={(event) => setEditingAssignment((current) => ({ ...current, title: event.target.value }))}
                        />
                      </label>
                      <div className="teacher-assignment-edit-grid">
                        <label htmlFor={`workspace-edit-instrument-${assignment.id}`}>
                          Instrument
                          <input
                            id={`workspace-edit-instrument-${assignment.id}`}
                            type="text"
                            value={editingAssignment.instrumentType}
                            disabled={Boolean(action)}
                            onChange={(event) => setEditingAssignment((current) => ({ ...current, instrumentType: event.target.value }))}
                          />
                        </label>
                        <label htmlFor={`workspace-edit-category-${assignment.id}`}>
                          Category
                          <select
                            id={`workspace-edit-category-${assignment.id}`}
                            value={editingAssignment.category}
                            disabled={Boolean(action)}
                            onChange={(event) => setEditingAssignment((current) => ({ ...current, category: event.target.value }))}
                          >
                            {assignmentCategories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
                          </select>
                        </label>
                        <label htmlFor={`workspace-edit-deadline-${assignment.id}`}>
                          Due date
                          <input
                            id={`workspace-edit-deadline-${assignment.id}`}
                            type="date"
                            min={localDateString()}
                            value={editingAssignment.deadline}
                            disabled={Boolean(action)}
                            onChange={(event) => setEditingAssignment((current) => ({ ...current, deadline: event.target.value }))}
                          />
                        </label>
                      </div>
                      <label htmlFor={`workspace-edit-description-${assignment.id}`}>
                        Student-facing note (optional)
                        <textarea
                          id={`workspace-edit-description-${assignment.id}`}
                          rows="3"
                          value={editingAssignment.description}
                          disabled={Boolean(action)}
                          onChange={(event) => setEditingAssignment((current) => ({ ...current, description: event.target.value }))}
                        />
                      </label>
                      <button type="submit" disabled={Boolean(action) || !editingAssignment.title.trim()}>
                        {busy && action.name === "edit" ? "Saving…" : "Save assignment details"}
                      </button>
                    </form>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        <aside className="teacher-suggested-assignment">
          <p>From the latest lesson notes</p>
          {draft ? (
            <>
              <h3>{draft.title}</h3>
              {draft.description && <p>{draft.description}</p>}
              <ol>{(draft.steps || []).map((step, index) => <li key={`${step.title}-${index}`}>{step.title}{step.description && <small>{step.description}</small>}</li>)}</ol>
              {draft.status === "approved" ? (
                <button type="button" onClick={() => setComposerSource("draft")}>Turn into assignment</button>
              ) : (
                <button type="button" onClick={onGoLesson}>Review in Lesson Memory</button>
              )}
              <small>{draft.status === "approved" ? "Approved · still private until you publish" : "Suggestion only · teacher approval required"}</small>
            </>
          ) : (
            <><h3>No lesson draft waiting</h3><p>Wrap a lesson to shape its notes into a private suggestion.</p><button type="button" onClick={onGoLesson}>Open Lesson Memory</button></>
          )}
        </aside>
      </div>
    </section>
  );
}

function LiveFamily({ student }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  return (
    <section className="teacher-student-section" aria-labelledby="student-family-title">
      <header className="teacher-student-section-heading"><div><p>Private teacher view</p><h2 id="student-family-title">Family & schedule</h2></div><button type="button" onClick={() => setPreviewOpen(true)}>Preview parent view</button></header>
      <div className="teacher-family-grid">
        <article><span>Regular lesson</span><h3>{student.schedule}</h3><p>{student.lesson?.location || "Rainbow Heart Studio"} · {student.lesson?.duration_minutes || 30} minutes</p></article>
        <article><span>Primary family connection</span><h3>{student.family}</h3><p>{[student.familyContact?.email, student.familyContact?.phone].filter(Boolean).join(" · ") || "Contact details not added yet"}</p></article>
        {(student.guardians || []).map((guardian) => (
          <article key={`${guardian.family_id}-${guardian.name}-${guardian.email || guardian.phone}`}>
            <span>{guardian.relationship || "Additional caregiver"}</span>
            <h3>{guardian.name}</h3>
            <p>{[guardian.email, guardian.phone].filter(Boolean).join(" · ")}</p>
            <small>{guardian.receives_studio_contact ? "Studio contact approved" : "Reference contact only"}</small>
          </article>
        ))}
      </div>
      <CommLog studentId={student.id} role="teacher" authorName="Jonathan" />
      {previewOpen && <ParentPreviewModal student={{ ...student, status: student.accountStatus || "active" }} onClose={() => setPreviewOpen(false)} />}
    </section>
  );
}

function LessonMemoryUnavailable({ student, onOpenAssignments }) {
  return (
    <section className="teacher-student-section lesson-memory-unavailable" aria-labelledby="lesson-memory-unavailable-title">
      <header className="teacher-student-section-heading">
        <div>
          <p>Private lesson notes</p>
          <h2 id="lesson-memory-unavailable-title">Lesson Memory is not enabled yet</h2>
        </div>
      </header>
      <div className="lesson-memory-unavailable-body">
        <p>
          {student.shortName}’s assignments, practice history, schedule, and family messages are still available.
          The private note workspace will open after its protected database setup is reviewed and approved.
        </p>
        <button type="button" onClick={onOpenAssignments}>Open {student.shortName}’s assignments</button>
      </div>
    </section>
  );
}

export default function TeacherWorkspace({ teacherId, userEmail, onLogout }) {
  const workspace = useTeacherWorkspace(teacherId);

  return (
    <TeacherWorkspaceShell
      students={workspace.students}
      todaySchedule={workspace.todaySchedule}
      performanceEvents={workspace.performanceEvents}
      summary={workspace.summary}
      userEmail={userEmail}
      onLogout={onLogout}
      loading={workspace.loading}
      error={workspace.error}
      onRetry={workspace.refresh}
      renderLessonMemory={(student, onOpenAssignments, options = {}) => (
        workspace.summary.lessonMemoryAvailable === false ? (
          <LessonMemoryUnavailable student={student} onOpenAssignments={onOpenAssignments} />
        ) : (
          <LessonMemory
            teacherId={teacherId}
            student={student}
            autoStart={options.autoStart}
            onAutoStartHandled={options.onAutoStartHandled}
            onOpenAssignments={onOpenAssignments}
            onChanged={workspace.refresh}
          />
        )
      )}
      renderAssignments={(student, onGoLesson) => (
        <LiveAssignments
          teacherId={teacherId}
          student={student}
          onRefresh={() => workspace.refresh({ silent: true })}
          onGoLesson={onGoLesson}
        />
      )}
      renderFamily={(student) => <LiveFamily student={student} />}
      renderStudentManager={() => <StudentManager teacherId={teacherId} onChanged={workspace.refresh} />}
      renderStudioInbox={() => <RescheduleRequests teacherId={teacherId} />}
      renderBadgeStudio={(students) => (
        <BadgeStudio students={students} teacherId={teacherId} onAward={() => workspace.refresh({ silent: true })} />
      )}
    />
  );
}

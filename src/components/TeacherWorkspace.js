import React, { useState } from "react";
import useTeacherWorkspace from "../hooks/useTeacherWorkspace";
import { lessonMemoryApi } from "../lib/lessonMemory";
import AssignmentForm from "./AssignmentForm";
import CommLog from "./CommLog";
import LessonMemory from "./LessonMemory";
import StudentManager from "./StudentManager";
import { TeacherWorkspaceShell } from "./TeacherWorkspaceFixture";

function LiveAssignments({ teacherId, student, onRefresh, onGoLesson }) {
  const draft = student.memory.draft?.id ? student.memory.draft : null;
  const [composerSource, setComposerSource] = useState(null);
  const [status, setStatus] = useState(null);

  const assignmentCreated = async (assignment) => {
    if (composerSource === "draft" && draft?.id) {
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
            {student.assignments.map((assignment) => (
              <article key={assignment.id || assignment.title}>
                <div><span>{assignment.category}</span><span>{assignment.stage}</span></div>
                <h4>{assignment.title}</h4>
                <p>{assignment.progress}</p>
                <footer><strong>{assignment.age}</strong><span>working on this</span></footer>
              </article>
            ))}
          </div>
        </div>

        <aside className="teacher-suggested-assignment">
          <p>From the latest lesson notes</p>
          {draft ? (
            <>
              <h3>{draft.title}</h3>
              {draft.description && <p>{draft.description}</p>}
              <ol>{(draft.steps || []).map((step) => <li key={step}>{step}</li>)}</ol>
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
  return (
    <section className="teacher-student-section" aria-labelledby="student-family-title">
      <header className="teacher-student-section-heading"><div><p>Private teacher view</p><h2 id="student-family-title">Family & schedule</h2></div></header>
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
      summary={workspace.summary}
      userEmail={userEmail}
      onLogout={onLogout}
      loading={workspace.loading}
      error={workspace.error}
      onRetry={workspace.refresh}
      renderLessonMemory={(student, onOpenAssignments) => (
        workspace.summary.lessonMemoryAvailable === false ? (
          <LessonMemoryUnavailable student={student} onOpenAssignments={onOpenAssignments} />
        ) : (
          <LessonMemory
            teacherId={teacherId}
            student={student}
            onOpenAssignments={onOpenAssignments}
            onChanged={workspace.refresh}
          />
        )
      )}
      renderAssignments={(student, onGoLesson) => (
        <LiveAssignments
          teacherId={teacherId}
          student={student}
          onRefresh={workspace.refresh}
          onGoLesson={onGoLesson}
        />
      )}
      renderFamily={(student) => <LiveFamily student={student} />}
      renderStudentManager={() => <StudentManager teacherId={teacherId} onChanged={workspace.refresh} />}
    />
  );
}

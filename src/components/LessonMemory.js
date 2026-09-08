import React, { useCallback, useEffect, useState } from "react";
import { lessonMemoryApi } from "../lib/lessonMemory";
import LessonMemoryFixture from "./LessonMemoryFixture";

function sessionPresentation(memory, student) {
  const source = memory?.startedAt ? new Date(memory.startedAt) : null;
  if (!source || Number.isNaN(source.getTime())) {
    return {
      sessionLabel: student.nextLesson || "Ready for the next lesson",
      sessionDateTime: undefined,
    };
  }

  return {
    sessionLabel: source.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    sessionDateTime: source.toISOString(),
  };
}

function draftStateOf(draft) {
  if (!draft) return "hidden";
  return draft.status === "approved" || draft.status === "published"
    ? "approved"
    : "ready";
}

export default function LessonMemory({ teacherId, student, onOpenAssignments, onChanged }) {
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMemory(
        await lessonMemoryApi.loadLatest({ teacherId, studentId: student.id })
      );
    } catch (loadError) {
      console.error("Lesson Memory could not load:", loadError);
      setError(loadError.message || "Lesson Memory could not load.");
    } finally {
      setLoading(false);
    }
  }, [student.id, teacherId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <section className="lesson-memory" aria-label="Lesson Memory">
        <div className="prep-state" role="status">
          <h2>Opening {student.shortName}’s Lesson Memory</h2>
          <p>Gathering the private teacher notes…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="lesson-memory" aria-label="Lesson Memory">
        <div className="prep-state prep-state-error" role="alert">
          <h2>Lesson Memory could not load</h2>
          <p>{error}</p>
          <button type="button" onClick={load}>Try again</button>
        </div>
      </section>
    );
  }

  const session = sessionPresentation(memory, student);
  const draftConfig = memory?.draft || student.memory.draft || {};

  const startLesson = async () => {
    const started = await lessonMemoryApi.start({
      teacherId,
      studentId: student.id,
    });
    setMemory(started);
    return started;
  };

  const addNote = async ({ categoryId, text }) =>
    lessonMemoryApi.addNote({
      lessonSessionId: memory.id,
      categoryId,
      text,
    });

  const removeNote = async (noteId) =>
    lessonMemoryApi.removeNote({ lessonSessionId: memory.id, noteId });

  const wrapLesson = async (draft) => {
    const savedDraft = await lessonMemoryApi.wrap({
      lessonSessionId: memory.id,
      draft,
    });
    setMemory((current) => ({
      ...current,
      status: "wrapped",
      wrappedAt: new Date().toISOString(),
      draft: savedDraft,
    }));
    return savedDraft;
  };

  const approveDraft = async (draft) => {
    const savedDraft = await lessonMemoryApi.approveDraft(draft.id);
    setMemory((current) => ({ ...current, draft: savedDraft }));
    await onChanged?.();
    return savedDraft;
  };

  return (
    <LessonMemoryFixture
      key={memory?.id || `ready-${student.id}`}
      studentName={student.shortName}
      sessionLabel={session.sessionLabel}
      sessionDateTime={session.sessionDateTime}
      starterNotes={memory?.notes || []}
      activeWorkTitle={student.memory.activeWorkTitle}
      activeWorkAge={student.memory.activeWorkAge}
      activeWorkStatus={student.memory.activeWorkStatus}
      draftConfig={draftConfig}
      initialLessonState={memory?.status || "idle"}
      initialDraftState={draftStateOf(memory?.draft)}
      onStartLesson={startLesson}
      onAddNote={memory?.status === "open" ? addNote : undefined}
      onRemoveNote={memory?.status === "open" ? removeNote : undefined}
      onWrapLesson={memory?.status === "open" ? wrapLesson : undefined}
      onApproveDraft={memory?.draft?.id || memory?.status === "open" ? approveDraft : undefined}
      onOpenAssignments={onOpenAssignments}
    />
  );
}

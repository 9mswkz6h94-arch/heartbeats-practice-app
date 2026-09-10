import React, { useMemo, useState } from "react";
import { normalizeAssignmentSteps } from "../lib/lessonMemory";
import PlanningPartnerPanel from "./PlanningPartnerPanel";
import "./LessonMemoryFixture.css";

export const LESSON_NOTE_CATEGORIES = [
  {
    id: "worked-on",
    label: "Worked on",
    shortLabel: "Focus",
    symbol: "01",
    description: "Songs, skills, and musical ideas explored today.",
    prompt: "What did you explore together?",
  },
  {
    id: "clicked",
    label: "Clicked today",
    shortLabel: "Spark",
    symbol: "02",
    description: "A breakthrough, brave try, or connection worth remembering.",
    prompt: "What felt easier or suddenly made sense?",
  },
  {
    id: "keep-exploring",
    label: "Keep exploring",
    shortLabel: "Growing",
    symbol: "03",
    description: "Something to revisit gently without framing it as a failure.",
    prompt: "What deserves another comfortable pass?",
  },
  {
    id: "student-voice",
    label: "Student voice",
    shortLabel: "Their voice",
    symbol: "04",
    description: "Questions, choices, interests, and language the student used.",
    prompt: "What did the student ask for, notice, or choose?",
  },
  {
    id: "next-time",
    label: "Start here next time",
    shortLabel: "Next",
    symbol: "05",
    description: "The exact musical doorway into the next lesson.",
    prompt: "Where should the next lesson begin?",
  },
  {
    id: "family-admin",
    label: "Family / admin",
    shortLabel: "Private",
    symbol: "06",
    description: "Scheduling or helpful context kept private from the student view.",
    prompt: "Anything practical to remember or follow up on?",
  },
];

const STARTER_NOTES = [
  {
    id: 1,
    categoryId: "worked-on",
    text: "You Are My Sunshine — chorus breathing and confident starts.",
    time: "4:42 PM",
  },
  {
    id: 2,
    categoryId: "clicked",
    text: "Found a comfortable breath before the final phrase without prompting.",
    time: "4:51 PM",
  },
  {
    id: 3,
    categoryId: "student-voice",
    text: "Wants to learn a song from the Minecraft soundtrack next.",
    time: "4:56 PM",
  },
  {
    id: 4,
    categoryId: "next-time",
    text: "Begin with the chorus once, then connect it to verse two.",
    time: "5:00 PM",
  },
];

export function buildAssignmentDraft(notes, draftConfig = {}) {
  const growthNote = notes.find((note) => note.categoryId === "keep-exploring");
  const nextNote = notes.find((note) => note.categoryId === "next-time");
  const focusNote = notes.find((note) => note.categoryId === "worked-on");

  return {
    title: draftConfig.title || "You Are My Sunshine — easy breaths and verse two",
    description:
      draftConfig.description ||
      growthNote?.text ||
      nextNote?.text ||
      focusNote?.text ||
      "Continue from today's lesson notes.",
    steps:
      draftConfig.steps ||
      [
        "Sing the chorus once at a comfortable volume.",
        "Pause and mark one easy breath before each long phrase.",
        "Connect the chorus to verse two when it feels ready.",
      ],
  };
}

function CategoryButton({ category, active, count, onSelect }) {
  return (
    <button
      type="button"
      className={`lesson-memory-category category-${category.id}${active ? " active" : ""}`}
      onClick={() => onSelect(category.id)}
      aria-pressed={active}
    >
      <span className="lesson-memory-category-number" aria-hidden="true">
        {category.symbol}
      </span>
      <span className="lesson-memory-category-copy">
        <strong>{category.label}</strong>
        <small>{category.description}</small>
      </span>
      <span className="lesson-memory-category-count" aria-label={`${count} notes`}>
        {count}
      </span>
    </button>
  );
}

export default function LessonMemoryFixture({
  studentName = "Alexandria",
  sessionLabel = "Sep 6 · 4:30 PM",
  sessionDateTime = "2026-09-06T16:30",
  starterNotes = STARTER_NOTES,
  activeWorkTitle = "Chromatic warmup",
  activeWorkAge = "3 weeks",
  activeWorkStatus = "building comfortably",
  draftConfig = {},
  initialLessonState = "open",
  initialDraftState = "hidden",
  onStartLesson,
  onAddNote,
  onRemoveNote,
  onWrapLesson,
  onApproveDraft,
  onOpenAssignments,
}) {
  const [activeCategoryId, setActiveCategoryId] = useState("worked-on");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState(() => starterNotes);
  const [draftState, setDraftState] = useState(initialDraftState);
  const [lessonState, setLessonState] = useState(initialLessonState);
  const [savingAction, setSavingAction] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [savedDraft, setSavedDraft] = useState(
    initialDraftState === "hidden" ? null : draftConfig
  );
  const [planningOpen, setPlanningOpen] = useState(false);

  const activeCategory =
    LESSON_NOTE_CATEGORIES.find((category) => category.id === activeCategoryId) ||
    LESSON_NOTE_CATEGORIES[0];

  const counts = useMemo(
    () =>
      notes.reduce((result, note) => {
        result[note.categoryId] = (result[note.categoryId] || 0) + 1;
        return result;
      }, {}),
    [notes]
  );

  const assignmentDraft = useMemo(
    () => buildAssignmentDraft(notes, draftConfig),
    [notes, draftConfig]
  );

  const addNote = async (event) => {
    event.preventDefault();
    const trimmed = noteText.trim();
    if (!trimmed || lessonState !== "open") return;

    setSavingAction("note");
    setSaveError(null);
    try {
      const savedNote = onAddNote
        ? await onAddNote({ categoryId: activeCategoryId, text: trimmed })
        : {
            id: Date.now(),
            categoryId: activeCategoryId,
            text: trimmed,
            time: "Just now",
          };
      setNotes((current) => [...current, savedNote]);
      setNoteText("");
    } catch (error) {
      setSaveError(error.message || "The note could not be saved. Try again.");
    } finally {
      setSavingAction(null);
    }
  };

  const removeNote = async (noteId) => {
    setSavingAction(`remove-${noteId}`);
    setSaveError(null);
    try {
      if (onRemoveNote) await onRemoveNote(noteId);
      setNotes((current) => current.filter((note) => note.id !== noteId));
    } catch (error) {
      setSaveError(error.message || "The note could not be removed. Try again.");
    } finally {
      setSavingAction(null);
    }
  };

  const wrapLesson = async () => {
    setSavingAction("wrap");
    setSaveError(null);
    try {
      const result = onWrapLesson
        ? await onWrapLesson(assignmentDraft)
        : assignmentDraft;
      setSavedDraft(result || assignmentDraft);
      setLessonState("wrapped");
      setDraftState("ready");
    } catch (error) {
      setSaveError(error.message || "The lesson could not be wrapped. Try again.");
    } finally {
      setSavingAction(null);
    }
  };

  const approveDraft = async () => {
    setSavingAction("approve");
    setSaveError(null);
    try {
      const result = onApproveDraft
        ? await onApproveDraft(savedDraft || assignmentDraft)
        : savedDraft || assignmentDraft;
      setSavedDraft(result || savedDraft || assignmentDraft);
      setDraftState("approved");
    } catch (error) {
      setSaveError(error.message || "The draft could not be approved. Try again.");
    } finally {
      setSavingAction(null);
    }
  };

  const startLesson = async () => {
    if (!onStartLesson) return;
    setSavingAction("start");
    setSaveError(null);
    try {
      await onStartLesson();
      setLessonState("open");
      setDraftState("hidden");
      setNotes([]);
    } catch (error) {
      setSaveError(error.message || "The lesson could not be started. Try again.");
    } finally {
      setSavingAction(null);
    }
  };

  const lessonStatusLabel =
    lessonState === "open"
      ? "Lesson in progress"
      : lessonState === "wrapped"
      ? "Lesson wrapped"
      : "Ready to begin";

  return (
    <section className="lesson-memory" aria-labelledby="lesson-memory-title">
      <header className="lesson-memory-header">
        <div>
          <p className="lesson-memory-eyebrow">Lesson memory · private to teacher</p>
          <h2 id="lesson-memory-title">{studentName} · today’s lesson</h2>
          <p className="lesson-memory-intro">
            Catch the musical thread while you teach. These notes never appear in the
            student workspace.
          </p>
        </div>
        <div className="lesson-memory-session-state">
          <span className={`lesson-memory-status ${lessonState}`}>{lessonStatusLabel}</span>
          <time dateTime={sessionDateTime}>{sessionLabel}</time>
          {onStartLesson && lessonState !== "open" && (
            <button type="button" onClick={startLesson} disabled={savingAction === "start"}>
              {savingAction === "start"
                ? "Starting…"
                : lessonState === "wrapped"
                ? "Start new lesson"
                : "Start lesson"}
            </button>
          )}
        </div>
      </header>

      {saveError && <p className="lesson-memory-save-error" role="alert">{saveError}</p>}

      <div className="lesson-memory-layout">
        <div className="lesson-memory-capture">
          <div className="lesson-memory-category-grid" aria-label="Note categories">
            {LESSON_NOTE_CATEGORIES.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                active={category.id === activeCategoryId}
                count={counts[category.id] || 0}
                onSelect={setActiveCategoryId}
              />
            ))}
          </div>

          <form className="lesson-memory-composer" onSubmit={addNote}>
            <div className="lesson-memory-composer-heading">
              <span className={`lesson-memory-note-tag tag-${activeCategory.id}`}>
                {activeCategory.shortLabel}
              </span>
              <label htmlFor="lesson-memory-note">{activeCategory.prompt}</label>
            </div>
            <textarea
              id="lesson-memory-note"
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              placeholder="A sentence or a few words is plenty…"
              rows="3"
              disabled={lessonState !== "open" || savingAction === "note"}
            />
            <div className="lesson-memory-composer-actions">
              <span>{savingAction === "note" ? "Saving the teacher note…" : "Saved here as a teacher note"}</span>
              <button type="submit" disabled={!noteText.trim() || lessonState !== "open" || savingAction === "note"}>
                {savingAction === "note" ? "Saving…" : "Add note"}
              </button>
            </div>
          </form>

          <div className="lesson-memory-notes" aria-live="polite">
            <div className="lesson-memory-section-heading">
              <h3>Today’s thread</h3>
              <span>{notes.length} notes</span>
            </div>
            {notes.map((note) => {
              const category = LESSON_NOTE_CATEGORIES.find(
                (item) => item.id === note.categoryId
              );
              return (
                <article className="lesson-memory-note" key={note.id}>
                  <span className={`lesson-memory-note-tag tag-${category.id}`}>
                    {category.shortLabel}
                  </span>
                  <p>{note.text}</p>
                  <time dateTime={note.createdAt}>{note.time || (note.createdAt ? new Date(note.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Saved")}</time>
                  <button
                    type="button"
                    onClick={() => removeNote(note.id)}
                    aria-label={`Remove ${category.label} note`}
                    disabled={lessonState !== "open" || savingAction === `remove-${note.id}`}
                  >
                    {savingAction === `remove-${note.id}` ? "Removing…" : "Remove"}
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="lesson-memory-handoff" aria-label="Lesson handoff">
          <div className="lesson-memory-handoff-heading">
            <p>End-of-lesson handoff</p>
            <h3>Turn the thread into a gentle next step.</h3>
          </div>

          <div className="lesson-memory-next-card">
            <span>Start here next time</span>
            <p>
              {notes.find((note) => note.categoryId === "next-time")?.text ||
                "Add a next-time note before wrapping the lesson."}
            </p>
          </div>

          <div className="lesson-memory-duration">
            <div>
              <span>Active work</span>
              <strong>{activeWorkTitle}</strong>
            </div>
            <p><strong>{activeWorkAge}</strong> · {activeWorkStatus}</p>
          </div>

          {draftState === "hidden" ? (
            <button type="button" className="lesson-memory-wrap" onClick={wrapLesson} disabled={lessonState !== "open" || savingAction === "wrap"}>
              <span>Wrap lesson</span>
              <small>{savingAction === "wrap" ? "Saving memory + draft…" : "Save the memory + shape a draft"}</small>
            </button>
          ) : (
            <div className="lesson-memory-draft">
              <div className="lesson-memory-draft-status">
                <span>{draftState === "approved" ? "Approved" : "Suggested draft"}</span>
                <small>Nothing reaches the student automatically</small>
              </div>
              <h4>{assignmentDraft.title}</h4>
              <p>{assignmentDraft.description}</p>
              <ol>
                {normalizeAssignmentSteps(assignmentDraft.steps).map((step, index) => (
                  <li key={`${step.title}-${index}`}>
                    {step.title}
                    {step.description && <small>{step.description}</small>}
                  </li>
                ))}
              </ol>
              {draftState === "ready" ? (
                <div className="lesson-memory-draft-actions">
                  <button type="button" onClick={approveDraft} disabled={savingAction === "approve"}>
                    {savingAction === "approve" ? "Approving…" : "Approve draft"}
                  </button>
                  {!onWrapLesson && !onStartLesson && <button type="button" onClick={() => { setDraftState("hidden"); setLessonState("open"); }}>Keep editing notes</button>}
                </div>
              ) : (
                <div className="lesson-memory-approved-handoff">
                  <p className="lesson-memory-approved-copy">
                    Ready to review in Assignments.
                  </p>
                  {onOpenAssignments && (
                    <button type="button" onClick={onOpenAssignments}>
                      Open Assignments
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="lesson-memory-partner"
            aria-expanded={planningOpen}
            onClick={() => setPlanningOpen((current) => !current)}
          >
            <span aria-hidden="true">✦</span>
            <span>
              <strong>{planningOpen ? "Close planning helper" : "Ask planning partner"}</strong>
              <small>Uses only these private notes; no outside AI call</small>
            </span>
          </button>
          {planningOpen && (
            <PlanningPartnerPanel
              student={{ id: studentName.toLowerCase().replace(/\W+/g, "-"), name: studentName, memory: { activeWorkTitle } }}
              notes={notes}
              onClose={() => setPlanningOpen(false)}
            />
          )}
        </aside>
      </div>
    </section>
  );
}

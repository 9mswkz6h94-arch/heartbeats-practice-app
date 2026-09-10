import {
  LESSON_NOTE_CATEGORY_IDS,
  normalizeAssignmentDraft,
  normalizeLessonMemory,
  normalizeLessonNote,
} from "./lessonMemory";

test("lesson memory allows only the six teacher note categories", () => {
  expect(LESSON_NOTE_CATEGORY_IDS).toEqual([
    "worked-on",
    "clicked",
    "keep-exploring",
    "student-voice",
    "next-time",
    "family-admin",
  ]);
});

test("normalizes database notes without exposing storage column names", () => {
  expect(
    normalizeLessonNote({
      id: "note-1",
      category_id: "clicked",
      body: "The bridge made sense today.",
      created_at: "2026-09-06T21:15:00.000Z",
    })
  ).toEqual({
    id: "note-1",
    categoryId: "clicked",
    text: "The bridge made sense today.",
    createdAt: "2026-09-06T21:15:00.000Z",
  });
});

test("sorts lesson notes and keeps the private assignment suggestion attached", () => {
  const memory = normalizeLessonMemory({
    id: "session-1",
    student_id: "student-1",
    teacher_id: "teacher-1",
    scheduled_for: null,
    started_at: "2026-09-06T21:00:00.000Z",
    wrapped_at: "2026-09-06T21:45:00.000Z",
    status: "wrapped",
    lesson_notes: [
      { id: "b", category_id: "next-time", body: "Start here.", created_at: "2026-09-06T21:20:00.000Z" },
      { id: "a", category_id: "worked-on", body: "Warmup.", created_at: "2026-09-06T21:05:00.000Z" },
    ],
    assignment_drafts: [
      { id: "draft-1", title: "Warmup", description: null, steps: ["Try once."], status: "approved", assignment_id: null },
    ],
  });

  expect(memory.notes.map((note) => note.id)).toEqual(["a", "b"]);
  expect(memory.draft).toEqual({
    id: "draft-1",
    title: "Warmup",
    description: "",
    steps: [{ title: "Try once.", description: "" }],
    status: "approved",
    assignmentId: null,
  });
});

test("treats malformed draft steps as an empty list", () => {
  expect(normalizeAssignmentDraft({ id: "d", title: "Draft", steps: {}, status: "suggested" }).steps).toEqual([]);
});

test("normalizes string and structured draft steps for every live consumer", () => {
  expect(normalizeAssignmentDraft({
    id: "d",
    title: "Draft",
    status: "suggested",
    steps: [
      "  Play once.  ",
      { title: " Listen back. ", description: " Notice one comfortable moment. " },
      { description: "Missing title" },
    ],
  }).steps).toEqual([
    { title: "Play once.", description: "" },
    { title: "Listen back.", description: "Notice one comfortable moment." },
  ]);
});

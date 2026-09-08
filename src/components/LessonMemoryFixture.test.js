import { buildAssignmentDraft, LESSON_NOTE_CATEGORIES } from "./LessonMemoryFixture";

describe("lesson memory categories", () => {
  test("keeps the live note set focused and non-overlapping", () => {
    expect(LESSON_NOTE_CATEGORIES).toHaveLength(6);
    expect(new Set(LESSON_NOTE_CATEGORIES.map((category) => category.id)).size).toBe(6);
    expect(LESSON_NOTE_CATEGORIES.map((category) => category.label)).toEqual([
      "Worked on",
      "Clicked today",
      "Keep exploring",
      "Student voice",
      "Start here next time",
      "Family / admin",
    ]);
  });

  test("uses a gentle growth note as the assignment draft description", () => {
    const draft = buildAssignmentDraft([
      { categoryId: "worked-on", text: "Worked on the chorus." },
      { categoryId: "keep-exploring", text: "Try the last phrase slowly once more." },
      { categoryId: "next-time", text: "Start with verse two." },
    ]);

    expect(draft.description).toBe("Try the last phrase slowly once more.");
    expect(draft.steps).toHaveLength(3);
  });

  test("accepts student-specific assignment language", () => {
    const draft = buildAssignmentDraft(
      [{ categoryId: "next-time", text: "Begin at the bridge." }],
      { title: "Rainbow Connection — bridge", steps: ["Right hand alone."] }
    );

    expect(draft.title).toBe("Rainbow Connection — bridge");
    expect(draft.steps).toEqual(["Right hand alone."]);
  });
});

import {
  addLocalDays,
  getAssignmentDueState,
  isAssignmentActive,
  localDateString,
} from "./assignmentLifecycle";

describe("assignment lifecycle", () => {
  test("formats a date using the local calendar day", () => {
    expect(localDateString(new Date(2026, 8, 3, 23, 30))).toBe("2026-09-03");
  });

  test("defaults a reassignment one local week ahead across month boundaries", () => {
    expect(localDateString(addLocalDays(new Date(2026, 8, 28), 7))).toBe(
      "2026-10-05"
    );
  });

  test("keeps an assignment active through its due date", () => {
    expect(isAssignmentActive({ deadline: "2026-09-03" }, "2026-09-03")).toBe(true);
    expect(getAssignmentDueState({ deadline: "2026-09-03" }, "2026-09-03")).toBe(
      "due-today"
    );
  });

  test("a reassignment expires the day after its new due date", () => {
    const assignment = { deadline: "2026-09-10" };
    expect(isAssignmentActive(assignment, "2026-09-10")).toBe(true);
    expect(isAssignmentActive(assignment, "2026-09-11")).toBe(false);
  });

  test("drops a past-due assignment from active practice", () => {
    expect(isAssignmentActive({ deadline: "2026-09-02" }, "2026-09-03")).toBe(false);
    expect(getAssignmentDueState({ deadline: "2026-09-02" }, "2026-09-03")).toBe(
      "past-due"
    );
  });

  test("keeps a no-date assignment active until the teacher resolves it", () => {
    expect(isAssignmentActive({ deadline: null }, "2026-09-03")).toBe(true);
    expect(getAssignmentDueState({ deadline: null }, "2026-09-03")).toBe("none");
  });

  test("hides archived and repertoire assignments", () => {
    expect(
      isAssignmentActive({ deadline: null, archived_at: "2026-09-03T12:00:00Z" })
    ).toBe(false);
    expect(isAssignmentActive({ deadline: null, memorized: true })).toBe(false);
  });
});

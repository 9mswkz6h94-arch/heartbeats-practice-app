import {
  addLocalDays,
  filterCurrentAssignments,
  getAssignmentDueState,
  isAssignmentActive,
  localDateString,
} from "./assignmentLifecycle";

describe("assignment lifecycle", () => {
  test("formats a date using the local calendar day", () => {
    expect(localDateString(new Date("2026-09-04T04:30:00.000Z"))).toBe("2026-09-03");
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

  test("keeps an overdue assignment in current practice until resolved", () => {
    const assignment = { deadline: "2026-09-10" };
    expect(isAssignmentActive(assignment, "2026-09-10")).toBe(true);
    expect(isAssignmentActive(assignment, "2026-09-11")).toBe(true);
    expect(getAssignmentDueState({ deadline: "2026-09-02" }, "2026-09-03")).toBe(
      "past-due"
    );
  });

  test.each([
    ["overdue", { deadline: "2026-09-02" }, "2026-09-03", "past-due"],
    ["today", { deadline: "2026-09-03" }, "2026-09-03", "due-today"],
    ["future", { deadline: "2026-09-10" }, "2026-09-03", "upcoming"],
    ["undated", { deadline: null }, "2026-09-03", "none"],
  ])("keeps %s work visible while preserving its due state", (_label, assignment, today, dueState) => {
    expect(isAssignmentActive(assignment, today)).toBe(true);
    expect(getAssignmentDueState(assignment, today)).toBe(dueState);
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

  test("filters only explicitly resolved assignments from current work", () => {
    const current = filterCurrentAssignments([
      { id: "overdue", deadline: "2026-09-02" },
      { id: "today", deadline: "2026-09-03" },
      { id: "future", deadline: "2026-09-10" },
      { id: "undated", deadline: null },
      { id: "archived", deadline: null, archived_at: "2026-09-03T12:00:00Z" },
      { id: "memorized", deadline: null, memorized: true },
    ]);

    expect(current.map((assignment) => assignment.id)).toEqual([
      "overdue",
      "today",
      "future",
      "undated",
    ]);
  });
});

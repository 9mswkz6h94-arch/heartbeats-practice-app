import { assignmentAge, assignmentDueLabel, initialsFor, isMissingOptionalRelation, lessonScheduleLabel, nextLessonLabel } from "./teacherWorkspace";

test("builds compact initials from long and single-word student names", () => {
  expect(initialsFor("Alexandria Montgomery-Rivera")).toBe("AM");
  expect(initialsFor("Sam")).toBe("SA");
});

test("describes assignment age without deadline pressure", () => {
  const now = new Date("2026-09-06T12:00:00");
  expect(assignmentAge("2026-09-06T08:00:00", now)).toBe("Today");
  expect(assignmentAge("2026-08-22T08:00:00", now)).toBe("2 weeks");
});

test("uses calm, consistent due-date labels for current work", () => {
  expect(assignmentDueLabel({ deadline: "2026-09-02" }, "2026-09-03")).toBe("Still open · due earlier");
  expect(assignmentDueLabel({ deadline: "2026-09-03" }, "2026-09-03")).toBe("Due today");
  expect(assignmentDueLabel({ deadline: "2026-09-10" }, "2026-09-03")).toBe("Due later");
  expect(assignmentDueLabel({ deadline: null }, "2026-09-03")).toBe("No due date");
});

test("formats recurring lesson context for the student workspace", () => {
  const lesson = { day_of_week: 0, start_time: "16:30:00" };
  expect(lessonScheduleLabel(lesson)).toMatch(/^Sundays at 4:30/);
  expect(nextLessonLabel(lesson, new Date("2026-09-06T09:00:00"))).toMatch(/^Today · 4:30/);
});

test("recognizes only missing optional relation errors as a graceful feature boundary", () => {
  expect(isMissingOptionalRelation({ code: "42P01", message: "relation missing" }, "assignment_drafts")).toBe(true);
  expect(isMissingOptionalRelation({ code: "PGRST205", message: "Could not find the table 'assignment_drafts'" }, "assignment_drafts")).toBe(true);
  expect(isMissingOptionalRelation({ code: "42501", message: "permission denied" }, "assignment_drafts")).toBe(false);
});

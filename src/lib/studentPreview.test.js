import { createStudentPreviewApi, studentPreviewIsReadOnly } from "./studentPreview";
import { isAssignmentActive } from "./assignmentLifecycle";

function makeQuery(result) {
  const filters = [];
  const query = {
    select: () => query,
    eq: (column, value) => {
      filters.push([column, value]);
      return query;
    },
    order: () => Promise.resolve(result),
    maybeSingle: () => Promise.resolve(result),
  };
  return { query, filters };
}

test("teacher preview requires both teacher and student filters", async () => {
  const { query, filters } = makeQuery({ data: { id: "student-a", name: "Alex", instrument: "Voice" }, error: null });
  const api = createStudentPreviewApi({ from: () => query });

  await expect(api.getAuthorizedStudent("teacher-a", "student-a")).resolves.toEqual({
    id: "student-a",
    name: "Alex",
    instrument: "Voice",
  });
  expect(filters).toEqual([["teacher_id", "teacher-a"], ["id", "student-a"]]);
});

test("cross-teacher preview denial stays fail-closed", async () => {
  const { query, filters } = makeQuery({ data: null, error: null });
  const api = createStudentPreviewApi({ from: () => query });

  await expect(api.getAuthorizedStudent("teacher-b", "student-a")).rejects.toThrow("not available for this teacher");
  expect(filters).toEqual([["teacher_id", "teacher-b"], ["id", "student-a"]]);
});

test("preview mode is an explicit read-only contract", () => {
  expect(studentPreviewIsReadOnly()).toBe(true);
});

test("student preview keeps the same active-assignment filters as student practice", () => {
  expect(isAssignmentActive({ id: "current", deadline: "2026-10-06" }, "2026-10-06")).toBe(true);
  expect(isAssignmentActive({ id: "archived", archived_at: "2026-10-05T12:00:00Z" }, "2026-10-06")).toBe(false);
  expect(isAssignmentActive({ id: "memorized", memorized: true }, "2026-10-06")).toBe(false);
  expect(isAssignmentActive({ id: "expired", deadline: "2026-10-05" }, "2026-10-06")).toBe(true);
});

import { previewContentState } from "./DevStudentPreview";

test("clears a cached student when a new teacher scope is denied", () => {
  const authorized = { id: "student-a", name: "Alex" };
  expect(previewContentState({ loading: false, error: null, student: authorized })).toBe(true);
  expect(previewContentState({ loading: false, error: "Student preview is not available for this teacher.", student: authorized })).toBe(false);
  expect(previewContentState({ loading: true, error: null, student: authorized })).toBe(false);
});

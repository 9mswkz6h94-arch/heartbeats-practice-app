import { STUDENT_WORKSPACE_TABS, TEACHER_PRIMARY_TABS, TEACHER_STUDENTS } from "./TeacherWorkspaceFixture";

describe("teacher workspace information architecture", () => {
  test("assignments live inside a selected student's workspace", () => {
    expect(STUDENT_WORKSPACE_TABS.map((tab) => tab.label)).toEqual([
      "Lesson",
      "Assignments",
      "Progress",
      "Family & schedule",
    ]);
  });

  test("Badge Studio is a global teacher destination, not a student sub-tab", () => {
    expect(TEACHER_PRIMARY_TABS.map((tab) => tab.label)).toEqual(["Studio", "Students", "Badge Studio"]);
    expect(STUDENT_WORKSPACE_TABS.map((tab) => tab.label)).not.toContain("Badge Studio");
  });

  test("every roster student has the context needed to start a lesson", () => {
    TEACHER_STUDENTS.forEach((student) => {
      expect(student.memory.notes.length).toBeGreaterThan(0);
      expect(student.assignments.length).toBeGreaterThan(0);
      expect(student.nextLesson).toBeTruthy();
    });
  });
});

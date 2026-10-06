import fs from "fs";
import path from "path";

const source = fs.readFileSync(path.join(__dirname, "TeacherWorkspace.js"), "utf8");

describe("live teacher workspace release wiring", () => {
  test("exposes the accepted global and family workflows", () => {
    expect(source).toMatch(/renderBadgeStudio=/);
    expect(source).toMatch(/<BadgeStudio[\s\S]*teacherId=/);
    expect(source).toMatch(/renderStudioInbox=/);
    expect(source).toMatch(/<RescheduleRequests/);
    expect(source).toMatch(/<ParentPreviewModal/);
  });

  test("routes assignment lifecycle controls through the preserving database function", () => {
    expect(source).toMatch(/resolve_practice_assignment/);
    expect(source).toMatch(/"reassign"/);
    expect(source).toMatch(/"repertoire"/);
    expect(source).toMatch(/"remove"/);
    expect(source).toMatch(/Earlier completion history was kept/);
  });

  test("wires a teacher-scoped, read-only student-facing preview", () => {
    expect(source).toMatch(/DevStudentPreview/);
    expect(source).toMatch(/studentId=\{student\.id\}/);
    const fixtureSource = fs.readFileSync(path.join(__dirname, "TeacherWorkspaceFixture.js"), "utf8");
    expect(fixtureSource).toMatch(/View student preview/);
    expect(fixtureSource).toMatch(/renderStudentPreview/);
    expect(fs.readFileSync(path.join(__dirname, "../lib/studentPreview.js"), "utf8")).toMatch(/\.eq\("teacher_id", teacherId\)/);
    expect(fs.readFileSync(path.join(__dirname, "PracticeCardDetail.js"), "utf8")).toMatch(/Practice actions are disabled in this teacher preview/);
    expect(fs.readFileSync(path.join(__dirname, "DevStudentPreview.js"), "utf8")).toMatch(/!loading && !error && Boolean\(student\)/);
  });
});

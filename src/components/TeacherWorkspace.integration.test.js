import fs from "fs";
import path from "path";

const source = fs.readFileSync(path.join(__dirname, "TeacherWorkspace.js"), "utf8");
const shellSource = fs.readFileSync(path.join(__dirname, "TeacherWorkspaceFixture.js"), "utf8");
const workspaceSource = fs.readFileSync(path.join(__dirname, "../lib/teacherWorkspace.js"), "utf8");
const assignmentFormSource = fs.readFileSync(path.join(__dirname, "AssignmentForm.js"), "utf8");
const assignmentListSource = fs.readFileSync(path.join(__dirname, "AssignmentList.js"), "utf8");
const studentManagerSource = fs.readFileSync(path.join(__dirname, "StudentManager.js"), "utf8");

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

  test("lets teachers edit assignment details without rewriting practice history", () => {
    expect(source).toMatch(/Edit details/);
    expect(source).toMatch(/\.from\("assignments"\)/);
    expect(source).toMatch(/Practice steps and completion history were kept/);
    expect(source).toMatch(/description: editingAssignment\.description/);
    expect(source).toMatch(/instrument_type: editingAssignment\.instrumentType/);
  });

  test("starts the next lesson from the studio timeline and passes the request into live Lesson Memory", () => {
    expect(shellSource).toMatch(/startLesson: item\.kind === "next"/);
    expect(shellSource).toMatch(/startLessonRequested={startLessonRequested}/);
    expect(shellSource).toMatch(/autoStart: startLessonRequested/);
    expect(shellSource).toMatch(/onAutoStartHandled/);
    expect(source).toMatch(/autoStart={options\.autoStart}/);
  });

  test("keeps badge awards in Badge Studio instead of pretending assignment rewards are saved", () => {
    expect(assignmentFormSource).not.toMatch(/badgeReward|Badge Reward/);
  });

  test("cleans up partial assignment writes and surfaces roster deletion errors", () => {
    expect(assignmentFormSource).toMatch(/practice steps could not be cleaned up/);
    expect(assignmentFormSource).toMatch(/uploadedAttachmentPath/);
    expect(assignmentListSource).toMatch(/duplicate assignment could not be cleaned up/);
    expect(studentManagerSource).toMatch(/Could not remove student/);
    expect(studentManagerSource).toMatch(/if \(removeError\) throw removeError/);
  });

  test("uses the atomic draft publisher when migration 022 is available", () => {
    expect(assignmentFormSource).toMatch(/rpc\("publish_assignment_draft"/);
    expect(assignmentFormSource).toMatch(/draftPublished: true/);
    expect(source).toMatch(/!metadata\.draftPublished/);
  });

  test("passes the provider-neutral performance feed into the studio home", () => {
    expect(source).toMatch(/performanceEvents=\{workspace\.performanceEvents\}/);
    expect(shellSource).toMatch(/performanceEvents=\{performanceEvents\}/);
    expect(shellSource).toMatch(/performance calendar not connected yet/i);
    expect(workspaceSource).toMatch(/performanceCalendarSource/);
    expect(shellSource).toMatch(/Sync pending/);
  });
});

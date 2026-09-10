import React, { act } from "react";
import { createRoot } from "react-dom/client";
import LessonMemory from "./LessonMemory";
import { lessonMemoryApi } from "../lib/lessonMemory";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const student = {
  id: "student-1",
  shortName: "Alexandria",
  nextLesson: "Today · 4:30 PM",
  memory: {
    activeWorkTitle: "Chromatic warmup",
    activeWorkAge: "New",
    activeWorkStatus: "ready",
    draft: {},
  },
};

function flushEffects() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("live Lesson Memory start flow", () => {
  let container;
  let root;
  let loadLatest;
  let start;
  let consoleError;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    loadLatest = jest.spyOn(lessonMemoryApi, "loadLatest").mockResolvedValue(null);
    start = jest.spyOn(lessonMemoryApi, "start").mockResolvedValue({
      id: "session-1",
      studentId: student.id,
      teacherId: "teacher-1",
      startedAt: "2026-09-10T16:30:00.000Z",
      status: "open",
      notes: [],
      draft: null,
    });
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    loadLatest.mockRestore();
    start.mockRestore();
    consoleError.mockRestore();
    container.remove();
  });

  test("auto-starts when the teacher chooses Start lesson from today's timeline", async () => {
    const onAutoStartHandled = jest.fn();

    await act(async () => {
      root.render(<LessonMemory teacherId="teacher-1" student={student} autoStart onAutoStartHandled={onAutoStartHandled} />);
      await flushEffects();
      await flushEffects();
    });

    expect(loadLatest).toHaveBeenCalledWith({ teacherId: "teacher-1", studentId: student.id });
    expect(start).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledWith({ teacherId: "teacher-1", studentId: student.id });
    expect(onAutoStartHandled).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("Lesson in progress");
  });

  test("does not create a session when loading the student workspace normally", async () => {
    await act(async () => {
      root.render(<LessonMemory teacherId="teacher-1" student={student} />);
      await flushEffects();
    });

    expect(start).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Start lesson");
  });

  test("does not start a session after a load error", async () => {
    loadLatest.mockRejectedValueOnce(new Error("Lesson Memory is unavailable"));

    await act(async () => {
      root.render(<LessonMemory teacherId="teacher-1" student={student} autoStart />);
      await flushEffects();
    });

    expect(start).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Lesson Memory could not load");
  });
});

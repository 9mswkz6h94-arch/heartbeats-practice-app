import { monthBounds, createAttendanceApi } from "./lessonAttendance";

test("uses an exclusive next-month boundary, including year rollover", () => {
  expect(monthBounds("2026-12")).toEqual({ start: "2026-12-01", end: "2027-01-01" });
  expect(() => monthBounds("2026-13")).toThrow();
});

test("propagates a failed save rather than reporting success", async () => {
  const client = { from: () => ({ upsert: async () => ({ error: new Error("offline") }) }) };
  await expect(createAttendanceApi(client).save("teacher", {})).rejects.toThrow("offline");
});


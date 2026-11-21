import { isSafePinResetTarget } from "../../supabase/functions/reset-kid-pin/target-safety";

const studentId = "12345678-1234-1234-1234-123456789abc";
const safe = { studentId, accountEmail: `kid-${studentId}@kids.heartbeats.app`, linkedStudentIds: [studentId] };

test("allows only a dedicated synthetic account for the requested student", () => {
  expect(isSafePinResetTarget(safe)).toBe(true);
  expect(isSafePinResetTarget({ ...safe, accountEmail: "parent@example.com" })).toBe(false);
  expect(isSafePinResetTarget({ ...safe, accountEmail: "kid-another@kids.heartbeats.app" })).toBe(false);
  expect(isSafePinResetTarget({ ...safe, linkedStudentIds: [studentId, "another"] })).toBe(false);
  expect(isSafePinResetTarget({ ...safe, linkedStudentIds: [] })).toBe(false);
  expect(isSafePinResetTarget({ ...safe, linkedStudentIds: undefined })).toBe(false);
});

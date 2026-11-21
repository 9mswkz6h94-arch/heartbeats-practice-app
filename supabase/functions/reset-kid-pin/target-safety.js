// A PIN reset changes a Supabase password, so only the dedicated synthetic
// account for exactly this student is eligible. Missing evidence fails closed.
export function isSafePinResetTarget({ studentId, accountEmail, linkedStudentIds }) {
  if (typeof studentId !== "string" || !studentId || typeof accountEmail !== "string") return false;
  if (!Array.isArray(linkedStudentIds) || linkedStudentIds.length !== 1 || linkedStudentIds[0] !== studentId) return false;
  return accountEmail.toLowerCase() === `kid-${studentId.toLowerCase()}@kids.heartbeats.app`;
}

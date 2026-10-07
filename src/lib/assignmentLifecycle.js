export function localDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function addLocalDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getAssignmentDueState(assignment, today = localDateString()) {
  if (!assignment?.deadline) return "none";
  if (assignment.deadline < today) return "past-due";
  if (assignment.deadline === today) return "due-today";
  return "upcoming";
}

export function isAssignmentActive(assignment, today = localDateString()) {
  if (!assignment || assignment.archived_at || assignment.memorized === true) {
    return false;
  }

  // Due dates are reminders, not an automatic removal rule. Teachers keep
  // control of the assignment lifecycle through archive/repertoire actions.
  // Keep the `today` parameter for API compatibility with existing callers.
  void today;
  return true;
}

export function filterCurrentAssignments(assignments = []) {
  return (assignments || []).filter((assignment) => isAssignmentActive(assignment));
}

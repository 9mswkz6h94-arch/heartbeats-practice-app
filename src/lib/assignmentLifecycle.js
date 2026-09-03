export function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

  return getAssignmentDueState(assignment, today) !== "past-due";
}

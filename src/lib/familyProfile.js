export const GUARDIAN_RELATIONSHIPS = [
  "Parent",
  "Grandparent",
  "Guardian",
  "Step-parent",
  "Other caregiver",
];

export function normalizeOptionalText(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

export function calculateAge(birthday, today = new Date()) {
  if (!birthday) return "—";

  const [year, month, day] = String(birthday).split("-").map(Number);
  if (!year || !month || !day) return "—";

  const birthdayDate = new Date(year, month - 1, day);
  if (
    birthdayDate.getFullYear() !== year
    || birthdayDate.getMonth() !== month - 1
    || birthdayDate.getDate() !== day
    || birthdayDate > today
  ) {
    return "—";
  }

  let age = today.getFullYear() - year;
  const birthdayHasPassed = today.getMonth() + 1 > month
    || (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!birthdayHasPassed) age -= 1;

  return age;
}

export function birthdayError(birthday, today = new Date()) {
  if (!birthday) return null;
  const age = calculateAge(birthday, today);
  if (age === "—") return "Choose a birthday in the past.";
  if (age > 120) return "Double-check that birthday.";
  return null;
}

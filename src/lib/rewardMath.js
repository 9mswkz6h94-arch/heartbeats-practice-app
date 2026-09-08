export const dayStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const parseDay = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const daysBetween = (a, b) => Math.round((b - a) / 86400000);

export function computeStreak(daySet, today = new Date()) {
  if (daySet.size === 0) return 0;
  const cursor = new Date(today);
  if (!daySet.has(dayStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!daySet.has(dayStr(cursor))) return 0;
  }
  let streak = 0;
  while (daySet.has(dayStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

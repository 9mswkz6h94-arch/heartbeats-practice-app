const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Builds a "TEMPLATE" Google Calendar event URL for the *next* occurrence
// of a weekly lesson slot, set to repeat every week. No OAuth, no backend —
// clicking it just opens Google Calendar's own add-event screen prefilled.
export function buildGoogleCalendarUrl({ studentName, dayOfWeek, startTime, durationMinutes, location }) {
  const [h, m] = startTime.split(":").map(Number);
  const next = new Date();
  next.setHours(h, m, 0, 0);
  const todayDow = next.getDay();
  let daysAhead = (dayOfWeek - todayDow + 7) % 7;
  if (daysAhead === 0 && next.getTime() <= Date.now()) daysAhead = 7;
  next.setDate(next.getDate() + daysAhead);

  const end = new Date(next.getTime() + (durationMinutes || 30) * 60000);

  const fmt = (d) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}` +
    `T${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `🎵 ${studentName} — Heart Beats Lesson`,
    dates: `${fmt(next)}/${fmt(end)}`,
    details: `Weekly Heart Beats practice lesson for ${studentName}.`,
    recur: "RRULE:FREQ=WEEKLY",
  });
  if (location) params.set("location", location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function dayName(dayOfWeek) {
  return DAY_NAMES[dayOfWeek] || "";
}

export const DAY_OPTIONS = DAY_NAMES.map((name, value) => ({ value, name }));

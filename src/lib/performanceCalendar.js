// Selected by the studio owner for the first calendar-source pass. This is
// metadata only: the browser app never receives OAuth credentials or copies
// private event contents. A server-side sync must populate studio_performances.
export const SELECTED_PERFORMANCE_SOURCE = Object.freeze({
  provider: "google-calendar",
  calendarId: "c_953e902726d550530474bcda3624f4c6ade00aff1f5600ba9b6e37f82797bfa9@group.calendar.google.com",
  calendarLabel: "Bro Jon & Rainbow Hearts",
  timezone: "America/Chicago",
  status: "selected-awaiting-sync",
});

export function normalizePerformanceEvent(row = {}) {
  const startsAt = row.starts_at || row.startsAt || row.start_at || null;
  if (!row.id || !startsAt || Number.isNaN(new Date(startsAt).getTime())) return null;

  return {
    id: row.id,
    title: row.title || "Studio performance",
    startsAt,
    endsAt: row.ends_at || row.endsAt || null,
    venue: row.venue || row.location || "",
    notes: row.notes || "",
    source: row.source || "studio",
  };
}

export function normalizePerformanceEvents(rows = [], now = new Date()) {
  const nowTime = new Date(now).getTime();
  return rows
    .map(normalizePerformanceEvent)
    .filter((event) => event && new Date(event.startsAt).getTime() >= nowTime)
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
}

export function isMissingPerformanceSource(error) {
  const message = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return ["42P01", "PGRST205"].includes(error?.code)
    || /(?:relation|table).*studio_performances.*(?:does not exist|not found)/i.test(message)
    || (
      message.includes("performance calendar source")
      && /(?:does not exist|not found|missing)/i.test(message)
    );
}

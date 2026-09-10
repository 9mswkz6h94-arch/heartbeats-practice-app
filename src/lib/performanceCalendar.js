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

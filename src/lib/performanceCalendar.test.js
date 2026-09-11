import {
  isMissingPerformanceSource,
  normalizePerformanceEvents,
  SELECTED_PERFORMANCE_SOURCE,
} from "./performanceCalendar";

test("records the selected Google Calendar source without claiming app sync", () => {
  expect(SELECTED_PERFORMANCE_SOURCE).toMatchObject({
    provider: "google-calendar",
    calendarId: expect.stringContaining("@group.calendar.google.com"),
    calendarLabel: "Bro Jon & Rainbow Hearts",
    status: "selected-awaiting-sync",
  });
});

test("keeps only valid upcoming performance events in date order", () => {
  const events = normalizePerformanceEvents([
    { id: "later", title: "Riverside", starts_at: "2026-09-18T19:00:00Z" },
    { id: "past", title: "Past show", starts_at: "2026-09-01T19:00:00Z" },
    { id: "soon", title: "Library", starts_at: "2026-09-12T19:00:00Z" },
    { id: "bad", title: "Missing date" },
  ], new Date("2026-09-10T12:00:00Z"));

  expect(events.map((event) => event.id)).toEqual(["soon", "later"]);
});

test("treats an absent performance source as an intentional boundary", () => {
  expect(isMissingPerformanceSource({ code: "PGRST205", message: "Could not find the table 'studio_performances'" })).toBe(true);
  expect(isMissingPerformanceSource({ code: "42501", message: "permission denied" })).toBe(false);
});

import { computeStreak } from "./rewardMath";
import { buildRecentActivity } from "./studentStats";

function localDay(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

test("counts a consecutive streak ending today", () => {
  expect(computeStreak(new Set([localDay(0), localDay(1), localDay(2)]))).toBe(3);
});

test("keeps a streak alive when the latest practice was yesterday", () => {
  expect(computeStreak(new Set([localDay(1), localDay(2)]))).toBe(2);
});

test("does not count disconnected practice days as a streak", () => {
  expect(computeStreak(new Set([localDay(0), localDay(2), localDay(3)]))).toBe(1);
});

test("builds a real seven-day activity rhythm from completion records", () => {
  const today = new Date(2026, 8, 6);
  expect(buildRecentActivity([
    { completed_at: "2026-09-01" },
    { completed_at: "2026-09-05T18:00:00Z" },
    { completed_at: "2026-09-05T19:00:00Z" },
  ], today)).toEqual([0, 1, 0, 0, 0, 2, 0]);
});

import { BADGES, getBadgeProgress } from "./badgeCatalog";

test("streak badges use the consecutive streak value", () => {
  const progress = getBadgeProgress({ streak: 6 }, BADGES.streak_7);
  expect(progress).toMatchObject({ current: 6, target: 7, earned: false });
});

test("badge progress never exceeds 100 percent", () => {
  const progress = getBadgeProgress({ songsMemorized: 12 }, BADGES.songs_5);
  expect(progress).toMatchObject({ current: 12, target: 5, percent: 100, earned: true });
});

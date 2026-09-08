import { BADGES, getBadgeProgress } from "./badgeCatalog";
import { getTeacherBadgeAwards } from "./badgeLogic";

test("streak badges use the consecutive streak value", () => {
  const progress = getBadgeProgress({ streak: 6 }, BADGES.streak_7);
  expect(progress).toMatchObject({ current: 6, target: 7, earned: false });
});

test("badge progress never exceeds 100 percent", () => {
  const progress = getBadgeProgress({ songsMemorized: 12 }, BADGES.songs_5);
  expect(progress).toMatchObject({ current: 12, target: 5, percent: 100, earned: true });
});

test("teacher-created badges are mapped into earned student celebrations", async () => {
  const order = jest.fn().mockResolvedValue({
    data: [{
      id: "award-1",
      title: "Careful Listener",
      message: "You noticed the sound and made a thoughtful choice.",
      character_id: "ringlet",
      earned_at: "2026-09-07T18:30:00.000Z",
    }],
    error: null,
  });
  const eq = jest.fn(() => ({ order }));
  const select = jest.fn(() => ({ eq }));
  const from = jest.fn(() => ({ select }));

  await expect(getTeacherBadgeAwards("student-1", { from })).resolves.toEqual([
    expect.objectContaining({
      id: "teacher-award-1",
      name: "Careful Listener",
      source: "teacher",
      earned_at: "2026-09-07T18:30:00.000Z",
    }),
  ]);
  expect(from).toHaveBeenCalledWith("teacher_badge_awards");
});

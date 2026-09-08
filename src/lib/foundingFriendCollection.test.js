import {
  canMergeFoundingFriend,
  createFoundingFriendCollection,
  hatchFoundingFriend,
  mergeFoundingFriendPair,
} from "./foundingFriendCollection";

describe("Founding Friend collection helpers", () => {
  test("creates a fresh mock collection with the preserved starter groups", () => {
    const first = createFoundingFriendCollection();
    const second = createFoundingFriendCollection();
    expect(first).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "turtle-2", count: 2 }),
      expect.objectContaining({ id: "fox-3", count: 1 }),
    ]));
    expect(first).not.toBe(second);
  });

  test("hatches into a separate stage group without changing other friends", () => {
    const hatched = hatchFoundingFriend(createFoundingFriendCollection());
    expect(hatched.find((group) => group.id === "turtle-1").count).toBe(1);
    expect(hatched.find((group) => group.id === "fox-3").count).toBe(1);
  });

  test("merges exactly two matching friends into the next stage", () => {
    const initial = createFoundingFriendCollection();
    expect(canMergeFoundingFriend(initial.find((group) => group.id === "turtle-2"))).toBe(true);

    const merged = mergeFoundingFriendPair(initial, "turtle-2");
    expect(merged.find((group) => group.id === "turtle-2")).toBeUndefined();
    expect(merged.find((group) => group.id === "turtle-3")).toEqual(expect.objectContaining({ count: 1, stage: 3 }));
    expect(merged.find((group) => group.id === "fox-3").count).toBe(1);
  });
});

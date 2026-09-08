import {
  buildOwnedZooFriends,
  buildUnlockedZooState,
  getLiveZooDestinationIds,
  applyStudentZooPreferences,
} from "./studentZoo";

describe("student Zoo state", () => {
  test("shows only rewards that have already appeared", () => {
    expect(buildUnlockedZooState({ completionCount: 0 }).meadowDecorations).toEqual([]);
    const state = buildUnlockedZooState({ completionCount: 5 });
    expect(state.meadowDecorations.map((item) => item.id)).toEqual([
      "tempo-lantern",
      "songflower-patch",
    ]);
    expect(state.meadowDecorations.every((item) => item.unlocked)).toBe(true);
  });

  test("turns existing pet records into owned friends without inventing locked cards", () => {
    const friends = buildOwnedZooFriends(
      { stage: 2, species: "fox", name: "Juniper" },
      [
        { id: "egg", stage: 0, species: null },
        { id: "owl", stage: 1, species: "owl" },
      ]
    );
    expect(friends).toHaveLength(2);
    expect(friends[0]).toMatchObject({ id: "main-pet", name: "Juniper" });
    expect(friends[1]).toMatchObject({ id: "owl", name: "Owl" });
  });

  test("adds habitats and the museum only when the student already owns them", () => {
    const empty = buildUnlockedZooState({ completionCount: 2 });
    expect(getLiveZooDestinationIds(empty)).toEqual(["meadow", "cabin", "stickers"]);

    const expanded = buildUnlockedZooState({
      completionCount: 15,
      pet: { stage: 1, species: "panda", name: "Mochi" },
    });
    expect(getLiveZooDestinationIds(expanded)).toContain("riverbank");
    expect(getLiveZooDestinationIds(expanded)).toContain("museum");
  });

  test("restores only owned friends and valid scenery placements", () => {
    const state = buildUnlockedZooState({
      completionCount: 15,
      pet: { stage: 1, species: "panda", name: "Mochi" },
    });
    const restored = applyStudentZooPreferences(state, {
      habitat_residency: { meadow: ["main-pet", "locked-friend", null, null] },
      meadow_placements: { "tempo-lantern": "friendship-nook", "not-owned": "welcome-patch" },
    });
    expect(restored.residency.meadow).toEqual(["main-pet", null, null, null]);
    expect(restored.meadowDecorations.find((item) => item.id === "tempo-lantern").placedSpotId).toBe("friendship-nook");
  });

  test("does not turn the registered review cast into live student ownership", () => {
    const state = buildUnlockedZooState({ completionCount: 15 });
    const restored = applyStudentZooPreferences(state, {
      habitat_residency: {
        meadow: ["riffin", "ringlet", "boppo", "chordillo"],
        riverbank: ["brumbo", "plinka", "puffino", "cymbi", "spirlo"],
      },
    });
    expect(restored.residency.meadow).toEqual(["riffin", null, null, null]);
    expect(restored.residency.riverbank.every((characterId) => characterId === null)).toBe(true);
  });
});

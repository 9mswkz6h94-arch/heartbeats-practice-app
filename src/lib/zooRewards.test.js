import {
  createMockMeadowDecorations,
  createMockRiverbankUnlock,
  getDecorationAtSpot,
  getMeadowDecorationStatus,
  getRiverbankStatus,
  placeMeadowDecoration,
  RAINBOW_NOTE_GARDEN_ID,
  recordMeadowDecorationPractice,
  recordRiverbankPractice,
  removeMeadowDecoration,
} from "./zooRewards";

describe("Musical Zoo decoration rewards", () => {
  test("starts with two unlocked scenery pieces and one practice reward", () => {
    const decorations = createMockMeadowDecorations();
    expect(decorations).toHaveLength(3);
    expect(decorations.filter((item) => item.unlocked)).toHaveLength(2);
    expect(getMeadowDecorationStatus(decorations[0])).toEqual({ state: "locked", label: "1 more practice step to unlock" });
  });

  test("unlocks the garden after completed practice and caps its progress", () => {
    const unlocked = recordMeadowDecorationPractice(createMockMeadowDecorations());
    const repeated = recordMeadowDecorationPractice(unlocked);
    expect(unlocked.find((item) => item.id === RAINBOW_NOTE_GARDEN_ID)).toMatchObject({ practiceCount: 2, unlocked: true });
    expect(repeated.find((item) => item.id === RAINBOW_NOTE_GARDEN_ID)).toMatchObject({ practiceCount: 2, unlocked: true });
  });

  test("blocks locked scenery and invalid spots", () => {
    const decorations = createMockMeadowDecorations();
    expect(placeMeadowDecoration(decorations, RAINBOW_NOTE_GARDEN_ID, "welcome-patch")).toBe(decorations);
    expect(placeMeadowDecoration(decorations, "tempo-lantern", "missing-spot")).toBe(decorations);
  });

  test("moves a decoration between named spots", () => {
    const decorations = createMockMeadowDecorations();
    const firstPlacement = placeMeadowDecoration(decorations, "tempo-lantern", "welcome-patch");
    const moved = placeMeadowDecoration(firstPlacement, "tempo-lantern", "friendship-nook");
    expect(getDecorationAtSpot(moved, "welcome-patch")).toBeNull();
    expect(getDecorationAtSpot(moved, "friendship-nook")).toMatchObject({ id: "tempo-lantern" });
  });

  test("returns an occupied spot's old scenery to inventory", () => {
    const decorations = createMockMeadowDecorations();
    const lanternPlaced = placeMeadowDecoration(decorations, "tempo-lantern", "melody-corner");
    const flowerPlaced = placeMeadowDecoration(lanternPlaced, "songflower-patch", "melody-corner");
    expect(getDecorationAtSpot(flowerPlaced, "melody-corner")).toMatchObject({ id: "songflower-patch" });
    expect(flowerPlaced.find((item) => item.id === "tempo-lantern").placedSpotId).toBeNull();
  });

  test("stores scenery without changing its unlock progress", () => {
    const decorations = placeMeadowDecoration(createMockMeadowDecorations(), "tempo-lantern", "welcome-patch");
    const stored = removeMeadowDecoration(decorations, "tempo-lantern");
    expect(stored.find((item) => item.id === "tempo-lantern")).toMatchObject({ unlocked: true, practiceCount: 1, placedSpotId: null });
  });
});

describe("Rhythm Riverbank habitat reward", () => {
  test("starts one completed practice step away from opening", () => {
    const riverbank = createMockRiverbankUnlock();
    expect(riverbank).toMatchObject({ practiceCount: 2, practiceGoal: 3, unlocked: false });
    expect(getRiverbankStatus(riverbank)).toEqual({ state: "locked", label: "1 more practice step to open" });
  });

  test("opens after completed practice and caps its progress", () => {
    const opened = recordRiverbankPractice(createMockRiverbankUnlock());
    const repeated = recordRiverbankPractice(opened);
    expect(opened).toMatchObject({ practiceCount: 3, unlocked: true });
    expect(repeated).toMatchObject({ practiceCount: 3, unlocked: true });
    expect(getRiverbankStatus(repeated)).toEqual({ state: "open", label: "Habitat open" });
  });
});

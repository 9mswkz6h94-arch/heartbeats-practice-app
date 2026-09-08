import {
  clearCharacterFromHabitat,
  clearHabitatSlot,
  createHabitatResidency,
  createHabitatSlots,
  findCharacterHome,
  getFilledSlotCount,
  placeCharacterInHabitat,
  placeCharacterInSlot,
  resetHabitatResidency,
} from "./habitatPlacement";

describe("habitat placement helpers", () => {
  test("creates the requested number of safe habitat spots", () => {
    expect(createHabitatSlots(3, ["riffin"])).toEqual(["riffin", null, null]);
    expect(createHabitatSlots(-2, ["riffin"])).toEqual([]);
  });

  test("places each character only once and moves it between spots", () => {
    expect(placeCharacterInSlot(["riffin", "pickles"], 1, "riffin")).toEqual([null, "riffin"]);
    expect(placeCharacterInSlot(["riffin", null], 1, "pickles")).toEqual(["riffin", "pickles"]);
  });

  test("clears one spot without disturbing the rest of the habitat", () => {
    const cleared = clearHabitatSlot(["riffin", "turtle"], 0);
    expect(cleared).toEqual([null, "turtle"]);
    expect(getFilledSlotCount(cleared)).toBe(1);
  });

  test("gives each character only one owned-habitat home", () => {
    const residency = createHabitatResidency({
      meadow: ["riffin", null],
      riverbank: ["pickles", "turtle", "fox", null],
    });

    const moved = placeCharacterInHabitat(residency, "riverbank", 3, "riffin");

    expect(moved).toEqual({
      meadow: [null, null],
      riverbank: ["pickles", "turtle", "fox", "riffin"],
    });
    expect(findCharacterHome(moved, "riffin")).toEqual({ habitatId: "riverbank", slotIndex: 3 });
  });

  test("cleans up duplicate homes when residency first loads", () => {
    expect(createHabitatResidency({
      meadow: ["riffin", "turtle"],
      riverbank: ["riffin", "pickles", "turtle", null],
    })).toEqual({
      meadow: ["riffin", "turtle"],
      riverbank: [null, "pickles", null, null],
    });
  });

  test("returns a displaced resident to the collection during a transfer", () => {
    const residency = createHabitatResidency({
      meadow: ["riffin", null],
      riverbank: ["pickles", "turtle", "fox", null],
    });

    const moved = placeCharacterInHabitat(residency, "meadow", 0, "turtle");

    expect(moved.meadow).toEqual(["turtle", null]);
    expect(moved.riverbank).toEqual(["pickles", null, "fox", null]);
    expect(findCharacterHome(moved, "riffin")).toBeNull();
  });

  test("clears one home and resets one habitat without creating duplicates", () => {
    const residency = createHabitatResidency({
      meadow: ["turtle", "riffin"],
      riverbank: ["pickles", null, "fox", null],
    });
    const cleared = clearCharacterFromHabitat(residency, "meadow", 0);
    const reset = resetHabitatResidency(cleared, "riverbank", ["pickles", "turtle", "fox"]);

    expect(cleared.meadow).toEqual([null, "riffin"]);
    expect(reset).toEqual({
      meadow: [null, "riffin"],
      riverbank: ["pickles", "turtle", "fox", null],
    });
  });
});

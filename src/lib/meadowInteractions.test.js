import {
  getMeadowInteraction,
  getMeadowPairKey,
  meadowInteractionCount,
} from "./meadowInteractions";

describe("Meadow pair interactions", () => {
  test("creates the same pair key regardless of spot order", () => {
    expect(getMeadowPairKey(["riffin", "pickles"])).toBe("pickles|riffin");
    expect(getMeadowPairKey(["pickles", "riffin"])).toBe("pickles|riffin");
  });

  test("requires two different placed friends", () => {
    expect(getMeadowPairKey(["riffin", null])).toBeNull();
    expect(getMeadowPairKey(["riffin", "riffin"])).toBeNull();
    expect(getMeadowInteraction(["riffin", null])).toBeNull();
  });

  test("provides an authored moment for every available pair", () => {
    const characterIds = ["riffin", "pickles", "turtle", "fox"];
    const pairs = characterIds.flatMap((characterId, index) => (
      characterIds.slice(index + 1).map((otherCharacterId) => [characterId, otherCharacterId])
    ));

    expect(meadowInteractionCount).toBe(6);
    expect(pairs).toHaveLength(6);
    pairs.forEach((pair) => expect(getMeadowInteraction(pair)).toEqual(expect.objectContaining({
      id: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      signal: expect.any(String),
    })));
  });
});

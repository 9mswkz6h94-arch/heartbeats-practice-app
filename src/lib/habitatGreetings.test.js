import { getHabitatGreeting } from "./habitatGreetings";
import { characterIds, getCharacter } from "./characterRegistry";

describe("gentle habitat greetings", () => {
  test("returns authored character greetings deterministically", () => {
    expect(getHabitatGreeting("riffin", 0)).toBe("Riffin strums a tiny hello.");
    expect(getHabitatGreeting("riffin", 3)).toBe("Riffin strums a tiny hello.");
    expect(getHabitatGreeting("ringlet", 1)).toBe("Ringlet listens close, then answers with a tiny chime.");
    expect(getHabitatGreeting("turtle", 1)).toBe("Turtle taps a gentle beat.");
  });

  test("keeps future characters friendly without adding scores or rewards", () => {
    expect(getHabitatGreeting("future-friend", 0)).toBe("Your friend gives you a happy little wave.");
    expect(getHabitatGreeting("future-friend", -1)).toBe("A tiny musical hello floats your way.");
  });

  test("authors a named habitat greeting for every accepted Musical Zoo friend", () => {
    characterIds.forEach((characterId) => {
      expect(getHabitatGreeting(characterId, 0)).toContain(getCharacter(characterId).name);
    });
  });
});

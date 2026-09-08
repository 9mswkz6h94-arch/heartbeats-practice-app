import { getPracticeCompanionReaction, foundingFriendReactionIds } from "./companionReactions";
import { characterIds, getCharacterReaction } from "./characterRegistry";

describe("practice companion reactions", () => {
  test("keeps Riffin on the approved character registry voice", () => {
    expect(getPracticeCompanionReaction("riffin", "step_complete_generic", 1))
      .toBe(getCharacterReaction("riffin", "step_complete_generic", 1));
  });

  test("keeps Ringlet on the accepted response-only character voice", () => {
    expect(getPracticeCompanionReaction("ringlet", "step_complete_generic", 1))
      .toBe(getCharacterReaction("ringlet", "step_complete_generic", 1));
    expect(getPracticeCompanionReaction("ringlet", "skip_accepted", 2))
      .toBe("That card can wait.");
  });

  test("routes the full Musical Zoo cast through their response-only voices", () => {
    characterIds.forEach((companionId) => {
      expect(getPracticeCompanionReaction(companionId, "step_complete_generic", 1))
        .toBe(getCharacterReaction(companionId, "step_complete_generic", 1));
      expect(getPracticeCompanionReaction(companionId, "skip_accepted", 2))
        .toBe(getCharacterReaction(companionId, "skip_accepted", 2));
      expect(getPracticeCompanionReaction(companionId, "session_welcome", 0)).toBeNull();
    });
  });

  test("provides complete and save-for-later responses for every Founding Friend", () => {
    foundingFriendReactionIds.forEach((companionId) => {
      expect(getPracticeCompanionReaction(companionId, "step_complete_generic", 0)).toBeTruthy();
      expect(getPracticeCompanionReaction(companionId, "skip_accepted", 0)).toBeTruthy();
    });
  });

  test("cycles deterministically through a companion's response set", () => {
    expect(getPracticeCompanionReaction("pickles", "step_complete_generic", 0))
      .toBe(getPracticeCompanionReaction("pickles", "step_complete_generic", 3));
    expect(getPracticeCompanionReaction("turtle", "skip_accepted", -1))
      .toBe(getPracticeCompanionReaction("turtle", "skip_accepted", 1));
  });

  test("uses a shame-free fallback for future unlocked companions", () => {
    expect(getPracticeCompanionReaction("future-friend", "skip_accepted", 0))
      .toBe("Saved for another day.");
    expect(getPracticeCompanionReaction("future-friend", "unknown-intent", 0)).toBeNull();
  });
});

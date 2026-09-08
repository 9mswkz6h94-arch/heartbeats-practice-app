import { getCharacterReaction } from "./characterRegistry";

const FOUNDING_FRIEND_REACTIONS = Object.freeze({
  pickles: Object.freeze({
    step_complete_generic: Object.freeze([
      "Another practice step is complete!",
      "That card is finished. Nice work!",
      "You kept going and finished this one.",
    ]),
    skip_accepted: Object.freeze([
      "Saved for another day.",
      "We can come back when it fits.",
      "This one can wait. You’re still moving forward.",
    ]),
  }),
  turtle: Object.freeze({
    step_complete_generic: Object.freeze([
      "Slow and steady—another step complete.",
      "You finished that card, one step at a time.",
      "Another practice step is safely done.",
    ]),
    skip_accepted: Object.freeze([
      "We can take our time and return later.",
      "A pause is part of practice. Saved for later.",
      "This card will wait until another day.",
    ]),
  }),
  fox: Object.freeze({
    step_complete_generic: Object.freeze([
      "You finished that step. High five!",
      "Another card complete—nice follow-through!",
      "That practice step is in the books.",
    ]),
    skip_accepted: Object.freeze([
      "Good choice. We can visit this one later.",
      "Saved for later. Today’s plan can flex.",
      "That card can wait. Keep choosing what fits.",
    ]),
  }),
});

const FALLBACK_REACTIONS = Object.freeze({
  step_complete_generic: Object.freeze([
    "That practice step is complete.",
    "You finished another practice card.",
  ]),
  skip_accepted: Object.freeze([
    "Saved for another day.",
    "We can come back to that one later.",
  ]),
});

function chooseReaction(reactions, variation) {
  if (!reactions?.length) return null;
  const safeVariation = Number.isFinite(variation) ? Math.abs(Math.trunc(variation)) : 0;
  return reactions[safeVariation % reactions.length];
}

export function getPracticeCompanionReaction(companionId, intent, variation = 0) {
  const registeredReaction = getCharacterReaction(companionId, intent, variation);
  if (registeredReaction) return registeredReaction;

  const reactions = FOUNDING_FRIEND_REACTIONS[companionId]?.[intent]
    || FALLBACK_REACTIONS[intent];
  return chooseReaction(reactions, variation);
}

export const foundingFriendReactionIds = Object.freeze(Object.keys(FOUNDING_FRIEND_REACTIONS));

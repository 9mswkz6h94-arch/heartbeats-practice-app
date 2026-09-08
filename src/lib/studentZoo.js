import { CREATURE_STAGES, speciesInfo } from "./petSpecies";
import { MAIN_PET_SPECIES, stageInfo } from "./petStages";
import { createHabitatResidency } from "./habitatPlacement";
import { MEADOW_DECORATION_SPOTS, RAINBOW_NOTE_GARDEN_ID } from "./zooRewards";

const SCENERY_UNLOCKS = Object.freeze([
  Object.freeze({
    id: "tempo-lantern",
    name: "Tempo Lantern",
    icon: "🏮",
    description: "A warm light for slow, steady Meadow evenings.",
    at: 1,
  }),
  Object.freeze({
    id: "songflower-patch",
    name: "Songflower Patch",
    icon: "🌻",
    description: "Sunny flowers that make a cheerful place to gather.",
    at: 5,
  }),
  Object.freeze({
    id: RAINBOW_NOTE_GARDEN_ID,
    name: "Rainbow Note Garden",
    icon: "🌈",
    description: "A little rainbow garden where music notes grow between practice visits.",
    at: 10,
  }),
]);

function creatureStageName(stage) {
  return CREATURE_STAGES[stage]?.name || "Grown";
}

export function buildOwnedZooFriends(pet, creatures = []) {
  const friends = [];

  if (pet && Number(pet.stage) > 0) {
    const info = stageInfo(Number(pet.stage), pet.species);
    const speciesLabel = MAIN_PET_SPECIES[pet.species]?.label || "Practice pet";
    friends.push({
      id: "main-pet",
      emoji: info.emoji,
      name: pet.name || speciesLabel,
      stage: info.name,
      companionType: "Practice pet",
    });
  }

  creatures
    .filter((creature) => Number(creature.stage) > 0)
    .forEach((creature) => {
      const info = speciesInfo(creature.species);
      friends.push({
        id: creature.id,
        emoji: info.emoji,
        name: info.name,
        stage: creatureStageName(Number(creature.stage)),
        companionType: "Zoo friend",
      });
    });

  return friends;
}

export function buildUnlockedZooState({ completionCount = 0, pet = null, creatures = [] } = {}) {
  const safeCount = Math.max(0, Number(completionCount) || 0);
  const foundingFriends = buildOwnedZooFriends(pet, creatures);
  const friendIds = foundingFriends.map((friend) => friend.id);

  return {
    foundingFriends,
    meadowDecorations: SCENERY_UNLOCKS
      .filter((reward) => safeCount >= reward.at)
      .map((reward, index) => ({
        ...reward,
        practiceCount: reward.at,
        practiceGoal: reward.at,
        unlocked: true,
        placedSpotId: index < 3
          ? ["welcome-patch", "melody-corner", "friendship-nook"][index]
          : null,
      })),
    riverbankUnlock: {
      id: "rhythm-riverbank",
      name: "Rhythm Riverbank",
      unlocked: safeCount >= 15,
      practiceCount: safeCount,
      practiceGoal: 15,
    },
    residency: {
      meadow: ["riffin", friendIds[0] || null, friendIds[1] || null, null],
      riverbank: [friendIds[2] || null, friendIds[3] || null, friendIds[4] || null, null],
    },
  };
}

export function getLiveZooDestinationIds(zooState) {
  const ids = ["meadow", "cabin", "stickers"];
  if (zooState?.riverbankUnlock?.unlocked) ids.unshift("riverbank");
  if (zooState?.foundingFriends?.length) ids.push("museum");
  return ids;
}

export function applyStudentZooPreferences(zooState, preferences = {}) {
  if (!zooState) return zooState;
  const allowedIds = new Set(["riffin", ...zooState.foundingFriends.map((friend) => friend.id)]);
  const proposedResidency = preferences.habitat_residency || {};
  const sanitizedResidency = Object.fromEntries(
    Object.entries(zooState.residency).map(([habitatId, defaultSlots]) => {
      const proposedSlots = proposedResidency[habitatId];
      if (!Array.isArray(proposedSlots)) return [habitatId, defaultSlots];
      return [
        habitatId,
        defaultSlots.map((_, index) => (
          allowedIds.has(proposedSlots[index]) ? proposedSlots[index] : null
        )),
      ];
    })
  );
  const residency = createHabitatResidency(sanitizedResidency);

  const validSpots = new Set(MEADOW_DECORATION_SPOTS.map((spot) => spot.id));
  const hasSavedPlacements = Object.prototype.hasOwnProperty.call(preferences, "meadow_placements");
  const placements = preferences.meadow_placements || {};
  const usedSpots = new Set();
  const meadowDecorations = !hasSavedPlacements ? zooState.meadowDecorations : zooState.meadowDecorations.map((decoration) => {
    const proposedSpot = placements[decoration.id];
    if (!validSpots.has(proposedSpot) || usedSpots.has(proposedSpot)) {
      return { ...decoration, placedSpotId: null };
    }
    usedSpots.add(proposedSpot);
    return { ...decoration, placedSpotId: proposedSpot };
  });

  return { ...zooState, residency, meadowDecorations };
}

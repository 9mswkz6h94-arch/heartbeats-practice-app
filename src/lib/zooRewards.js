export const RAINBOW_NOTE_GARDEN_ID = "rainbow-note-garden";
export const RHYTHM_RIVERBANK_ID = "rhythm-riverbank";

export const MEADOW_DECORATION_SPOTS = Object.freeze([
  Object.freeze({ id: "welcome-patch", name: "Welcome Patch", description: "Beside the Meadow path" }),
  Object.freeze({ id: "melody-corner", name: "Melody Corner", description: "Near the music-making" }),
  Object.freeze({ id: "friendship-nook", name: "Friendship Nook", description: "Room for visiting friends" }),
]);

export function createMockMeadowDecorations() {
  return [
    {
      id: RAINBOW_NOTE_GARDEN_ID,
      name: "Rainbow Note Garden",
      icon: "🌈",
      description: "A little rainbow garden where music notes grow between practice visits.",
      practiceCount: 1,
      practiceGoal: 2,
      unlocked: false,
      placedSpotId: null,
    },
    {
      id: "tempo-lantern",
      name: "Tempo Lantern",
      icon: "🏮",
      description: "A warm light for slow, steady Meadow evenings.",
      practiceCount: 1,
      practiceGoal: 1,
      unlocked: true,
      placedSpotId: null,
    },
    {
      id: "songflower-patch",
      name: "Songflower Patch",
      icon: "🌻",
      description: "Sunny flowers that make a cheerful place to gather.",
      practiceCount: 1,
      practiceGoal: 1,
      unlocked: true,
      placedSpotId: null,
    },
  ];
}

export function createMockRiverbankUnlock() {
  return {
    id: RHYTHM_RIVERBANK_ID,
    name: "Rhythm Riverbank",
    icon: "🌊",
    practiceCount: 2,
    practiceGoal: 3,
    unlocked: false,
  };
}

export function recordMeadowDecorationPractice(decorations, decorationId = RAINBOW_NOTE_GARDEN_ID) {
  if (!Array.isArray(decorations)) return decorations;
  return decorations.map((decoration) => {
    if (decoration.id !== decorationId) return decoration;
    const practiceCount = Math.min(decoration.practiceGoal, decoration.practiceCount + 1);
    return {
      ...decoration,
      practiceCount,
      unlocked: decoration.unlocked || practiceCount >= decoration.practiceGoal,
    };
  });
}

export function recordRiverbankPractice(riverbankUnlock) {
  if (!riverbankUnlock) return riverbankUnlock;
  const practiceCount = Math.min(riverbankUnlock.practiceGoal, riverbankUnlock.practiceCount + 1);
  return {
    ...riverbankUnlock,
    practiceCount,
    unlocked: riverbankUnlock.unlocked || practiceCount >= riverbankUnlock.practiceGoal,
  };
}

export function placeMeadowDecoration(decorations, decorationId, spotId) {
  if (!Array.isArray(decorations) || !MEADOW_DECORATION_SPOTS.some((spot) => spot.id === spotId)) return decorations;
  const decoration = decorations.find((item) => item.id === decorationId);
  if (!decoration?.unlocked || decoration.placedSpotId === spotId) return decorations;

  return decorations.map((item) => {
    if (item.id === decorationId) return { ...item, placedSpotId: spotId };
    if (item.placedSpotId === spotId) return { ...item, placedSpotId: null };
    return item;
  });
}

export function removeMeadowDecoration(decorations, decorationId) {
  if (!Array.isArray(decorations)) return decorations;
  const decoration = decorations.find((item) => item.id === decorationId);
  if (!decoration?.placedSpotId) return decorations;
  return decorations.map((item) => (
    item.id === decorationId ? { ...item, placedSpotId: null } : item
  ));
}

export function getMeadowDecorationStatus(decoration) {
  if (!decoration) return null;
  if (decoration.placedSpotId) return { state: "placed", label: `${decoration.name} placed` };
  if (decoration.unlocked) return { state: "ready", label: "New decoration ready" };
  const remaining = Math.max(0, decoration.practiceGoal - decoration.practiceCount);
  return {
    state: "locked",
    label: `${remaining} more practice step${remaining === 1 ? "" : "s"} to unlock`,
  };
}

export function getRiverbankStatus(riverbankUnlock) {
  if (!riverbankUnlock) return null;
  if (riverbankUnlock.unlocked) return { state: "open", label: "Habitat open" };
  const remaining = Math.max(0, riverbankUnlock.practiceGoal - riverbankUnlock.practiceCount);
  return {
    state: "locked",
    label: `${remaining} more practice step${remaining === 1 ? "" : "s"} to open`,
  };
}

export function getDecorationAtSpot(decorations, spotId) {
  return decorations?.find((decoration) => decoration.placedSpotId === spotId) || null;
}

const meadowInteractions = Object.freeze({
  "pickles|riffin": Object.freeze({
    id: "riffin-pickles-call-answer",
    title: "Call and answer",
    description: "Riffin plays a tiny phrase. The dragon answers with a friendly tail tap.",
    signal: "♪ · tap · ♫",
  }),
  "riffin|turtle": Object.freeze({
    id: "riffin-turtle-steady-duet",
    title: "Slow-and-steady duet",
    description: "Riffin strums a soft pattern while Turtle keeps a calm pulse.",
    signal: "♪ · step · ♪",
  }),
  "fox|riffin": Object.freeze({
    id: "riffin-fox-meadow-echo",
    title: "Meadow echo",
    description: "Riffin sends a tune across the grass. Fox answers with a quick wave.",
    signal: "♫ · wave · ♫",
  }),
  "pickles|turtle": Object.freeze({
    id: "pickles-turtle-tiny-parade",
    title: "Tiny parade",
    description: "The dragon takes one careful step. Turtle follows with another.",
    signal: "step · step · ♪",
  }),
  "fox|pickles": Object.freeze({
    id: "pickles-fox-shared-spotlight",
    title: "Shared spotlight",
    description: "The dragon and Fox take turns in the warm meadow light.",
    signal: "★ · ♪ · ★",
  }),
  "fox|turtle": Object.freeze({
    id: "turtle-fox-hello-neighbor",
    title: "Hello, neighbor",
    description: "Turtle and Fox trade a small wave, then settle back in.",
    signal: "wave · ♥ · wave",
  }),
});

export function getMeadowPairKey(characterIds) {
  if (!Array.isArray(characterIds)) return null;
  const uniqueCharacterIds = [...new Set(characterIds.filter(Boolean))];
  return uniqueCharacterIds.length === 2 ? uniqueCharacterIds.sort().join("|") : null;
}

export function getMeadowInteraction(characterIds) {
  const pairKey = getMeadowPairKey(characterIds);
  return pairKey ? meadowInteractions[pairKey] || null : null;
}

export const meadowInteractionCount = Object.keys(meadowInteractions).length;

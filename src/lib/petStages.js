// Growth, never survival — the pet only ever moves forward. No health,
// no decay, no missed-day penalty. A quiet week just means it naps.
export const PET_STAGES = [
  { stage: 0, emoji: "🥚", name: "Egg", xpToNext: 5, blurb: "Keep practicing to help it hatch!" },
  { stage: 1, emoji: "🐣", name: "Hatchling", xpToNext: 20, blurb: "It hatched! Still finding its feet." },
  { stage: 2, emoji: "🐤", name: "Chick", xpToNext: 50, blurb: "Growing fast — every practice helps." },
  { stage: 3, emoji: "🐥", name: "Fledgling", xpToNext: 100, blurb: "Almost fully grown!" },
  { stage: 4, emoji: "🐓", name: "Full Grown", xpToNext: null, blurb: "Fully grown — practicing now just makes it stronger." },
];

export function stageInfo(stage) {
  return PET_STAGES[Math.min(stage, PET_STAGES.length - 1)] || PET_STAGES[0];
}

export function progressToNext(xp, stage) {
  const info = stageInfo(stage);
  if (info.xpToNext == null) return 1;
  const prevThreshold = stage === 0 ? 0 : PET_STAGES[stage - 1]?.xpToNext ?? 0;
  const span = info.xpToNext - prevThreshold;
  return Math.max(0, Math.min(1, (xp - prevThreshold) / span));
}

import { SPECIES as COLLECTION_SPECIES } from "./petSpecies";

// Growth, never survival — the pet only ever moves forward. No health,
// no decay, no missed-day penalty. A quiet week just means it naps.
//
// Chicken keeps its original hand-picked 5-emoji lifecycle (the default
// everyone already knows). Every other species reuses the single emoji
// from the collection roster — most exotic animals don't have distinct
// baby/adult emoji in Unicode either — and starts as a plain egg until it
// hatches, same as the collection creatures.
const CHICKEN_STAGES = [
  { emoji: "🥚", name: "Egg", xpToNext: 5, blurb: "Keep practicing to help it hatch!" },
  { emoji: "🐣", name: "Hatchling", xpToNext: 20, blurb: "It hatched! Still finding its feet." },
  { emoji: "🐤", name: "Chick", xpToNext: 50, blurb: "Growing fast — every practice helps." },
  { emoji: "🐥", name: "Fledgling", xpToNext: 100, blurb: "Almost fully grown!" },
  { emoji: "🐓", name: "Full Grown", xpToNext: null, blurb: "Fully grown — practicing now just makes it stronger." },
];

const GENERIC_STAGE_TEMPLATE = [
  { name: "Egg", xpToNext: 5, blurb: "Keep practicing to help it hatch!" },
  { name: "Baby", xpToNext: 20, blurb: "It hatched! Still finding its feet." },
  { name: "Young", xpToNext: 50, blurb: "Growing fast — every practice helps." },
  { name: "Growing", xpToNext: 100, blurb: "Almost fully grown!" },
  { name: "Full Grown", xpToNext: null, blurb: "Fully grown — practicing now just makes it stronger." },
];

function genericStages(emoji) {
  return GENERIC_STAGE_TEMPLATE.map((s, i) => ({ ...s, emoji: i === 0 ? "🥚" : emoji }));
}

export const MAIN_PET_SPECIES = {
  chicken: { label: "Chicken", stages: CHICKEN_STAGES },
  ...Object.fromEntries(
    Object.entries(COLLECTION_SPECIES).map(([key, info]) => [
      key,
      { label: info.name, stages: genericStages(info.emoji) },
    ])
  ),
};

// One option per species for the one-time picker — previewed with its
// post-hatch emoji (stage 1) rather than the shared 🥚, so the choices are
// actually distinguishable before anyone's hatched anything.
export const SPECIES_CHOICES = Object.entries(MAIN_PET_SPECIES).map(([key, data]) => ({
  key,
  label: data.label,
  previewEmoji: data.stages[1].emoji,
}));

function speciesData(species) {
  return MAIN_PET_SPECIES[species] || MAIN_PET_SPECIES.chicken;
}

export function stageInfo(stage, species = "chicken") {
  const data = speciesData(species);
  return data.stages[Math.min(stage, data.stages.length - 1)] || data.stages[0];
}

export function progressToNext(xp, stage, species = "chicken") {
  const data = speciesData(species);
  const info = stageInfo(stage, species);
  if (info.xpToNext == null) return 1;
  const prevThreshold = stage === 0 ? 0 : data.stages[stage - 1]?.xpToNext ?? 0;
  const span = info.xpToNext - prevThreshold;
  return Math.max(0, Math.min(1, (xp - prevThreshold) / span));
}

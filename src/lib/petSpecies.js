// Species roster for the pet collection (SQL_MIGRATIONS/013_pet_collection.sql).
// One emoji per species — life stage is communicated through size/glow in
// the UI rather than hunting for baby-animal emoji variants that mostly
// don't exist in Unicode. `emoji` is the closest good match available;
// capybara has no dedicated emoji yet, so it borrows beaver.
export const SPECIES = {
  dragon: { name: "Dragon", emoji: "🐉" },
  capybara: { name: "Capybara", emoji: "🦫" },
  giraffe: { name: "Giraffe", emoji: "🦒" },
  fox: { name: "Fox", emoji: "🦊" },
  panda: { name: "Panda", emoji: "🐼" },
  owl: { name: "Owl", emoji: "🦉" },
  koala: { name: "Koala", emoji: "🐨" },
  bunny: { name: "Bunny", emoji: "🐰" },
  cat: { name: "Cat", emoji: "🐱" },
  dolphin: { name: "Dolphin", emoji: "🐬" },
};

export const CREATURE_STAGES = {
  1: { name: "Baby" },
  2: { name: "Grown" },
  3: { name: "Elder" },
};

export function speciesInfo(key) {
  return SPECIES[key] || { name: key, emoji: "❓" };
}

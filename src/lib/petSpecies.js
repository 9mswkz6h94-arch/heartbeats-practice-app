// Species roster for the pet collection (SQL_MIGRATIONS/013_pet_collection.sql,
// extended in 015_pet_species_expansion.sql). One emoji per species — life
// stage is communicated through size/glow in the UI rather than hunting for
// baby-animal emoji variants that mostly don't exist in Unicode. `emoji` is
// the closest good match available; capybara and cheetah have no dedicated
// emoji yet, so they borrow beaver and leopard respectively.
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
  cheetah: { name: "Cheetah", emoji: "🐆" },
  robot: { name: "Robot", emoji: "🤖" },
  poop: { name: "Poop", emoji: "💩" },
};

export const CREATURE_STAGES = {
  1: { name: "Baby" },
  2: { name: "Grown" },
  3: { name: "Elder" },
};

export function speciesInfo(key) {
  return SPECIES[key] || { name: key, emoji: "❓" };
}

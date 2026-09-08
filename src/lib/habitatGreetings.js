const greetingsByCharacter = Object.freeze({
  riffin: Object.freeze([
    "Riffin strums a tiny hello.",
    "Riffin answers with a bright little riff.",
    "Riffin gives one brave, bouncy note.",
  ]),
  boppo: Object.freeze([
    "Boppo taps a soft hello.",
    "Boppo answers with one friendly hop.",
    "Boppo's drum belly keeps a tiny beat.",
  ]),
  chordillo: Object.freeze([
    "Chordillo hums a warm hello.",
    "Chordillo's shell answers with a gentle chord.",
    "Chordillo gives a cozy little wave.",
  ]),
  ringlet: Object.freeze([
    "Ringlet tips one ear and chimes hello.",
    "Ringlet listens close, then answers with a tiny chime.",
    "Ringlet gives one calm, friendly wave.",
  ]),
  brumbo: Object.freeze([
    "Brumbo's trumpet trunk whispers hello.",
    "Brumbo makes room for one bright note.",
    "Brumbo gives a gentle, wide-eared wave.",
  ]),
  plinka: Object.freeze([
    "Plinka plinks a curious hello.",
    "Plinka's tine-spines sparkle with one new idea.",
    "Plinka gives a playful little wave.",
  ]),
  puffino: Object.freeze([
    "Puffino sways a colorful hello.",
    "Puffino's bellows breathe one friendly note.",
    "Puffino opens one wing to say hello.",
  ]),
  cymbi: Object.freeze([
    "Cymbi gives a bright, careful hello.",
    "Cymbi's cymbal wings shimmer softly.",
    "Cymbi pauses, then gives a friendly wave.",
  ]),
  spirlo: Object.freeze([
    "Spirlo curls a patient hello.",
    "Spirlo's horn shell hums one gentle note.",
    "Spirlo takes the long way over to wave.",
  ]),
  pickles: Object.freeze([
    "Pickles gives a happy little hop.",
    "Pickles wiggles hello.",
    "Pickles answers with a playful bounce.",
  ]),
  turtle: Object.freeze([
    "Turtle gives a slow, friendly wave.",
    "Turtle taps a gentle beat.",
    "Turtle peeks up and says hello.",
  ]),
  fox: Object.freeze([
    "Fox flicks a cheerful hello.",
    "Fox answers with a quick little hop.",
    "Fox gives a bright, friendly wave.",
  ]),
});

const fallbackGreetings = Object.freeze([
  "Your friend gives you a happy little wave.",
  "A tiny musical hello floats your way.",
  "Your friend answers with a cheerful hop.",
]);

export function getHabitatGreeting(characterId, variation = 0) {
  const greetings = greetingsByCharacter[characterId] || fallbackGreetings;
  const safeVariation = Number.isFinite(variation) ? Math.abs(Math.trunc(variation)) : 0;
  return greetings[safeVariation % greetings.length];
}

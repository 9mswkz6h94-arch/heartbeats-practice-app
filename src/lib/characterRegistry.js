const PURPOSE_LABELS = Object.freeze({
  celebrate: "Celebrate",
  encourage: "Encourage",
  connect: "Connect",
});

function sticker(characterId, id, phrase, description, alt) {
  return Object.freeze({
    id,
    purpose: PURPOSE_LABELS[id],
    phrase,
    description,
    image: `/characters/${characterId}/sticker-${id}-768.png`,
    alt,
    status: "accepted-art-v2",
  });
}

function freezeReactions(reactions) {
  return Object.freeze(Object.fromEntries(
    Object.entries(reactions).map(([intent, lines]) => [intent, Object.freeze(lines)]),
  ));
}

function characterAssets(id, stickers) {
  return Object.freeze({
    zooSmall: Object.freeze({
      image: `/characters/${id}/roaming-32.png`,
      nativeSize: 32,
      interpretation: "8-bit roaming sprite",
    }),
    companionMedium: Object.freeze({
      image: `/characters/${id}/companion-64.png`,
      nativeSize: 64,
      interpretation: "expressive interactive companion",
    }),
    stickersLarge: Object.freeze({
      targetMinimumSize: 768,
      interpretation: "full-art sticker illustration",
      status: "accepted-art-v2",
      items: stickers,
    }),
  });
}

function createCharacter(spec) {
  const stickers = Object.freeze(Object.entries(spec.stickerCopy).map(([id, copy]) => (
    sticker(spec.id, id, copy.phrase, copy.description, copy.alt)
  )));
  const assets = characterAssets(spec.id, stickers);

  return Object.freeze({
    id: spec.id,
    name: spec.name,
    animal: spec.animal,
    instrument: spec.instrument,
    role: spec.role,
    virtue: spec.virtue,
    introduction: spec.introduction,
    assets,
    image: assets.companionMedium.image,
    companionImage: assets.companionMedium.image,
    roamingImage: assets.zooSmall.image,
    stickers,
    imageAlt: spec.imageAlt,
    artVersion: 2,
    sourceVersions: Object.freeze(spec.sourceVersions),
    responseVersion: 1,
    voiceVersion: spec.voiceVersion || 1,
    reactions: freezeReactions(spec.reactions),
  });
}

const CHARACTER_SPECS = Object.freeze([
  {
    id: "riffin",
    name: "Riffin",
    animal: "Fox",
    instrument: "Acoustic-guitar belly and curved neck-tail",
    role: "Melody starter",
    virtue: "Brave first attempts",
    introduction: "Riffin follows every new melody and loves the brave sound of a first try.",
    imageAlt: "Riffin, a friendly fox with a round guitar belly and curved guitar-neck tail.",
    sourceVersions: { companionMaster: 2, habitatSource: 2, stickerSheetSource: 2 },
    voiceVersion: 2,
    stickerCopy: {
      celebrate: { phrase: "Big riff!", description: "A bright celebration for making music and finishing the work.", alt: "Riffin celebrates with one paw raised, with the guitar belly and curved tail-neck visible." },
      encourage: { phrase: "One note at a time", description: "Calm company for a small try or a tricky musical moment.", alt: "Riffin offers calm encouragement with the guitar belly and curved tail-neck visible." },
      connect: { phrase: "Practice high five", description: "A friendly way to say that music can be shared.", alt: "Riffin offers a friendly practice high five with the curved tail-neck visible." },
    },
    reactions: {
      step_complete_generic: ["Nice! That card is done.", "The melody keeps growing.", "That was a brave try."],
      skip_accepted: ["Saved for another day.", "We can come back to that one.", "Good choice. That one can rest."],
      session_complete: ["Today’s practice is complete!", "Every card is done. Big riff!", "Today’s melody is complete!"],
      listening_started: ["I’ll dance while you play!", "My ears are ready!", "Let’s make some sound!"],
    },
  },
  {
    id: "boppo",
    name: "Boppo",
    animal: "Frog",
    instrument: "Hand-drum belly",
    role: "Rhythm starter",
    virtue: "Steady persistence",
    introduction: "Boppo keeps a comfortable beat and finds a friendly hop for every rhythm.",
    imageAlt: "Boppo, a friendly green frog with a round hand-drum belly.",
    sourceVersions: { companionMaster: 1, habitatSource: 1, stickerSheetSource: 1 },
    stickerCopy: {
      celebrate: { phrase: "Beat complete!", description: "A joyful hop for a finished piece of practice.", alt: "Boppo celebrates with raised frog arms and a round drum belly." },
      encourage: { phrase: "Steady as you go", description: "A gentle beat for taking practice one step at a time.", alt: "Boppo offers steady encouragement with one hand on the drum belly." },
      connect: { phrase: "Tap together", description: "An open-armed invitation to share a friendly rhythm.", alt: "Boppo reaches out to share a friendly rhythm." },
    },
    reactions: {
      step_complete_generic: ["That beat is complete.", "Steady work—card complete.", "One more rhythm is finished."],
      skip_accepted: ["Saved for another beat.", "That rhythm can wait.", "We can tap it another day."],
      session_complete: ["Today’s beat is complete!", "Every card found its rhythm.", "Practice finished with a happy hop!"],
      listening_started: ["I’ll keep a gentle beat!", "My drum belly is listening.", "Let’s hear your rhythm!"],
    },
  },
  {
    id: "chordillo",
    name: "Chordillo",
    animal: "Armadillo",
    instrument: "Segmented chord shell",
    role: "Harmony starter",
    virtue: "Building sounds together",
    introduction: "Chordillo hears how neighboring sounds can fit together inside one warm chord.",
    imageAlt: "Chordillo, a friendly purple armadillo with a segmented musical chord shell.",
    sourceVersions: { companionMaster: 1, habitatSource: 1, stickerSheetSource: 1 },
    stickerCopy: {
      celebrate: { phrase: "Chords together!", description: "A bright harmony celebration for completed work.", alt: "Chordillo celebrates with the segmented chord shell clearly visible." },
      encourage: { phrase: "Build it gently", description: "A calm reminder that sounds can be added one at a time.", alt: "Chordillo offers patient encouragement beside the musical chord shell." },
      connect: { phrase: "Sounds belong together", description: "A welcoming gesture for making music alongside someone else.", alt: "Chordillo reaches out in a friendly harmony gesture." },
    },
    reactions: {
      step_complete_generic: ["That sound is in place.", "Another part joins the whole.", "That card is complete."],
      skip_accepted: ["That part can wait.", "Saved for another day.", "There’s room for it later."],
      session_complete: ["Today’s harmony is complete!", "Every part found its place.", "All the cards fit together!"],
      listening_started: ["I’ll listen for the whole sound!", "My chord shell is ready.", "Let’s hear the parts together!"],
    },
  },
  {
    id: "ringlet",
    name: "Ringlet",
    animal: "Rabbit",
    instrument: "Hand-bell torso",
    role: "Listening friend",
    virtue: "Careful attention",
    introduction: "Ringlet tips one ear toward every new sound, then answers with one calm little chime.",
    imageAlt: "Ringlet, a friendly periwinkle rabbit with a flared hand-bell body.",
    sourceVersions: { companionMaster: 2, habitatSource: 2, stickerSheetSource: 2 },
    stickerCopy: {
      celebrate: { phrase: "Bright chime!", description: "A joyful little chime for finishing a piece of practice.", alt: "Ringlet celebrates with one paw raised and a warm hand-bell body." },
      encourage: { phrase: "Take your time", description: "Quiet company for listening carefully and trying again.", alt: "Ringlet listens closely and offers calm encouragement." },
      connect: { phrase: "Listen together", description: "A welcoming invitation to share one calm musical moment.", alt: "Ringlet reaches out with a welcoming gesture to listen together." },
    },
    reactions: {
      step_complete_generic: ["Nice! That card is done.", "Good noticing! That step is complete.", "You listened all the way through."],
      skip_accepted: ["Saved for another day.", "We can come back to that one.", "That card can wait."],
      session_complete: ["Today’s practice is complete!", "Every card is complete. Well heard!", "Today’s listening is complete!"],
      listening_started: ["I’ll listen closely while you play!", "My ears are ready!", "Let’s hear something together!"],
    },
  },
  {
    id: "brumbo",
    name: "Brumbo",
    animal: "Elephant",
    instrument: "Trumpet-bell trunk",
    role: "Dynamics friend",
    virtue: "Gentle control",
    introduction: "Brumbo knows that big sounds and tiny sounds both deserve room.",
    imageAlt: "Brumbo, a friendly teal elephant whose curled trunk opens into a trumpet bell.",
    sourceVersions: { companionMaster: 1, habitatSource: 1, stickerSheetSource: 1 },
    stickerCopy: {
      celebrate: { phrase: "Big or tiny!", description: "A roomy celebration for every shape a finished sound can take.", alt: "Brumbo celebrates with a raised foot and trumpet-bell trunk." },
      encourage: { phrase: "Make room for sound", description: "A gentle pause that welcomes both soft and full sounds.", alt: "Brumbo offers calm encouragement with the trumpet-bell trunk lowered gently." },
      connect: { phrase: "Sound has space", description: "An open gesture that makes room for another musician.", alt: "Brumbo reaches out with an open, welcoming gesture." },
    },
    reactions: {
      step_complete_generic: ["That card has room to ring.", "A full little finish.", "That practice step is complete."],
      skip_accepted: ["We’ll leave room for later.", "Saved for another day.", "That sound can wait."],
      session_complete: ["Today’s sounds filled the room!", "Every card is complete.", "Practice ended with room to breathe."],
      listening_started: ["I’ll make room for your sound!", "My trumpet trunk is listening.", "Soft or full, I’m ready!"],
    },
  },
  {
    id: "plinka",
    name: "Plinka",
    animal: "Hedgehog",
    instrument: "Graded kalimba tine-spines",
    role: "Improvisation friend",
    virtue: "Playful curiosity",
    introduction: "Plinka enjoys finding one more shape a sound can make.",
    imageAlt: "Plinka, a friendly pink hedgehog whose graded back spines are kalimba tines.",
    sourceVersions: { companionMaster: 2, habitatSource: 2, stickerSheetSource: 2 },
    stickerCopy: {
      celebrate: { phrase: "Fresh idea!", description: "A sparkling celebration for a finished musical experiment.", alt: "Plinka celebrates with one paw raised and kalimba tine-spines fanned behind her." },
      encourage: { phrase: "Try your own shape", description: "Friendly support for exploring sound without needing one right answer.", alt: "Plinka offers curious encouragement with softly rounded tine-spines." },
      connect: { phrase: "Plink hello!", description: "An open-pawed invitation to share a new musical idea.", alt: "Plinka reaches out in a friendly hello with tine-spines visible." },
    },
    reactions: {
      step_complete_generic: ["That idea found a shape.", "A curious little finish!", "That card is complete."],
      skip_accepted: ["That idea can wait.", "Saved for another day.", "There are more shapes later."],
      session_complete: ["Today’s ideas are complete!", "Every card found a shape.", "Practice finished with a new plink!"],
      listening_started: ["I’m curious what you’ll play!", "My tine-spines are listening.", "Let’s hear a new shape!"],
    },
  },
  {
    id: "puffino",
    name: "Puffino",
    animal: "Puffin",
    instrument: "Horizontal accordion torso",
    role: "Expression friend",
    virtue: "Personal choice",
    introduction: "Puffino likes hearing familiar notes take on a musician’s own shape.",
    imageAlt: "Puffino, a friendly blue puffin with a horizontal accordion across the torso.",
    sourceVersions: { companionMaster: 1, habitatSource: 1, stickerSheetSource: 2 },
    stickerCopy: {
      celebrate: { phrase: "What a shape!", description: "A colorful celebration for completing practice in your own way.", alt: "Puffino celebrates with one wing raised and the horizontal accordion torso visible." },
      encourage: { phrase: "Your way counts", description: "Calm support for making a musical choice and seeing where it goes.", alt: "Puffino offers warm encouragement with wings resting beside the accordion torso." },
      connect: { phrase: "Sway together", description: "A friendly wing-out gesture for sharing musical expression.", alt: "Puffino opens one wing in a welcoming shared-music gesture." },
    },
    reactions: {
      step_complete_generic: ["That sound took your shape.", "A colorful little finish!", "That card is complete."],
      skip_accepted: ["Your plan can change.", "Saved for another day.", "That shape can wait."],
      session_complete: ["Today’s musical shapes are complete!", "Every card had its own color.", "Practice finished in your own way!"],
      listening_started: ["I’ll sway while you play!", "My accordion is listening.", "Let’s hear your musical shape!"],
    },
  },
  {
    id: "cymbi",
    name: "Cymbi",
    animal: "Ladybug",
    instrument: "Dorsal cymbal wing covers",
    role: "Ensemble friend",
    virtue: "Thoughtful turn-taking",
    introduction: "Cymbi listens for the shared moment when two parts can meet.",
    imageAlt: "Cymbi, a friendly red ladybug with two golden cymbal wing covers on her back.",
    sourceVersions: { companionMaster: 2, habitatSource: 2, stickerSheetSource: 3 },
    stickerCopy: {
      celebrate: { phrase: "Together!", description: "A bright celebration for completing your part of the music.", alt: "Cymbi celebrates with six feet visible and both dorsal cymbal wing covers raised." },
      encourage: { phrase: "There is room", description: "Gentle support for listening, waiting, and finding shared space.", alt: "Cymbi offers calm encouragement with cymbal wing covers resting on her back." },
      connect: { phrase: "Meet in the music", description: "A friendly gesture for two musical parts finding one another.", alt: "Cymbi reaches out while both golden cymbal wing covers remain visible." },
    },
    reactions: {
      step_complete_generic: ["Your part is complete.", "That card joined the music.", "A thoughtful turn, finished."],
      skip_accepted: ["There’s room for it later.", "Saved for another day.", "That turn can wait."],
      session_complete: ["Every part is complete!", "Today’s music came together.", "All the cards found their place!"],
      listening_started: ["I’ll listen for your part!", "My cymbal wings are ready.", "Let’s make space for sound!"],
    },
  },
  {
    id: "spirlo",
    name: "Spirlo",
    animal: "Snail",
    instrument: "French-horn shell",
    role: "Phrasing friend",
    virtue: "Patient pacing",
    introduction: "Spirlo carries a musical idea patiently enough to hear its whole curve.",
    imageAlt: "Spirlo, a friendly amber snail with one pair of stalk-tip eyes and a French-horn shell.",
    sourceVersions: { companionMaster: 2, habitatSource: 2, stickerSheetSource: 2 },
    stickerCopy: {
      celebrate: { phrase: "Phrase complete!", description: "A warm celebration for following a musical idea to its end.", alt: "Spirlo celebrates with both stalk-tip eyes visible and the French-horn shell complete." },
      encourage: { phrase: "Follow the curve", description: "Unhurried company for giving a musical phrase enough space.", alt: "Spirlo offers patient encouragement beside the coiled French-horn shell." },
      connect: { phrase: "Around together", description: "A welcoming gesture for following a musical path with someone else.", alt: "Spirlo reaches out with one pair of stalk-tip eyes and the horn-shell visible." },
    },
    reactions: {
      step_complete_generic: ["That phrase found its ending.", "The whole curve is complete.", "That card is finished."],
      skip_accepted: ["That path can wait.", "Saved for another day.", "There’s space to return later."],
      session_complete: ["Today’s phrases are complete!", "Every card reached its ending.", "Practice followed the whole curve!"],
      listening_started: ["I’ll follow the whole phrase!", "My horn shell is listening.", "Let’s hear the musical curve!"],
    },
  },
]);

const CHARACTER_REGISTRY = Object.freeze(Object.fromEntries(
  CHARACTER_SPECS.map((spec) => [spec.id, createCharacter(spec)]),
));

export function getCharacter(characterId) {
  return CHARACTER_REGISTRY[characterId] || null;
}

export function getCharacters(characterIds = Object.keys(CHARACTER_REGISTRY)) {
  return characterIds.map(getCharacter).filter(Boolean);
}

export function getCharacterReaction(characterId, intent, variation = 0) {
  const reactions = getCharacter(characterId)?.reactions[intent];
  if (!reactions?.length) return null;
  const safeVariation = Number.isFinite(variation) ? Math.abs(Math.trunc(variation)) : 0;
  return reactions[safeVariation % reactions.length];
}

export const characterIds = Object.freeze(Object.keys(CHARACTER_REGISTRY));

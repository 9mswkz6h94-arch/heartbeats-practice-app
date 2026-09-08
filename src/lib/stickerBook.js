import { characterIds, getCharacters } from "./characterRegistry";

export const stickerBookFilters = Object.freeze([
  Object.freeze({ id: "all", label: "All stickers" }),
  Object.freeze({ id: "celebrate", label: "Celebrate" }),
  Object.freeze({ id: "encourage", label: "Encourage" }),
  Object.freeze({ id: "connect", label: "Connect" }),
]);

export const mockStickerPages = Object.freeze([
  Object.freeze({
    id: "riffin-connect",
    characterId: "riffin",
    characterName: "Riffin",
    purpose: "connect",
    title: "Practice high five",
    description: "A friendly way to say “we’re practicing together.”",
    image: "/characters/riffin/sticker-connect-768.png",
    imageAlt: "Riffin offering a practice high five.",
    deliveries: Object.freeze([
      Object.freeze({ id: "connect-1", sender: "Sam L.", senderRole: "Studio friend", date: "September 4, 2026", dateTime: "2026-09-04" }),
      Object.freeze({ id: "connect-2", sender: "Maya R.", senderRole: "Studio friend", date: "September 2, 2026", dateTime: "2026-09-02" }),
      Object.freeze({ id: "connect-3", sender: "Teacher Jon", senderRole: "Teacher", date: "August 30, 2026", dateTime: "2026-08-30" }),
    ]),
  }),
  Object.freeze({
    id: "riffin-celebrate",
    characterId: "riffin",
    characterName: "Riffin",
    purpose: "celebrate",
    title: "Big riff!",
    description: "A bright little celebration for showing up and making music.",
    image: "/characters/riffin/sticker-celebrate-768.png",
    imageAlt: "Riffin celebrating with music notes.",
    deliveries: Object.freeze([
      Object.freeze({ id: "celebrate-1", sender: "Avery K.", senderRole: "Studio friend", date: "September 3, 2026", dateTime: "2026-09-03" }),
      Object.freeze({ id: "celebrate-2", sender: "Teacher Jon", senderRole: "Teacher", date: "August 29, 2026", dateTime: "2026-08-29" }),
    ]),
  }),
  Object.freeze({
    id: "riffin-encourage",
    characterId: "riffin",
    characterName: "Riffin",
    purpose: "encourage",
    title: "One note at a time",
    description: "A gentle reminder that small tries still count.",
    image: "/characters/riffin/sticker-encourage-768.png",
    imageAlt: "Riffin sending warm encouragement.",
    deliveries: Object.freeze([
      Object.freeze({
        id: "encourage-1",
        sender: "Mom",
        senderRole: "Family",
        date: "September 1, 2026",
        dateTime: "2026-09-01",
        note: "I loved hearing you come back to your song today.",
      }),
      Object.freeze({ id: "encourage-2", sender: "Noah P.", senderRole: "Studio friend", date: "August 28, 2026", dateTime: "2026-08-28" }),
    ]),
  }),
]);

export const mockRingletStickerPages = Object.freeze([
  Object.freeze({
    id: "ringlet-celebrate",
    characterId: "ringlet",
    characterName: "Ringlet",
    purpose: "celebrate",
    title: "Bright chime!",
    description: "A joyful little chime for finishing a piece of practice.",
    image: "/characters/ringlet/sticker-celebrate-768.png",
    imageAlt: "Ringlet celebrates with one paw raised and a warm hand-bell body.",
    deliveries: Object.freeze([
      Object.freeze({ id: "ringlet-celebrate-1", sender: "Teacher Jon", senderRole: "Teacher", date: "September 6, 2026", dateTime: "2026-09-06" }),
    ]),
  }),
  Object.freeze({
    id: "ringlet-encourage",
    characterId: "ringlet",
    characterName: "Ringlet",
    purpose: "encourage",
    title: "Take your time",
    description: "A quiet reminder that careful listening is part of making music.",
    image: "/characters/ringlet/sticker-encourage-768.png",
    imageAlt: "Ringlet listens closely and offers calm encouragement.",
    deliveries: Object.freeze([
      Object.freeze({ id: "ringlet-encourage-1", sender: "Mom", senderRole: "Family", date: "September 5, 2026", dateTime: "2026-09-05" }),
    ]),
  }),
  Object.freeze({
    id: "ringlet-connect",
    characterId: "ringlet",
    characterName: "Ringlet",
    purpose: "connect",
    title: "Listen together",
    description: "A welcoming invitation to share one calm musical moment.",
    image: "/characters/ringlet/sticker-connect-768.png",
    imageAlt: "Ringlet reaches out with a welcoming gesture to listen together.",
    deliveries: Object.freeze([
      Object.freeze({ id: "ringlet-connect-1", sender: "Sam L.", senderRole: "Studio friend", date: "September 4, 2026", dateTime: "2026-09-04" }),
    ]),
  }),
]);

const establishedReviewCharacterIds = new Set(["riffin", "ringlet"]);

export const mockFullCastStickerPages = Object.freeze(
  getCharacters()
    .filter((character) => !establishedReviewCharacterIds.has(character.id))
    .flatMap((character) => character.stickers.map((item) => Object.freeze({
      id: `${character.id}-${item.id}`,
      characterId: character.id,
      characterName: character.name,
      purpose: item.id,
      title: item.phrase,
      description: item.description,
      image: item.image,
      imageAlt: item.alt,
      deliveries: Object.freeze([
        Object.freeze({
          id: `${character.id}-${item.id}-review`,
          sender: "Teacher Jon",
          senderRole: "Teacher",
          date: "September 7, 2026",
          dateTime: "2026-09-07",
        }),
      ]),
    }))),
);

const allReviewStickerPages = [
  ...mockStickerPages,
  ...mockRingletStickerPages,
  ...mockFullCastStickerPages,
];

export const reviewStickerPages = Object.freeze(characterIds.flatMap((characterId) => (
  allReviewStickerPages.filter((page) => page.characterId === characterId)
)));

export function filterStickerPages(pages, purpose = "all", characterId = "all") {
  return pages.filter((page) => (
    (purpose === "all" || page.purpose === purpose)
    && (characterId === "all" || page.characterId === characterId)
  ));
}

export function clampStickerPageIndex(index, pageCount) {
  if (pageCount <= 0) return 0;
  return Math.min(Math.max(0, index), pageCount - 1);
}

export function formatStickerCopyCount(count) {
  return `${count} ${count === 1 ? "copy" : "copies"} in your book`;
}

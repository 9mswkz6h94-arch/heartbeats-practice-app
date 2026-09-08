import fs from "fs";
import path from "path";
import { characterIds, getCharacter, getCharacterReaction } from "./characterRegistry";

const acceptedCharacterIds = [
  "riffin",
  "boppo",
  "chordillo",
  "ringlet",
  "brumbo",
  "plinka",
  "puffino",
  "cymbi",
  "spirlo",
];

test("registers the complete accepted Musical Zoo cast in manifest order", () => {
  const riffin = getCharacter("riffin");
  expect(characterIds).toEqual(acceptedCharacterIds);
  expect(riffin.name).toBe("Riffin");
  expect(riffin.artVersion).toBe(2);
  expect(riffin.voiceVersion).toBe(2);
  expect(riffin.image).toBe("/characters/riffin/companion-64.png");
  expect(riffin.assets.zooSmall).toMatchObject({
    image: "/characters/riffin/roaming-32.png",
    nativeSize: 32,
  });
  expect(riffin.assets.companionMedium).toMatchObject({
    image: "/characters/riffin/companion-64.png",
    nativeSize: 64,
  });
  expect(riffin.assets.stickersLarge).toMatchObject({
    targetMinimumSize: 768,
    status: "accepted-art-v2",
  });
  expect(riffin.stickers).toHaveLength(3);
  expect(riffin.stickers[0]).toMatchObject({
    id: "celebrate",
    image: "/characters/riffin/sticker-celebrate-768.png",
    status: "accepted-art-v2",
  });
  expect(riffin.stickers[1]).toMatchObject({
    id: "encourage",
    image: "/characters/riffin/sticker-encourage-768.png",
    status: "accepted-art-v2",
  });
  expect(riffin.stickers[2]).toMatchObject({
    id: "connect",
    image: "/characters/riffin/sticker-connect-768.png",
    status: "accepted-art-v2",
  });
});

test("matches every registry entry to the accepted art manifest", () => {
  const manifestPath = path.join(
    process.cwd(),
    "concept-art",
    "library-expansion",
    "three-format-v1",
    "character-library.manifest.json",
  );
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  expect(manifest.scope.appIntegrationApproved).toBe(true);
  expect(manifest.characters.map(({ id }) => id)).toEqual(characterIds);
  manifest.characters.forEach((acceptedCharacter) => {
    const character = getCharacter(acceptedCharacter.id);
    expect(character).toMatchObject({
      name: acceptedCharacter.name,
      artVersion: manifest.libraryVersion,
      sourceVersions: acceptedCharacter.acceptedSources,
      image: `/characters/${acceptedCharacter.id}/companion-64.png`,
      roamingImage: `/characters/${acceptedCharacter.id}/roaming-32.png`,
    });
    expect(character.stickers.map(({ id }) => id)).toEqual(["celebrate", "encourage", "connect"]);
    character.stickers.forEach((item) => expect(item).toMatchObject({ status: "accepted-art-v2" }));
  });
});

test("ships all five accepted assets for every registered character", () => {
  characterIds.forEach((characterId) => {
    const character = getCharacter(characterId);
    const images = [character.roamingImage, character.companionImage, ...character.stickers.map(({ image }) => image)];
    images.forEach((image) => expect(fs.existsSync(path.join(process.cwd(), "public", image))).toBe(true));
  });
});

test("selects accepted reactions deterministically and safely", () => {
  expect(getCharacterReaction("riffin", "step_complete_generic", 0)).toBe("Nice! That card is done.");
  expect(getCharacterReaction("riffin", "step_complete_generic", 3)).toBe("Nice! That card is done.");
  expect(getCharacterReaction("riffin", "missing_intent", 0)).toBeNull();
  expect(getCharacterReaction("ringlet", "step_complete_generic", 1))
    .toBe("Good noticing! That step is complete.");
  expect(getCharacterReaction("missing_character", "session_welcome", 0)).toBeNull();
});

test("keeps every Musical Zoo character response-only and ready for practice events", () => {
  characterIds.forEach((characterId) => {
    expect(getCharacterReaction(characterId, "step_complete_generic", 0)).toBeTruthy();
    expect(getCharacterReaction(characterId, "skip_accepted", 0)).toBeTruthy();
    expect(getCharacterReaction(characterId, "session_complete", 0)).toBeTruthy();
    expect(getCharacterReaction(characterId, "listening_started", 0)).toBeTruthy();
    expect(getCharacterReaction(characterId, "session_welcome", 0)).toBeNull();
  });
});

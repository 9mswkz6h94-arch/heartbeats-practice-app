const fs = require('fs');
const path = require('path');

const root = __dirname;
const manifestPath = path.join(root, 'character-library.manifest.json');

function loadLibrary() {
  const requestedManifest = process.env.ZOO_MANIFEST_PATH;
  const activeManifestPath = requestedManifest ? path.resolve(requestedManifest) : manifestPath;
  return JSON.parse(fs.readFileSync(activeManifestPath, 'utf8'));
}

function characterFolder(character) {
  return path.join(root, 'characters', character.id);
}

function acceptedSourcePath(library, character, sourceKey) {
  const sourceMap = {
    companionMaster: library.formats.companion.sourceStem,
    habitatSource: library.formats.habitat.sourceStem,
    stickerSheetSource: library.formats.stickers.sourceStem,
  };
  const stem = sourceMap[sourceKey];
  const sourceVersions = character.sourceVersions || character.acceptedSources;
  const version = sourceVersions?.[sourceKey];
  if (!stem || !Number.isInteger(version)) {
    throw new Error(`Missing source version for ${character.id}.${sourceKey}`);
  }
  return path.join(characterFolder(character), `${character.id}-${stem}-v${version}.png`);
}

function boardDimensions(characterCount, cardHeight) {
  const top = 274;
  const rowGap = 30;
  const rows = Math.ceil(characterCount / 3);
  const contentBottom = top + rows * cardHeight + Math.max(0, rows - 1) * rowGap;
  const footerY = contentBottom + 51;
  return { width: 1728, height: footerY + 47, footerY, top, rowGap };
}

module.exports = {
  acceptedSourcePath,
  boardDimensions,
  characterFolder,
  loadLibrary,
  manifestPath,
  root,
};

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  acceptedSourcePath,
  boardDimensions,
  characterFolder,
  loadLibrary,
  manifestPath,
  root,
} = require('./library-config.cjs');

function loadSharp() {
  try {
    return require('sharp');
  } catch (projectError) {
    const roots = [
      process.env.CODEX_NODE_MODULES,
      path.join(os.homedir(), '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'node_modules'),
    ].filter(Boolean);
    for (const dependencyRoot of roots) {
      const candidate = path.join(dependencyRoot, 'sharp');
      if (fs.existsSync(candidate)) return require(candidate);
    }
    throw new Error('Sharp was not found in the project or Codex bundled runtime.', { cause: projectError });
  }
}

const sharp = loadSharp();
const library = loadLibrary();
const outputHashes = new Map();
const packageGate = process.env.ZOO_PACKAGE_GATE || 'accepted-art-package';
const characterGate = process.env.ZOO_CHARACTER_GATE || packageGate;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertUnique(values, label) {
  assert(new Set(values).size === values.length, `Duplicate ${label} in ${manifestPath}`);
}

function assertManifest() {
  assert(library.schemaVersion === 1, 'Expected character library schemaVersion 1');
  assert(
    ['accepted-art-package', 'proposed-correction-package'].includes(packageGate),
    `Unsupported validation gate: ${packageGate}`,
  );
  assert(library.status === packageGate, `Library is not at the ${packageGate} gate`);
  assert(library.scope?.appLocal === true, 'Character art library must remain app-local');
  assert(library.scope?.canonicalRainbowHeartIllustration === false, 'Library must not claim canonical Rainbow Heart illustration status');
  assert(library.scope?.appIntegrationApproved === true, 'This accepted package must record the approved app integration');
  assert(Array.isArray(library.characters) && library.characters.length > 0, 'Library has no characters');
  assert(JSON.stringify(library.formats?.stickers?.poses) === JSON.stringify(['celebrate', 'encourage', 'connect']), 'Sticker poses must be celebrate, encourage, connect');
  assert(library.formats?.habitat?.width === 32 && library.formats.habitat.height === 32, 'Habitat format must remain 32x32');
  assert(library.formats.habitat.previewScale === 8, 'Habitat preview scale must remain 8x');
  assert(library.formats.habitat.maximumOpaqueColors === 16, 'Habitat color budget must remain 16');
  assert(library.formats?.companion?.width === 64 && library.formats.companion.height === 64, 'Companion format must remain 64x64');
  assert(library.formats.companion.previewScale === 8, 'Companion preview scale must remain 8x');
  assert(library.formats?.stickers?.width === 768 && library.formats.stickers.height === 768, 'Sticker format must remain 768x768');

  const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const requiredText = [
    'id', 'name', 'animal', 'instrument', 'musicalRole', 'practiceVirtue',
    'silhouetteAnchor', 'anatomyInvariant', 'avoid',
  ];
  for (const character of library.characters) {
    for (const field of requiredText) {
      assert(typeof character[field] === 'string' && character[field].trim(), `Missing ${character.id || 'character'}.${field}`);
    }
    assert(idPattern.test(character.id), `Invalid stable ID: ${character.id}`);
    assert(character.status === characterGate, `${character.id} is not at the ${characterGate} gate`);
    const sourceVersions = character.sourceVersions || character.acceptedSources;
    for (const sourceKey of ['companionMaster', 'habitatSource', 'stickerSheetSource']) {
      assert(Number.isInteger(sourceVersions?.[sourceKey]) && sourceVersions[sourceKey] > 0, `Missing positive source version for ${character.id}.${sourceKey}`);
    }
  }
  assertUnique(library.characters.map(({ id }) => id), 'character ID');
  assertUnique(library.characters.map(({ name }) => name.toLowerCase()), 'character name');
  assertUnique(library.characters.map(({ musicalRole }) => musicalRole), 'musical role');
  assertUnique(library.characters.map(({ practiceVirtue }) => practiceVirtue), 'practice virtue');
}

async function pngPixels(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparentPixels = 0;
  let opaquePixels = 0;
  const colors = new Set();
  for (let offset = 0; offset < data.length; offset += 4) {
    const alpha = data[offset + 3];
    if (alpha === 0) transparentPixels += 1;
    if (alpha > 0) {
      opaquePixels += 1;
      colors.add(`${data[offset]},${data[offset + 1]},${data[offset + 2]},${alpha}`);
    }
  }
  return { data, info, transparentPixels, opaquePixels, colors };
}

async function validatePng(filePath, width, height, options = {}) {
  assert(fs.existsSync(filePath), `Missing ${filePath}`);
  const metadata = await sharp(filePath).metadata();
  assert(metadata.format === 'png', `Expected PNG: ${filePath}`);
  assert(metadata.width === width && metadata.height === height, `Expected ${width}x${height}: ${filePath}`);
  assert(metadata.hasAlpha, `Expected alpha channel: ${filePath}`);

  const pixels = await pngPixels(filePath);
  assert(pixels.opaquePixels > 0, `Expected visible artwork: ${filePath}`);
  assert(pixels.transparentPixels > 0, `Expected transparent canvas space: ${filePath}`);

  if (options.transparentCorners) {
    const corners = [
      0,
      pixels.info.width - 1,
      (pixels.info.height - 1) * pixels.info.width,
      pixels.info.width * pixels.info.height - 1,
    ];
    assert(corners.every((index) => pixels.data[index * 4 + 3] === 0), `Expected transparent corners: ${filePath}`);
  }

  if (Number.isInteger(options.maximumOpaqueColors)) {
    assert(
      pixels.colors.size <= options.maximumOpaqueColors,
      `Expected no more than ${options.maximumOpaqueColors} opaque colors, found ${pixels.colors.size}: ${filePath}`,
    );
  }

  if (options.uniqueOutput) {
    const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
    assert(!outputHashes.has(hash), `Duplicate output: ${filePath} and ${outputHashes.get(hash)}`);
    outputHashes.set(hash, filePath);
  }
}

async function validateCharacter(character) {
  const folder = characterFolder(character);
  assert(fs.existsSync(folder), `Missing character folder: ${folder}`);

  for (const sourceKey of ['companionMaster', 'habitatSource', 'stickerSheetSource']) {
    const sourcePath = acceptedSourcePath(library, character, sourceKey);
    assert(fs.existsSync(sourcePath), `Missing pinned source: ${sourcePath}`);
    const sourceMetadata = await sharp(sourcePath).metadata();
    assert(sourceMetadata.format === 'png', `Pinned source must be PNG: ${sourcePath}`);
  }

  const { id } = character;
  const habitat = library.formats.habitat;
  const companion = library.formats.companion;
  const stickers = library.formats.stickers;

  await validatePng(path.join(folder, `${id}-${habitat.outputStem}.png`), habitat.width, habitat.height, {
    maximumOpaqueColors: habitat.maximumOpaqueColors,
    transparentCorners: true,
    uniqueOutput: true,
  });
  await validatePng(
    path.join(folder, `${id}-${habitat.previewStem}.png`),
    habitat.width * habitat.previewScale,
    habitat.height * habitat.previewScale,
    { transparentCorners: true, uniqueOutput: true },
  );
  await validatePng(path.join(folder, `${id}-${companion.outputStem}.png`), companion.width, companion.height, {
    transparentCorners: true,
    uniqueOutput: true,
  });
  await validatePng(
    path.join(folder, `${id}-${companion.previewStem}.png`),
    companion.width * companion.previewScale,
    companion.height * companion.previewScale,
    { transparentCorners: true, uniqueOutput: true },
  );

  const cleanSheet = path.join(folder, `${id}-${stickers.cleanStem}.png`);
  assert(fs.existsSync(cleanSheet), `Missing derived clean sticker sheet: ${cleanSheet}`);
  assert((await sharp(cleanSheet).metadata()).hasAlpha, `Expected alpha on clean sticker sheet: ${cleanSheet}`);

  for (const pose of stickers.poses) {
    await validatePng(
      path.join(folder, `${id}-sticker-${pose}-${stickers.outputSuffix}.png`),
      stickers.width,
      stickers.height,
      { transparentCorners: true, uniqueOutput: true },
    );
  }
}

async function validateReviewBoards() {
  const nativeBoard = path.join(root, library.review?.nativeBoard || 'musical-zoo-native-sprite-review-v1.png');
  const stickerBoard = path.join(root, library.review?.stickerBoard || 'musical-zoo-sticker-review-v1.png');
  const nativeExpected = boardDimensions(library.characters.length, 352);
  const stickerExpected = boardDimensions(library.characters.length, 380);
  assert(fs.existsSync(nativeBoard), 'Missing native sprite review board');
  assert(fs.existsSync(stickerBoard), 'Missing sticker review board');
  const nativeMetadata = await sharp(nativeBoard).metadata();
  const stickerMetadata = await sharp(stickerBoard).metadata();
  assert(nativeMetadata.width === nativeExpected.width && nativeMetadata.height === nativeExpected.height, 'Unexpected native review-board dimensions');
  assert(stickerMetadata.width === stickerExpected.width && stickerMetadata.height === stickerExpected.height, 'Unexpected sticker review-board dimensions');
}

async function main() {
  assertManifest();
  for (const character of library.characters) await validateCharacter(character);
  await validateReviewBoards();
  process.stdout.write(
    `Validated manifest pins, ${library.characters.length} habitat sprites, ${library.characters.length} companions, ${library.characters.length * library.formats.stickers.poses.length} stickers, and 2 review boards.\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

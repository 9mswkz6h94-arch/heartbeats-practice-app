const fs = require('fs');
const os = require('os');
const path = require('path');
const { acceptedSourcePath, characterFolder, loadLibrary } = require('./library-config.cjs');

function loadSharp() {
  try {
    return require('sharp');
  } catch (projectError) {
    const roots = [
      process.env.CODEX_NODE_MODULES,
      path.join(os.homedir(), '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'node_modules'),
    ].filter(Boolean);
    for (const root of roots) {
      const candidate = path.join(root, 'sharp');
      if (fs.existsSync(candidate)) return require(candidate);
    }
    throw new Error('Sharp was not found in the project or Codex bundled runtime.', { cause: projectError });
  }
}

const sharp = loadSharp();
const library = loadLibrary();

async function clearConnectedNeutralBackground(inputPath) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const total = info.width * info.height;
  const visited = new Uint8Array(total);
  const queue = new Uint32Array(total);
  let head = 0;
  let tail = 0;

  const isBackground = (index) => {
    const offset = index * 4;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const alpha = data[offset + 3];
    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    return alpha < 20 || (minimum >= 220 && maximum - minimum <= 18);
  };
  const enqueue = (index) => {
    if (visited[index] || !isBackground(index)) return;
    visited[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < info.width; x += 1) {
    enqueue(x);
    enqueue((info.height - 1) * info.width + x);
  }
  for (let y = 0; y < info.height; y += 1) {
    enqueue(y * info.width);
    enqueue(y * info.width + info.width - 1);
  }
  while (head < tail) {
    const index = queue[head++];
    const x = index % info.width;
    const y = Math.floor(index / info.width);
    if (x > 0) enqueue(index - 1);
    if (x + 1 < info.width) enqueue(index + 1);
    if (y > 0) enqueue(index - info.width);
    if (y + 1 < info.height) enqueue(index + info.width);
  }
  for (let index = 0; index < total; index += 1) {
    if (visited[index]) data[index * 4 + 3] = 0;
  }

  return sharp(data, { raw: info }).png().toBuffer();
}

async function normalize(inputPath, outputPath, size, contentSize, kernel, palette = false) {
  const cleaned = await clearConnectedNeutralBackground(inputPath);
  const trimmed = await sharp(cleaned)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 4 })
    .png()
    .toBuffer();
  const fitted = await sharp(trimmed)
    .resize(contentSize, contentSize, { fit: 'inside', withoutEnlargement: false, kernel })
    .png()
    .toBuffer();
  const metadata = await sharp(fitted).metadata();
  const left = Math.floor((size - metadata.width) / 2);
  const top = Math.floor((size - metadata.height) / 2);
  let output = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite([{ input: fitted, left, top }]);
  output = palette ? output.png({ palette: true, colours: 16, dither: 0 }) : output.png();
  await output.toFile(outputPath);
  const finalMetadata = await sharp(outputPath).metadata();
  if (finalMetadata.width !== size || finalMetadata.height !== size || !finalMetadata.hasAlpha) {
    throw new Error(`Invalid native asset: ${outputPath}`);
  }
}

async function preview(inputPath, outputPath, size) {
  await sharp(inputPath).resize(size, size, { kernel: 'nearest' }).png().toFile(outputPath);
}

async function main() {
  for (const character of library.characters) {
    const { id } = character;
    const folder = characterFolder(character);
    const companionMaster = acceptedSourcePath(library, character, 'companionMaster');
    const habitatSource = acceptedSourcePath(library, character, 'habitatSource');
    const companion = path.join(folder, `${id}-${library.formats.companion.outputStem}.png`);
    const companionPreview = path.join(folder, `${id}-${library.formats.companion.previewStem}.png`);
    const habitat = path.join(folder, `${id}-${library.formats.habitat.outputStem}.png`);
    const habitatPreview = path.join(folder, `${id}-${library.formats.habitat.previewStem}.png`);

    await normalize(
      companionMaster,
      companion,
      library.formats.companion.width,
      library.formats.companion.width - 6,
      'nearest',
    );
    await preview(
      companion,
      companionPreview,
      library.formats.companion.width * library.formats.companion.previewScale,
    );
    await normalize(
      habitatSource,
      habitat,
      library.formats.habitat.width,
      library.formats.habitat.width - 4,
      'nearest',
      true,
    );
    await preview(
      habitat,
      habitatPreview,
      library.formats.habitat.width * library.formats.habitat.previewScale,
    );
    process.stdout.write(`${id}: companion ${library.formats.companion.width}x${library.formats.companion.height} + habitat ${library.formats.habitat.width}x${library.formats.habitat.height}\n`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

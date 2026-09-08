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
const poses = library.formats.stickers.poses;

async function clearBackground(inputPath) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const cornerIndexes = [0, info.width - 1, (info.height - 1) * info.width, info.width * info.height - 1];
  const transparentCorners = cornerIndexes.every((index) => data[index * 4 + 3] < 20);
  if (transparentCorners) return sharp(data, { raw: info }).png().toBuffer();

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
    const neutral = maximum - minimum <= 20;
    return alpha < 20 || neutral;
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

async function extractPoseImages(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const total = info.width * info.height;
  const visited = new Uint8Array(total);
  const queue = new Uint32Array(total);
  const components = [];

  const isVisible = (index) => data[index * 4 + 3] >= 28;
  const enqueue = (index, state) => {
    if (visited[index] || !isVisible(index)) return;
    visited[index] = 1;
    queue[state.tail++] = index;
  };

  for (let seed = 0; seed < total; seed += 1) {
    if (visited[seed] || !isVisible(seed)) continue;
    const state = { head: 0, tail: 0 };
    enqueue(seed, state);
    let left = info.width;
    let top = info.height;
    let right = -1;
    let bottom = -1;
    let pixels = 0;
    while (state.head < state.tail) {
      const index = queue[state.head++];
      const x = index % info.width;
      const y = Math.floor(index / info.width);
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
      pixels += 1;
      if (x > 0) enqueue(index - 1, state);
      if (x + 1 < info.width) enqueue(index + 1, state);
      if (y > 0) enqueue(index - info.width, state);
      if (y + 1 < info.height) enqueue(index + info.width, state);
    }
    if (pixels < 180) continue;
    components.push({
      left,
      top,
      right,
      bottom,
      center: (left + right) / 2,
      pixels,
      indexes: queue.slice(0, state.tail),
    });
  }

  const boxDistance = (first, second) => {
    const horizontal = Math.max(0, first.left - second.right, second.left - first.right);
    const vertical = Math.max(0, first.top - second.bottom, second.top - first.bottom);
    return Math.hypot(horizontal, vertical);
  };

  return Promise.all(Array.from({ length: 3 }, async (_, index) => {
    const columnStart = index * info.width / 3;
    const columnEnd = (index + 1) * info.width / 3;
    const columnComponents = components.filter((component) => (
      component.center >= columnStart && component.center < columnEnd
    ));
    const main = columnComponents.reduce((largest, component) => (
      !largest || component.pixels > largest.pixels ? component : largest
    ), null);
    if (!main) {
      throw new Error(`No sticker artwork found in pose column ${index + 1}.`);
    }
    const included = columnComponents.filter((component) => component === main || boxDistance(component, main) <= 96);
    const cluster = included.reduce((combined, component) => ({
      left: Math.min(combined.left, component.left),
      top: Math.min(combined.top, component.top),
      right: Math.max(combined.right, component.right),
      bottom: Math.max(combined.bottom, component.bottom),
      indexes: combined.indexes.concat(Array.from(component.indexes)),
    }), {
      left: info.width,
      top: info.height,
      right: -1,
      bottom: -1,
      indexes: [],
    });
    const isolated = Buffer.alloc(data.length);
    for (const pixelIndex of cluster.indexes) {
      const offset = pixelIndex * 4;
      isolated[offset] = data[offset];
      isolated[offset + 1] = data[offset + 1];
      isolated[offset + 2] = data[offset + 2];
      isolated[offset + 3] = data[offset + 3];
    }
    const margin = 18;
    const left = Math.max(0, cluster.left - margin);
    const top = Math.max(0, cluster.top - margin);
    const right = Math.min(info.width - 1, cluster.right + margin);
    const bottom = Math.min(info.height - 1, cluster.bottom + margin);
    return sharp(isolated, { raw: info })
      .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
      .png()
      .toBuffer();
  }));
}

async function addDieCutOutline(input, size = 768, contentSize = 666) {
  const trimmed = await sharp(input)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 4 })
    .png()
    .toBuffer();
  const fitted = await sharp(trimmed)
    .resize(contentSize, contentSize, { fit: 'inside', kernel: 'lanczos3' })
    .png()
    .toBuffer();
  const metadata = await sharp(fitted).metadata();
  const alpha = await sharp(fitted).ensureAlpha().extractChannel(3).dilate(9).png().toBuffer();
  const outline = await sharp({
    create: { width: metadata.width, height: metadata.height, channels: 3, background: { r: 255, g: 255, b: 255 } },
  }).joinChannel(alpha).png().toBuffer();
  const left = Math.floor((size - metadata.width) / 2);
  const top = Math.floor((size - metadata.height) / 2);
  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite([
    { input: outline, left, top },
    { input: fitted, left, top },
  ]).png().toBuffer();
}

async function main() {
  for (const character of library.characters) {
    const { id } = character;
    const folder = characterFolder(character);
    const source = acceptedSourcePath(library, character, 'stickerSheetSource');
    const cleaned = await clearBackground(source);
    const poseImages = await extractPoseImages(cleaned);
    const cleanSheet = path.join(folder, `${id}-${library.formats.stickers.cleanStem}.png`);
    await sharp(cleaned).png().toFile(cleanSheet);

    for (let index = 0; index < poses.length; index += 1) {
      const sticker = await addDieCutOutline(
        poseImages[index],
        library.formats.stickers.width,
        library.formats.stickers.width - 102,
      );
      const output = path.join(folder, `${id}-sticker-${poses[index]}-${library.formats.stickers.outputSuffix}.png`);
      await sharp(sticker).png().toFile(output);
      const outputMetadata = await sharp(output).metadata();
      if (
        outputMetadata.width !== library.formats.stickers.width
        || outputMetadata.height !== library.formats.stickers.height
        || !outputMetadata.hasAlpha
      ) {
        throw new Error(`Invalid sticker output: ${output}`);
      }
    }
    process.stdout.write(`${id}: ${poses.length} ${library.formats.stickers.width}x${library.formats.stickers.height} alpha stickers\n`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

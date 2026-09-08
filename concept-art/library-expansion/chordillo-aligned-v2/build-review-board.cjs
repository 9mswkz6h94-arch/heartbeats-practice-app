const fs = require('fs');
const os = require('os');
const path = require('path');

function loadSharp() {
  try {
    return require('sharp');
  } catch (projectError) {
    const runtimeRoots = [
      process.env.CODEX_NODE_MODULES,
      path.join(os.homedir(), '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'node_modules'),
    ].filter(Boolean);

    for (const runtimeRoot of runtimeRoots) {
      const sharpPath = path.join(runtimeRoot, 'sharp');
      if (fs.existsSync(sharpPath)) return require(sharpPath);
    }

    throw new Error('Sharp was not found in the project or the Codex bundled runtime.', { cause: projectError });
  }
}

const sharp = loadSharp();
const outputRoot = __dirname;
const projectRoot = path.resolve(outputRoot, '..', '..', '..');
const starterTrioPath = path.join(projectRoot, 'concept-art', 'musical-zoo-starter-trio-handheld-color-v3.png');

const entries = [
  { id: 'riffin', name: 'Riffin', role: 'Melody · brave beginnings', tag: 'STARTER · ALIGNED V2' },
  { id: 'boppo', name: 'Boppo', role: 'Rhythm · steady persistence', tag: 'STARTER · ALIGNED V2' },
  { id: 'chordillo', name: 'Chordillo', role: 'Harmony · thoughtful choices', tag: 'STYLE ANCHOR' },
  { id: 'ringlet', name: 'Ringlet', role: 'Listening · careful attention', tag: 'CANDIDATE · ALIGNED V2' },
  { id: 'brumbo', name: 'Brumbo', role: 'Dynamics · gentle control', tag: 'CANDIDATE · ALIGNED V2' },
  { id: 'plinka', name: 'Plinka', role: 'Improvisation · playful curiosity', tag: 'CANDIDATE · ALIGNED V2' },
  { id: 'puffino', name: 'Puffino', role: 'Expression · personal choices', tag: 'CANDIDATE · ALIGNED V2' },
  { id: 'cymbi', name: 'Cymbi', role: 'Ensemble · thoughtful turn-taking', tag: 'CANDIDATE · ALIGNED V2' },
  { id: 'spirlo', name: 'Spirlo', role: 'Phrasing · patient pacing', tag: 'CANDIDATE · ALIGNED V2' },
];

function escapeXml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  }[character]));
}

function asDataUrl(buffer) {
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

async function ensureTransparentCutout(entry) {
  const rawPath = path.join(outputRoot, `${entry.id}-companion-chordillo-aligned-v2.png`);
  const cutoutPath = path.join(outputRoot, `${entry.id}-companion-chordillo-aligned-cutout-v2.png`);
  const image = sharp(rawPath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const pixelCount = info.width * info.height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Uint32Array(pixelCount);
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
    return alpha < 20 || (minimum >= 224 && maximum - minimum <= 16);
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

  for (let index = 0; index < pixelCount; index += 1) {
    if (visited[index]) data[index * 4 + 3] = 0;
  }

  await sharp(data, { raw: info }).png().toFile(cutoutPath);
  const outputMetadata = await sharp(cutoutPath).metadata();
  if (!outputMetadata.hasAlpha) {
    throw new Error(`${entry.name} cutout was written without an alpha channel.`);
  }
  return {
    buffer: fs.readFileSync(cutoutPath),
    width: info.width,
    height: info.height,
    cleared: tail,
    hasAlpha: outputMetadata.hasAlpha,
  };
}

async function chordilloReference() {
  return sharp(starterTrioPath)
    .extract({ left: 1020, top: 225, width: 345, height: 545 })
    .resize(480, 360, { fit: 'contain', kernel: 'nearest', background: '#EDF4D9' })
    .png()
    .toBuffer();
}

async function buildBoard(images) {
  const width = 1728;
  const height = 1800;
  const cardWidth = 520;
  const cardHeight = 486;
  const gap = 28;
  const left = 56;
  const top = 218;

  const cards = entries.map((entry, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = left + column * (cardWidth + gap);
    const y = top + row * (cardHeight + gap);
    const tagFill = entry.id === 'chordillo' ? '#241E20' : '#6C5CE7';
    return `<g transform="translate(${x} ${y})">
      <rect width="${cardWidth}" height="${cardHeight}" rx="18" fill="#FFFFFF" stroke="#C9C3C6"/>
      <rect x="24" y="24" width="230" height="30" rx="12" fill="${tagFill}"/>
      <text x="36" y="45" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">${escapeXml(entry.tag)}</text>
      <text x="24" y="92" font-family="Georgia, serif" font-size="32" font-weight="700" fill="#241E20">${escapeXml(entry.name)}</text>
      <text x="24" y="121" font-family="Arial, sans-serif" font-size="15" fill="#544C50">${escapeXml(entry.role)}</text>
      <rect x="24" y="144" width="472" height="302" rx="12" fill="#F7F5F6" stroke="#D8D2D5"/>
      <image href="${asDataUrl(images[index])}" x="56" y="156" width="408" height="278" preserveAspectRatio="xMidYMid meet" image-rendering="pixelated"/>
      <text x="24" y="472" font-family="monospace" font-size="13" fill="#6A6065">DETAILED COMPANION CONCEPT · REVIEW ONLY</text>
    </g>`;
  }).join('');

  const boardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#F8F9FA"/>
    <rect width="288" height="18" fill="#FF1717"/>
    <rect x="288" width="288" height="18" fill="#FF904E"/>
    <rect x="576" width="288" height="18" fill="#FFDE59"/>
    <rect x="864" width="288" height="18" fill="#60E027"/>
    <rect x="1152" width="288" height="18" fill="#00BAFF"/>
    <rect x="1440" width="288" height="18" fill="#8B51FE"/>
    <text x="56" y="80" font-family="Georgia, serif" font-size="48" font-weight="700" fill="#241E20">Musical Zoo character library</text>
    <text x="56" y="120" font-family="Arial, sans-serif" font-size="22" fill="#544C50">Chordillo-aligned detailed companion concepts · app-local proposal · v2</text>
    <text x="56" y="162" font-family="Arial, sans-serif" font-size="17" fill="#241E20">One family: rounded creature anatomy, integrated instruments, expressive faces, and richer hand-pixeled volume.</text>
    ${cards}
    <text x="56" y="1770" font-family="Arial, sans-serif" font-size="16" fill="#544C50">Concept masters only. Production sprites, motion frames, companion crops, and stickers require a separate approved derivation pass.</text>
  </svg>`;

  const svgPath = path.join(outputRoot, 'musical-zoo-library-chordillo-aligned-v2.svg');
  const pngPath = path.join(outputRoot, 'musical-zoo-library-chordillo-aligned-v2.png');
  fs.writeFileSync(svgPath, boardSvg);
  await sharp(Buffer.from(boardSvg)).png().toFile(pngPath);
  return pngPath;
}

async function main() {
  const images = [];
  const results = [];
  for (const entry of entries) {
    if (entry.id === 'chordillo') {
      images.push(await chordilloReference());
      continue;
    }
    const result = await ensureTransparentCutout(entry);
    images.push(result.buffer);
    results.push(`${entry.name}: ${result.width}x${result.height}, alpha ${result.hasAlpha ? 'yes' : 'no'}, cleared ${result.cleared} connected background pixels`);
  }
  const boardPath = await buildBoard(images);
  process.stdout.write(`${results.join('\n')}\nBoard: ${boardPath}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

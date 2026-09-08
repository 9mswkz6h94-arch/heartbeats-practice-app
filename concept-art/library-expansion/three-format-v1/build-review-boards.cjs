const fs = require('fs');
const os = require('os');
const path = require('path');
const { boardDimensions, characterFolder, loadLibrary, root } = require('./library-config.cjs');

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
const characters = library.characters.map((character) => ({
  ...character,
  detail: `${character.animal} · ${character.instrument}`,
}));
const review = library.review || {};
const integrationLabel = library.scope?.appIntegrationApproved
  ? 'mock app integration approved'
  : 'no app integration';

const colors = {
  canvas: '#FFFFFF',
  soft: '#F8F9FA',
  text: '#241E20',
  muted: '#544C50',
  border: '#C9C3C6',
  action: '#6C5CE7',
  actionSoft: '#EEEAFF',
};

function escapeXml(value) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '\"': '&quot;',
  }[character]));
}

function dataUri(buffer) {
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

function spectrumBand(width, y) {
  const stops = ['#FF1717', '#FF904E', '#FFDE59', '#60E027', '#00BAFF', '#8B51FE'];
  const segment = width / stops.length;
  return stops.map((color, index) => (
    `<rect x="${index * segment}" y="${y}" width="${segment + 1}" height="16" fill="${color}"/>`
  )).join('');
}

async function resizedData(filePath, width, height, kernel) {
  const buffer = await sharp(filePath)
    .resize(width, height, { fit: 'inside', kernel, withoutEnlargement: false })
    .png()
    .toBuffer();
  const metadata = await sharp(buffer).metadata();
  return { uri: dataUri(buffer), width: metadata.width, height: metadata.height };
}

function imageTag(image, x, y) {
  return `<image href="${image.uri}" x="${Math.round(x)}" y="${Math.round(y)}" width="${image.width}" height="${image.height}"/>`;
}

async function buildNativeBoard() {
  const cardWidth = 500;
  const cardHeight = 352;
  const { width, height, footerY, top, rowGap } = boardDimensions(characters.length, cardHeight);
  const columnGap = 30;
  const left = 84;
  const images = [];
  let cards = '';

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = left + column * (cardWidth + columnGap);
    const y = top + row * (cardHeight + rowGap);
    const folder = characterFolder(character);
    const habitat = await resizedData(
      path.join(folder, `${character.id}-${library.formats.habitat.outputStem}.png`),
      224,
      224,
      'nearest',
    );
    const companion = await resizedData(
      path.join(folder, `${character.id}-${library.formats.companion.outputStem}.png`),
      256,
      256,
      'nearest',
    );

    cards += `
      <rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="18" fill="${colors.soft}" stroke="${colors.border}"/>
      <text x="${x + 24}" y="${y + 41}" class="card-title">${escapeXml(character.name)}</text>
      <text x="${x + cardWidth - 24}" y="${y + 39}" text-anchor="end" class="card-detail">${escapeXml(character.detail)}</text>
      <rect x="${x + 20}" y="${y + 58}" width="210" height="236" rx="12" fill="#FFFFFF" stroke="${colors.border}"/>
      <rect x="${x + 246}" y="${y + 58}" width="234" height="236" rx="12" fill="#FFFFFF" stroke="${colors.border}"/>
      <text x="${x + 125}" y="${y + 326}" text-anchor="middle" class="format-label">HABITAT · 32 PX</text>
      <text x="${x + 363}" y="${y + 326}" text-anchor="middle" class="format-label">COMPANION · 64 PX</text>`;
    images.push(imageTag(habitat, x + 13, y + 64));
    images.push(imageTag(companion, x + 235, y + 48));
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <style>
        .eyebrow { font-family: Inter, Arial, sans-serif; font-size: 20px; font-weight: 800; letter-spacing: 3px; fill: ${colors.action}; }
        .title { font-family: Fraunces, Georgia, serif; font-size: 72px; font-weight: 700; fill: ${colors.text}; }
        .subtitle { font-family: Inter, Arial, sans-serif; font-size: 25px; fill: ${colors.muted}; }
        .card-title { font-family: Fraunces, Georgia, serif; font-size: 31px; font-weight: 700; fill: ${colors.text}; }
        .card-detail { font-family: Inter, Arial, sans-serif; font-size: 16px; font-weight: 650; fill: ${colors.muted}; }
        .format-label { font-family: 'Space Mono', Consolas, monospace; font-size: 15px; font-weight: 700; letter-spacing: 1px; fill: ${colors.muted}; }
      </style>
      <rect width="${width}" height="${height}" fill="${colors.canvas}"/>
      <text x="84" y="66" class="eyebrow">MUSICAL ZOO · APP-LOCAL ART SYSTEM</text>
      <text x="84" y="143" class="title">${escapeXml(review.nativeTitle || 'Tiny walkers, warm companions')}</text>
      <text x="84" y="197" class="subtitle">${escapeXml(review.nativeSubtitle || 'Each character is redrawn for its job—purpose-built habitat sprite and interactive companion.')}</text>
      ${spectrumBand(width, 228)}
      ${cards}
      ${images.join('')}
      <text x="84" y="${footerY}" class="subtitle">${escapeXml(review.label || 'Review V1')} · ${characters.length} habitat sprites · ${characters.length} interactive companions · ${integrationLabel}</text>
    </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(root, review.nativeBoard || 'musical-zoo-native-sprite-review-v1.png'));
}

async function buildStickerBoard() {
  const cardWidth = 500;
  const cardHeight = 380;
  const { width, height, footerY, top, rowGap } = boardDimensions(characters.length, cardHeight);
  const columnGap = 30;
  const left = 84;
  const poses = library.formats.stickers.poses;
  const poseLabels = ['CELEBRATE', 'ENCOURAGE', 'CONNECT'];
  const images = [];
  let cards = '';

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = left + column * (cardWidth + columnGap);
    const y = top + row * (cardHeight + rowGap);
    const folder = characterFolder(character);
    cards += `
      <rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="18" fill="${colors.soft}" stroke="${colors.border}"/>
      <text x="${x + 24}" y="${y + 43}" class="card-title">${escapeXml(character.name)}</text>
      <text x="${x + cardWidth - 24}" y="${y + 41}" text-anchor="end" class="card-detail">${escapeXml(character.detail)}</text>`;

    for (let poseIndex = 0; poseIndex < poses.length; poseIndex += 1) {
      const sticker = await resizedData(
        path.join(folder, `${character.id}-sticker-${poses[poseIndex]}-${library.formats.stickers.outputSuffix}.png`),
        148,
        250,
        'lanczos3',
      );
      const slotX = x + 16 + poseIndex * 158;
      const slotY = y + 70;
      cards += `<rect x="${slotX}" y="${slotY}" width="152" height="240" rx="12" fill="#FFFFFF" stroke="${colors.border}"/>`;
      cards += `<text x="${slotX + 76}" y="${y + 349}" text-anchor="middle" class="format-label">${poseLabels[poseIndex]}</text>`;
      images.push(imageTag(sticker, slotX + (152 - sticker.width) / 2, slotY + (240 - sticker.height) / 2));
    }
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <style>
        .eyebrow { font-family: Inter, Arial, sans-serif; font-size: 20px; font-weight: 800; letter-spacing: 3px; fill: ${colors.action}; }
        .title { font-family: Fraunces, Georgia, serif; font-size: 72px; font-weight: 700; fill: ${colors.text}; }
        .subtitle { font-family: Inter, Arial, sans-serif; font-size: 25px; fill: ${colors.muted}; }
        .card-title { font-family: Fraunces, Georgia, serif; font-size: 31px; font-weight: 700; fill: ${colors.text}; }
        .card-detail { font-family: Inter, Arial, sans-serif; font-size: 16px; font-weight: 650; fill: ${colors.muted}; }
        .format-label { font-family: 'Space Mono', Consolas, monospace; font-size: 13px; font-weight: 700; letter-spacing: .8px; fill: ${colors.muted}; }
      </style>
      <rect width="${width}" height="${height}" fill="${colors.canvas}"/>
      <text x="84" y="66" class="eyebrow">MUSICAL ZOO · APP-LOCAL ART SYSTEM</text>
      <text x="84" y="143" class="title">${escapeXml(review.stickerTitle || 'Full-art sticker collection')}</text>
      <text x="84" y="197" class="subtitle">${escapeXml(review.stickerSubtitle || 'Three expressive rewards per character: celebrate, encourage, and connect.')}</text>
      ${spectrumBand(width, 228)}
      ${cards}
      ${images.join('')}
      <text x="84" y="${footerY}" class="subtitle">${escapeXml(review.label || 'Review V1')} · ${characters.length * poses.length} transparent die-cut stickers · no unlock or progression changes</text>
    </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(root, review.stickerBoard || 'musical-zoo-sticker-review-v1.png'));
}

async function main() {
  await buildNativeBoard();
  await buildStickerBoard();
  process.stdout.write('Built native-sprite and sticker review boards.\n');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

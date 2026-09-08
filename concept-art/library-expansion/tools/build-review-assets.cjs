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

    throw new Error(
      'Sharp was not found in project dependencies or the Codex bundled runtime. ' +
      'Run this task inside Codex Desktop, or set CODEX_NODE_MODULES to the bundled node_modules directory.',
      { cause: projectError },
    );
  }
}

const sharp = loadSharp();

const expansionRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(expansionRoot, '..', '..');
const characterRoot = path.join(expansionRoot, 'characters');

const candidates = [
  { id: 'ringlet', name: 'Ringlet', role: 'Listening · careful attention' },
  { id: 'brumbo', name: 'Brumbo', role: 'Dynamics · gentle control' },
  { id: 'plinka', name: 'Plinka', role: 'Improvisation · playful curiosity' },
  { id: 'puffino', name: 'Puffino', role: 'Expression · personal choices' },
  { id: 'cymbi', name: 'Cymbi', role: 'Ensemble · thoughtful turn-taking' },
  { id: 'spirlo', name: 'Spirlo', role: 'Phrasing · patient pacing' },
];

const starterTrioPath = path.join(projectRoot, 'concept-art', 'musical-zoo-starter-trio-handheld-color-v3.png');
const riffinPath = path.join(projectRoot, 'concept-art', 'sprites', 'riffin-64x64-v2.png');
const tempoPath = path.join(projectRoot, 'concept-art', 'sprites', 'tempo-64x64-v1.png');

function escapeXml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  }[character]));
}

function asDataUrl(buffer) {
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

async function exportCandidate(candidate) {
  const folder = path.join(characterRoot, candidate.id);
  const svgPath = path.join(folder, `${candidate.id}-companion-64x64-v1.svg`);
  const pngPath = path.join(folder, `${candidate.id}-companion-64x64-v1.png`);
  const previewPath = path.join(folder, `${candidate.id}-companion-preview-8x-v1.png`);
  const svg = fs.readFileSync(svgPath);

  await sharp(svg).resize(64, 64, { fit: 'fill', kernel: 'nearest' }).png().toFile(pngPath);
  await sharp(pngPath).resize(512, 512, { fit: 'fill', kernel: 'nearest' }).png().toFile(previewPath);
  return fs.readFileSync(pngPath);
}

async function buildBoard(candidatePngs) {
  const riffin = fs.readFileSync(riffinPath);
  const boppoHistorical = fs.readFileSync(tempoPath);
  const chordilloReference = await sharp(starterTrioPath)
    .extract({ left: 1010, top: 225, width: 405, height: 545 })
    .resize(64, 64, { fit: 'contain', kernel: 'nearest', background: '#E9F0D0' })
    .png()
    .toBuffer();

  const entries = [
    { name: 'Riffin', role: 'LOCKED STARTER · current sprite', image: riffin, starter: true },
    { name: 'Boppo', role: 'LOCKED STARTER · Tempo draft art', image: boppoHistorical, starter: true },
    { name: 'Chordillo', role: 'LOCKED STARTER · concept crop', image: chordilloReference, starter: true },
    ...candidates.map((candidate, index) => ({ ...candidate, image: candidatePngs[index], starter: false })),
  ];

  const width = 1728;
  const height = 1728;
  const cardWidth = 520;
  const cardHeight = 456;
  const gap = 28;
  const left = 56;
  const top = 224;

  const cards = entries.map((entry, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = left + column * (cardWidth + gap);
    const y = top + row * (cardHeight + gap);
    const tag = entry.starter ? 'REFERENCE — DO NOT EDIT' : 'POST-STARTER CANDIDATE';
    const tagFill = entry.starter ? '#241E20' : '#6C5CE7';
    const image = asDataUrl(entry.image);
    return `<g transform="translate(${x} ${y})">
        <rect width="${cardWidth}" height="${cardHeight}" rx="18" fill="#FFFFFF" stroke="#C9C3C6"/>
        <rect x="24" y="24" width="${entry.starter ? 208 : 226}" height="30" rx="12" fill="${tagFill}"/>
        <text x="36" y="45" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">${tag}</text>
        <text x="24" y="92" font-family="Georgia, serif" font-size="32" font-weight="700" fill="#241E20">${escapeXml(entry.name)}</text>
        <text x="24" y="121" font-family="Arial, sans-serif" font-size="15" fill="#544C50">${escapeXml(entry.role)}</text>
        <rect x="24" y="148" width="104" height="104" fill="#F8F9FA" stroke="#C9C3C6"/>
        <path d="M24 174h104M24 200h104M24 226h104M50 148v104M76 148v104M102 148v104" stroke="#E8E4E6"/>
        <image href="${image}" x="44" y="168" width="64" height="64" image-rendering="pixelated"/>
        <text x="24" y="276" font-family="monospace" font-size="14" fill="#544C50">NATIVE 64 × 64</text>
        <rect x="200" y="148" width="280" height="280" fill="#F8F9FA" stroke="#C9C3C6"/>
        <image href="${image}" x="212" y="160" width="256" height="256" image-rendering="pixelated"/>
        <text x="200" y="448" font-family="monospace" font-size="14" fill="#544C50">4× NEAREST-NEIGHBOR REVIEW</text>
      </g>`;
  }).join('');

  const boardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#F8F9FA"/>
    <rect width="${width}" height="18" fill="#FF1717"/>
    <rect x="288" width="288" height="18" fill="#FF904E"/>
    <rect x="576" width="288" height="18" fill="#FFDE59"/>
    <rect x="864" width="288" height="18" fill="#60E027"/>
    <rect x="1152" width="288" height="18" fill="#00BAFF"/>
    <rect x="1440" width="288" height="18" fill="#8B51FE"/>
    <text x="56" y="80" font-family="Georgia, serif" font-size="48" font-weight="700" fill="#241E20">Musical Zoo character library</text>
    <text x="56" y="120" font-family="Arial, sans-serif" font-size="22" fill="#544C50">Companion review board · proposed app-local illustration language · v1</text>
    <text x="56" y="162" font-family="Arial, sans-serif" font-size="17" fill="#241E20">Starter identities are locked. Boppo uses historical Tempo draft art; Chordillo uses a review-only crop. Six candidates stop at the 64×64 companion gate.</text>
    ${cards}
    <text x="56" y="1690" font-family="Arial, sans-serif" font-size="16" fill="#544C50">Review silhouettes at native size first. Enlargement exposes pixel construction; it does not replace phone-scale judgment.</text>
  </svg>`;

  const boardSourcePath = path.join(expansionRoot, 'musical-zoo-library-review-board-v1.svg');
  const boardPngPath = path.join(expansionRoot, 'musical-zoo-library-review-board-v1.png');
  fs.writeFileSync(boardSourcePath, boardSvg);
  await sharp(Buffer.from(boardSvg)).png().toFile(boardPngPath);
}

async function main() {
  const candidatePngs = [];
  for (const candidate of candidates) {
    candidatePngs.push(await exportCandidate(candidate));
  }
  await buildBoard(candidatePngs);
  process.stdout.write(`Built ${candidatePngs.length} companion PNGs, ${candidatePngs.length} previews, and one review board.\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

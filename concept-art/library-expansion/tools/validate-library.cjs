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

const projectRoot = path.resolve(__dirname, '..', '..', '..');
const designRoot = path.join(projectRoot, 'character-design', 'library-expansion');
const artRoot = path.join(projectRoot, 'concept-art', 'library-expansion');
const catalogPath = path.join(designRoot, 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const failures = [];

function fail(message) {
  failures.push(message);
}

function normalizeHex(value) {
  return value.toUpperCase();
}

async function validateCandidate(candidate) {
  const packetDir = path.join(designRoot, 'characters', candidate.id);
  const manifestPath = path.join(packetDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const expectedId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const expectedName = /^[A-Za-z]+$/;

  if (!expectedId.test(candidate.id) || manifest.id !== candidate.id) fail(`${candidate.id}: unstable or mismatched ID`);
  if (!expectedName.test(manifest.name) || manifest.name.length < 4 || manifest.name.length > 9) fail(`${candidate.id}: name is not short early-reader ASCII`);
  if (manifest.starterRole !== null || manifest.canonical !== false || manifest.status !== 'companion-review') fail(`${candidate.id}: proposal boundary is not explicit`);

  const palette = Object.values(manifest.palette).map(normalizeHex);
  if (palette.length !== 4 || new Set(palette).size !== 4 || palette[0] !== '#201923') fail(`${candidate.id}: palette must be four unique colors with shared outline`);

  const svgPath = path.resolve(packetDir, manifest.companion.sourceSvg);
  const pngPath = path.resolve(packetDir, manifest.companion.nativePng);
  const previewPath = path.resolve(packetDir, manifest.companion.previewPng);
  for (const assetPath of [svgPath, pngPath, previewPath]) {
    if (!fs.existsSync(assetPath)) fail(`${candidate.id}: missing ${assetPath}`);
  }
  if (!fs.existsSync(svgPath) || !fs.existsSync(pngPath) || !fs.existsSync(previewPath)) return;

  const svg = fs.readFileSync(svgPath, 'utf8');
  if (!/width="64"/.test(svg) || !/height="64"/.test(svg) || !/viewBox="0 0 64 64"/.test(svg)) fail(`${candidate.id}: SVG canvas is not exactly 64×64`);
  if (!/shape-rendering="crispEdges"/.test(svg)) fail(`${candidate.id}: crispEdges missing`);
  if (/<(?:linearGradient|radialGradient|filter|image|text|foreignObject|style)\b/i.test(svg)) fail(`${candidate.id}: forbidden SVG element present`);
  if (/\b(?:stroke|filter|opacity|style)=/i.test(svg)) fail(`${candidate.id}: forbidden SVG effect attribute present`);
  if (/\d+\.\d+/.test(svg)) fail(`${candidate.id}: subpixel number present`);
  const fills = [...svg.matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)].map((match) => normalizeHex(match[1]));
  const svgColors = [...new Set(fills)].sort();
  const declaredColors = [...palette].sort();
  if (JSON.stringify(svgColors) !== JSON.stringify(declaredColors)) fail(`${candidate.id}: SVG colors differ from declared palette`);

  const metadata = await sharp(pngPath).metadata();
  if (metadata.width !== 64 || metadata.height !== 64 || metadata.hasAlpha !== true) fail(`${candidate.id}: native PNG size/alpha mismatch`);
  const previewMetadata = await sharp(previewPath).metadata();
  if (previewMetadata.width !== 512 || previewMetadata.height !== 512 || previewMetadata.hasAlpha !== true) fail(`${candidate.id}: preview PNG size/alpha mismatch`);

  const { data, info } = await sharp(pngPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const opaque = new Set();
  let transparentCount = 0;
  for (let offset = 0; offset < data.length; offset += info.channels) {
    const alpha = data[offset + 3];
    if (alpha === 0) {
      transparentCount += 1;
      continue;
    }
    if (alpha !== 255) fail(`${candidate.id}: PNG contains partial alpha`);
    opaque.add(`#${data[offset].toString(16).padStart(2, '0')}${data[offset + 1].toString(16).padStart(2, '0')}${data[offset + 2].toString(16).padStart(2, '0')}`.toUpperCase());
  }
  if (transparentCount === 0) fail(`${candidate.id}: PNG has no transparent pixels`);
  if (JSON.stringify([...opaque].sort()) !== JSON.stringify(declaredColors)) fail(`${candidate.id}: PNG opaque colors differ from declared palette`);
}

async function main() {
  if (catalog.candidateCount !== 6 || catalog.candidates.length !== 6) fail('Catalog must contain exactly six candidates');
  const fields = ['id', 'name', 'musicalRole', 'practiceVirtue'];
  for (const field of fields) {
    const values = catalog.candidates.map((candidate) => candidate[field]);
    if (new Set(values).size !== values.length) fail(`Catalog ${field} values are not distinct`);
  }

  for (const candidate of catalog.candidates) await validateCandidate(candidate);

  const board = path.join(artRoot, 'musical-zoo-library-review-board-v1.png');
  const boardMetadata = await sharp(board).metadata();
  if (boardMetadata.width !== 1728 || boardMetadata.height !== 1728) fail('Review board must be 1728×1728');

  if (failures.length) {
    for (const failure of failures) process.stderr.write(`FAIL: ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('PASS: 6 unique proposal IDs, names, roles, and virtues.\n');
  process.stdout.write('PASS: 6 SVGs are 64×64, grid-aligned, crisp, effect-free, and four-color.\n');
  process.stdout.write('PASS: 6 native PNGs are 64×64 with binary transparency and declared palettes only.\n');
  process.stdout.write('PASS: 6 nearest-neighbor previews are 512×512 with alpha.\n');
  process.stdout.write('PASS: comparison board is 1728×1728.\n');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

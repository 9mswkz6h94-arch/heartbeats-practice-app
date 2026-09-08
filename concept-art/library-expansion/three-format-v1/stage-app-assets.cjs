const fs = require('fs');
const path = require('path');
const { characterFolder, loadLibrary, root } = require('./library-config.cjs');

const library = loadLibrary();
const appRoot = path.resolve(root, '../../..');
const publicRoot = path.join(appRoot, 'public', 'characters');
const idArgumentIndex = process.argv.indexOf('--ids');

if (idArgumentIndex < 0 || !process.argv[idArgumentIndex + 1]) {
  throw new Error('Provide a comma-separated character list with --ids.');
}

const requestedIds = [...new Set(process.argv[idArgumentIndex + 1]
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean))];
const charactersById = new Map(library.characters.map((character) => [character.id, character]));

for (const id of requestedIds) {
  const character = charactersById.get(id);
  if (!character) throw new Error(`Unknown accepted character: ${id}`);
  if (character.status !== 'accepted-art-package') {
    throw new Error(`${id} is not at the accepted-art-package gate.`);
  }

  const sourceFolder = characterFolder(character);
  const destinationFolder = path.join(publicRoot, id);
  fs.mkdirSync(destinationFolder, { recursive: true });
  const copies = [
    [`${id}-${library.formats.habitat.outputStem}.png`, 'roaming-32.png'],
    [`${id}-${library.formats.companion.outputStem}.png`, 'companion-64.png'],
    ...library.formats.stickers.poses.map((pose) => [
      `${id}-sticker-${pose}-${library.formats.stickers.outputSuffix}.png`,
      `sticker-${pose}-768.png`,
    ]),
  ];

  for (const [sourceName, destinationName] of copies) {
    const source = path.join(sourceFolder, sourceName);
    const destination = path.join(destinationFolder, destinationName);
    if (!fs.existsSync(source)) throw new Error(`Missing accepted output: ${source}`);
    fs.copyFileSync(source, destination);
  }
  process.stdout.write(`${id}: staged habitat, companion, and three stickers in public/characters/${id}\n`);
}

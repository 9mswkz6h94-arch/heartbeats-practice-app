const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const result = { dryRun: false, root: path.resolve(__dirname, '..', '..', '..') };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--dry-run') {
      result.dryRun = true;
      continue;
    }
    if (!token.startsWith('--') || index + 1 >= argv.length) throw new Error(`Invalid argument: ${token}`);
    result[token.slice(2)] = argv[index + 1];
    index += 1;
  }
  return result;
}

function replaceTemplate(template, values) {
  return template
    .replace(/^# Character name/m, `# ${values.name}`)
    .replace(/\*\*Stable ID:\*\*$/m, `**Stable ID:** \`${values.id}\``)
    .replace(/\*\*Animal:\*\*$/m, `**Animal:** ${values.animal}`)
    .replace(/\*\*Integrated instrument:\*\*$/m, `**Integrated instrument:** ${values.instrument}`)
    .replace(/\*\*Musical role:\*\*$/m, `**Musical role:** ${values.role}`)
    .replace(/\*\*Practice virtue:\*\*$/m, `**Practice virtue:** ${values.virtue}`);
}

function assertSafeId(id) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id || '')) {
    throw new Error('--id must use lowercase ASCII kebab-case');
  }
}

function writeNew(filePath, contents, dryRun) {
  if (!dryRun) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, contents, 'utf8');
  }
  process.stdout.write(`${dryRun ? 'WOULD CREATE' : 'CREATED'} ${filePath}\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const required = ['id', 'name', 'animal', 'instrument', 'role', 'virtue'];
  for (const key of required) {
    if (!args[key]?.trim()) throw new Error(`Missing --${key}`);
  }
  assertSafeId(args.id);

  const repoRoot = path.resolve(args.root);
  const characterRoot = path.join(repoRoot, 'character-design', 'characters', args.id);
  const artRoot = path.join(repoRoot, 'concept-art', 'library-expansion', 'three-format-v1', 'characters', args.id);
  const templateRoot = path.join(repoRoot, 'character-design', 'characters', '_template');
  const acceptedLibraryPath = path.join(repoRoot, 'concept-art', 'library-expansion', 'three-format-v1', 'character-library.manifest.json');
  const templateCharacter = fs.readFileSync(path.join(templateRoot, 'CHARACTER.md'), 'utf8');
  const templateManifest = JSON.parse(fs.readFileSync(path.join(templateRoot, 'manifest.json'), 'utf8'));
  const templateVoice = JSON.parse(fs.readFileSync(path.join(templateRoot, 'voice-pack-v1.json'), 'utf8'));

  const values = {
    id: args.id,
    name: args.name.trim(),
    animal: args.animal.trim(),
    instrument: args.instrument.trim(),
    role: args.role.trim(),
    virtue: args.virtue.trim(),
  };
  if (fs.existsSync(acceptedLibraryPath)) {
    const acceptedLibrary = JSON.parse(fs.readFileSync(acceptedLibraryPath, 'utf8'));
    const duplicate = acceptedLibrary.characters?.find((character) => (
      character.id === values.id || character.name.toLowerCase() === values.name.toLowerCase()
    ));
    if (duplicate) throw new Error(`Refusing to scaffold accepted character: ${duplicate.id} (${duplicate.name})`);
  }
  const characterSheet = replaceTemplate(templateCharacter, values);
  const manifest = {
    ...templateManifest,
    id: values.id,
    name: values.name,
    animal: values.animal,
    instrument: values.instrument,
    musicalRole: values.role,
    practiceVirtue: values.virtue,
  };
  const voice = { ...templateVoice, characterId: values.id };
  const gateReview = `# ${values.name} gate review\n\nStatus: **Gate 1 — identity**\n\n- [ ] Identity and anatomy invariant accepted\n- [ ] Companion master accepted\n- [ ] Purpose-authored habitat sprite accepted\n- [ ] Celebrate, encourage, and connect stickers accepted\n- [ ] Accepted source versions pinned in the library manifest\n- [ ] Deterministic build and validator pass\n- [ ] App integration separately authorized\n`;
  const sourceNotes = `# ${values.name} source notes\n\nKeep every generated master. Never overwrite an accepted source.\n\nExpected accepted-source naming after review:\n\n- \`${values.id}-companion-master-v1.png\`\n- \`${values.id}-habitat-source-v1.png\`\n- \`${values.id}-sticker-sheet-source-v1.png\`\n\nDo not add this character to \`character-library.manifest.json\` until all three source families pass human review.\n`;

  const outputs = [
    [path.join(characterRoot, 'CHARACTER.md'), characterSheet],
    [path.join(characterRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`],
    [path.join(characterRoot, 'voice-pack-v1.json'), `${JSON.stringify(voice, null, 2)}\n`],
    [path.join(characterRoot, 'GATE_REVIEW.md'), gateReview],
    [path.join(artRoot, 'SOURCE_NOTES.md'), sourceNotes],
  ];
  const existing = outputs.map(([filePath]) => filePath).filter((filePath) => fs.existsSync(filePath));
  if (existing.length) throw new Error(`Refusing to overwrite existing files:\n${existing.join('\n')}`);
  for (const [filePath, contents] of outputs) writeNew(filePath, contents, args.dryRun);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

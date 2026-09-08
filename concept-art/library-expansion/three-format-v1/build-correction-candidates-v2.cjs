const path = require('path');
const { spawnSync } = require('child_process');

const root = __dirname;
const manifest = path.join(root, 'character-corrections-v2.candidate.manifest.json');
const scripts = [
  'build-native-assets.cjs',
  'build-sticker-assets.cjs',
  'build-review-boards.cjs',
  'validate-three-format.cjs',
];

for (const script of scripts) {
  const result = spawnSync(process.execPath, [path.join(root, script)], {
    cwd: root,
    env: {
      ...process.env,
      ZOO_MANIFEST_PATH: manifest,
      ZOO_PACKAGE_GATE: 'proposed-correction-package',
      ZOO_CHARACTER_GATE: 'proposed-correction',
    },
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

process.stdout.write('Built and validated Riffin + Ringlet correction candidates without changing accepted pins.\n');

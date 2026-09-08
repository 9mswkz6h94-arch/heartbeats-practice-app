const { spawnSync } = require('child_process');
const path = require('path');

const steps = [
  'build-native-assets.cjs',
  'build-sticker-assets.cjs',
  'build-review-boards.cjs',
  'validate-three-format.cjs',
];

for (const step of steps) {
  process.stdout.write(`\n[Musical Zoo] ${step}\n`);
  const result = spawnSync(process.execPath, [path.join(__dirname, step)], {
    cwd: __dirname,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

process.stdout.write('\nMusical Zoo accepted art package rebuilt and validated.\n');

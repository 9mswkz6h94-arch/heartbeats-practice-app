const fs = require('fs');
const path = require('path');

const environment = { ...process.env };
const localEnvironmentPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(localEnvironmentPath)) {
  for (const line of fs.readFileSync(localEnvironmentPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match || match[1] in environment) continue;
    environment[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

const required = {
  REACT_APP_SUPABASE_URL: environment.REACT_APP_SUPABASE_URL,
  REACT_APP_SUPABASE_ANON_KEY: environment.REACT_APP_SUPABASE_ANON_KEY,
};

const errors = Object.entries(required)
  .filter(([, value]) => !value)
  .map(([name]) => `${name} is required`);

if (environment.REACT_APP_REVIEW_DATA_MODE) {
  errors.push('REACT_APP_REVIEW_DATA_MODE must be unset for real-role staging tests');
}

if (environment.REACT_APP_STAGING_DATABASE_CONFIRMATION !== 'isolated-sanitized') {
  errors.push('REACT_APP_STAGING_DATABASE_CONFIRMATION must equal isolated-sanitized');
}

if (/your-isolated-project|your-isolated-anon-key/i.test(
  `${required.REACT_APP_SUPABASE_URL || ''} ${required.REACT_APP_SUPABASE_ANON_KEY || ''}`
)) {
  errors.push('replace the example Supabase URL and anon key with isolated staging values');
}

if (errors.length) {
  console.error('Staging environment check failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Staging environment is explicitly marked isolated and sanitized.');

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const migrationDirectory = path.join(projectRoot, 'SQL_MIGRATIONS');

const releaseMigrations = [
  {
    filename: '016_invite_only_teachers.sql',
    required: [
      /DROP POLICY IF EXISTS "Allow anonymous signup"/i,
      /type IN \('student', 'parent'\)/i,
      /Teacher profiles must be created by the service role/i,
    ],
  },
  {
    filename: '017_assignment_lifecycle.sql',
    required: [
      /ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ/i,
      /CREATE OR REPLACE FUNCTION public\.resolve_practice_assignment/i,
      /CREATE OR REPLACE FUNCTION public\.guard_active_practice_write/i,
      /DELETE FROM public\.daily_practice_status/i,
    ],
    forbidden: [
      /DELETE FROM public\.completions/i,
      /TRUNCATE\s+(?:TABLE\s+)?public\.(?:completions|assignments|practice_steps)/i,
    ],
  },
  {
    filename: '018_lesson_memory.sql',
    required: [
      /CREATE TABLE IF NOT EXISTS public\.lesson_sessions/i,
      /CREATE TABLE IF NOT EXISTS public\.lesson_notes/i,
      /CREATE TABLE IF NOT EXISTS public\.assignment_drafts/i,
      /ALTER TABLE public\.lesson_sessions ENABLE ROW LEVEL SECURITY/i,
      /REVOKE ALL ON public\.lesson_sessions FROM anon/i,
    ],
  },
  {
    filename: '019_family_profiles.sql',
    required: [
      /ADD COLUMN IF NOT EXISTS birthday DATE/i,
      /CREATE TABLE IF NOT EXISTS public\.family_guardians/i,
      /ALTER TABLE public\.family_guardians ENABLE ROW LEVEL SECURITY/i,
      /REVOKE ALL ON public\.family_guardians FROM anon/i,
    ],
  },
  {
    filename: '020_student_zoo_preferences.sql',
    required: [
      /CREATE TABLE IF NOT EXISTS public\.student_zoo_preferences/i,
      /ALTER TABLE public\.student_zoo_preferences ENABLE ROW LEVEL SECURITY/i,
      /REVOKE ALL ON public\.student_zoo_preferences FROM anon/i,
      /no practice or reward ledger data/i,
    ],
  },
  {
    filename: '021_teacher_badge_awards.sql',
    required: [
      /CREATE TABLE IF NOT EXISTS public\.teacher_badge_awards/i,
      /ALTER TABLE public\.teacher_badge_awards ENABLE ROW LEVEL SECURITY/i,
      /teacher_id = auth\.uid\(\)/i,
      /public\.is_teacher_of\(student_id\)/i,
      /public\.is_parent_of\(student_id\)/i,
      /CHECK \(order_status = 'not-requested'\)/i,
      /REVOKE ALL ON public\.teacher_badge_awards FROM anon/i,
    ],
    forbidden: [
      /DELETE FROM public\.student_badges/i,
      /UPDATE public\.student_badges/i,
      /INSERT INTO public\.student_badges/i,
    ],
  },
  {
    filename: '022_atomic_assignment_publish.sql',
    required: [
      /CREATE OR REPLACE FUNCTION public\.publish_assignment_draft/i,
      /FOR UPDATE/i,
      /UPDATE public\.assignment_drafts/i,
      /REVOKE ALL ON FUNCTION public\.publish_assignment_draft/i,
      /GRANT EXECUTE ON FUNCTION public\.publish_assignment_draft/i,
    ],
    forbidden: [
      /DELETE FROM public\.completions/i,
      /TRUNCATE\s+(?:TABLE\s+)?public\.(?:completions|assignments|practice_steps)/i,
    ],
  },
  {
    filename: '023_student_zoo_character_ownership.sql',
    required: [
      /ALTER TABLE public\.student_zoo_preferences/i,
      /ADD COLUMN IF NOT EXISTS owned_character_ids JSONB/i,
      /jsonb_typeof\(owned_character_ids\) = 'array'/i,
      /arrival policy is owned by the app/i,
    ],
    forbidden: [
      /DELETE FROM public\.(?:completions|pets|pet_creatures)/i,
      /TRUNCATE\s+(?:TABLE\s+)?public\.(?:completions|pets|pet_creatures)/i,
    ],
  },
  {
    filename: '024_egg_xp_cadence.sql',
    required: [
      /CREATE OR REPLACE FUNCTION public\.award_pet_xp/i,
      /new_xp % 10 = 0/i,
      /INSERT INTO public\.pet_creatures/i,
      /missed days never remove progress/i,
    ],
    forbidden: [
      /DELETE FROM public\.(?:pets|completions)/i,
      /UPDATE public\.(?:pets|completions)/i,
    ],
  },
];

const errors = [];
const numberedFiles = fs
  .readdirSync(migrationDirectory)
  .filter((filename) => /^\d{3}_.+\.sql$/i.test(filename));

const filesByNumber = new Map();
for (const filename of numberedFiles) {
  const number = filename.slice(0, 3);
  const group = filesByNumber.get(number) || [];
  group.push(filename);
  filesByNumber.set(number, group);
}

for (const [number, filenames] of filesByNumber) {
  if (filenames.length > 1) {
    errors.push(`duplicate migration prefix ${number}: ${filenames.join(', ')}`);
  }
}

for (const migration of releaseMigrations) {
  const migrationPath = path.join(migrationDirectory, migration.filename);
  if (!fs.existsSync(migrationPath)) {
    errors.push(`missing release migration ${migration.filename}`);
    continue;
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  if (!/^\s*(?:--[^\r\n]*(?:\r?\n|$)|\s)*BEGIN;/i.test(sql)) {
    errors.push(`${migration.filename} does not begin with an explicit transaction`);
  }
  if (!/COMMIT;\s*$/i.test(sql)) {
    errors.push(`${migration.filename} does not end with COMMIT`);
  }

  for (const pattern of migration.required) {
    if (!pattern.test(sql)) {
      errors.push(`${migration.filename} is missing release invariant ${pattern}`);
    }
  }
  for (const pattern of migration.forbidden || []) {
    if (pattern.test(sql)) {
      errors.push(`${migration.filename} contains forbidden destructive statement ${pattern}`);
    }
  }
}

if (errors.length > 0) {
  console.error('Release migration checks failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Release migration checks passed for ${releaseMigrations.length} ordered migrations (016-024).`,
);

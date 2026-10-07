import fs from "fs";
import path from "path";

const migrationPath = path.resolve(
  __dirname,
  "../../SQL_MIGRATIONS/027_overdue_practice_visibility.sql"
);
const rehearsalPath = path.resolve(
  __dirname,
  "../../scripts/verify_overdue_assignment_lifecycle.sql"
);
const rollbackPath = path.resolve(
  __dirname,
  "../../SQL_MIGRATIONS/ROLLBACK_027_overdue_practice_visibility.sql"
);

const migration = fs.readFileSync(migrationPath, "utf8");
const rehearsal = fs.readFileSync(rehearsalPath, "utf8");
const rollback = fs.readFileSync(rollbackPath, "utf8");

test("overdue visibility migration removes only deadline eligibility gates", () => {
  expect(migration).toMatch(/BEGIN;/i);
  expect(migration).toMatch(/COMMIT;/i);
  expect(migration).toMatch(/CREATE POLICY completions_insert/i);
  expect(migration).toMatch(/CREATE POLICY daily_practice_status_insert/i);
  expect(migration).toMatch(/CREATE POLICY daily_practice_status_update/i);
  expect(migration).toMatch(/CREATE OR REPLACE FUNCTION public\.guard_active_practice_write/i);
  expect(migration).toMatch(/student\.auth_user_id = auth\.uid\(\)/i);
  expect(migration).toMatch(/assignment\.archived_at IS NULL/i);
  expect(migration).toMatch(/assignment\.memorized IS NOT TRUE/i);
  expect(migration).toMatch(/FOR SHARE OF assignment/i);
  expect(migration).not.toMatch(/assignment\.deadline/i);
  expect(migration).not.toMatch(/DELETE FROM public\.(?:completions|daily_practice_status)/i);
});

test("overdue lifecycle rehearsal covers allowed and protected paths", () => {
  expect(rehearsal).toMatch(/INSERT INTO public\.assignments[\s\S]*v_today - 7/i);
  expect(rehearsal).toMatch(/INSERT INTO public\.daily_practice_status[\s\S]*'pending'/i);
  expect(rehearsal).toMatch(/SET status = 'completed'/i);
  expect(rehearsal).toMatch(/SET status = 'skipped'/i);
  expect(rehearsal).toMatch(/Cross-student completion unexpectedly succeeded/i);
  expect(rehearsal).toMatch(/Cross-student daily insert unexpectedly succeeded/i);
  expect(rehearsal).toMatch(/Cross-student daily update unexpectedly succeeded/i);
  expect(rehearsal).toMatch(/Mismatched-step completion unexpectedly succeeded/i);
  expect(rehearsal).toMatch(/Archived assignment unexpectedly accepted/i);
  expect(rehearsal).toMatch(/Memorized assignment unexpectedly accepted/i);
  expect(rehearsal).toMatch(/Rejected writes changed completion history/i);
});

test("rollback packet restores the old deadline gate without deleting history", () => {
  expect(rollback).toMatch(/BEGIN;/i);
  expect(rollback).toMatch(/COMMIT;/i);
  expect(rollback).toMatch(/assignment\.deadline IS NULL/i);
  expect(rollback).toMatch(/assignment\.deadline >=/i);
  expect(rollback).not.toMatch(/DELETE FROM public\.(?:completions|daily_practice_status)/i);
});

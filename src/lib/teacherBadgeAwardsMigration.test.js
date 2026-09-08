import fs from "fs";
import path from "path";

const migration = fs.readFileSync(
  path.join(__dirname, "../../SQL_MIGRATIONS/021_teacher_badge_awards.sql"),
  "utf8"
);

test("teacher badge awards are isolated from the automatic badge ledger", () => {
  expect(migration).toMatch(/CREATE TABLE IF NOT EXISTS public\.teacher_badge_awards/i);
  expect(migration).toMatch(/ENABLE ROW LEVEL SECURITY/i);
  expect(migration).toMatch(/teacher_id = auth\.uid\(\)/i);
  expect(migration).toMatch(/public\.is_teacher_of\(student_id\)/i);
  expect(migration).toMatch(/public\.is_parent_of\(student_id\)/i);
  expect(migration).toMatch(/CHECK \(order_status = 'not-requested'\)/i);
  expect(migration).not.toMatch(/(?:DELETE|UPDATE|INSERT INTO) public\.student_badges/i);
});

test("teacher badge awards are atomic and unavailable to anonymous clients", () => {
  expect(migration).toMatch(/BEGIN;/i);
  expect(migration).toMatch(/REVOKE ALL ON public\.teacher_badge_awards FROM anon/i);
  expect(migration).toMatch(/COMMIT;\s*$/i);
});

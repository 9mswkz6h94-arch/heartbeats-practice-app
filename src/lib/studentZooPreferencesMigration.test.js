import fs from "fs";
import path from "path";

const migration = fs.readFileSync(
  path.resolve(__dirname, "../../SQL_MIGRATIONS/020_student_zoo_preferences.sql"),
  "utf8"
);

test("Zoo preferences are student-scoped and anonymous access is revoked", () => {
  expect(migration).toContain("ALTER TABLE public.student_zoo_preferences ENABLE ROW LEVEL SECURITY;");
  expect(migration).toMatch(/student_manage_own_zoo_preferences/i);
  expect(migration).toMatch(/auth_user_id = auth\.uid\(\)/i);
  expect(migration).toContain("REVOKE ALL ON public.student_zoo_preferences FROM anon;");
});

test("Zoo preferences do not duplicate practice or reward ledgers", () => {
  expect(migration).not.toMatch(/\b(streak|completion|xp|assignment_id|practice_step_id)\s+(integer|uuid|jsonb|text)/i);
  expect(migration).toMatch(/arrangement and companion choices only/i);
});

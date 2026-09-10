import fs from "fs";
import path from "path";

const migration = fs.readFileSync(
  path.resolve(__dirname, "../../SQL_MIGRATIONS/022_atomic_assignment_publish.sql"),
  "utf8"
);

test("atomic assignment publishing keeps the draft, assignment, and steps in one transaction", () => {
  expect(migration).toContain("CREATE OR REPLACE FUNCTION public.publish_assignment_draft");
  expect(migration).toContain("FOR UPDATE");
  expect(migration).toContain("INSERT INTO public.assignments");
  expect(migration).toContain("INSERT INTO public.practice_steps");
  expect(migration).toContain("UPDATE public.assignment_drafts");
  expect(migration).toContain("status = 'published'");
  expect(migration).toContain("REVOKE ALL ON FUNCTION public.publish_assignment_draft");
  expect(migration).toContain("GRANT EXECUTE ON FUNCTION public.publish_assignment_draft");
});

test("atomic assignment publishing does not mutate student practice history", () => {
  expect(migration).not.toMatch(/DELETE FROM public\.(completions|daily_practice_status|student_badges)/i);
  expect(migration).not.toMatch(/UPDATE public\.(completions|daily_practice_status|student_badges)/i);
});

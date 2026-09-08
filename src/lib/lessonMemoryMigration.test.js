import fs from "fs";
import path from "path";

const migration = fs.readFileSync(
  path.resolve(__dirname, "../../SQL_MIGRATIONS/018_lesson_memory.sql"),
  "utf8"
);

test("lesson memory tables enable row-level security", () => {
  ["lesson_sessions", "lesson_notes", "assignment_drafts"].forEach((table) => {
    expect(migration).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
  });
});

test("lesson memory grants no anonymous or student-facing policy", () => {
  expect(migration).toContain("REVOKE ALL ON public.lesson_sessions FROM anon;");
  expect(migration).toContain("REVOKE ALL ON public.lesson_notes FROM anon;");
  expect(migration).not.toMatch(/CREATE POLICY\s+\S*(student|parent)\S*\s+ON public\.(lesson_sessions|lesson_notes|assignment_drafts)/i);
});

test("teacher policies verify ownership through the real student relationship", () => {
  expect(migration.match(/public\.is_teacher_of\(/g)?.length).toBeGreaterThanOrEqual(4);
  expect(migration).toContain("teacher_id = auth.uid()");
});

test("the schema explicitly excludes recording and transcript storage", () => {
  expect(migration).not.toMatch(/^\s*(audio|recording|transcript)_/im);
  expect(migration).toContain("Short teacher-entered notes only; no audio, recording, or transcript storage.");
});

import fs from "fs";
import path from "path";

const migration = fs.readFileSync(
  path.join(__dirname, "../../SQL_MIGRATIONS/023_student_zoo_character_ownership.sql"),
  "utf8",
);

describe("Musical Zoo ownership migration", () => {
  test("adds explicit owned character IDs without touching reward ledgers", () => {
    expect(migration).toMatch(/ALTER TABLE public\.student_zoo_preferences/);
    expect(migration).toMatch(/owned_character_ids JSONB NOT NULL DEFAULT '\[\]'::jsonb/);
    expect(migration).toMatch(/jsonb_typeof\(owned_character_ids\) = 'array'/);
    expect(migration).toMatch(/arrival policy is owned by the app/i);
    expect(migration).not.toMatch(/DELETE FROM public\.(completions|pets|pet_creatures)/i);
    expect(migration).not.toMatch(/TRUNCATE\s+(?:TABLE\s+)?public\.(completions|pets|pet_creatures)/i);
  });
});

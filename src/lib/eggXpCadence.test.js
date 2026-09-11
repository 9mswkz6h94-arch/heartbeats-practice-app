import fs from "fs";
import path from "path";
import { EGG_XP_INTERVAL } from "./petStages";

const migration = fs.readFileSync(
  path.resolve(__dirname, "../../SQL_MIGRATIONS/024_egg_xp_cadence.sql"),
  "utf8",
);

describe("calm egg XP cadence", () => {
  test("keeps eggs XP-earned at the two-week target without adding decay", () => {
    expect(EGG_XP_INTERVAL).toBe(10);
    expect(migration).toMatch(/CREATE OR REPLACE FUNCTION public\.award_pet_xp/i);
    expect(migration).toMatch(/new_xp % 10 = 0/i);
    expect(migration).toMatch(/INSERT INTO public\.pet_creatures/i);
    expect(migration).toMatch(/missed days never remove progress/i);
    expect(migration).not.toMatch(/DELETE FROM public\.(?:pets|completions)/i);
  });
});

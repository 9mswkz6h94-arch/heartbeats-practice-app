import fs from "fs";
import path from "path";

describe("family profile migration", () => {
  const sql = fs.readFileSync(
    path.join(process.cwd(), "SQL_MIGRATIONS", "019_family_profiles.sql"),
    "utf8"
  );

  test("keeps profile data private and does not store a duplicate age", () => {
    expect(sql).toMatch(/ENABLE ROW LEVEL SECURITY/i);
    expect(sql).toMatch(/REVOKE ALL ON public\.family_guardians FROM anon/i);
    expect(sql).toMatch(/teacher_read_family_guardians/i);
    expect(sql).not.toMatch(/ADD COLUMN IF NOT EXISTS age\b/i);
  });

  test("requires a usable contact method for additional guardians", () => {
    expect(sql).toMatch(/CHECK \(email IS NOT NULL OR phone IS NOT NULL\)/i);
  });
});

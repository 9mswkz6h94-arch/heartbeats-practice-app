import {
  birthdayError,
  calculateAge,
  normalizeOptionalText,
} from "./familyProfile";

describe("family profile helpers", () => {
  const today = new Date(2026, 8, 5);

  test("derives age from birthday instead of storing a second value", () => {
    expect(calculateAge("2016-08-20", today)).toBe(10);
    expect(calculateAge("2016-10-14", today)).toBe(9);
    expect(calculateAge("2012-09-05", today)).toBe(14);
  });

  test("rejects malformed and future birthdays", () => {
    expect(calculateAge("", today)).toBe("—");
    expect(calculateAge("2027-01-01", today)).toBe("—");
    expect(calculateAge("2020-02-31", today)).toBe("—");
    expect(birthdayError("2027-01-01", today)).toMatch(/past/i);
  });

  test("normalizes optional profile fields without inventing values", () => {
    expect(normalizeOptionalText("  they / them ")).toBe("they / them");
    expect(normalizeOptionalText("   ")).toBeNull();
  });
});

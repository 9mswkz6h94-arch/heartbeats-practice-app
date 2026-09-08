import { calculateAge } from "./FamilySetupFixture";

describe("family setup age calculation", () => {
  const today = new Date(2026, 8, 5);

  test("calculates age from birthday instead of storing a second value", () => {
    expect(calculateAge("2016-08-20", today)).toBe(10);
    expect(calculateAge("2016-10-14", today)).toBe(9);
  });

  test("handles birthdays that fall on the current date", () => {
    expect(calculateAge("2012-09-05", today)).toBe(14);
  });

  test("leaves age empty until a birthday is provided", () => {
    expect(calculateAge("", today)).toBe("—");
  });
});

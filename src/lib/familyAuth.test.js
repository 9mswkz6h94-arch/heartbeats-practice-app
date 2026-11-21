import { normalizeFamilyCode } from "./familyAuth";

test("ignores surrounding whitespace while normalizing a family code", () => {
  expect(normalizeFamilyCode("  blue tiger 42  ")).toBe("BLUE-TIGER-42");
  expect(normalizeFamilyCode("blue--tiger-42")).toBe("BLUE-TIGER-42");
  expect(normalizeFamilyCode(" \n ")).toBe("");
});

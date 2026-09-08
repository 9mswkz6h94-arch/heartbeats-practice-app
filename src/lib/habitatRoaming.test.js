import {
  getHabitatEncounter,
  getHabitatMotionFrame,
  getHabitatRouteLength,
} from "./habitatRoaming";

describe("living habitat routes", () => {
  test("keeps every resident frame inside the habitat map", () => {
    ["commons", "meadow", "riverbank"].forEach((habitatId) => {
      const residentCount = habitatId === "meadow" ? 2 : habitatId === "commons" ? 3 : 4;
      const routeLength = getHabitatRouteLength(habitatId);
      for (let residentIndex = 0; residentIndex < residentCount; residentIndex += 1) {
        for (let tick = 0; tick < routeLength; tick += 1) {
          const frame = getHabitatMotionFrame(habitatId, residentIndex, tick);
          expect(frame.x).toBeGreaterThanOrEqual(0);
          expect(frame.x).toBeLessThanOrEqual(100);
          expect(frame.y).toBeGreaterThanOrEqual(0);
          expect(frame.y).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  test("loops deterministic movement routes", () => {
    const routeLength = getHabitatRouteLength("riverbank");
    expect(getHabitatMotionFrame("riverbank", 2, routeLength)).toEqual(
      getHabitatMotionFrame("riverbank", 2, 0),
    );
  });

  test("only creates an encounter when both residents are present", () => {
    expect(getHabitatEncounter("meadow", 3, 1)).toBeNull();
    expect(getHabitatEncounter("meadow", 3, 2)).toMatchObject({
      residentIndexes: [0, 1],
      title: "A trail-side duet",
    });
  });

  test("cycles through two Riverbank pair encounters", () => {
    expect(getHabitatEncounter("riverbank", 3, 4)).toMatchObject({ residentIndexes: [0, 1] });
    expect(getHabitatEncounter("riverbank", 8, 4)).toMatchObject({ residentIndexes: [2, 3] });
    expect(getHabitatEncounter("riverbank", 6, 4)).toBeNull();
  });

  test("gives the chosen Commons companion two visitor greetings", () => {
    expect(getHabitatEncounter("commons", 3, 3)).toMatchObject({ residentIndexes: [0, 1] });
    expect(getHabitatEncounter("commons", 6, 3)).toMatchObject({ residentIndexes: [0, 2] });
    expect(getHabitatEncounter("commons", 6, 2)).toBeNull();
  });
});

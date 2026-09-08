const meadowRoutes = [
  [
    { x: 14, y: 66 }, { x: 24, y: 57 }, { x: 37, y: 49 }, { x: 46, y: 54 },
    { x: 58, y: 63 }, { x: 46, y: 72 }, { x: 30, y: 74 }, { x: 18, y: 70 },
  ],
  [
    { x: 84, y: 68 }, { x: 74, y: 59 }, { x: 63, y: 51 }, { x: 54, y: 54 },
    { x: 43, y: 64 }, { x: 56, y: 73 }, { x: 70, y: 76 }, { x: 81, y: 71 },
  ],
];

const riverbankRoutes = [
  [
    { x: 13, y: 30 }, { x: 23, y: 30 }, { x: 34, y: 39 }, { x: 44, y: 46 },
    { x: 38, y: 57 }, { x: 27, y: 64 }, { x: 17, y: 56 }, { x: 12, y: 43 },
    { x: 21, y: 36 }, { x: 32, y: 29 }, { x: 24, y: 23 }, { x: 14, y: 25 },
  ],
  [
    { x: 86, y: 28 }, { x: 76, y: 31 }, { x: 65, y: 39 }, { x: 55, y: 46 },
    { x: 62, y: 56 }, { x: 73, y: 64 }, { x: 84, y: 56 }, { x: 88, y: 43 },
    { x: 79, y: 35 }, { x: 68, y: 28 }, { x: 76, y: 22 }, { x: 86, y: 24 },
  ],
  [
    { x: 17, y: 76 }, { x: 27, y: 70 }, { x: 37, y: 65 }, { x: 29, y: 56 },
    { x: 20, y: 49 }, { x: 29, y: 43 }, { x: 39, y: 49 }, { x: 45, y: 59 },
    { x: 45, y: 69 }, { x: 36, y: 78 }, { x: 26, y: 82 }, { x: 18, y: 81 },
  ],
  [
    { x: 83, y: 77 }, { x: 73, y: 71 }, { x: 63, y: 66 }, { x: 72, y: 56 },
    { x: 81, y: 49 }, { x: 72, y: 43 }, { x: 62, y: 49 }, { x: 55, y: 59 },
    { x: 55, y: 69 }, { x: 64, y: 78 }, { x: 74, y: 82 }, { x: 82, y: 81 },
  ],
];

const commonsRoutes = [
  [
    { x: 14, y: 68 }, { x: 24, y: 59 }, { x: 37, y: 51 }, { x: 48, y: 48 }, { x: 60, y: 53 },
    { x: 72, y: 45 }, { x: 62, y: 35 }, { x: 50, y: 32 }, { x: 35, y: 40 }, { x: 22, y: 51 },
  ],
  [
    { x: 85, y: 69 }, { x: 74, y: 61 }, { x: 63, y: 53 }, { x: 54, y: 48 }, { x: 44, y: 55 },
    { x: 34, y: 65 }, { x: 44, y: 73 }, { x: 58, y: 71 }, { x: 72, y: 75 }, { x: 82, y: 73 },
  ],
  [
    { x: 81, y: 25 }, { x: 71, y: 30 }, { x: 61, y: 35 }, { x: 71, y: 42 }, { x: 81, y: 50 },
    { x: 69, y: 55 }, { x: 60, y: 38 }, { x: 52, y: 33 }, { x: 62, y: 24 }, { x: 73, y: 20 },
  ],
];

const routesByHabitat = Object.freeze({
  commons: commonsRoutes,
  meadow: meadowRoutes,
  riverbank: riverbankRoutes,
});

const encountersByHabitat = Object.freeze({
  commons: [
    {
      phases: [3, 4],
      residentIndexes: [0, 1],
      signal: "hello!",
      title: "A Commons welcome",
      description: "Your companion and a studio visitor cross paths for a friendly little hop.",
    },
    {
      phases: [6, 7],
      residentIndexes: [0, 2],
      signal: "♪ hi",
      title: "A music-sign meetup",
      description: "They pause near the sign, trade a musical greeting, and wander on.",
    },
  ],
  meadow: [
    {
      phases: [3, 4],
      residentIndexes: [0, 1],
      signal: "♪ ♫",
      title: "A trail-side duet",
      description: "They stop together for a tiny musical hello, then choose their own paths again.",
    },
  ],
  riverbank: [
    {
      phases: [3, 4],
      residentIndexes: [0, 1],
      signal: "splish!",
      title: "A bridge-side hello",
      description: "They meet near the bridge, trade a cheerful hop, and keep exploring.",
    },
    {
      phases: [8, 9],
      residentIndexes: [2, 3],
      signal: "♪ plip",
      title: "A rhythm-stone greeting",
      description: "They find the same stepping stone and answer one another with a little bounce.",
    },
  ],
});

export function getHabitatMotionFrame(habitatId, residentIndex, tick) {
  const routes = routesByHabitat[habitatId] || routesByHabitat.meadow;
  const route = routes[residentIndex % routes.length];
  const phase = Math.abs(tick) % route.length;
  const current = route[phase];
  const next = route[(phase + 1) % route.length];
  return {
    ...current,
    facing: next.x < current.x ? "left" : "right",
    phase,
  };
}

export function getHabitatEncounter(habitatId, tick, residentCount) {
  const routes = routesByHabitat[habitatId] || routesByHabitat.meadow;
  const phase = Math.abs(tick) % routes[0].length;
  return (encountersByHabitat[habitatId] || []).find((encounter) => (
    encounter.phases.includes(phase)
    && encounter.residentIndexes.every((index) => index < residentCount)
  )) || null;
}

export function getHabitatRouteLength(habitatId) {
  return (routesByHabitat[habitatId] || routesByHabitat.meadow)[0].length;
}

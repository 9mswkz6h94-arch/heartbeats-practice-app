export const FOUNDING_FRIEND_STAGES = Object.freeze({
  1: "Hatchling",
  2: "Growing",
  3: "Full grown",
});

function sortGroups(groups) {
  return [...groups].sort((first, second) => (
    second.stage - first.stage || first.name.localeCompare(second.name)
  ));
}

export function createFoundingFriendCollection() {
  return [
    { id: "turtle-2", speciesId: "turtle", name: "Turtle", emoji: "🐢", stage: 2, count: 2 },
    { id: "fox-3", speciesId: "fox", name: "Fox", emoji: "🦊", stage: 3, count: 1 },
  ];
}

export function hatchFoundingFriend(groups, creature = { speciesId: "turtle", name: "Turtle", emoji: "🐢" }) {
  const hatchlingId = `${creature.speciesId}-1`;
  const existingGroup = groups.find((group) => group.id === hatchlingId);

  if (existingGroup) {
    return sortGroups(groups.map((group) => (
      group.id === hatchlingId ? { ...group, count: group.count + 1 } : group
    )));
  }

  return sortGroups([
    ...groups,
    { id: hatchlingId, ...creature, stage: 1, count: 1 },
  ]);
}

export function canMergeFoundingFriend(group) {
  return Boolean(group && group.count >= 2 && group.stage < 3);
}

export function mergeFoundingFriendPair(groups, groupId) {
  const sourceGroup = groups.find((group) => group.id === groupId);
  if (!canMergeFoundingFriend(sourceGroup)) return groups;

  const nextStage = sourceGroup.stage + 1;
  const nextGroupId = `${sourceGroup.speciesId}-${nextStage}`;
  const nextStageGroup = groups.find((group) => group.id === nextGroupId);
  const remainingSourceCount = sourceGroup.count - 2;

  const updatedGroups = groups
    .filter((group) => group.id !== sourceGroup.id && group.id !== nextGroupId)
    .map((group) => ({ ...group }));

  if (remainingSourceCount > 0) {
    updatedGroups.push({ ...sourceGroup, count: remainingSourceCount });
  }

  updatedGroups.push(nextStageGroup
    ? { ...nextStageGroup, count: nextStageGroup.count + 1 }
    : { ...sourceGroup, id: nextGroupId, stage: nextStage, count: 1 });

  return sortGroups(updatedGroups);
}

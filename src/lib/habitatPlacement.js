export function createHabitatSlots(slotCount, initialCharacterIds = []) {
  const safeCount = Math.max(0, Math.trunc(Number(slotCount) || 0));
  return Array.from({ length: safeCount }, (_, index) => initialCharacterIds[index] || null);
}

export function placeCharacterInSlot(slots, slotIndex, characterId) {
  if (!Array.isArray(slots) || slotIndex < 0 || slotIndex >= slots.length || !characterId) return slots;

  return slots.map((placedCharacterId, index) => {
    if (index === slotIndex) return characterId;
    if (placedCharacterId === characterId) return null;
    return placedCharacterId;
  });
}

export function clearHabitatSlot(slots, slotIndex) {
  if (!Array.isArray(slots) || slotIndex < 0 || slotIndex >= slots.length) return slots;
  return slots.map((characterId, index) => (index === slotIndex ? null : characterId));
}

export function getFilledSlotCount(slots) {
  return Array.isArray(slots) ? slots.filter(Boolean).length : 0;
}

export function createHabitatResidency(initialHabitats = {}) {
  const assignedCharacterIds = new Set();

  return Object.fromEntries(Object.entries(initialHabitats).map(([habitatId, slots]) => [
    habitatId,
    Array.isArray(slots)
      ? slots.map((characterId) => {
        if (!characterId || assignedCharacterIds.has(characterId)) return null;
        assignedCharacterIds.add(characterId);
        return characterId;
      })
      : [],
  ]));
}

export function findCharacterHome(residency, characterId) {
  if (!residency || !characterId) return null;

  for (const [habitatId, slots] of Object.entries(residency)) {
    if (!Array.isArray(slots)) continue;
    const slotIndex = slots.indexOf(characterId);
    if (slotIndex >= 0) return { habitatId, slotIndex };
  }

  return null;
}

export function placeCharacterInHabitat(residency, habitatId, slotIndex, characterId) {
  const targetSlots = residency?.[habitatId];
  if (!Array.isArray(targetSlots) || slotIndex < 0 || slotIndex >= targetSlots.length || !characterId) {
    return residency;
  }

  const nextResidency = Object.fromEntries(Object.entries(residency).map(([currentHabitatId, slots]) => [
    currentHabitatId,
    Array.isArray(slots)
      ? slots.map((placedCharacterId) => (placedCharacterId === characterId ? null : placedCharacterId))
      : slots,
  ]));

  nextResidency[habitatId][slotIndex] = characterId;
  return nextResidency;
}

export function clearCharacterFromHabitat(residency, habitatId, slotIndex) {
  const targetSlots = residency?.[habitatId];
  if (!Array.isArray(targetSlots) || slotIndex < 0 || slotIndex >= targetSlots.length) return residency;

  return {
    ...residency,
    [habitatId]: clearHabitatSlot(targetSlots, slotIndex),
  };
}

export function resetHabitatResidency(residency, habitatId, initialCharacterIds = []) {
  const targetSlots = residency?.[habitatId];
  if (!Array.isArray(targetSlots)) return residency;

  let nextResidency = {
    ...residency,
    [habitatId]: createHabitatSlots(targetSlots.length),
  };

  initialCharacterIds.slice(0, targetSlots.length).forEach((characterId, slotIndex) => {
    if (characterId) {
      nextResidency = placeCharacterInHabitat(nextResidency, habitatId, slotIndex, characterId);
    }
  });

  return nextResidency;
}

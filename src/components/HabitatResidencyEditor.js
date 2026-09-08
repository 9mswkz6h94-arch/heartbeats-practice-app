import React, { useState } from "react";
import { findCharacterHome } from "../lib/habitatPlacement";
import "./HabitatResidencyEditor.css";

const HABITAT_NAMES = {
  meadow: "Melody Meadow",
  riverbank: "Rhythm Riverbank",
};

function getHomeLabel(home) {
  if (!home) return "In your collection";
  return `${HABITAT_NAMES[home.habitatId] || "Owned habitat"} · Spot ${home.slotIndex + 1}`;
}

export default function HabitatResidencyEditor({
  habitatId,
  habitatName,
  characters = [],
  residency = {},
  initialSlotIndex = 0,
  onPlaceCharacter,
  onClearCharacter,
  onResetHabitat,
}) {
  const slots = residency[habitatId] || [];
  const [activeSlotIndex, setActiveSlotIndex] = useState(initialSlotIndex);
  const [message, setMessage] = useState("Choose a home spot, then choose a friend from your collection.");
  const characterById = (characterId) => characters.find((character) => character.id === characterId);
  const activeCharacter = characterById(slots[activeSlotIndex]);

  const selectSlot = (slotIndex) => {
    const character = characterById(slots[slotIndex]);
    setActiveSlotIndex(slotIndex);
    setMessage(character
      ? `${character.name} lives in Spot ${slotIndex + 1}. Choose another friend to change this home.`
      : `Spot ${slotIndex + 1} is ready to become a friend's home.`);
  };

  const placeCharacter = (characterId) => {
    const character = characterById(characterId);
    if (!character) return;

    const oldHome = findCharacterHome(residency, characterId);
    const displacedCharacter = activeCharacter?.id !== characterId ? activeCharacter : null;
    onPlaceCharacter?.(habitatId, activeSlotIndex, characterId);

    if (oldHome?.habitatId && oldHome.habitatId !== habitatId) {
      setMessage(`${character.name} moved home from ${HABITAT_NAMES[oldHome.habitatId]} to ${habitatName}.${displacedCharacter ? ` ${displacedCharacter.name} returned to your collection.` : ""}`);
    } else if (oldHome?.slotIndex !== undefined && oldHome.slotIndex !== activeSlotIndex) {
      setMessage(`${character.name} moved to Spot ${activeSlotIndex + 1}. Spot ${oldHome.slotIndex + 1} is now open.${displacedCharacter ? ` ${displacedCharacter.name} returned to your collection.` : ""}`);
    } else if (displacedCharacter) {
      setMessage(`${character.name} now lives in Spot ${activeSlotIndex + 1}. ${displacedCharacter.name} returned to your collection.`);
    } else {
      setMessage(`${character.name} now lives in ${habitatName}, Spot ${activeSlotIndex + 1}.`);
    }
  };

  const clearSpot = () => {
    if (!activeCharacter) return;
    onClearCharacter?.(habitatId, activeSlotIndex);
    setMessage(`${activeCharacter.name} returned to your collection. Spot ${activeSlotIndex + 1} is open.`);
  };

  const resetHabitat = () => {
    onResetHabitat?.(habitatId);
    setMessage(`${habitatName} is back to its starting homes. Any transferred friends moved out of their old habitat first.`);
  };

  return (
    <section className={`habitat-residency-editor theme-${habitatId}`} aria-labelledby={`${habitatId}-residency-title`}>
      <div className="habitat-residency-heading">
        <div>
          <p className="zoo-district-eyebrow">Editing home spot {activeSlotIndex + 1}</p>
          <h4 id={`${habitatId}-residency-title`}>Who should live here?</h4>
        </div>
        <p>Each friend has one owned-habitat home. Moving them here opens their old spot. Commons visits and museum displays stay available.</p>
      </div>

      <div className="habitat-residency-spots" role="group" aria-label={`Choose a ${habitatName} home spot`}>
        {slots.map((characterId, slotIndex) => {
          const character = characterById(characterId);
          return (
            <button
              type="button"
              key={`${habitatId}-home-${slotIndex}`}
              aria-pressed={activeSlotIndex === slotIndex}
              onClick={() => selectSlot(slotIndex)}
            >
              <small>Home spot {slotIndex + 1}</small>
              <strong>{character?.name || "Open spot"}</strong>
              <span>{activeSlotIndex === slotIndex ? "Choosing here" : "Choose spot"}</span>
            </button>
          );
        })}
      </div>

      <div className="habitat-residency-roster">
        {characters.map((character) => {
          const home = findCharacterHome(residency, character.id);
          const isInActiveSpot = home?.habitatId === habitatId && home.slotIndex === activeSlotIndex;
          const action = isInActiveSpot
            ? "Lives here"
            : home?.habitatId === habitatId
              ? `Move from Spot ${home.slotIndex + 1}`
              : home
                ? `Move from ${HABITAT_NAMES[home.habitatId]}`
                : "Make this home";

          return (
            <button
              type="button"
              key={character.id}
              aria-pressed={isInActiveSpot}
              onClick={() => placeCharacter(character.id)}
            >
              <span className="habitat-residency-portrait">
                {character.image
                  ? <img src={character.image} alt="" width="64" height="64" />
                  : <span aria-hidden="true">{character.emoji}</span>}
              </span>
              <span className="habitat-residency-copy">
                <strong>{character.name}</strong>
                <small>{getHomeLabel(home)}</small>
              </span>
              <span className="habitat-residency-action">{action}</span>
            </button>
          );
        })}
      </div>

      <div className="habitat-residency-buttons">
        <button type="button" disabled={!activeCharacter} onClick={clearSpot}>Clear home spot {activeSlotIndex + 1}</button>
        <button type="button" onClick={resetHabitat}>Reset {habitatName}</button>
      </div>

      <div className="habitat-residency-status" role="status" aria-live="polite">
        <strong>{message}</strong>
        <span>Home changes are immediate in this sandbox and reset when the page refreshes.</span>
      </div>
    </section>
  );
}

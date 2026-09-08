import React, { useMemo, useState } from "react";
import { getFilledSlotCount } from "../lib/habitatPlacement";
import {
  getDecorationAtSpot,
  getMeadowDecorationStatus,
  MEADOW_DECORATION_SPOTS,
} from "../lib/zooRewards";
import HabitatNPCWorld from "./HabitatNPCWorld";
import HabitatResidencyEditor from "./HabitatResidencyEditor";
import "./MelodyMeadow.css";

export default function MelodyMeadow({
  active = false,
  riffin,
  musicalZooFriends = [],
  foundingFriends = [],
  residency,
  onPlaceCharacter,
  onClearCharacter,
  onResetHabitat,
  decorations = [],
  onPlaceDecoration,
  onRemoveDecoration,
}) {
  const activeMusicalZooFriends = musicalZooFriends.length
    ? musicalZooFriends
    : [riffin].filter(Boolean);
  const characters = useMemo(() => [
    ...activeMusicalZooFriends.map((friend) => ({
      id: friend.id,
      name: friend.name,
      image: friend.image,
      roamingImage: friend.roamingImage,
      imageAlt: friend.imageAlt,
      collection: "Musical Zoo friend",
      detail: friend.role,
    })),
    ...foundingFriends.map((friend) => ({
      ...friend,
      collection: "Founding Friend",
      detail: friend.stage,
    })),
  ], [activeMusicalZooFriends, foundingFriends]);

  const slots = residency?.meadow || [];
  const [arranging, setArranging] = useState(false);
  const [activeDecorationSpotId, setActiveDecorationSpotId] = useState(MEADOW_DECORATION_SPOTS[0].id);
  const [decorationMessage, setDecorationMessage] = useState("Choose a scenery spot, then pick something from your collection.");

  const characterById = (characterId) => characters.find((character) => character.id === characterId);
  const filledCount = getFilledSlotCount(slots);
  const placedCharacters = slots.map(characterById).filter(Boolean);
  const placedDecorations = decorations.filter((decoration) => decoration.placedSpotId);
  const availableDecorations = decorations.filter((decoration) => decoration.unlocked);
  const activeDecorationSpot = MEADOW_DECORATION_SPOTS.find((spot) => spot.id === activeDecorationSpotId);
  const activeSpotDecoration = getDecorationAtSpot(decorations, activeDecorationSpotId);

  const selectDecorationSpot = (spot) => {
    setActiveDecorationSpotId(spot.id);
    const placedDecoration = getDecorationAtSpot(decorations, spot.id);
    setDecorationMessage(placedDecoration
      ? `${placedDecoration.name} is in ${spot.name}. Choose another item to swap it, or clear the spot.`
      : `${spot.name} is open. Choose something from your scenery collection.`);
  };

  const placeDecorationInActiveSpot = (decoration) => {
    if (!decoration.unlocked || !activeDecorationSpot) return;
    if (decoration.placedSpotId === activeDecorationSpot.id) {
      setDecorationMessage(`${decoration.name} is already in ${activeDecorationSpot.name}.`);
      return;
    }

    const previousSpot = MEADOW_DECORATION_SPOTS.find((spot) => spot.id === decoration.placedSpotId);
    const displacedDecoration = activeSpotDecoration?.id !== decoration.id ? activeSpotDecoration : null;
    onPlaceDecoration?.(decoration.id, activeDecorationSpot.id);

    if (previousSpot) {
      setDecorationMessage(`${decoration.name} moved from ${previousSpot.name} to ${activeDecorationSpot.name}.${displacedDecoration ? ` ${displacedDecoration.name} returned to your inventory.` : ""}`);
    } else {
      setDecorationMessage(`${decoration.name} is now in ${activeDecorationSpot.name}.${displacedDecoration ? ` ${displacedDecoration.name} returned to your inventory.` : ""}`);
    }
  };

  const clearDecorationSpot = () => {
    if (!activeSpotDecoration) return;
    onRemoveDecoration?.(activeSpotDecoration.id);
    setDecorationMessage(`${activeSpotDecoration.name} returned to your inventory. ${activeDecorationSpot.name} is open.`);
  };

  return (
    <article className="zoo-district zoo-owned-space melody-meadow">
      <div className="zoo-district-heading meadow-heading">
        <div><p>Your space</p><h3>Melody Meadow</h3></div>
        <div className="meadow-heading-actions">
          <span>{filledCount} of {slots.length} spots filled</span>
          <button
            type="button"
            aria-expanded={arranging}
            aria-controls="melody-meadow-arranger"
            onClick={() => setArranging((current) => !current)}
          >
            {arranging ? "Done arranging" : "Arrange friends"}
          </button>
        </div>
      </div>

      <HabitatNPCWorld
        active={active}
        greetingsEnabled
        habitatId="meadow"
        residents={placedCharacters}
        scenery={placedDecorations}
      />

      {!!decorations.length && (
        <section className="meadow-decoration-studio" aria-labelledby="meadow-decoration-title">
          <div className="meadow-decoration-heading">
            <div>
              <p className="zoo-district-eyebrow">Decorate your space</p>
              <h4 id="meadow-decoration-title">Meadow scenery</h4>
            </div>
            <span>{placedDecorations.length} of {MEADOW_DECORATION_SPOTS.length} spots decorated</span>
          </div>

          <div className="meadow-decoration-spots" role="group" aria-label="Choose a Meadow scenery spot">
            {MEADOW_DECORATION_SPOTS.map((spot) => {
              const placedDecoration = getDecorationAtSpot(decorations, spot.id);
              const selected = spot.id === activeDecorationSpotId;
              return (
                <button
                  type="button"
                  key={spot.id}
                  aria-pressed={selected}
                  onClick={() => selectDecorationSpot(spot)}
                >
                  <small>{spot.description}</small>
                  <strong>{spot.name}</strong>
                  {placedDecoration ? (
                    <span className="meadow-spot-decoration"><b aria-hidden="true">{placedDecoration.icon}</b>{placedDecoration.name}</span>
                  ) : (
                    <span className="meadow-spot-open"><b aria-hidden="true">+</b>Open spot</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="meadow-decoration-inventory-heading">
            <div>
              <p className="zoo-district-eyebrow">Scenery inventory</p>
              <h5>Choose for {activeDecorationSpot?.name}</h5>
            </div>
            <button type="button" disabled={!activeSpotDecoration} onClick={clearDecorationSpot}>Clear selected spot</button>
          </div>

          <div className="meadow-decoration-inventory">
            {availableDecorations.map((decoration) => {
              const status = getMeadowDecorationStatus(decoration);
              const placedSpot = MEADOW_DECORATION_SPOTS.find((spot) => spot.id === decoration.placedSpotId);
              const inActiveSpot = decoration.placedSpotId === activeDecorationSpotId;
              return (
                <button
                  type="button"
                  className={`state-${status.state}`}
                  key={decoration.id}
                  aria-pressed={inActiveSpot}
                  onClick={() => placeDecorationInActiveSpot(decoration)}
                >
                  <span className="meadow-decoration-preview" aria-hidden="true">{decoration.icon}<small>♪</small></span>
                  <span className="meadow-decoration-copy">
                    <strong>{decoration.name}</strong>
                    <small>{decoration.description}</small>
                  </span>
                  <span className="meadow-decoration-action">
                    {inActiveSpot
                      ? "In this spot"
                      : placedSpot
                        ? `Move from ${placedSpot.name}`
                        : "Place here"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="meadow-decoration-status" role="status" aria-live="polite">
            <strong>{decorationMessage}</strong>
            <span>Moving or clearing scenery never removes it from your collection.</span>
          </div>
        </section>
      )}

      {arranging && (
        <div id="melody-meadow-arranger">
          <HabitatResidencyEditor
            habitatId="meadow"
            habitatName="Melody Meadow"
            characters={characters}
            residency={residency}
            initialSlotIndex={1}
            onPlaceCharacter={onPlaceCharacter}
            onClearCharacter={onClearCharacter}
            onResetHabitat={onResetHabitat}
          />
        </div>
      )}

      <details className="zoo-character-card">
        <summary>Meet the Musical Zoo friends</summary>
        <dl>
          {activeMusicalZooFriends.map((friend) => (
            <div key={friend.id}>
              <dt>{friend.name}</dt>
              <dd>{friend.animal} · {friend.role} · {friend.virtue}</dd>
            </div>
          ))}
        </dl>
        <p>Each friend notices completed work, responds briefly, and keeps practice gentle and shame-free.</p>
      </details>
    </article>
  );
}

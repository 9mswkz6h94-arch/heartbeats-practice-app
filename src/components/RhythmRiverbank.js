import React, { useState } from "react";
import { getFilledSlotCount } from "../lib/habitatPlacement";
import HabitatNPCWorld from "./HabitatNPCWorld";
import HabitatResidencyEditor from "./HabitatResidencyEditor";
import "./RhythmRiverbank.css";

export default function RhythmRiverbank({
  active = false,
  companions = [],
  residency,
  onPlaceCharacter,
  onClearCharacter,
  onResetHabitat,
}) {
  const [arranging, setArranging] = useState(false);
  const slots = residency?.riverbank || [];
  const residents = slots
    .map((characterId) => companions.find((character) => character.id === characterId))
    .filter(Boolean);

  return (
    <article className="rhythm-riverbank" aria-labelledby="rhythm-riverbank-title">
      <header className="riverbank-heading">
        <div>
          <p className="zoo-district-eyebrow">Your second habitat</p>
          <h3 id="rhythm-riverbank-title">Rhythm Riverbank</h3>
          <p>Friends who make their home here wander the banks, cross the little bridge, and notice one another along the way.</p>
        </div>
        <div className="riverbank-heading-actions">
          <span>{getFilledSlotCount(slots)} of {slots.length} homes filled</span>
          <button
            type="button"
            aria-expanded={arranging}
            aria-controls="rhythm-riverbank-arranger"
            onClick={() => setArranging((current) => !current)}
          >
            {arranging ? "Done arranging" : "Arrange homes"}
          </button>
        </div>
      </header>

      <HabitatNPCWorld
        active={active}
        greetingsEnabled
        habitatId="riverbank"
        residents={residents}
      />

      {arranging && (
        <div id="rhythm-riverbank-arranger">
          <HabitatResidencyEditor
            habitatId="riverbank"
            habitatName="Rhythm Riverbank"
            characters={companions}
            residency={residency}
            initialSlotIndex={3}
            onPlaceCharacter={onPlaceCharacter}
            onClearCharacter={onClearCharacter}
            onResetHabitat={onResetHabitat}
          />
        </div>
      )}

      <section className="riverbank-world-notes" aria-labelledby="riverbank-world-notes-title">
        <div>
          <p className="zoo-district-eyebrow">A world, not an activity</p>
          <h4 id="riverbank-world-notes-title">Come watch whenever you like</h4>
        </div>
        <ul>
          <li>Friends pick their own looping paths.</li>
          <li>Each friend keeps one owned-habitat home.</li>
          <li>Small meetings happen without a prompt.</li>
          <li>Commons visits remain open wherever they live.</li>
        </ul>
      </section>
    </article>
  );
}

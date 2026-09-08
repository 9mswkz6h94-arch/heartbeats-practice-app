import React, { useEffect, useState } from "react";
import { getCharacter } from "../lib/characterRegistry";
import "./FloatingCompanion.css";

export default function FloatingCompanion({
  characterId = "riffin",
  companion,
  response,
  illustratedSheet,
  visualState = "practice",
}) {
  const character = companion || getCharacter(characterId);
  const [visibleResponse, setVisibleResponse] = useState(null);

  useEffect(() => {
    if (!response?.message) {
      setVisibleResponse(null);
      return undefined;
    }
    setVisibleResponse(response);
    const timeout = window.setTimeout(() => setVisibleResponse(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [response]);

  if (!character) return null;
  const companionImage = character.companionImage || character.assets?.companionMedium?.image || character.image;
  const responseState = ["practice", "complete"].includes(visualState) ? visualState : "practice";
  const illustratedState = visibleResponse ? responseState : "neutral";

  return (
    <aside className="floating-companion" aria-label={`${character.name}, your practice companion`}>
      {visibleResponse && (
        <div className="floating-companion-bubble" role="status" aria-live="polite">
          {visibleResponse.message}
        </div>
      )}
      {illustratedSheet ? (
        <span
          className={`floating-companion-portrait floating-companion-illustrated state-${illustratedState}${visibleResponse ? " responding" : ""}`}
          style={{ backgroundImage: `url("${illustratedSheet}")` }}
          role="img"
          aria-label={character.imageAlt}
        />
      ) : companionImage ? (
        <img
          className={`floating-companion-portrait floating-companion-sprite${visibleResponse ? " responding" : ""}`}
          src={companionImage}
          alt={character.imageAlt}
          width="96"
          height="96"
        />
      ) : (
        <span
          className={`floating-companion-portrait floating-companion-emoji${visibleResponse ? " responding" : ""}`}
          aria-hidden="true"
        >
          {character.emoji}
        </span>
      )}
    </aside>
  );
}

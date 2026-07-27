import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { stageInfo, progressToNext } from "../lib/petStages";
import "./PetWidget.css";

// The practice pet. Growth only — no health bar, no sad face, no
// "it's been 4 days" guilt trip. Whoever left it will find it exactly
// as happy as they left it.
export default function PetWidget({ studentId, compact = false }) {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPet = useCallback(async () => {
    const { data } = await supabase.from("pets").select("xp, stage").eq("student_id", studentId).maybeSingle();
    setPet(data || { xp: 0, stage: 0 });
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    fetchPet();
  }, [fetchPet]);

  if (loading) return null;

  const info = stageInfo(pet.stage);
  const progress = Math.round(progressToNext(pet.xp, pet.stage) * 100);

  if (compact) {
    return (
      <div className="pet-widget pet-widget-compact">
        <span className="pet-emoji-compact">{info.emoji}</span>
        <div className="pet-compact-info">
          <span className="pet-name-compact">{info.name}</span>
          {info.xpToNext != null && (
            <div className="pet-bar-track pet-bar-track-sm">
              <div className="pet-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pet-widget">
      <div className="pet-emoji-big" aria-hidden="true">{info.emoji}</div>
      <div className="pet-name">{info.name}</div>
      <p className="pet-blurb">{info.blurb}</p>
      {info.xpToNext != null ? (
        <>
          <div className="pet-bar-track">
            <div className="pet-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="pet-xp-label">{pet.xp} / {info.xpToNext} XP to next stage</p>
        </>
      ) : (
        <p className="pet-xp-label">🌟 {pet.xp} total practice XP</p>
      )}
    </div>
  );
}

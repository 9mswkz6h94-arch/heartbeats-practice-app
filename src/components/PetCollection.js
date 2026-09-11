import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { speciesInfo, CREATURE_STAGES } from "../lib/petSpecies";
import { EGG_XP_INTERVAL } from "../lib/petStages";
import "./PetCollection.css";

// The collection side-layer: every EGG_XP_INTERVAL XP the main pet earns, a mystery egg
// drops in here too (see the award_pet_xp() trigger). Hatch it to reveal a
// random species, then merge two matching same-species-same-stage creatures
// to push that one up a stage. All mutation happens through SECURITY
// DEFINER RPC functions — this component only ever reads pet_creatures
// directly, never writes to it.
export default function PetCollection({ studentId, readOnly = false }) {
  const [creatures, setCreatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState(null); // egg id or group key currently hatching/merging
  const [reveal, setReveal] = useState(null); // { species } briefly shown after a hatch
  const [error, setError] = useState(null);

  const fetchCreatures = useCallback(async () => {
    const { data } = await supabase
      .from("pet_creatures")
      .select("id, species, stage")
      .eq("student_id", studentId)
      .order("created_at", { ascending: true });
    setCreatures(data || []);
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    fetchCreatures();
  }, [fetchCreatures]);

  if (loading) return null;

  const eggs = creatures.filter((c) => c.stage === 0);
  const hatched = creatures.filter((c) => c.stage > 0);

  const groups = {};
  hatched.forEach((c) => {
    const key = `${c.species}-${c.stage}`;
    if (!groups[key]) groups[key] = { species: c.species, stage: c.stage, ids: [] };
    groups[key].ids.push(c.id);
  });
  const groupList = Object.values(groups).sort((a, b) => b.stage - a.stage || a.species.localeCompare(b.species));

  async function handleHatch() {
    if (readOnly || eggs.length === 0) return;
    const egg = eggs[0];
    setBusyKey(egg.id);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("hatch_egg", { p_egg_id: egg.id });
    setBusyKey(null);
    if (rpcError) {
      setError("Couldn't hatch that egg — try again?");
      return;
    }
    setReveal(data.species);
    setTimeout(() => setReveal(null), 2500);
    fetchCreatures();
  }

  async function handleMerge(group) {
    if (readOnly || group.ids.length < 2) return;
    const key = `${group.species}-${group.stage}`;
    setBusyKey(key);
    setError(null);
    const { error: rpcError } = await supabase.rpc("merge_creatures", {
      p_id_a: group.ids[0],
      p_id_b: group.ids[1],
    });
    setBusyKey(null);
    if (rpcError) {
      setError("Couldn't merge those — try again?");
      return;
    }
    fetchCreatures();
  }

  const revealInfo = reveal ? speciesInfo(reveal) : null;

  return (
    <div className="pet-collection">
      <h2 className="pet-collection-title">Pet collection</h2>

      {error && <p className="pet-collection-error" role="alert">{error}</p>}

      {revealInfo && (
        <div className="pet-hatch-reveal" role="status">
          <span className="pet-hatch-reveal-emoji">{revealInfo.emoji}</span>
          You hatched a {revealInfo.name}!
        </div>
      )}

      {eggs.length > 0 && (
        <div className="pet-collection-eggs">
          <span className="pet-egg-count">
            {eggs.length} unhatched egg{eggs.length > 1 ? "s" : ""}
          </span>
          {!readOnly && (
            <button
              className="btn-hatch"
              type="button"
              onClick={handleHatch}
              disabled={busyKey === eggs[0]?.id}
            >
              {busyKey === eggs[0]?.id ? "Hatching…" : "Hatch"}
            </button>
          )}
        </div>
      )}

      {groupList.length === 0 && eggs.length === 0 ? (
        <p className="pet-collection-empty">
          Keep practicing — a mystery egg arrives around every {EGG_XP_INTERVAL} XP, usually about every two weeks.
        </p>
      ) : (
        <div className="pet-collection-grid">
          {groupList.map((group) => {
            const info = speciesInfo(group.species);
            const stageName = CREATURE_STAGES[group.stage]?.name || "Grown";
            const key = `${group.species}-${group.stage}`;
            const canMerge = group.ids.length >= 2 && group.stage < 3;
            return (
              <div key={key} className={`pet-creature-card stage-${group.stage}`}>
                <span className="pet-creature-emoji">{info.emoji}</span>
                <span className="pet-creature-name">{info.name}</span>
                <span className="pet-creature-stage">{stageName}</span>
                {group.ids.length > 1 && (
                  <span className="pet-creature-count">×{group.ids.length}</span>
                )}
                {!readOnly && canMerge && (
                  <button
                    className="btn-merge"
                    type="button"
                    onClick={() => handleMerge(group)}
                    disabled={busyKey === key}
                  >
                    {busyKey === key ? "Merging…" : "Merge pair"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

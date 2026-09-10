import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getCharacter } from "../lib/characterRegistry";
import { getPracticeCompanionReaction } from "../lib/companionReactions";
import {
  applyStudentZooPreferences,
  buildUnlockedZooState,
  getLiveZooDestinationIds,
} from "../lib/studentZoo";
import {
  placeMeadowDecoration,
  removeMeadowDecoration,
} from "../lib/zooRewards";
import FloatingCompanion from "./FloatingCompanion";
import MusicalZooStrip from "./MusicalZooStrip";
import PetCollection from "./PetCollection";
import PetWidget, { PRACTICE_RESPONSE_EVENT } from "./PetWidget";
import "./StudentZooExperience.css";

function companionStorageKey(studentId) {
  return `heartbeats-zoo-companion:${studentId}`;
}

function zooPreferencesStorageKey(studentId) {
  return `heartbeats-zoo-preferences:${studentId}`;
}

function readDeviceZooPreferences(studentId) {
  try {
    return JSON.parse(window.localStorage.getItem(zooPreferencesStorageKey(studentId)) || "{}");
  } catch {
    return {};
  }
}

function writeDeviceZooPreferences(studentId, preferences) {
  try {
    window.localStorage.setItem(zooPreferencesStorageKey(studentId), JSON.stringify(preferences));
  } catch {
    // Device storage is a convenience fallback, never a practice blocker.
  }
}

function isMissingPreferencesTable(error) {
  const message = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return ["42P01", "PGRST205"].includes(error?.code)
    || message.includes("could not find the table 'public.student_zoo_preferences'")
    || message.includes('relation "public.student_zoo_preferences" does not exist');
}

function isMissingOwnershipColumn(error) {
  const message = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return ["42703", "PGRST204"].includes(error?.code)
    && message.includes("owned_character_ids");
}

function getStoredCompanionId(studentId) {
  try {
    return window.localStorage.getItem(companionStorageKey(studentId));
  } catch {
    return null;
  }
}

function rememberCompanion(studentId, companionId) {
  try {
    window.localStorage.setItem(companionStorageKey(studentId), companionId);
  } catch {
    // A blocked storage preference should never block practice.
  }
}

function StudentZooCare({ studentId, companions, selectedCompanionId, onSelectCompanion }) {
  return (
    <section className="student-zoo-care" aria-labelledby="student-zoo-care-title">
      <header className="student-zoo-care-header">
        <div>
          <p className="zoo-district-eyebrow">Care & collection</p>
          <h3 id="student-zoo-care-title">Caretaker Cabin</h3>
          <p>Name your practice pet, hatch eggs, and choose which unlocked friend comes along.</p>
        </div>
      </header>

      <section className="student-zoo-companions" aria-labelledby="student-zoo-companion-title">
        <div>
          <p className="zoo-district-eyebrow">Practice companion</p>
          <h4 id="student-zoo-companion-title">Who should come along?</h4>
          <p>They stay quiet while you work, then respond when you finish or save a card for later.</p>
        </div>
        <div className="student-zoo-companion-grid">
          {companions.map((companion) => {
            const selected = companion.id === selectedCompanionId;
            const image = companion.companionImage || companion.image;
            return (
              <button
                type="button"
                key={companion.id}
                aria-pressed={selected}
                onClick={() => onSelectCompanion(companion)}
              >
                <span aria-hidden="true">
                  {image ? <img src={image} alt="" width="56" height="56" /> : companion.emoji}
                </span>
                <strong>{companion.name}</strong>
                <small>{selected ? "Coming along" : companion.companionType}</small>
              </button>
            );
          })}
        </div>
      </section>

      <div className="student-zoo-care-grid">
        <PetWidget studentId={studentId} />
        <PetCollection studentId={studentId} />
      </div>
    </section>
  );
}

export default function StudentZooExperience({ studentId }) {
  const riffin = useMemo(() => getCharacter("riffin"), []);
  const [zooState, setZooState] = useState(null);
  const [selectedCompanion, setSelectedCompanion] = useState(riffin);
  const [companionResponse, setCompanionResponse] = useState(null);
  const [issue, setIssue] = useState(null);
  const variationRef = useRef(0);
  const preferencesRef = useRef({});
  const remotePreferencesAvailableRef = useRef(false);

  const savePreferences = useCallback((patch) => {
    const nextPreferences = { ...preferencesRef.current, ...patch };
    preferencesRef.current = nextPreferences;
    writeDeviceZooPreferences(studentId, nextPreferences);

    if (!remotePreferencesAvailableRef.current) return;
    supabase
      .from("student_zoo_preferences")
      .upsert({ student_id: studentId, ...patch }, { onConflict: "student_id" })
      .then(({ error }) => {
        if (!error) return;
        if (isMissingPreferencesTable(error)) {
          remotePreferencesAvailableRef.current = false;
          return;
        }
        setIssue("Your Zoo choices are saved on this device, but studio sync is taking a moment.");
      });
  }, [studentId]);

  const loadZoo = useCallback(async () => {
    const [petResult, creaturesResult, completionsResult, initialPreferencesResult] = await Promise.all([
      supabase
        .from("pets")
        .select("xp, stage, name, species")
        .eq("student_id", studentId)
        .maybeSingle(),
      supabase
        .from("pet_creatures")
        .select("id, species, stage")
        .eq("student_id", studentId)
        .order("created_at", { ascending: true }),
      supabase
        .from("completions")
        .select("id", { count: "exact", head: true })
        .eq("student_id", studentId),
      supabase
        .from("student_zoo_preferences")
        .select("student_id, selected_companion_id, owned_character_ids, habitat_residency, meadow_placements")
      .eq("student_id", studentId)
      .maybeSingle(),
    ]);

    let preferencesResult = initialPreferencesResult;
    if (isMissingOwnershipColumn(preferencesResult.error)) {
      preferencesResult = await supabase
        .from("student_zoo_preferences")
        .select("student_id, selected_companion_id, habitat_residency, meadow_placements")
        .eq("student_id", studentId)
        .maybeSingle();
    }

    const preferencesTableMissing = isMissingPreferencesTable(preferencesResult.error);
    remotePreferencesAvailableRef.current = !preferencesResult.error;
    const hadError = petResult.error
      || creaturesResult.error
      || completionsResult.error
      || (preferencesResult.error && !preferencesTableMissing);
    setIssue(hadError ? "Some Zoo details are taking a moment to arrive. Your practice work is safe." : null);

    const devicePreferences = readDeviceZooPreferences(studentId);
    const preferences = { ...devicePreferences, ...(preferencesResult.data || {}) };
    preferencesRef.current = preferences;
    const nextZooState = applyStudentZooPreferences(buildUnlockedZooState({
      completionCount: completionsResult.count || 0,
      pet: petResult.data || null,
      creatures: creaturesResult.data || [],
      ownedCharacterIds: preferences.owned_character_ids || [],
    }), preferences);
    setZooState(nextZooState);

    const companions = [riffin, ...nextZooState.foundingFriends].filter(Boolean);
    const storedId = preferences.selected_companion_id || getStoredCompanionId(studentId);
    setSelectedCompanion((current) => (
      companions.find((companion) => companion.id === storedId)
      || companions.find((companion) => companion.id === current?.id)
      || riffin
    ));
  }, [riffin, studentId]);

  useEffect(() => {
    loadZoo();
  }, [loadZoo]);

  useEffect(() => {
    const respondToPractice = (event) => {
      const intent = event?.detail?.intent || "step_complete_generic";
      const message = getPracticeCompanionReaction(
        selectedCompanion?.id,
        intent,
        variationRef.current,
      );
      variationRef.current += 1;
      setCompanionResponse({ id: Date.now(), intent, message });
      if (intent === "step_complete_generic") loadZoo();
    };

    window.addEventListener(PRACTICE_RESPONSE_EVENT, respondToPractice);
    return () => window.removeEventListener(PRACTICE_RESPONSE_EVENT, respondToPractice);
  }, [loadZoo, selectedCompanion?.id]);

  const companions = useMemo(
    () => [riffin, ...(zooState?.foundingFriends || [])].filter(Boolean),
    [riffin, zooState?.foundingFriends],
  );
  const liveZooCharacters = useMemo(() => [riffin].filter(Boolean), [riffin]);

  const chooseCompanion = (companion) => {
    setSelectedCompanion(companion);
    setCompanionResponse(null);
    rememberCompanion(studentId, companion.id);
    savePreferences({ selected_companion_id: companion.id });
  };

  const placeDecoration = (decorationId, spotId) => {
    const meadowDecorations = placeMeadowDecoration(zooState.meadowDecorations, decorationId, spotId);
    setZooState((current) => ({ ...current, meadowDecorations }));
    savePreferences({
      meadow_placements: Object.fromEntries(
        meadowDecorations.filter((item) => item.placedSpotId).map((item) => [item.id, item.placedSpotId])
      ),
    });
  };

  const removeDecoration = (decorationId) => {
    const meadowDecorations = removeMeadowDecoration(zooState.meadowDecorations, decorationId);
    setZooState((current) => ({ ...current, meadowDecorations }));
    savePreferences({
      meadow_placements: Object.fromEntries(
        meadowDecorations.filter((item) => item.placedSpotId).map((item) => [item.id, item.placedSpotId])
      ),
    });
  };

  const saveResidency = useCallback((residency) => {
    savePreferences({ habitat_residency: residency });
  }, [savePreferences]);

  if (!zooState) {
    return (
      <section className="student-zoo-loading" aria-label="Musical Zoo" aria-busy="true">
        <span aria-hidden="true">♫</span>
        <p>Opening the Musical Zoo…</p>
      </section>
    );
  }

  return (
    <>
      {issue && <p className="student-zoo-notice" role="status">{issue}</p>}
      <MusicalZooStrip
        meadowDecorations={zooState.meadowDecorations}
        riverbankUnlock={zooState.riverbankUnlock}
        onPlaceMeadowDecoration={placeDecoration}
        onRemoveMeadowDecoration={removeDecoration}
        selectedCompanionId={selectedCompanion?.id}
        onCompanionChange={chooseCompanion}
        onCompanionResponse={(message) => setCompanionResponse({ id: Date.now(), message, intent: "practice_response" })}
        visitors={[]}
        initialFoundingFriends={zooState.foundingFriends}
        initialResidency={zooState.residency}
        availableDestinationIds={getLiveZooDestinationIds(zooState)}
        careContent={(
          <StudentZooCare
            studentId={studentId}
            companions={companions}
            selectedCompanionId={selectedCompanion?.id}
            onSelectCompanion={chooseCompanion}
          />
        )}
        onResidencyChange={saveResidency}
        musicalZooFriends={liveZooCharacters}
      />
      <FloatingCompanion
        companion={selectedCompanion}
        response={companionResponse}
        visualState={companionResponse?.intent === "step_complete_generic" ? "complete" : "practice"}
      />
    </>
  );
}

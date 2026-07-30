import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { stageInfo, progressToNext, SPECIES_CHOICES } from "../lib/petStages";
import "./PetWidget.css";

const CHEER_MESSAGES = ["Yay!! 🎉", "You did it!", "Great practice!", "Woo hoo!", "Nice work!"];
const CHEER_EVENT = "pet-cheer";

// Fires whenever a practice card gets completed — PetWidget listens for
// this to celebrate. A plain window event rather than threading a prop
// through StudentDashboard, since the two components are unrelated
// siblings and this is a one-off "hey, something happened" signal, not
// shared state either component needs to hold.
export function cheerForPractice() {
  window.dispatchEvent(new CustomEvent(CHEER_EVENT));
}

// The practice pet. Growth only — no health bar, no sad face, no
// "it's been 4 days" guilt trip. Whoever left it will find it exactly
// as happy as they left it.
//
// Reactions layered on top of that: a gentle idle bob so it never looks
// static, wiggling along to live mic volume while "Play for me!" is on (no
// pitch/correctness judgment, just "there's sound"), and a little cheer
// whenever a practice card gets completed anywhere on the dashboard. Once,
// early on, the student also names it and picks its species from the same
// roster as the collection creatures — permanent choices, made through
// SECURITY DEFINER functions the same way hatch/merge are.
export default function PetWidget({ studentId, compact = false, readOnly = false }) {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const [micStatus, setMicStatus] = useState("idle"); // idle | requesting | listening | denied | unsupported
  const [cheerMessage, setCheerMessage] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [choosingSpecies, setChoosingSpecies] = useState(false);

  const emojiRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const bufferRef = useRef(null);
  const rafRef = useRef(null);

  const fetchPet = useCallback(async () => {
    const { data } = await supabase
      .from("pets")
      .select("xp, stage, name, species, species_chosen")
      .eq("student_id", studentId)
      .maybeSingle();
    setPet(data || { xp: 0, stage: 0, name: null, species: "chicken", species_chosen: true });
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    fetchPet();
  }, [fetchPet]);

  // Cheer on completion, regardless of listening/idle state.
  useEffect(() => {
    function handleCheer() {
      setCheerMessage(CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)]);
      const el = emojiRef.current;
      if (el) {
        el.classList.remove("pet-cheer-bounce");
        // eslint-disable-next-line no-unused-expressions
        el.offsetWidth; // restart the animation if it's already mid-cheer
        el.classList.add("pet-cheer-bounce");
        setTimeout(() => el.classList.remove("pet-cheer-bounce"), 650);
      }
      setTimeout(() => setCheerMessage(null), 2200);
    }
    window.addEventListener(CHEER_EVENT, handleCheer);
    return () => window.removeEventListener(CHEER_EVENT, handleCheer);
  }, []);

  function stopListening() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    rafRef.current = null;
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    if (emojiRef.current) emojiRef.current.style.transform = "";
    setListening(false);
    setMicStatus("idle");
  }

  useEffect(() => () => stopListening(), []);

  async function startListening() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus("unsupported");
      return;
    }
    setMicStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      analyserRef.current = analyser;
      bufferRef.current = new Float32Array(analyser.fftSize);

      setListening(true);
      setMicStatus("listening");

      let phase = 0;
      const tick = () => {
        rafRef.current = requestAnimationFrame(tick);
        const buffer = bufferRef.current;
        analyser.getFloatTimeDomainData(buffer);
        let sumSquares = 0;
        for (let i = 0; i < buffer.length; i++) sumSquares += buffer[i] * buffer[i];
        const rms = Math.sqrt(sumSquares / buffer.length);
        // Small noise floor so ambient room hiss doesn't twitch the pet.
        const level = Math.max(0, Math.min(1, (rms - 0.015) * 8));

        phase += 0.15;
        const scale = 1 + level * 0.35;
        const wiggle = Math.sin(phase) * level * 12;
        if (emojiRef.current) {
          emojiRef.current.style.transform = `scale(${scale}) rotate(${wiggle}deg)`;
        }
      };
      tick();
    } catch (err) {
      console.error("Pet listening mic access denied or failed:", err);
      setMicStatus("denied");
    }
  }

  async function handleSaveName(e) {
    e.preventDefault();
    const clean = nameDraft.trim();
    if (!clean) return;
    setSavingName(true);
    const { data, error } = await supabase.rpc("set_pet_name", { p_name: clean });
    setSavingName(false);
    if (!error) {
      setPet((p) => ({ ...p, name: data.name }));
      setEditingName(false);
    }
  }

  async function handleChooseSpecies(key) {
    setChoosingSpecies(true);
    const { data, error } = await supabase.rpc("choose_pet_species", { p_species: key });
    setChoosingSpecies(false);
    if (!error) {
      setPet((p) => ({ ...p, species: data.species, species_chosen: true }));
    }
  }

  if (loading) return null;

  const info = stageInfo(pet.stage, pet.species);
  const progress = Math.round(progressToNext(pet.xp, pet.stage, pet.species) * 100);

  if (compact) {
    return (
      <div className="pet-widget pet-widget-compact">
        <span className="pet-emoji-compact pet-idle-bob">{info.emoji}</span>
        <div className="pet-compact-info">
          <span className="pet-name-compact">{pet.name || info.name}</span>
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
      {!pet.species_chosen && (
        <div className="pet-species-picker">
          <p className="pet-species-prompt">Choose your pet! (This one's forever — pick your favorite)</p>
          <div className="pet-species-grid">
            {SPECIES_CHOICES.map((choice) => (
              <button
                key={choice.key}
                className="pet-species-option"
                onClick={() => handleChooseSpecies(choice.key)}
                disabled={choosingSpecies || readOnly}
              >
                <span className="pet-species-emoji">{choice.previewEmoji}</span>
                <span className="pet-species-label">{choice.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pet-emoji-wrap">
        {cheerMessage && <div className="pet-cheer-bubble">{cheerMessage}</div>}
        <div
          className={`pet-emoji-big${listening ? "" : " pet-idle-bob"}`}
          aria-hidden="true"
          ref={emojiRef}
        >
          {info.emoji}
        </div>
      </div>

      <div className="pet-name-row">
        {pet.name && (!editingName || readOnly) && (
          <>
            <span className="pet-custom-name">{pet.name}</span>
            {!readOnly && (
              <button
                className="pet-name-edit-btn"
                onClick={() => {
                  setNameDraft(pet.name);
                  setEditingName(true);
                }}
                aria-label="Rename pet"
              >
                ✏️
              </button>
            )}
          </>
        )}
        {!pet.name && !editingName && !readOnly && (
          <button
            className="btn-name-pet"
            onClick={() => {
              setNameDraft("");
              setEditingName(true);
            }}
          >
            Name your pet!
          </button>
        )}
      </div>

      {editingName && !readOnly && (
        <form className="pet-name-form" onSubmit={handleSaveName}>
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            maxLength={24}
            placeholder="e.g. Spike"
            autoFocus
          />
          <button type="submit" disabled={!nameDraft.trim() || savingName}>
            {savingName ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => setEditingName(false)}>
            Cancel
          </button>
        </form>
      )}

      <div className="pet-stage-label">{info.name}</div>
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

      <div className="pet-listen-row">
        {!listening ? (
          <button className="btn-pet-listen" onClick={startListening} disabled={micStatus === "requesting"}>
            {micStatus === "requesting" ? "Listening…" : "🎤 Play for me!"}
          </button>
        ) : (
          <button className="btn-pet-listen active" onClick={stopListening}>
            ⏹ Stop
          </button>
        )}
        {micStatus === "denied" && <p className="pet-mic-note">Couldn't access the microphone.</p>}
        {micStatus === "unsupported" && <p className="pet-mic-note">Mic not supported on this device.</p>}
      </div>
    </div>
  );
}

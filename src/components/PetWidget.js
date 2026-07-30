import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { stageInfo, progressToNext } from "../lib/petStages";
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
// Two purely-visual reactions layered on top of that: it wiggles along to
// live mic volume while "Play for me!" is on (no pitch/correctness
// judgment, just "there's sound"), and it does a little cheer whenever a
// practice card gets completed anywhere on the dashboard.
export default function PetWidget({ studentId, compact = false }) {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const [micStatus, setMicStatus] = useState("idle"); // idle | requesting | listening | denied | unsupported
  const [cheerMessage, setCheerMessage] = useState(null);

  const emojiRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const bufferRef = useRef(null);
  const rafRef = useRef(null);

  const fetchPet = useCallback(async () => {
    const { data } = await supabase.from("pets").select("xp, stage").eq("student_id", studentId).maybeSingle();
    setPet(data || { xp: 0, stage: 0 });
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
      <div className="pet-emoji-wrap">
        {cheerMessage && <div className="pet-cheer-bubble">{cheerMessage}</div>}
        <div className="pet-emoji-big" aria-hidden="true" ref={emojiRef}>
          {info.emoji}
        </div>
      </div>
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

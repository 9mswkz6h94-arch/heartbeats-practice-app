import React, { useState, useEffect, useRef, useCallback } from "react";
import { Renderer, Stave, StaveNote, TabStave, TabNote, Voice, Formatter } from "vexflow";
import { PitchDetector } from "pitchy";
import { supabase } from "../lib/supabaseClient";
import {
  generateExercise,
  matchesPitch,
  INSTRUMENT_LIST,
  instrumentSupportsTab,
} from "../lib/sightReadingEngine";
import "./SightReading.css";

const NOTE_LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
const PITCH_COLOR = "#175CD3"; // var(--color-focus) — VexFlow sets SVG fill
// attributes directly, which don't resolve CSS custom properties, so these
// are the token's literal values (kept in sync with src/index.css by hand).
const CORRECT_COLOR = "#17603A"; // var(--color-complete)
const DEFAULT_COLOR = "#0A0A0A"; // var(--color-ink)

function flattenExercise(exercise) {
  const flat = [];
  exercise.measures.forEach((measure) => {
    measure.notes.forEach((note) => flat.push(note));
  });
  return flat;
}

// Legible width per tickable — a fixed per-measure width regardless of note
// count is what caused eighth-note-heavy measures to compress into
// overlapping noteheads, so width now scales with how many notes are
// actually in the measure.
const NOTE_UNIT_WIDTH = { q: 46, h: 58, 8: 34, qr: 46 };
const FIRST_MEASURE_EXTRA = 70; // room for clef + time signature
const MEASURE_MARGIN = 22; // breathing room so noteheads never touch a barline

function measureWidthFor(measure, isFirst) {
  const notesWidth = measure.notes.reduce(
    (sum, n) => sum + (NOTE_UNIT_WIDTH[n.duration] || 46),
    0
  );
  return notesWidth + MEASURE_MARGIN + (isFirst ? FIRST_MEASURE_EXTRA : 0);
}

function renderStaff(container, exercise, currentFlatIndex, results) {
  container.innerHTML = "";
  const measureWidths = exercise.measures.map((m, i) => measureWidthFor(m, i === 0));
  const totalWidth = measureWidths.reduce((a, b) => a + b, 0) + 20;
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(totalWidth, 150);
  const context = renderer.getContext();

  let flatIdx = 0;
  let x = 10;
  exercise.measures.forEach((measure, mIdx) => {
    const width = measureWidths[mIdx];
    const stave = new Stave(x, 10, width);
    if (mIdx === 0) stave.addClef(exercise.clef).addTimeSignature("4/4");
    stave.setContext(context).draw();

    const staveNotes = measure.notes.map((n) => {
      const idx = flatIdx++;
      const sn = n.isRest
        ? new StaveNote({ keys: ["b/4"], duration: n.duration, clef: exercise.clef })
        : new StaveNote({
            keys: [`${n.note[0]}/${n.note.slice(1)}`],
            duration: n.duration,
            clef: exercise.clef,
          });

      const color =
        idx === currentFlatIndex ? PITCH_COLOR : results[idx] ? CORRECT_COLOR : DEFAULT_COLOR;
      sn.setStyle({ fillStyle: color, strokeStyle: color });
      return sn;
    });

    const voice = new Voice({ num_beats: 4, beat_value: 4 }).setStrict(false);
    voice.addTickables(staveNotes);
    new Formatter().joinVoices([voice]).format([voice], width - MEASURE_MARGIN);
    voice.draw(context, stave);

    x += width;
  });
}

// Same width-per-note-density approach as renderStaff, but tab staves need
// a bit more first-measure room for the "TAB" glyph.
const FIRST_MEASURE_EXTRA_TAB = 55;

function measureWidthForTab(measure, isFirst) {
  const notesWidth = measure.notes.reduce(
    (sum, n) => sum + (NOTE_UNIT_WIDTH[n.duration] || 46),
    0
  );
  return notesWidth + MEASURE_MARGIN + (isFirst ? FIRST_MEASURE_EXTRA_TAB : 0);
}

function renderTab(container, exercise, currentFlatIndex, results) {
  container.innerHTML = "";
  const measureWidths = exercise.measures.map((m, i) => measureWidthForTab(m, i === 0));
  const totalWidth = measureWidths.reduce((a, b) => a + b, 0) + 20;
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(totalWidth, 160);
  const context = renderer.getContext();

  const stringCount = exercise.tuning.length;
  // Engine's `position.string` is 0 = lowest-pitched string (tuning array
  // order); VexFlow's TabNote numbers strings 1 = highest string. Convert
  // at render time so the engine stays render-library-agnostic.
  const toVexString = (idx) => stringCount - idx;

  let flatIdx = 0;
  let x = 10;
  exercise.measures.forEach((measure, mIdx) => {
    const width = measureWidths[mIdx];
    const stave = new TabStave(x, 10, width);
    stave.setNumLines(stringCount);
    if (mIdx === 0) stave.addTabGlyph();
    stave.setContext(context).draw();

    const tabNotes = measure.notes.map((n) => {
      const idx = flatIdx++;
      let tn;
      if (n.isRest || !n.position) {
        // No literal rest glyph on a tab staff — an invisible note preserves
        // the rhythmic space instead.
        tn = new TabNote({ positions: [{ str: 1, fret: 0 }], duration: n.duration.replace("r", "") });
        tn.setGhost(true);
      } else {
        tn = new TabNote({
          positions: [{ str: toVexString(n.position.string), fret: n.position.fret }],
          duration: n.duration,
        });
      }

      const color =
        idx === currentFlatIndex ? PITCH_COLOR : results[idx] ? CORRECT_COLOR : DEFAULT_COLOR;
      tn.setStyle({ fillStyle: color, strokeStyle: color });
      return tn;
    });

    const voice = new Voice({ num_beats: 4, beat_value: 4 }).setStrict(false);
    voice.addTickables(tabNotes);
    new Formatter().joinVoices([voice]).format([voice], width - MEASURE_MARGIN);
    voice.draw(context, stave);

    x += width;
  });
}

// Sight-reading module: generates a random exercise sized to the student's
// instrument + chosen level, confirms notes either by ear (mic + pitch
// detection) or by tap (manual note-name fallback — no mic permission or
// quiet room required), then logs the session so it feeds the same
// streak/pet-XP pipeline every other practice activity uses.
export default function SightReading({ studentId, readOnly = false, startImmediately = false }) {
  const [enabled, setEnabled] = useState(true);
  const [instrument, setInstrument] = useState(null);
  const [notation, setNotation] = useState("staff"); // 'staff' | 'tab'
  const [level, setLevel] = useState("beginner");
  const [exercise, setExercise] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [inputMode, setInputMode] = useState(null); // 'mic' | 'manual'
  const [micStatus, setMicStatus] = useState("idle"); // idle | requesting | listening | denied | unsupported
  const [flash, setFlash] = useState(null); // 'correct' | 'wrong' | null
  const [sessionDone, setSessionDone] = useState(false);
  const [started, setStarted] = useState(startImmediately);
  const [forceContinue, setForceContinue] = useState(false);
  const [isPortrait, setIsPortrait] = useState(
    () => window.matchMedia("(orientation: portrait)").matches
  );

  const staffRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const bufferRef = useRef(null);
  const analyserRef = useRef(null);

  const flat = exercise ? flattenExercise(exercise) : [];
  const current = flat[currentIndex];

  // No cross-browser API can force a phone into landscape (Screen
  // Orientation lock needs Fullscreen + isn't supported on iOS Safari at
  // all), so instead we detect orientation and prompt the student to
  // rotate — with an escape hatch, since the check can't tell a phone in a
  // stand from one lying flat.
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const handler = (e) => setIsPortrait(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("students")
        .select("instrument, sightreading_enabled, sightreading_level")
        .eq("id", studentId)
        .single();
      if (cancelled) return;
      setEnabled(data?.sightreading_enabled !== false);
      setLevel(data?.sightreading_level || "beginner");
      const raw = (data?.instrument || "piano").trim().toLowerCase();
      const matched = INSTRUMENT_LIST.find((i) => i.key.toLowerCase() === raw);
      setInstrument(matched ? matched.key : "piano");
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const newExercise = useCallback(() => {
    if (!instrument) return;
    setExercise(generateExercise({ instrument, level, measureCount: 4, notation }));
    setCurrentIndex(0);
    setResults([]);
    setSessionDone(false);
    setFlash(null);
  }, [instrument, level, notation]);

  useEffect(() => {
    newExercise();
  }, [newExercise]);

  function handleInstrumentChange(key) {
    setInstrument(key);
    if (!instrumentSupportsTab(key)) setNotation("staff");
  }

  function stopMic() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    detectorRef.current = null;
  }

  useEffect(() => () => stopMic(), []);

  function advance(correct) {
    setResults((r) => {
      const next = [...r];
      next[currentIndex] = correct;
      return next;
    });
    setFlash(correct ? "correct" : "wrong");
    setTimeout(() => setFlash(null), 300);

    if (currentIndex + 1 >= flat.length) {
      setSessionDone(true);
      stopMic();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  // Auto-advance past rests — nothing to play or tap.
  useEffect(() => {
    if (current?.isRest && !sessionDone) {
      const t = setTimeout(() => advance(true), 500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, exercise]);

  async function startMic() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus("unsupported");
      setInputMode("manual");
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
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const detector = PitchDetector.forFloat32Array(analyser.fftSize);
      detectorRef.current = detector;
      bufferRef.current = new Float32Array(detector.inputLength);

      setInputMode("mic");
      setMicStatus("listening");
    } catch (err) {
      console.error("Mic access denied or failed:", err);
      setMicStatus("denied");
      setInputMode("manual");
    }
  }

  // Re-subscribes fresh every note (rather than one long-lived recursive
  // loop) so the closure always compares against the *current* target note
  // instead of a stale one captured when listening first started.
  useEffect(() => {
    if (inputMode !== "mic" || !current || current.isRest || sessionDone) return;
    let cancelled = false;
    let rafId;

    function tick() {
      if (cancelled) return;
      rafId = requestAnimationFrame(tick);
      const analyser = analyserRef.current;
      const detector = detectorRef.current;
      const buffer = bufferRef.current;
      const ctx = audioCtxRef.current;
      if (!analyser || !detector || !buffer || !ctx) return;

      analyser.getFloatTimeDomainData(buffer);
      const [pitch, clarity] = detector.findPitch(buffer, ctx.sampleRate);
      if (clarity > 0.9 && pitch && matchesPitch(pitch, current.note, { matchOctave: exercise.matchOctave })) {
        cancelled = true;
        cancelAnimationFrame(rafId);
        advance(true);
      }
    }
    tick();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMode, currentIndex, exercise, sessionDone]);

  function tapLetter(letter) {
    if (!current || current.isRest) return;
    advance(letter === current.note[0].toUpperCase());
  }

  function skipNote() {
    if (!current || current.isRest) return;
    advance(false);
  }

  useEffect(() => {
    if (!exercise || !staffRef.current) return;
    if (exercise.notation === "tab") {
      renderTab(staffRef.current, exercise, currentIndex, results);
    } else {
      renderStaff(staffRef.current, exercise, currentIndex, results);
    }
  }, [exercise, currentIndex, results]);

  useEffect(() => {
    if (!sessionDone || readOnly) return;
    const correctCount = results.filter(Boolean).length;
    supabase
      .from("sightreading_attempts")
      .insert([
        {
          student_id: studentId,
          instrument,
          level,
          input_mode: inputMode || "manual",
          notation_mode: exercise?.notation || "staff",
          notes_correct: correctCount,
          notes_total: flat.length,
          completed_at: new Date().toISOString(),
        },
      ])
      .then(({ error }) => {
        if (error) console.error("Failed to save sight-reading session:", error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionDone]);

  if (!enabled) return null;

  if (!instrument || !exercise) {
    return <div className="sightreading-loading" role="status"><h3>Loading sight reading</h3><p>Preparing an exercise for your instrument…</p></div>;
  }

  if (!started) {
    return (
      <div className="sightreading-container sightreading-start-screen">
        <p className="sightreading-kicker">Optional practice</p>
        <h2>Sight reading</h2>
        <p>Read music on the staff — by ear or by tapping the note name.</p>
        <button type="button" className="btn-primary" onClick={() => setStarted(true)}>
          Start sight reading
        </button>
      </div>
    );
  }

  if (isPortrait && !forceContinue) {
    return (
      <div className="sightreading-container">
        <div className="sightreading-orientation-prompt">
          <div className="rotate-icon" aria-hidden="true">↻</div>
          <p>Turn your phone sideways for Sight Reading</p>
          <button type="button" className="btn-link" onClick={() => setForceContinue(true)}>
            Continue anyway
          </button>
        </div>
      </div>
    );
  }

  const correctSoFar = results.filter(Boolean).length;

  return (
    <div className={`sightreading-container ${flash ? `flash-${flash}` : ""}`}>
      <div className="sightreading-header">
        <h2>Sight reading</h2>
        <div className="sightreading-level-toggle">
          <button
            type="button"
            className={level === "beginner" ? "active" : ""}
            aria-pressed={level === "beginner"}
            onClick={() => setLevel("beginner")}
          >
            Beginner
          </button>
          <button
            type="button"
            className={level === "intermediate" ? "active" : ""}
            aria-pressed={level === "intermediate"}
            onClick={() => setLevel("intermediate")}
          >
            Intermediate
          </button>
        </div>
      </div>

      <div className="sightreading-instrument-row">
        <select
          className="sightreading-instrument-select"
          value={instrument}
          onChange={(e) => handleInstrumentChange(e.target.value)}
          aria-label="Instrument"
        >
          {INSTRUMENT_LIST.map((i) => (
            <option key={i.key} value={i.key}>
              {i.label}
            </option>
          ))}
        </select>

        {instrumentSupportsTab(instrument) && (
          <div className="sightreading-level-toggle">
            <button type="button" className={notation === "staff" ? "active" : ""} aria-pressed={notation === "staff"} onClick={() => setNotation("staff")}>
              Standard
            </button>
            <button type="button" className={notation === "tab" ? "active" : ""} aria-pressed={notation === "tab"} onClick={() => setNotation("tab")}>
              Tab
            </button>
          </div>
        )}
      </div>

      <div className="sightreading-progress">
        Note {Math.min(currentIndex + 1, flat.length)} of {flat.length} · {correctSoFar} correct
      </div>

      <div ref={staffRef} className="sightreading-staff" />

      {sessionDone ? (
        <div className="sightreading-done" role="status">
          <p><strong>Exercise complete.</strong> {correctSoFar} of {flat.length} notes correct.</p>
          <button type="button" className="btn-primary" onClick={newExercise}>
            New exercise
          </button>
        </div>
      ) : (
        <div className="sightreading-controls">
          {!inputMode && (
            <div className="sightreading-mode-picker">
              <button type="button" className="btn-primary" onClick={startMic}>
                Play it — use microphone
              </button>
              <button type="button" className="btn-secondary" onClick={() => setInputMode("manual")}>
                Tap the note name
              </button>
            </div>
          )}

          {inputMode === "mic" && (
            <div className="sightreading-mic-status">
              {micStatus === "requesting" && <p>Requesting microphone access…</p>}
              {micStatus === "listening" && <p>Listening — play the highlighted note</p>}
              <button
                className="btn-link"
                type="button"
                onClick={() => {
                  stopMic();
                  setInputMode("manual");
                }}
              >
                Switch to tap mode
              </button>
            </div>
          )}

          {inputMode === "manual" && (
            <div className="sightreading-letters">
              {micStatus === "denied" && (
                <p className="sightreading-mic-denied">
                  Couldn't access the microphone — tap the note name instead.
                </p>
              )}
              {NOTE_LETTERS.map((letter) => (
                <button type="button" key={letter} className="note-letter-btn" onClick={() => tapLetter(letter)}>
                  {letter}
                </button>
              ))}
            </div>
          )}

          {inputMode && current && !current.isRest && (
            <button type="button" className="btn-link sightreading-skip" onClick={skipNote}>
              Skip this note
            </button>
          )}
        </div>
      )}
    </div>
  );
}

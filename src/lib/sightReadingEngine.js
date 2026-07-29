// Sight-reading exercise generation + pitch-matching helpers.
// Note math runs on `tonal` (also used by rainbowheart-studio's Chord/Scale
// Explorer and Tab Studio) instead of hand-rolled semitone arithmetic, so
// note/frequency/fret handling stays consistent with those sibling tools.
import { Note } from "tonal";

// Tunings ported from rainbowheart-studio's ChordScaleExplorer.jsx
// (INSTRUMENTS config) so fretted-instrument behavior — and any future
// piggybacking on that app's chord/tab data — stays in sync with what the
// rest of the site already defines for these instruments.
export const TUNINGS = {
  ukulele: { tuning: ["g4", "c4", "e4", "a4"], frets: 12 },
  tenorGuitar: { tuning: ["c3", "g3", "d4", "a4"], frets: 12 },
  guitarlele: { tuning: ["a2", "d3", "g3", "c4", "e4", "a4"], frets: 12 },
  guitar: { tuning: ["e2", "a2", "d3", "g3", "b3", "e4"], frets: 12 },
  bass: { tuning: ["e1", "a1", "d2", "g2"], frets: 12 },
};

// Per-instrument reading range + clef. Ranges are deliberately narrow for
// "beginner" (mostly first-position / open-string-adjacent) and widen for
// "intermediate". `matchOctave: false` means only the pitch class (scale
// degree) has to match — used for voice, since a child singing "do" a
// register away from the printed pitch is still correct solfège, whereas an
// instrument's fingering is tied to the exact printed octave.
// `tuning` is only present for fretted instruments — its presence is what
// enables the Tab notation mode in the UI.
const INSTRUMENT_PROFILES = {
  piano: { clef: "treble", beginner: ["c4", "c5"], intermediate: ["c3", "c6"], matchOctave: true },
  voice: { clef: "treble", beginner: ["c4", "a4"], intermediate: ["a3", "d5"], matchOctave: false },
  violin: { clef: "treble", beginner: ["g3", "a4"], intermediate: ["g3", "e5"], matchOctave: true },
  viola: { clef: "alto", beginner: ["c3", "a4"], intermediate: ["c3", "d5"], matchOctave: true },
  cello: { clef: "bass", beginner: ["c2", "a3"], intermediate: ["c2", "d4"], matchOctave: true },
  flute: { clef: "treble", beginner: ["c4", "c5"], intermediate: ["c4", "g5"], matchOctave: true },
  guitar: {
    clef: "treble",
    beginner: ["e3", "b4"],
    intermediate: ["e3", "e5"],
    matchOctave: true,
    tuning: TUNINGS.guitar.tuning,
  },
  ukulele: {
    clef: "treble",
    beginner: ["c4", "a4"],
    intermediate: ["a3", "d5"],
    matchOctave: true,
    tuning: TUNINGS.ukulele.tuning,
  },
  tenorGuitar: {
    clef: "treble",
    beginner: ["g3", "d4"],
    intermediate: ["c3", "a4"],
    matchOctave: true,
    tuning: TUNINGS.tenorGuitar.tuning,
  },
  guitarlele: {
    clef: "treble",
    beginner: ["e3", "a4"],
    intermediate: ["a2", "a4"],
    matchOctave: true,
    tuning: TUNINGS.guitarlele.tuning,
  },
  bass: {
    clef: "bass",
    beginner: ["e2", "a2"],
    intermediate: ["e1", "g3"],
    matchOctave: true,
    tuning: TUNINGS.bass.tuning,
  },
  default: { clef: "treble", beginner: ["c4", "c5"], intermediate: ["c3", "c6"], matchOctave: true },
};

export const INSTRUMENT_LIST = [
  { key: "piano", label: "Piano" },
  { key: "voice", label: "Voice" },
  { key: "violin", label: "Violin" },
  { key: "viola", label: "Viola" },
  { key: "cello", label: "Cello" },
  { key: "flute", label: "Flute" },
  { key: "guitar", label: "Guitar" },
  { key: "ukulele", label: "Ukulele" },
  { key: "tenorGuitar", label: "Tenor Guitar" },
  { key: "guitarlele", label: "Guitarlele" },
  { key: "bass", label: "Bass Guitar" },
];

export function getInstrumentProfile(instrument) {
  const key = (instrument || "").trim();
  const normalized = INSTRUMENT_LIST.find((i) => i.key.toLowerCase() === key.toLowerCase())?.key;
  return INSTRUMENT_PROFILES[normalized] || INSTRUMENT_PROFILES.default;
}

export function instrumentSupportsTab(instrument) {
  return Boolean(getInstrumentProfile(instrument).tuning);
}

// Build the ordered list of natural-note names between lowNote and highNote inclusive.
function buildNoteLadder(lowNote, highNote) {
  const lowMidi = Note.midi(lowNote);
  const highMidi = Note.midi(highNote);
  const ladder = [];
  for (let midi = lowMidi; midi <= highMidi; midi++) {
    const note = Note.get(Note.fromMidi(midi));
    if (note.acc === "") ladder.push(note.name.toLowerCase()); // naturals only
  }
  return ladder;
}

const RHYTHM_POOLS = {
  // Kodály-order rhythms: ta (quarter), ti-ti (paired eighths), rest, ta-a (half).
  // Each entry is a measure's worth of VexFlow durations that sums to 4 beats.
  beginner: [
    ["q", "q", "q", "q"],
    ["h", "q", "q"],
    ["q", "q", "h"],
  ],
  intermediate: [
    ["q", "q", "q", "q"],
    ["8", "8", "q", "q", "q"],
    ["q", "8", "8", "q", "q"],
    ["q", "q", "8", "8", "q"],
    ["qr", "q", "q", "q"],
    ["8", "8", "8", "8", "q", "q"],
    ["h", "8", "8", "q"],
  ],
};

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Walks the note ladder with mostly-stepwise motion (beginner) or occasional
// skips (intermediate), rather than pure uniform-random note choice — random
// leaps across a beginner's whole range don't read like real sight-reading.
function generateMelody(ladder, noteCount, level) {
  const maxStep = level === "beginner" ? 1 : 3;
  const stepwiseBias = level === "beginner" ? 0.85 : 0.6;
  let idx = Math.floor(Math.random() * ladder.length);
  const melody = [ladder[idx]];

  for (let i = 1; i < noteCount; i++) {
    let step;
    if (Math.random() < stepwiseBias) {
      step = randomChoice([-1, 1]);
    } else {
      step = randomChoice(
        Array.from({ length: maxStep * 2 + 1 }, (_, n) => n - maxStep).filter((s) => s !== 0)
      );
    }
    idx = Math.min(ladder.length - 1, Math.max(0, idx + step));
    melody.push(ladder[idx]);
  }
  return melody;
}

// Every string/fret combination that plays `noteName` on `tuning`, within
// 0..maxFret. `string` is index 0 = lowest-pitched string (tuning array
// order) — the same convention ChordScaleExplorer.jsx uses for its
// getPositions(); callers doing VexFlow TabNote rendering convert to
// VexFlow's 1-is-highest-string numbering at render time.
export function getFretPositions(tuning, noteName, maxFret = 12) {
  const targetMidi = Note.midi(noteName);
  if (targetMidi == null) return [];
  const positions = [];
  tuning.forEach((openNote, stringIdx) => {
    const openMidi = Note.midi(openNote);
    const fret = targetMidi - openMidi;
    if (fret >= 0 && fret <= maxFret) positions.push({ string: stringIdx, fret });
  });
  return positions;
}

// Picks one playable position for a note, biased toward lower frets (more
// beginner-friendly / open-position-friendly) with a fallback to the full
// neck if the level's fret ceiling can't reach the note at all (can happen
// for notes near the top of a wide intermediate pitch range).
function pickFretPosition(tuning, noteName, maxFret) {
  let candidates = getFretPositions(tuning, noteName, maxFret);
  if (candidates.length === 0) candidates = getFretPositions(tuning, noteName, 12);
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.fret - b.fret);
  const lowestFret = candidates[0].fret;
  const nearLow = candidates.filter((p) => p.fret <= lowestFret + 2);
  return randomChoice(nearLow.length ? nearLow : candidates);
}

// Returns { clef, matchOctave, tuning, measures: [{ notes: [{ note, duration, isRest, position? }] }] }
// `notation` is "staff" (default) or "tab" — tab only applies anything extra
// when the instrument profile has a `tuning` (fretted instruments).
export function generateExercise({ instrument, level = "beginner", measureCount = 4, notation = "staff" }) {
  const profile = getInstrumentProfile(instrument);
  const [low, high] = profile[level] || profile.beginner;
  const ladder = buildNoteLadder(low, high);

  const rhythmPool = RHYTHM_POOLS[level] || RHYTHM_POOLS.beginner;
  const measureRhythms = Array.from({ length: measureCount }, () => randomChoice(rhythmPool));
  const totalNotes = measureRhythms.reduce(
    (sum, rhythm) => sum + rhythm.filter((d) => d !== "qr").length,
    0
  );
  const melody = generateMelody(ladder, totalNotes, level);

  const useTab = notation === "tab" && Boolean(profile.tuning);
  const maxFret = level === "beginner" ? 4 : 9;

  let cursor = 0;
  const measures = measureRhythms.map((rhythm) => ({
    notes: rhythm.map((duration) => {
      if (duration === "qr") return { note: null, duration: "qr", isRest: true };
      const note = melody[cursor++];
      const position = useTab ? pickFretPosition(profile.tuning, note, maxFret) : null;
      return { note, duration, isRest: false, position };
    }),
  }));

  return {
    clef: profile.clef,
    matchOctave: profile.matchOctave,
    tuning: profile.tuning || null,
    notation: useTab ? "tab" : "staff",
    measures,
  };
}

export function noteToFrequency(note) {
  return Note.freq(note);
}

// Compares a detected frequency (Hz) against an expected note name.
// When matchOctave is false, only the pitch class (scale degree) must match —
// used for voice, where register doesn't matter, only the correct syllable.
export function matchesPitch(detectedHz, expectedNote, { matchOctave = true, toleranceCents = 40 } = {}) {
  if (!detectedHz || !expectedNote) return false;

  const expectedFreq = noteToFrequency(expectedNote);
  const centsOff = (freqA, freqB) => 1200 * Math.log2(freqA / freqB);

  if (matchOctave) {
    return Math.abs(centsOff(detectedHz, expectedFreq)) <= toleranceCents;
  }

  // Fold the detected frequency to the same octave as the expected note,
  // then compare — this makes register irrelevant, pitch class only.
  let folded = detectedHz;
  while (folded > expectedFreq * Math.SQRT2) folded /= 2;
  while (folded < expectedFreq / Math.SQRT2) folded *= 2;
  return Math.abs(centsOff(folded, expectedFreq)) <= toleranceCents;
}

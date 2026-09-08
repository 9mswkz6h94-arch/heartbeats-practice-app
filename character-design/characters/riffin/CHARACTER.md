# Riffin

## Core concept

Riffin is a coral-orange fox and acoustic-guitar mashup. Riffin represents melody, phrasing, and the courage to try before feeling completely ready.

- **Stable ID:** `riffin`
- **Animal:** Fox
- **Instrument:** Acoustic guitar
- **Musical role:** Melody
- **Practice virtue:** Brave first attempts
- **Starter identity:** Melody starter

## Personality

Riffin is curious, eager, and encouraging. New sounds make Riffin lean closer rather than back away. Mistakes are treated as interesting clues for the next try.

Child-facing introduction:

> Riffin follows every new melody and loves the brave sound of a first try.

## Visual identity

Required silhouette cues:

- Tall fox ears and a compact friendly stance.
- Rounded guitar-resonator torso with one dark sound hole.
- Three visible strings crossing the sound hole.
- Tail shaped like a short guitar neck, ending in three readable tuning pegs.

Avoid separate guitar props, dense fur markings, realistic guitar hardware, or more than three visible strings.

## Palette

- Outline: `#201923`
- Dark wood accent: `#7A321C`
- Coral orange: `#E86F21`
- Warm cream: `#FFD27A`

## Motion

- **Idle:** ears alternate by one pixel while the tail rests.
- **Sound dance:** torso bobs and tail pegs bounce in time with microphone volume.
- **Celebrate:** paws lift and the strings flash to the light accent.

## Companion voice

Riffin speaks in short musical images and treats every attempt as forward motion. Riffin may notice melodies, strings, notes, riffs, and curiosity, but never claims the student played accurately unless the app measured that.

The complete versioned interaction set lives in `voice-pack-v2.json`. It implements all 23 catalog intents with 175 reviewed combinations. High-frequency lines use reviewed combinations plus per-student history so the companion stays varied without generating unreviewed text.

## Sticker trio

1. **Celebrate — Big Riff:** Riffin strums with raised ears and three bright music pixels. Accessibility label: “Riffin celebrates your practice.”
2. **Encourage — Keep Strumming:** Riffin offers a gentle paw-forward smile. Accessibility label: “Riffin says keep going, one try at a time.”
3. **Connect — Duet High-Five:** Riffin raises one paw while the tail curves toward an implied partner. Accessibility label: “Riffin sends a musical high-five.”

## Character-sheet facts

- **Instrument connection:** Riffin's round belly carries melodies like a guitar body carries sound.
- **Playful fact:** Riffin's tail pegs wiggle whenever a new tune is nearby.
- **Unlock source:** Choose Riffin's starter egg or unlock Riffin later through the Musical Zoo progression.

## Current review status

- **Current gate:** Gate 4 — approved full-art sticker family in progress; Celebrate V1 and Encourage V1 are accepted, while cuter Celebrate and Connect candidates are being explored.
- **Locked and approved:** Stable ID, starter slot, fox + acoustic-guitar identity, melody role, brave-first-attempts virtue, personality, required anatomy, four-color palette, motion budget, sticker meanings, accessibility direction, and authored-voice safety rules.
- **Accepted visual packet:** `../../../concept-art/sprites/riffin-64x64-v2.png`, complete sprite family, timed two-frame motion, and three stickers were accepted by Jonathan on 2026-08-23.
- **Full-art sticker refinement:** Jonathan approved `../../../concept-art/stickers/riffin-sticker-celebrate-full-v1.png` on 2026-09-05 as the first 1305×1305 transparent full-art Celebrate master under the three-interpretation system. Character Version 3 references the accepted master while Encourage and Connect remain accepted pixel previews during migration.
- **Encourage full-art approval:** Jonathan approved `../../../concept-art/stickers/riffin-sticker-encourage-full-v1.png` on 2026-09-05. Character Version 4 references the accepted 1254×1254 open-palm, gentle-smile design. A few microscopic extraction flecks outside the die-cut edge remain a technical cleanup item before print export even though they disappear at the 92px shelf size.
- **Cutest-set candidates:** `../../../concept-art/stickers/riffin-sticker-celebrate-full-v2.png` carries Encourage's rounder proportions into a waving celebration, while `../../../concept-art/stickers/riffin-sticker-connect-full-v1.png` uses a playful wink and soft high-five paw. Both are sandbox candidates; the manifest continues to preserve the previously accepted Celebrate V1 and pixel Connect until Jonathan reviews the new pair.
- **Voice capacity:** 23 of 23 intents and 175 unique calculated combinations, with zero micro reactions above eight words. Jonathan delegated final editorial acceptance on 2026-08-26; every expanded line is checked in `VOICE_REVIEW_V2.md`.
- **Status:** `design-approved-assets-in-progress` until the cuter Celebrate revision and matching full-art Connect master pass visual review and final alpha cleanup.
- **Do not integrate:** Keep app code, migrations, and student records untouched until the canonical intake process marks this packet accepted. Do not modify Founding Friend ownership or progress.

Full gate findings are recorded in `GATE_REVIEW.md`.

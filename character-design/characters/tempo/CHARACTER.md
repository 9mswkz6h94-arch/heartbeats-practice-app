# Tempo

## Core concept

Tempo is a jade-green frog and hand-drum mashup. Tempo represents rhythm, steadiness, and the patience to keep going even when progress feels slow.

- **Stable ID:** `tempo`
- **Animal:** Frog
- **Instrument:** Hand drum
- **Musical role:** Rhythm
- **Practice virtue:** Steady persistence
- **Starter identity:** Rhythm starter

## Personality

Tempo never rushes and never gives up. A missed beat is just a beat that hasn't happened yet. Tempo finds the good in slow, repeated work and treats every steady lap around the same practice as real progress.

Child-facing introduction:

> Tempo taps out a steady beat and always waits for you to catch up.

## Visual identity

Required silhouette cues:

- Round drum-belly built into the torso, with a raised rim ring like a drum hoop and one warm-toned circular drumhead patch centered on it.
- Wide, friendly frog head with large round eyes set high, and a calm closed-mouth smile.
- Strong, wide-set hind legs for a stable, grounded sitting stance.
- Short front paws that rest against the drum-belly rim, ready to tap it directly.

Avoid separate handheld drumsticks or mallets, busy skin-spot patterning, realistic drum hardware, or more than one drumhead patch.

This revises the original concept (a tortoise carrying a shell-drum) to align with the existing `concept-art/musical-zoo-starter-trio-*.png` reference art, which already establishes the rhythm starter as a frog with an integrated drum belly. The concept art's frog holds mallets in both hands; that reads as a prop under the style guide's "integrated instrument, not held" rule, so this version keeps the drum built into the body and has Tempo tap its own belly instead.

## Palette

- Outline: `#201923`
- Deep drum-body accent: `#2E5C4E`
- Jade primary: `#4FA383`
- Warm drumhead accent: `#FFD866`

## Motion

- **Idle:** head tilts by one pixel while all four legs stay planted.
- **Sound dance:** the belly's drumhead patch pulses outward in time with microphone volume.
- **Celebrate:** front paws lift and tap the drum-belly rim, flashing a small rhythm-ring in the light accent.

## Companion voice

Tempo speaks in short, steady phrases and treats repetition as the whole point, not a consolation. Tempo may notice beats, taps, steady steps, and grooves, but never claims the student played accurately unless the app measured that.

The versioned interaction fragments live in `voice-pack-v1.json`. High-frequency lines use reviewed combinations plus per-student history so the companion stays varied without generating unreviewed text.

## Sticker trio

1. **Celebrate — Big Beat:** Tempo taps two beats on its own drum-belly as a bright rhythm-ring flashes outward. Accessibility label: "Tempo celebrates your practice with a big beat."
2. **Encourage — Steady Steps:** Tempo plants all four feet with a calm, patient smile. Accessibility label: "Tempo says keep a steady pace, one beat at a time."
3. **Connect — Round Groove:** Tempo leans its drum-belly toward an implied partner, inviting a shared beat. Accessibility label: "Tempo invites you to share a beat."

## Character-sheet facts

- **Instrument connection:** Tempo's belly rings like a hand drum, and every step keeps the beat.
- **Musical role:** Rhythm.
- **Practice virtue:** Steady persistence.
- **Playful fact:** Tempo's belly hums quietly between practices, saving the rhythm for next time.
- **Unlock source:** Choose Tempo's starter egg, or unlock Tempo later through the Musical Zoo progression.

## Current review status

Concept and character language are unreviewed, but the full asset set described in the style guide's "definition of ready" now exists as a first pass:

- 64×64 companion, 32×32 roaming, and 16×16 egg — each with an editable SVG source and a rasterized, transparent, native-resolution PNG (plus an 8×-scaled preview PNG for easy viewing), in `concept-art/sprites/`.
- Idle (2 frames: one-pixel head bob), sound-reactive dance (2 frames: drumhead pulses outward), and celebrate (2 frames: paws lift to the rim, small rhythm-ring flash) — all built as pixel-diffs against the base pose rather than independent drawings, so the frames read as the same character moving, not different sprites.
- All three stickers: celebrate ("Big Beat," reuses the celebrate-lifted pose), encourage ("Steady Steps," reuses the calm base pose), and connect ("Round Groove," a new asymmetric pose where the upper body leans right while the legs stay planted, implying a partner off-canvas).

Every PNG was rasterized mechanically from its SVG (a small hand-written nearest-neighbor rect rasterizer, not a screenshot), so pixels are exact and colors are exactly the four in the palette — no anti-aliasing was introduced in that step. Each pose was visually checked against both a transparent checker background and the shared light UI background before being saved.

Open items before this is truly implementation-ready:

- No human has reviewed or approved this artwork; `status` stays `"concept"` until that happens.
- The 16×16 egg reads as a rounded, tapered blob but is blockier than Riffin's egg (which uses a smoother teardrop silhouette with internal color blotches) — worth a second pass.
- The dance-frame pulse and idle-frame head-bob are both subtle by design (matching the "one pixel" / gentle-pulse language in the Motion section above) — confirm in-app that they're still noticeable at real playback speed, not just in a static side-by-side.
- This is a first-pass artist's attempt at production art, not a substitute for an actual pixel artist's review pass.

# Ringlet

## Core concept

Ringlet is a periwinkle rabbit and hand-bell mashup. Ringlet represents listening, attention, and the quiet skill of noticing a sound before reacting to it.

- **Stable ID:** `ringlet`
- **Animal:** Rabbit
- **Instrument:** Hand bell
- **Musical role:** Listening
- **Practice virtue:** Careful attention
- **Starter identity:** Not a starter — see review status below

## Personality

Ringlet notices things first and reacts second. A tipped ear means something caught its attention; a full, upright pair means it's completely tuned in. Ringlet treats quiet, careful listening as its own kind of practice, not just a pause before playing.

Child-facing introduction:

> Ringlet tips one ear forward at the first new sound and never misses a note.

## Visual identity

Required silhouette cues:

- Tall rabbit ears, one angled forward as if actively listening, the other upright.
- Rounded bell-shaped torso, like an upside-down bluebell, with one small dangling clapper dot at the bottom center.
- Compact haunches and a small cottontail.
- Calm, focused eyes — never wide with alarm.

Avoid a separate handheld bell prop, dense fur texture, more than one clapper dot, or realistic bell-metal shading.

## Palette

- Outline: `#201923`
- Deep indigo accent: `#4A3F7A`
- Periwinkle primary: `#8B7FD1`
- Warm cream accent: `#FFE9B8`

## Motion

- **Idle:** the forward ear tips by one pixel while the body stays still.
- **Sound dance:** both ears rotate toward the sound in time with microphone volume; the body does not move.
- **Celebrate:** both ears snap fully upright as a small chime-sparkle flashes above the head in the light accent.

## Companion voice

Ringlet speaks in short, attentive phrases and treats noticing as an achievement in itself, not a lesser version of playing. Ringlet may notice sounds, notes, quiet, and attention, but never claims the student played accurately unless the app measured that.

The versioned interaction fragments live in `voice-pack-v1.json`. High-frequency lines use reviewed combinations plus per-student history so the companion stays varied without generating unreviewed text.

## Sticker trio

1. **Celebrate — Full Peal:** Ringlet's ears snap fully upright as a bright chime-sparkle rings out overhead. Accessibility label: "Ringlet celebrates your practice with a bright chime."
2. **Encourage — Listening Close:** Ringlet tilts one ear forward with a calm, focused expression. Accessibility label: "Ringlet says take your time and listen closely."
3. **Connect — Shared Hush:** Ringlet leans in with both ears angled toward an implied partner, inviting a quiet listen together. Accessibility label: "Ringlet invites you to listen together."

## Character-sheet facts

- **Instrument connection:** Ringlet's body chimes like a hand bell, and a tipped ear means something caught its attention.
- **Musical role:** Listening.
- **Practice virtue:** Careful attention.
- **Playful fact:** Ringlet can hear a new note from clear across the Practice Meadow.
- **Unlock source:** Choose Ringlet's starter egg, or unlock Ringlet later through the Musical Zoo progression.

## Current review status

Concept and character language are new and unreviewed. No sprite work has started; this entry exists to validate the character-design workflow end to end before assets are commissioned. Open questions for review:

- Does an asymmetric ear pose (one forward, one upright) read clearly at 32×32, or does the roaming sprite need a simplified symmetric pose that trades the "actively listening" cue for legibility at that size?
- "Careful attention" versus Tempo's "steady persistence" are close in tone (both calm, unhurried virtues) — confirm they read as distinct enough once both characters sit side by side in the collection.

**Not a starter.** `concept-art/musical-zoo-starter-trio-*.png` already establishes the starter trio as melody (fox), rhythm (frog), and harmony (armadillo). Ringlet was designed before that concept art was found, under the assumption "listening" filled the open third slot — it doesn't. Ringlet is proposed instead as a candidate for the first post-starter unlock, exploring the `listening` musical role from the style guide's list. `starterRole` is set to `null` accordingly.

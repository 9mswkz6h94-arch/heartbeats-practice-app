# Musical Zoo character style guide

Status: **accepted for the Heart Beats Practice App only**

## Creative promise

Musical Zoo characters are friendly animal-and-instrument beings that make practice feel accompanied. Their tiny forms use the visual economy of late-1990s color-handheld games; their larger art feels tactile, warm, and collectible. They do not copy the characters, interface, terminology, or lore of an existing franchise.

Characters respond to work. They do not fight, lose health, become sad after missed practice, rank students, demand replies, or judge musical accuracy.

Chordillo is the app-local quality anchor: rounded dimensional anatomy, expressive readable eyes, dark plum stepped outlines, disciplined color clusters, and an instrument that belongs to the creature's body. This does not establish a canonical Rainbow Heart illustration style.

## Character recipe

Every character needs:

1. **Animal silhouette:** recognizable before internal detail.
2. **Integrated instrument:** exactly one primary instrument mechanism built into the anatomy.
3. **Musical role:** a distinct musical idea such as melody, rhythm, harmony, listening, dynamics, improvisation, expression, ensemble, or phrasing.
4. **Practice virtue:** a distinct behavior worth reinforcing without pressure.
5. **Anatomy invariant:** one precise sentence locking placement and counts for eyes, limbs, strings, tines, bells, discs, keys, or other failure-prone features.
6. **Social response:** celebrate, encourage, and connect poses that answer real events.

If the animal or instrument requires explanatory text, simplify and redraw it.

## Three-format family

| Interpretation | Native output | Priority |
| --- | ---: | --- |
| Habitat resident | 32×32 transparent PNG | Direction, movement, silhouette, one simplified instrument cue |
| Interactive companion | 64×64 transparent PNG | Face, gesture, emotional warmth, animation-ready outline |
| Full-art stickers | Three 768×768 transparent PNGs | Expressive pose, tactile materials, clean die-cut silhouette |

Shared identity rules:

- Preserve animal, integrated instrument, core palette, signature markings, personality, and anatomy invariant in every format.
- Author each format for its job. Never shrink the companion to make the resident or enlarge it to make stickers.
- Keep the full body visible with healthy transparent margins.
- Prefer one unmistakable instrument mechanism over several musical decorations.
- Do not add loose mallets, sticks, notes, sparkles, or secondary instruments to rescue a weak design.
- Use character colors for identity, never to encode UI state or distribute individual Rainbow Heart Logo Spectrum stops.

## Habitat resident

- Purpose-author for 32×32 and inspect at native size.
- Use a compact 24–28-pixel final silhouette with a one-pixel near-black outline.
- Use 16 or fewer opaque colors with clustered highlights and shadows.
- Use hard pixels, integer placement, and nearest-neighbor enlargement.
- Keep the face and one instrument cue legible against a busy habitat.
- A three-quarter right-facing walking pose is the default; other directions are a later motion set.
- No antialiasing, blur, gradient, floor, cast shadow, scenery, frame, label, or UI.

## Interactive companion

- Use carefully clustered medium-resolution pixels and the dark plum-near-black outline established by the accepted cast.
- Allow roughly 6–10 disciplined character tones when dimensional volume or material separation needs them.
- Keep eyes and mouth readable, the pose grounded, and the expression warm rather than babyish or alarmed.
- Preserve enough transparent breathing room for future reaction motion.
- The 64×64 export may be normalized from a larger accepted identity master, but it must still read at native size.
- Do not imply constant bouncing or attention-seeking in the base pose.

## Full-art stickers

- Author full art, not enlarged pixel art.
- Use clean rounded shapes, confident dark-plum ink, subtle painted texture, dimensional shading, glossy readable eyes, and a clean white die-cut outline.
- Keep the accepted core palette dominant; material highlights and restrained secondary tones may support it.
- Use exactly three meanings: celebrate, encourage, connect.
- Keep meaning in pose and expression. Copy and accessibility labels stay outside the image.
- No text, labels, panels, scenery, floor, watermark, extra character, detached instrument, or cropped extremity.
- Keep the three source-sheet poses separated enough for deterministic extraction.

## Anatomy and cuteness checks

Cuteness comes from coherent anatomy, not simply larger eyes.

- Keep head, face, torso, and instrument relationships immediately understandable.
- Use rounded transitions where instrument and animal meet.
- Count eyes, stalks, legs, wings, strings, tines, discs, bells, and tuning pegs in every pose.
- Avoid front-mounted paired circles or chest shapes that accidentally suggest human anatomy.
- Avoid dangling or vertical torso instruments that read as beards, aprons, or loose props.
- Avoid a second ordinary anatomy layer when the instrument replaces it; Plinka's tines are her spines, for example.
- Prefer a single strong silhouette cue over many surface markings.

## Motion and reactions

Motion is a separately approved implementation layer. Plan it only when the character's use requires it.

- Habitat movement uses stepped, pixel-safe NPC motion rather than smooth drifting.
- Companion motion responds after actual student work; it does not prompt practice or demand attention.
- A static reduced-motion state is mandatory.
- Avoid constant idle bounce, blur, rotation between pixel boundaries, urgency, or screen obstruction.
- Additional frames require a demonstrated interaction need.

## Sticker language

- **Celebrate:** joyful recognition of completed work.
- **Encourage:** gentle support without implying failure or telling the student to hurry.
- **Connect:** a wave, high-five, ensemble gesture, or shared belonging.

No sticker compares students, mentions duration or streaks, creates reply pressure, or implies sadness when ignored.

## Character-sheet writing

Use short child-readable blocks:

- one-sentence personality introduction;
- animal and instrument connection;
- musical role and practice virtue;
- one playful fact;
- discovery source, if known.

Avoid violence, capture, ownership pressure, or lore that turns absence into loss. Students meet, befriend, and invite characters into the Zoo.

## Naming

- Two or three spoken syllables when practical.
- Easy for early readers to sound out.
- Suggest the animal, instrument, sound, or personality without copying a known character.
- Stable lowercase ASCII kebab-case ID that never changes after release.

## Legacy Grove

Every existing pet and collection creature is a Founding Friend. Preserve student ownership, name, species, XP, stage, duplicates, merge stage, and dates. New character inventory never replaces an existing record.

## Definition of accepted art

The art package is accepted when it has:

- approved identity, stable ID, animal, instrument, role, virtue, silhouette, invariant, and avoid list;
- accepted companion, habitat, and sticker source versions;
- one readable 64×64 companion and one readable 32×32 resident;
- celebrate, encourage, and connect 768×768 sticker outputs;
- version pins in the accepted library manifest;
- reproducible build, review boards, structural validation, and native-size visual review.

Voice packs, motion frames, egg/icons, progression, and app wiring are separate gates. A polished companion image alone is not an accepted art package, and accepted art alone is not release approval.

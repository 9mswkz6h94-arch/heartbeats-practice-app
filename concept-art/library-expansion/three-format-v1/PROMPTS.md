# Musical Zoo — three-format V1 prompt record

**Cast direction:** Chordillo-aligned V2, accepted 2026-09-07

**Scope:** App-local Musical Zoo artwork

**Generation mode:** Built-in image generation with identity references

Each actual generation prompt combines one character identity block with one format block below. Input 1 is always that character's accepted detailed companion master. The Chordillo companion master instead uses the starter-trio sheet as its source and the dedicated Chordillo prompt.

## Character identity blocks

- **Riffin:** Orange fox with oversized triangular ears, cream muzzle and inner ears, dark paws, a rounded acoustic-guitar resonator naturally forming his belly with exactly three dark strings, and a long orange tail that becomes a wooden guitar neck ending in exactly three tuning pegs. Warm, brave, alert, and kind.
- **Boppo:** Bright spring-green frog with big raised eyes, a joyful wide mouth, compact bent frog legs, small forefeet, and a broad cream hand-drum membrane naturally integrated into the round belly. Rhythm reads without separate sticks or mallets. Steady, cheerful, and persistent.
- **Chordillo:** Purple armadillo with long upright ears, compact legs, curled forepaws, cream claws, and a large segmented shell whose alternating cream and purple bands suggest stacked musical chords. Thoughtful, calm, and friendly; no egg.
- **Ringlet:** Periwinkle rabbit with two tall ears—one tipped forward in a listening gesture—compact feet, tiny forepaws, kind eyes, and a warm cream hand-bell naturally forming the lower torso with one visible clapper. Calm and attentive.
- **Brumbo:** Compact teal elephant with wide rounded ears, no tusks, sturdy little feet, gentle eyes, and a curled trunk that naturally widens into a polished trumpet bell. Quietly proud and carefully controlled; no separate trumpet.
- **Plinka:** Raspberry-pink hedgehog with cream face and belly, tiny dark nose, curious bright eyes, playful half-smile, and one fan of softly rounded metallic kalimba tine-spines growing directly from the back. The graded playable tines form the entire hedgehog silhouette; there is no separate rack or ordinary quill layer. Curious and playful, never sharp or dangerous.
- **Puffino:** Deep-ocean-blue puffin with a cream-and-gold puffin beak, warm eyes, small wings, orange feet, and a compact golden accordion integrated horizontally across the visible rounded torso with symmetrical blue end plates. Expressive and self-assured; no detached, dangling, or beard-like accordion.
- **Cymbi:** Round coral-red ladybug with two short antennae, six tiny dark feet, friendly eyes, and paired golden cymbal discs naturally forming dorsal wing covers on the back, with a center seam and restrained dark spots. Cooperative and thoughtful; no separate or front-mounted cymbals.
- **Spirlo:** Low-profile warm amber snail with exactly one pair of eyes at the tips of two friendly eye stalks, a clean cream face with a patient smile, grounded soft foot, and a French-horn shell built from coiled brass tubing ending in one flared bell facing backward. Calm, patient, and clearly distinct from Chordillo.

## Chordillo companion-master prompt

Use case: identity-preserve / style-transfer. Asset type: medium interactive game companion master. Input 1 is the starter-trio sheet; use only the purple armadillo at right as Chordillo's identity and rendering reference. Create Chordillo alone on a genuinely transparent background. Preserve the long upright ears, compact purple armadillo anatomy, gentle eye, curled forepaws, cream claws, and large segmented shell with alternating cream and purple chord bands. Remove the egg and all other characters. Polished late-1990s color-handheld-game pixel art with carefully clustered medium-resolution pixels, dark plum-near-black stepped outline, rounded volume, 8–10 purple and cream tones, warm highlights, quiet shadows, and a friendly thoughtful expression. Full body, neutral three-quarter pose, centered with generous margin. No scenery, floor, text, frame, UI, watermark, music notes, egg, or extra props. Original design only.

## Habitat-sprite format block

Use case: identity-preserve. Asset type: purpose-authored 32×32 roaming habitat sprite source. Create the same accepted character as one tiny late-1990s color-handheld-game NPC sprite, shown full-body in a simple three-quarter walking pose facing right. Design specifically for reduction to a 32×32 transparent PNG: compact 24–28-pixel final silhouette, crisp one-pixel near-black outline at final size, only 6–8 flat clustered colors, no antialiasing, large readable face marks, and exactly one simplified instrument-anatomy cue. Preserve the animal silhouette and integrated instrument pairing, but intentionally omit small companion-master details that would turn to noise. Centered with generous transparent padding. No floor, shadow, scenery, text, label, frame, UI, watermark, egg, separate instrument, extra character, sparkle, or musical note. Do not merely shrink the companion pose; reinterpret it for tiny habitat movement.

## Sticker-sheet format block

Use case: identity-preserve. Asset type: three-pose full-art collectible sticker sheet. Reinterpret the same accepted character as polished full-art children's character illustration—more tactile and expressive than the pixel companion while unmistakably the same animal/instrument identity and palette. Clean rounded shapes, confident dark-plum ink outline, subtle painted texture, soft dimensional shading, glossy readable eyes, tiny material highlights, and a professional die-cut sticker finish. On one genuinely transparent landscape canvas, place exactly three separate full-body poses in equal left, center, and right columns with no overlap and generous clear space around every figure: left = celebrate, an earned joyful success response; center = encourage, a gentle calm “you can keep going” response without prompting or urgency; right = connect, a friendly open gesture suggesting shared music and belonging. Give each figure its own clean white die-cut outline. Preserve species anatomy and the integrated instrument; change pose and expression only. No text, labels, panels, scenery, floor, frame, UI, watermark, extra character, detached instrument, or franchise imitation. Do not crop any ears, tails, shells, horn bells, feet, or outlines.

## Technical derivation

- Habitat source art is visually inspected, background-cleaned when needed, then reduced onto a native 32×32 transparent canvas and exported as an 8× nearest-neighbor preview.
- Accepted detailed companion masters are normalized onto a native 64×64 transparent canvas and exported as an 8× nearest-neighbor preview.
- Each three-pose sticker sheet is preserved as generated. The build selects the largest connected figure in each expected third, isolates it from neighboring poses, and normalizes it onto a transparent 768×768 sticker canvas with a derived white die-cut outline.
- Generation masters are retained; no existing V1 or V2 artwork is overwritten.

## Targeted recovery notes

- Chordillo's first habitat attempt was blocked by the image service before generation. The successful retry kept the same accepted identity and 32×32-ready walking-sprite contract with shorter wording; it did not change the design.
- Cymbi's first sticker sheet introduced a dark gradient and music notes. It is retained as `cymbi-sticker-sheet-source-v1.png` for provenance but excluded from the build. The accepted `cymbi-sticker-sheet-source-v2.png` retry reiterated: genuine transparency, exactly three separated full-body poses, no floor, no gradient, no scenery, no music notes, no text, and no extra objects.
- The original equal-third sticker split exposed neighboring-pose fragments on wide gestures and shells. Connected-figure isolation replaced that mechanical crop before the final review export.
- The separator was subsequently extended to retain all nearby disconnected components belonging to a pose. This preserves layered instruments, feet, hands, and dorsal wings while the character's column center still excludes neighboring-pose spill.
- The accepted correction prompt set for Puffino, Cymbi, and Spirlo is recorded in `CORRECTION_PROMPTS_V2.md`.
- Plinka's later anatomy correction is recorded in the same file and applies the integrated tine-spine rule to all three formats.

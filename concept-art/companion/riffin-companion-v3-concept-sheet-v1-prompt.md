# Riffin Companion V3 Concept Sheet V1

Generated with the built-in image generator on 2026-09-05.

## Source references

- `../stickers/riffin-sticker-encourage-full-v1.png` — binding reference for Riffin's cute face, round plush proportions, glossy eyes, palette, tiny paws, and guitar-belly identity.
- `../sprites/riffin-64x64-v2.png` — identity reference for the existing medium companion; the blocky pixel treatment was intentionally not carried forward.
- `../stickers/riffin-sticker-celebrate-full-v2.png` — reference for the brighter completion expression.

## Generation prompt

```text
Use case: stylized-concept
Asset type: Companion V3 character-state review sheet for a children's music-practice app
Primary request: Create one polished transparent PNG showing exactly three separate full-body poses of the same fox-guitar character, Riffin, arranged left-to-right at equal scale with generous spacing: (1) neutral/rest, (2) gentle practice response, (3) joyful completion.
Input images: Image 1 is the binding reference for Riffin's cute face, round plush proportions, glossy oversized eyes, orange/cream/brown palette, tiny paws, and guitar-belly identity. Image 2 is identity reference for the existing medium companion only; retain the fox-guitar idea but do not copy its pixel blockiness. Image 3 is a reference for the brighter joyful expression in the completion state.
Scene/backdrop: genuinely transparent background with no card, panel, floor, labels, checkerboard, or scenery.
Subject: one consistent child-safe orange fox whose cream belly is an integrated tiny guitar/ukulele body and whose curled tail ends in the instrument headstock.
Style/medium: cute polished 2D children's app mascot illustration; softer and simpler than full sticker art; clean small-size silhouette; restrained cel shading; animation-ready shapes; readable when rendered only 96–112 px tall.
Composition/framing: wide concept sheet, three isolated full-body poses, left-to-right, nothing cropped, identical character design and equal scale in all three.
Pose 1 — neutral/rest: gentle head tilt, relaxed closed-mouth smile, ears at ease, both paws resting low near the belly strings; receptive and companionable, never prompting.
Pose 2 — gentle practice response: ears perked, small supportive nod or lean, one tiny paw resting over the heart/upper belly and the other relaxed near the strings, kind encouraging smile; no pity or concern.
Pose 3 — joyful completion: happy open smile, a tiny celebratory strum plus a small raised paw or buoyant bounce, tail slightly lifted; joyful but calm, never competitive.
Character invariants: exactly three horizontal belly strings and exactly three tuning pegs on the tail headstock in every pose; very large glossy brown eyes; round head and plump body; tiny paws; orange fur, pale cream muzzle and belly, warm brown paws/nose; face and proportions must remain consistent across all poses.
Outline: use a thin warm-cream outer keyline or soft halo, much lighter and narrower than a die-cut sticker border; clean dark inner linework only where needed.
Constraints: no words, no labels, no speech bubbles, no trophies, no score, no additional characters, no floating musical notes, no props, no watermark, no thick white sticker border, no pixel art, no sad or demanding expression. Preserve a genuinely transparent alpha background.
```

## Transparency correction prompt

The generator returned the review sheet with a checkerboard baked into the image. A second built-in edit requested the following correction, but it also returned an opaque checkerboard:

```text
Use case: background-extraction
Asset type: transparent Companion V3 character-state review sheet
Primary request: Change only the baked gray-and-white checkerboard background into genuine transparent alpha.
Input images: Image 1 is the edit target.
Invariants: Preserve all three Riffin character drawings exactly as shown, including their positions, equal scale, expressions, poses, linework, colors, highlights, thin warm-cream keylines, three belly strings, and three tail tuning pegs. Do not redraw, restyle, resize, crop, move, add, remove, or alter any part of the characters.
Scene/backdrop: fully transparent pixels everywhere outside the three character/keyline silhouettes.
Constraints: no checkerboard pattern, no solid background, no floor, no shadow behind the characters, no text, no labels, no new elements, no watermark. Output must be a PNG with a real alpha channel and clean silhouette edges.
```

The saved project asset uses a deterministic connected-background cleanup to replace only the outer checkerboard with real alpha. The character drawings remain unchanged. This is a review concept, not a production animation asset.

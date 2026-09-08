# Riffin Celebrate full-art V1 generation record

## Tool path

Built-in image generation with approved local Riffin references, followed by one targeted background-extraction edit. No external API or fallback CLI was used.

## Reference images

1. `../sprites/riffin-64x64-v2.png` — approved identity reference
2. `../sprites/riffin-sticker-celebrate-v2.png` — approved tiny Celebrate pose reference
3. `../sprites/riffin-v2-final-review-board.png` — approved sprite-family review board

## Illustration prompt

```text
Use case: stylized-concept
Asset type: large full-art Celebrate sticker master for a children's music-practice app
Input images: Image 1 is the approved Riffin identity reference; Image 2 is the approved tiny pixel Celebrate pose reference; Image 3 is the approved sprite-family review board.
Primary request: Create a polished full-art sticker illustration of Riffin celebrating a completed practice moment. Reinterpret the pixel sprite as cute, expressive illustration art; do not simply upscale or imitate pixel art.
Subject: exactly one friendly coral-orange fox and acoustic-guitar creature. Preserve Riffin's tall fox ears, compact body, rounded acoustic-guitar resonator torso, one dark sound hole, exactly three visible strings crossing the belly, and a tail shaped like a short guitar neck ending in exactly three readable tuning pegs. One paw strums the three belly strings while the other paw lifts in a joyful gesture. Ears raised, bright open smile, energetic but gentle posture. Include exactly three small floating musical notes or sparkle-note marks to communicate celebration.
Style/medium: charming hand-inked children's character illustration with clean rounded shapes, expressive face, confident dark outline, subtle painted shading and highlights, and a professional collectible-sticker finish. More detailed and tactile than the pixel companion while unmistakably the same character.
Composition/framing: centered full-body square cutout, generous breathing room, no cropping, readable at thumbnail size. Add a clean warm-cream die-cut sticker border around the complete character and notes.
Color palette: core identity colors must dominate—outline #201923, dark wood #7A321C, coral orange #E86F21, warm cream #FFD27A. Limited lighter highlights and restrained secondary shading are allowed only to support full-art depth.
Scene/backdrop: genuinely transparent background; no ground plane, scenery, card, panel, shadow rectangle, or colored backdrop.
Text: none.
Constraints: retain the integrated guitar anatomy rather than giving Riffin a separate instrument; exactly three belly strings; exactly three tail tuning pegs; exactly three celebration notes; transparent background; clean anti-aliased edges; child-safe, joyful, non-competitive, no scores or trophies.
Avoid: pixel art, photorealism, realistic fox anatomy, separate guitar prop, extra limbs, extra strings, extra tuning pegs, text, letters, numbers, logos, watermark, confetti clutter, trophy, medal, star rating, leaderboard imagery, weapons, background.
```

## Transparency correction prompt

```text
Use case: background-extraction
Asset type: transparent full-art children's app sticker master
Input image: Image 1 is the edit target.
Primary request: Remove only the pale checkerboard background and replace it with genuine transparent alpha.
Preserve exactly: Riffin's character design, proportions, expression, raised paw, strumming paw, integrated guitar torso, exactly three visible belly strings, exactly three tail tuning pegs, exactly three floating music notes, all colors, shading, highlights, dark outlines, and the complete warm-cream die-cut sticker border around the character and notes.
Constraints: keep the full centered composition with no cropping; retain clean anti-aliased outer edges; output a genuinely transparent PNG with no background pixels and no checkerboard pattern.
Avoid: redrawing, restyling, recoloring, adding or removing objects, changing the pose, losing the cream sticker border, text, logos, watermark, solid background, gradient background, checkerboard background.
```

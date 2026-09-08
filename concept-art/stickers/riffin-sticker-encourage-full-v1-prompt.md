# Riffin Encourage full-art V1 generation record

## Tool path

Built-in image generation with approved local Riffin references, followed by one targeted background-extraction edit. No external API or fallback CLI was used.

## Reference images

1. `riffin-sticker-celebrate-full-v1.png` — approved full-art set-style reference
2. `../sprites/riffin-sticker-encourage-v2.png` — approved tiny Encourage pose reference
3. `../sprites/riffin-64x64-v2.png` — approved Riffin identity reference

## Illustration prompt

```text
Use case: stylized-concept
Asset type: large full-art Encourage sticker master for a children's music-practice app
Input images: Image 1 is the approved full-art Riffin Celebrate sticker and is the binding style, rendering, proportions, outline, palette, eye, and cream-border reference. Image 2 is the approved tiny pixel Encourage pose reference. Image 3 is the approved Riffin identity reference.
Primary request: Create the matching full-art Encourage sticker of Riffin offering calm, gentle support. It must clearly belong to the same collectible sticker set as Image 1 while using a quieter, distinct pose.
Subject: exactly one friendly coral-orange fox and acoustic-guitar creature. Preserve the same tall fox ears, compact rounded body, acoustic-guitar resonator torso, one dark sound hole, exactly three visible strings crossing the belly, and tail shaped like a short guitar neck ending in exactly three readable tuning pegs. Riffin faces forward with a soft reassuring smile and a slight friendly head tilt. One paw reaches forward with an open, welcoming palm; the other rests gently beside the belly strings without strumming. Ears are relaxed and attentive. The pose should visually say “I’m with you—one try at a time” without using words or implying failure.
Style/medium: match Image 1 exactly—charming hand-inked children's character illustration, clean rounded shapes, expressive glossy eyes, confident dark outline, subtle painted shading and highlights, professional collectible-sticker finish, and the same warm-cream die-cut border.
Composition/framing: centered full-body square cutout with generous breathing room, no cropping, readable at thumbnail size.
Color palette: match the approved Celebrate art. Core colors dominate—outline #201923, dark wood #7A321C, coral orange #E86F21, warm cream #FFD27A—with the same restrained highlight and shading treatment as Image 1.
Scene/backdrop: genuinely transparent background; no ground plane, scenery, card, panel, shadow rectangle, or checkerboard.
Text: none.
Constraints: retain the integrated guitar anatomy rather than giving Riffin a separate instrument; exactly three belly strings; exactly three tail tuning pegs; match the approved Celebrate character proportions and finish; transparent background; clean anti-aliased edges; child-safe, warm, patient, shame-free, and non-competitive.
Avoid: raised victory fist, celebratory jumping, floating music notes, confetti, trophy, medal, score, retry arrows, sad face, worried face, pity, pressure, pixel art, photorealism, realistic fox anatomy, separate guitar prop, extra limbs, extra strings, extra tuning pegs, text, letters, numbers, logos, watermark, background.
```

## Transparency correction prompt

```text
Use case: background-extraction
Asset type: transparent full-art children's app sticker master
Input image: Image 1 is the edit target.
Primary request: Remove only the pale checkerboard background and replace it with genuine transparent alpha.
Preserve exactly: Riffin's character design, proportions, gentle expression, open welcoming palm, resting paw, integrated guitar torso, exactly three visible belly strings, exactly three tail tuning pegs, all colors, shading, highlights, dark outlines, and the complete warm-cream die-cut sticker border.
Constraints: keep the full centered composition with no cropping; retain clean anti-aliased outer edges; output a genuinely transparent PNG with no background pixels and no checkerboard pattern.
Avoid: redrawing, restyling, recoloring, adding or removing objects, changing the pose, losing the cream sticker border, text, logos, watermark, solid background, gradient background, checkerboard background.
```

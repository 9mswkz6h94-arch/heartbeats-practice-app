# Riffin Celebrate Full-Art V2 — generation record

Generated with the built-in image generator on 2026-09-05.

## Generation prompt

```text
Use case: stylized-concept
Asset type: large full-art Celebrate sticker candidate for a children's music-practice app
Input images: Image 1 is the newly approved Encourage V1 and is the binding reference for cuteness, face proportions, rounded body, compact paws, rendering, outline, palette, and warm-cream die-cut border. Image 2 is the earlier Celebrate V1 and supplies only the celebration action: strumming, one raised paw, and three music notes. Image 3 is the approved Riffin identity reference.
Primary request: Reimagine Riffin's Celebrate sticker so it is noticeably cuter, rounder, softer, and more toy-like than Image 2, while clearly belonging to the same collectible sticker set as Image 1.
Subject: exactly one friendly coral-orange fox and acoustic-guitar creature. Match Image 1's oversized glossy eyes, large rounded face, plump compact body, tiny rounded paws, short limbs, soft cheeks, and sweet child-safe expression. Riffin gives a delighted open-mouth smile, gently strums the belly strings with one small paw, and lifts the other small paw in a friendly excited wave rather than a victory fist. Preserve tall fox ears, an integrated rounded acoustic-guitar resonator torso, one dark sound hole, exactly three visible strings crossing the belly, and a tail shaped like a short guitar neck ending in exactly three readable tuning pegs. Include exactly three small floating golden music notes, spaced cleanly around the character.
Style/medium: match Image 1 exactly—charming hand-inked children's character illustration, rounded chibi proportions, clean confident dark outline, subtle painted shading and highlights, plush toy-like warmth, professional collectible-sticker finish, and the same warm-cream die-cut border.
Composition/framing: centered full-body square cutout with generous breathing room, no cropping, instantly readable at thumbnail size.
Color palette: match approved Encourage V1; core colors dominate—outline #201923, dark wood #7A321C, coral orange #E86F21, warm cream #FFD27A—with restrained golden highlights.
Scene/backdrop: genuinely transparent background; no ground plane, scenery, card, panel, shadow rectangle, or checkerboard.
Text: none.
Constraints: retain the integrated guitar anatomy rather than giving Riffin a separate instrument; exactly three belly strings; exactly three tail tuning pegs; exactly three music notes; noticeably rounder and cuter than the earlier Celebrate; transparent background; clean anti-aliased edges; warm, joyful, non-competitive, and child-safe.
Avoid: long limbs, large realistic hands, aggressive fist, trophy pose, athletic victory gesture, sharp anatomy, thin body, realistic fox anatomy, separate guitar prop, extra characters, extra limbs, extra strings, extra tuning pegs, more or fewer than three music notes, score, trophy, medal, rank, comparison, pressure, text, letters, numbers, logo, watermark, background.
```

## Background-extraction prompts

```text
Use case: background-extraction
Asset type: transparent full-art children's app sticker candidate
Input image: Image 1 is the exact edit target.
Primary request: Remove only the gray-and-white checkerboard background and replace it with genuine transparent alpha.
Preserve exactly: the complete single Riffin character, round cute proportions, joyful expression, raised waving paw, strumming paw, integrated guitar torso, exactly three belly strings, exactly three tail tuning pegs, exactly three golden music notes, all colors, shading, highlights, dark outlines, and every part of the warm-cream die-cut sticker border around both Riffin and the notes.
Constraints: keep the full centered composition with no cropping; retain clean anti-aliased outer edges; all space outside the connected cream sticker borders must be genuinely transparent.
Avoid: redrawing, restyling, recoloring, adding or removing objects, changing the pose, losing cream borders, stray flecks, halos, detached debris, text, logos, watermark, solid background, gradient background, or checkerboard background.
```

```text
Use case: background-extraction. The gray-and-white checker pattern is a removable background, not transparency and not part of the art. Delete every checkerboard pixel and replace the entire area behind all sticker pieces with true transparent alpha. Keep only four connected sticker cutouts: the complete Riffin cutout and the three cream-bordered music-note cutouts. Preserve those four cutouts exactly with clean cream borders and anti-aliased edges. No checkerboard may remain anywhere. No solid color or scenery. No redrawing, no recoloring, no pose or anatomy changes, no cropping, no stray marks, no text, no watermark.
```

## Saved outputs

- Project master: `riffin-sticker-celebrate-full-v2.png`
- Web derivative: `../../public/characters/riffin/sticker-celebrate-full-512-v2.png`
- The wide master is proportionally fitted onto the square web canvas; it is not stretched.
- Visual review candidate only. Detached extraction flecks require cleanup before canonical approval or print export.

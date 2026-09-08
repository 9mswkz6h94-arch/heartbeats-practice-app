# Musical Zoo production sprites

Grid-locked sprite sources for the late-1990s handheld-color direction.

## Riffin V1

- Companion canvas: 64×64 transparent pixels
- Character canvas: 32×32 transparent pixels
- Egg canvas: 16×16 transparent pixels
- Palette: `#201923`, `#7A321C`, `#E86F21`, `#FFD27A`
- Rendering: hard pixels, no anti-aliasing, integer nearest-neighbor scaling
- Identity cues: guitar sound-hole belly, three strings, tuning-peg tail

The SVG files are editable pixel maps: all geometry is aligned to integer grid coordinates and uses `shape-rendering="crispEdges"`. The PNG files are the production-resolution exports.

The 64×64 companion V1 prioritizes Riffin's curious expression while enlarging the integrated resonator torso, exactly three strings, and three-peg guitar-neck tail for character-sheet readability.

## Riffin V2 final packet

V2 replaces the rectangular companion torso with a clearer acoustic-guitar upper bout, waist, and lower bout while preserving the approved fox head and three-peg neck-tail.

- Production companion: `riffin-64x64-v2.svg` / `.png`
- Idle: `riffin-idle-01-v2` and `riffin-idle-02-v2`
- Sound dance: `riffin-dance-01-v2` and `riffin-dance-02-v2`
- Celebrate: `riffin-celebrate-01-v2` and `riffin-celebrate-02-v2`
- Pixel sticker previews: `riffin-sticker-celebrate-v2`, `riffin-sticker-encourage-v2`, and `riffin-sticker-connect-v2`
- Review board: `riffin-v2-final-review-board.png`

Every companion motion frame is 64×64, transparent, and limited to the approved four opaque colors. The existing 32×32 roaming sprite and 16×16 egg remain the V2 character family's purposeful small-scale assets.

The three 64×64 Riffin sticker files are migration previews, not final sticker masters. Final sticker production follows `character-design/CHARACTER_STYLE_GUIDE.md`: celebrate, encourage, and connect each receive a separate full-art transparent master at 512×512 or larger while preserving Riffin's approved silhouette, integrated guitar cues, and core palette.

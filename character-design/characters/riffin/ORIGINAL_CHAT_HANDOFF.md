# Riffin deep handoff to the originating chat

Date: 2026-08-22

Scope: Musical Zoo character design only. No app integration, migration, commit, push, or deployment was performed. Existing student pets remain Founding Friends in Legacy Grove and no ownership or progress data was touched.

This report intentionally excludes `characters/lyra/`, `characters/tempo/`, `characters/ringlet/`, and non-Riffin sprite files. Those appeared from concurrent chats and must not be treated as cleanup targets for this work.

## Executive summary

The work began by firming up Riffin, the coral-orange fox and acoustic-guitar melody starter representing brave first attempts. It then hardened the repository's character-design packet so a new chat could begin with only the packet and a character idea. Finally, Riffin was re-run through that altered six-gate workflow and a complete V2 visual/voice packet was produced.

Current manifest status is `ready-for-implementation`, but the originating chat should make one explicit acceptance decision after reading the caveats in this report. Technical validation is strong. Several artistic and editorial claims deserve a human review before these files are treated as irreversible canon.

## Locked character identity

- Stable ID: `riffin`
- Animal: fox
- Integrated instrument: acoustic guitar
- Musical role: melody
- Practice virtue: brave first attempts
- Palette: `#201923`, `#7A321C`, `#E86F21`, `#FFD27A`
- Required anatomy: tall fox ears, resonator torso, one dark sound hole, exactly three strings, guitar-neck tail with exactly three tuning pegs
- Stickers: celebrate, encourage, connect—exactly one of each
- Companion language: authored and deterministic; no live AI-generated child-facing text
- Preservation boundary: starters add inventory; Founding Friends never lose ownership, XP, stage, duplicates, merge stage, or dates

## What was created or changed

### Shared cold-start system

- `character-design/README.md`
  - Expanded into an ordered cold-start workflow.
  - Adds required inputs, scope limits, six gates, and a copy-ready prompt.
- `character-design/CHARACTER_STYLE_GUIDE.md`
  - Definition of ready now includes the versioned voice pack.
- `character-design/CHARACTER_INTERACTION_GUIDE.md`
  - Clarifies calculated combination capacity and adds a voice review checklist.
- `character-design/palettes/handheld-color-v1.json`
  - Adds transparency, SVG source, PNG production, and nearest-neighbor metadata.
- `character-design/schema/character-manifest.schema.json`
  - Strengthened palette, asset, animation, sticker, accessibility, interaction, legacy, and status structure.
- `character-design/schema/voice-pack.schema.json`
  - New Draft 2020-12 structural schema for authored voice packs.
- `character-design/characters/_template/CHARACTER.md`
  - Expanded identity, visual, motion, voice, accessibility, and gate fields.
- `character-design/characters/_template/manifest.json`
  - Adds interaction metadata.
- `character-design/characters/_template/voice-pack-v1.json`
  - New starter voice-pack template.

### Riffin character packet

- `character-design/characters/riffin/CHARACTER.md`
  - Complete character sheet and current status.
- `character-design/characters/riffin/manifest.json`
  - Character version 2; points to production V2 assets and voice pack V2.
- `character-design/characters/riffin/voice-pack-v1.json`
  - Preserved original 11-intent pack with 106 calculated combinations.
- `character-design/characters/riffin/voice-pack-v2.json`
  - Adds all 23 catalog intents with 175 calculated combinations.
- `character-design/characters/riffin/GATE_REVIEW.md`
  - Six-gate audit and readiness rationale.
- `character-design/characters/riffin/ORIGINAL_CHAT_HANDOFF.md`
  - This report.

### Production visual assets referenced by the manifest

- Companion source/export:
  - `concept-art/sprites/riffin-64x64-v2.svg`
  - `concept-art/sprites/riffin-64x64-v2.png`
- Roaming source/export:
  - `concept-art/sprites/riffin-32x32-v1.svg`
  - `concept-art/sprites/riffin-32x32-v1.png`
- Egg source/export:
  - `concept-art/sprites/riffin-egg-16x16-v1.svg`
  - `concept-art/sprites/riffin-egg-16x16-v1.png`
- Idle:
  - `concept-art/sprites/riffin-idle-01-v2.svg` / `.png`
  - `concept-art/sprites/riffin-idle-02-v2.svg` / `.png`
- Sound dance:
  - `concept-art/sprites/riffin-dance-01-v2.svg` / `.png`
  - `concept-art/sprites/riffin-dance-02-v2.svg` / `.png`
- Celebrate:
  - `concept-art/sprites/riffin-celebrate-01-v2.svg` / `.png`
  - `concept-art/sprites/riffin-celebrate-02-v2.svg` / `.png`
- Stickers:
  - `concept-art/sprites/riffin-sticker-celebrate-v2.svg` / `.png`
  - `concept-art/sprites/riffin-sticker-encourage-v2.svg` / `.png`
  - `concept-art/sprites/riffin-sticker-connect-v2.svg` / `.png`

### Review-only and historical files not referenced by the manifest

- V1 companion history:
  - `concept-art/sprites/riffin-64x64-v1.svg`
  - `concept-art/sprites/riffin-64x64-v1.png`
  - `concept-art/sprites/riffin-64x64-v1-preview-8x.png`
- V2 candidate history:
  - `concept-art/sprites/riffin-64x64-v2-candidate.svg`
  - `concept-art/sprites/riffin-64x64-v2-candidate.png`
  - `concept-art/sprites/riffin-64x64-v2-candidate-preview-8x.png`
- Review board:
  - `concept-art/sprites/riffin-v2-final-review-board.png`
- Per-asset 8× previews:
  - Every V2 companion, animation, and sticker family has a sibling `-preview-8x.png`.
- Existing small-sprite previews:
  - `riffin-32x32-v1-preview-8x.png`
  - `riffin-egg-16x16-v1-preview-8x.png`
- Generator:
  - `character-design/tools/build-riffin-final-assets.js`
- Sprite documentation:
  - `concept-art/sprites/README.md`

### External generated concept not used by the repository

An early built-in image-generation exploration was saved outside the project at:

`C:\Users\John\.codex\generated_images\01a02ae5-3eae-7361-b660-3d7712cda609\exec-364280fb-1290-4d29-a7e2-4a482148bc5a.png`

It introduced gradients, color drift, excessive hardware, and non-production resolution. It was used only as a visual thought starter and is not referenced anywhere in the manifest or project. It is safe to remove independently if no other task needs it.

## What the process ran up against

### 1. Generative raster output was a poor production fit

The first generated concept looked appealing but violated the four-color and hard-pixel constraints. It used shading, gradients, too much guitar hardware, and a large freeform raster canvas. The better production method was deterministic SVG geometry followed by exact PNG export.

Recommendation: use generative imagery only for broad silhouette exploration. Once a direction exists, switch to a grid-native editor or deterministic sprite tool immediately.

### 2. The first deterministic 64×64 sprite passed technical checks but failed the stronger art gate

V1 was a clean fox with a visible sound hole, strings, and peg tail. Under the new cold-start workflow, its torso read too rectangular—closer to a keyboard/lyre panel than a rounded acoustic-guitar resonator. V2 added a visible upper bout, waist, and lower bout.

Recommendation: make “instrument anatomy reads without text at native size” a human gate, not merely a checklist item.

### 3. The first PNG export accidentally became 85×85

Sharp was initially called with SVG density 96. A 64-unit SVG then rasterized to 85×85. The size validator caught it, and the files were regenerated without the density override at exactly 64×64.

Recommendation: the permanent export command should set explicit output dimensions or verify them immediately. Never infer production dimensions from density.

### 4. Tail margin and string readability needed a second visual pass

The initial V2 candidate crowded the right edge, and one-pixel light strings visually inverted into broad dark bars at enlarged scale. The tail was shifted left and the three strings were widened to two pixels each while retaining exactly three visible strings.

Recommendation: review at native size and enlarged size. Enlarged review alone can misrepresent cluster priority.

### 5. The repository does not yet have a self-contained asset pipeline

`build-riffin-final-assets.js` writes the V2 SVG family, but PNG rendering and preview generation were performed through ad hoc Sharp commands using the Codex bundled runtime. Sharp is not a declared project dependency, and the generator currently reads `riffin-64x64-v2-candidate.svg`, not the production V2 source.

Recommendation: either remove this generator after accepting the assets, or replace it with a repository-supported build/validate command that:

1. reads the canonical production source;
2. writes SVG and PNG outputs deterministically;
3. verifies canvas size, alpha, palette, file paths, and counts;
4. refuses to overwrite approved assets without a version bump.

### 6. Draft 2020-12 schema validation was not available in the installed repository AJV

The repository's AJV is 6.15.0 and did not reliably validate the Draft 2020-12 `$defs` schemas. Direct structural checks were run instead. The schema documents are valid JSON and declare Draft 2020-12, but no modern schema validator was installed as part of this work.

Recommendation: add a modern Draft 2020-12 validator in the future, preferably as a separate character-design validation tool rather than expanding app dependencies casually.

### 7. Schema validation cannot enforce the full semantic contract

The voice schema restricts intent names and basic structure, but it does not cross-reference each intent's allowed variables. It also cannot prove that every expanded sentence is natural, shame-free, or under the preferred word count. The manifest's `implementedIntentCount` and `reviewedCombinationCount` are stored values that require a cross-file validator.

Recommendation: build one validator that loads the catalog, pack, manifest, and assets together. A schema alone is insufficient.

### 8. “175 reviewed combinations” needs a stricter interpretation

The 175 figure was calculated exactly from templates and atom pools, and the authored fragments were reviewed while writing. However, an exported list of all 175 expanded strings was not saved and individually signed off line by line. Some micro combinations exceed the “ideally under eight words” guidance.

Recommendation: before production, expand all 175 strings to a review artifact, flag word counts and forbidden language, and have a human approve or edit every result. Until that occurs, the originating chat may choose to rename the field or downgrade the manifest status from `ready-for-implementation` to `design-approved-assets-in-progress`.

### 9. The animations meet the frame budget but are deliberately minimal

- Idle frame 2 changes ear highlights by one pixel.
- Dance frames translate the sprite vertically by one pixel rather than independently animating only the torso and tail pegs.
- Celebrate frames add three bright music clusters; they do not strongly lift both paws as the written plan originally suggested.

These are valid low-budget frames, but they are not sophisticated character animation.

Recommendation: preview them in a timed nearest-neighbor loop before accepting. If the motion feels like a generic bounce, revise the SVG clusters while retaining two frames.

### 10. Sticker differences are readable but subtle

The celebrate sticker adds music pixels; encourage adds a paw-forward gesture; connect adds a higher open-paw gesture. They share most of the base pose. This is production-efficient but may not create three sufficiently distinct emotional silhouettes at notification size.

Recommendation: test the stickers without labels at actual phone size. If children cannot identify their function, revise the silhouettes before implementation.

### 11. Concurrent chats were actively modifying the same untracked design tree and project note

Other characters and assets appeared during this work. The project note's `nextAction` also changed concurrently. The newer action was preserved, and dashboard sync was rerun rather than overwriting it.

Recommendation: commit or isolate character packets per task/worktree once Jonathan approves the direction. Until then, cleanup must target exact files, never entire `character-design/` or `concept-art/` directories.

### 12. Windows/PowerShell details caused avoidable friction

- The dashboard sync initially failed because the Windows console used CP1252 and could not print emoji; rerunning with `PYTHONUTF8=1` fixed it.
- PowerShell expanded `$schema` inside double-quoted inline commands, causing malformed scripts.
- The generated project dashboard JSON uses a top-level object with a `projects` array, not a root array.

Recommendation: use checked-in scripts with explicit UTF-8 handling rather than long inline shell commands.

## Validation evidence completed

- Final companion, six animation frames, and three stickers are exactly 64×64.
- Every final 64×64 PNG contains transparency.
- Every final 64×64 PNG uses exactly these four opaque colors:
  - `(32, 25, 35, 255)` / `#201923`
  - `(122, 50, 28, 255)` / `#7A321C`
  - `(232, 111, 33, 255)` / `#E86F21`
  - `(255, 210, 122, 255)` / `#FFD27A`
- All manifest PNG paths resolved at validation time.
- Animation arrays contain exactly two paths each.
- Sticker keys are exactly `celebrate`, `encourage`, and `connect`.
- Voice V2 contains all 23 catalog intent keys.
- Calculated Voice V2 capacity is exactly 175 combinations.
- Voice V1 remains at 11 intents and 106 combinations.
- No app files were intentionally edited by this Riffin task.
- No database or student-progress operations were performed.

## Recommended acceptance sequence for the originating chat

1. Open `riffin-v2-final-review-board.png` and inspect the companion/stickers at phone scale, not only enlarged.
2. Play the two-frame animations in a nearest-neighbor loop and decide whether the minimal motion feels character-specific enough.
3. Compare the 64×64 companion with the 32×32 roaming sprite at 1× and 4× for family resemblance.
4. Expand all 175 Voice V2 strings and conduct an explicit editorial review.
5. Decide whether `ready-for-implementation` is justified or should be temporarily downgraded.
6. Decide whether to retain V1/candidate history and per-file previews.
7. Replace or remove the one-off generator before treating this as a maintainable production pipeline.
8. Only after those decisions, begin app integration in a separate explicitly authorized phase.

## Safe cleanup matrix

Do not delete anything merely because it is untracked. Other chats own nearby files.

### Safe to remove if only production assets are desired

These are not referenced by the current manifest:

- `concept-art/sprites/riffin-64x64-v1.svg`
- `concept-art/sprites/riffin-64x64-v1.png`
- `concept-art/sprites/riffin-64x64-v1-preview-8x.png`
- `concept-art/sprites/riffin-64x64-v2-candidate.svg`
- `concept-art/sprites/riffin-64x64-v2-candidate.png`
- `concept-art/sprites/riffin-64x64-v2-candidate-preview-8x.png`
- `concept-art/sprites/riffin-v2-final-review-board.png`
- Any Riffin `-preview-8x.png` after visual approval
- The external generated concept in `.codex/generated_images/...`

Important: `build-riffin-final-assets.js` currently depends on the V2 candidate SVG. If the candidate is deleted, remove or rewrite the generator too.

### Remove only if replacing the generation approach

- `character-design/tools/build-riffin-final-assets.js`

It is not required at runtime and is not referenced by the manifest. Keep it only if its limitations are fixed.

### Remove only if abandoning voice-pack history

- `character-design/characters/riffin/voice-pack-v1.json`

Voice V2 does not depend on V1. Keeping V1 is useful for provenance but not runtime operation.

### Do not remove without updating the manifest first

- `riffin-64x64-v2.png`
- `riffin-32x32-v1.png`
- `riffin-egg-16x16-v1.png`
- Both idle PNGs
- Both dance PNGs
- Both celebrate PNGs
- All three sticker PNGs
- `voice-pack-v2.json`

If any of these are replaced, update `manifest.json`, bump `characterVersion`, validate all paths, and retain or deliberately archive the old version.

### Shared files require broader coordination

Do not remove or casually revert the shared README, guides, templates, schemas, palette, or intent catalog. Concurrent character packets may already depend on them. Review their consumers first.

## Suggested cleanup procedure

The originating chat should not run a broad recursive delete. Instead:

1. Re-read `manifest.json` and collect every referenced path.
2. Confirm no other manifest references a proposed deletion target.
3. Review `git status --short` and identify concurrent character work.
4. Delete only explicit exact paths approved by Jonathan.
5. Re-run manifest, path, palette, size, voice-capacity, and dashboard integrity checks.
6. Report what was removed and whether it remains recoverable from Git or another copy.

Because the current character tree is untracked, deletion may be unrecoverable unless the files are copied or committed first. Archive or commit approved work before cleanup if recovery matters.

## Bottom-line recommendation

Keep the design packet, production SVG/PNG family, manifest, and Voice V2. Treat the review previews, V1 companion, V2 candidate, external generated concept, and one-off generator as cleanup candidates. Before implementation, conduct a timed animation review and an exported 175-line voice review. Those two steps are the largest remaining confidence gaps.

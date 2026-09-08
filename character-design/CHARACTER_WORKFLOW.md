# Musical Zoo character workflow

Status: **accepted app-local production workflow**

Owner: Jonathan

Last updated: 2026-09-07

This is the operational path from a loose creature idea to an accepted Musical Zoo art package. It records the workflow proven by Riffin, Boppo, Chordillo, Ringlet, Brumbo, Plinka, Puffino, Cymbi, and Spirlo.

It does not define the canonical Rainbow Heart illustration language. It does not authorize app registry changes, progression, student-data changes, migrations, push, or deployment.

## The character contract

Every character is one identity expressed three different ways:

1. **Habitat resident:** a purpose-authored 32×32 color-handheld NPC sprite for the Zoo world.
2. **Interactive companion:** a warm, expressive 64×64 pixel character that responds after student work.
3. **Full-art stickers:** three 768×768 transparent illustrations for celebrate, encourage, and connect.

Never mechanically resize one interpretation to create another. The animal, integrated instrument, core palette, signature markings, personality, and anatomy invariant remain the same; pose, detail, rendering, and silhouette emphasis change for the job.

## Status model

Use one of these gates and do not skip silently:

| Status | Meaning | Human decision required to advance |
| --- | --- | --- |
| `idea` | A possibility in the vault | Promote into an identity brief |
| `identity-review` | Name, role, virtue, anatomy, silhouette, and avoid list are drafted | Accept the identity and anatomy invariant |
| `companion-review` | Medium identity master exists | Accept the face, anatomy, instrument fusion, and family fit |
| `three-format-review` | Purpose-authored habitat and sticker sources exist | Accept all formats at native/review size |
| `accepted-art-package` | Accepted source versions are pinned and deterministic outputs validate | Separately authorize app integration |
| `ready-for-implementation` | Art, accessibility copy, motion plan, and authored response pack are complete | Separately authorize registry/progression work |
| `integrated` | Approved assets are wired in an isolated app review | Separately authorize release |

The current nine-character library is at `accepted-art-package`. Motion frames, eggs, voice packs, and app wiring remain optional later gates rather than hidden prerequisites for accepting the three-format art.

## Stage 0 — intake and distinctness

Start with:

- stable lowercase ASCII kebab-case ID and easy-to-say name;
- animal and exactly one instrument fused into its anatomy;
- one musical role and one practice virtue;
- one-sentence personality promise;
- three to five silhouette cues;
- one precise anatomy invariant;
- a concrete avoid list describing the most likely anatomical failures;
- a core palette that belongs to the character without assigning Rainbow Heart Logo Spectrum colors to categories or states.

Compare the idea with the accepted library manifest at `concept-art/library-expansion/three-format-v1/character-library.manifest.json`. A new character must add a meaningfully different silhouette, musical role, virtue, or social energy—not merely recolor an existing friend.

Use the scaffolder after the identity is coherent:

```powershell
npm run zoo:new-character -- --id new-id --name "New Name" --animal animal --instrument "integrated instrument" --role role --virtue virtue
```

The command refuses to overwrite files. Use `--dry-run` first when testing a new brief.

## Stage 1 — identity and anatomy lock

Complete `character-design/characters/<id>/CHARACTER.md` before polishing art.

The animal and instrument must read as one body. Define:

- where the instrument begins and ends anatomically;
- the number and location of eyes, limbs, strings, tines, bells, plates, keys, or other countable features;
- what must remain visible from the front, side, and three-quarter views;
- the single strongest silhouette cue;
- what the character must never resemble.

Use Chordillo as the app-local finish and warmth anchor, then use the closest accepted animal/instrument packet as a structural reference. Do not copy franchise characters or promote this app-local treatment into Rainbow Heart OS.

## Stage 2 — companion master

Create the companion identity master first. The master may be larger than the native export, but it must be designed for a crisp 64×64 result.

Review the master for:

- face and species readability;
- one integrated instrument, never a carried costume prop;
- correct counts and placements for all anatomy called out in the invariant;
- rounded, child-safe forms;
- neutral warmth rather than alarm, neediness, or pressure;
- a centered complete body with generous transparent margin;
- a silhouette distinct from the existing cast.

Keep every source attempt. Save corrections as `-v2`, `-v3`, and so on. Never overwrite an earlier master.

Stop at `companion-review` until the identity is accepted.

## Stage 3 — purpose-author the other formats

### Habitat resident

Redraw the character as a tiny three-quarter NPC, usually facing right. Preserve one dominant animal cue and one simplified instrument cue. Use compact clustered pixels, a one-pixel outline at native size, 16 or fewer opaque colors, and enough transparent margin to move cleanly through a busy habitat.

Do not shrink the companion master. Remove detail before it becomes noise.

### Sticker trio

Create one source sheet with exactly three separated full-body poses:

- **Celebrate:** earned joy after completed work.
- **Encourage:** calm support after effort or a difficult moment; no urgency or failure implication.
- **Connect:** a wave, high-five, shared-music gesture, or belonging moment.

Each pose must preserve the anatomy invariant and integrated instrument. Use clean rounded full-art rendering, transparent background, generous separation, no text, no scenery, no neighboring-character fragments, and no cropped extremities.

## Stage 4 — deterministic derivation

Add a character to the accepted library manifest only after all three source families pass human review. Pin the exact accepted source versions:

```json
"acceptedSources": {
  "companionMaster": 2,
  "habitatSource": 1,
  "stickerSheetSource": 3
}
```

The build uses only those versions. A newer experimental source can coexist without changing accepted outputs.

Run:

```powershell
npm run zoo:build-art
```

That command:

1. normalizes companion and habitat sources;
2. creates nearest-neighbor review previews;
3. removes the sticker-sheet background;
4. isolates the main pose plus nearby belonging components in each column;
5. adds a white die-cut outline and creates three 768×768 sticker files;
6. regenerates native and sticker review boards;
7. validates the complete accepted package.

Use `npm run zoo:validate-art` for a read-only validation pass.

## Stage 5 — native-size and board review

Review both boards and the individual native files. Automated checks cannot decide whether anatomy is cute, legible, or accidentally suggestive.

For every character, verify:

- species and instrument read without a label;
- the anatomy invariant holds in every format and pose;
- no duplicate eyes, limbs, instruments, or countable features appeared;
- no source pose, neighboring pose, floor, caption, or background leaked into a sticker;
- the habitat sprite reads at 32×32, not only at 8×;
- the companion reads at 64×64 and keeps transparent corners;
- celebrate, encourage, and connect feel different without creating pressure;
- the cast still feels related while silhouettes remain distinct.

Mark each character `accept`, `revise`, or `hold`. A correction creates a new source version; it never edits the pinned file in place. Rebuild, re-review, and only then update the accepted version pin.

## Stage 6 — optional interaction readiness

The art package can be accepted without implementing motion or dialogue. When interaction work is separately requested:

- author response-only companion copy; do not prompt a child to begin, return, preserve a streak, or reply;
- trigger visible reactions only from real student actions or completed system events;
- keep text deterministic and reviewed—no live child-facing generation;
- supply `full`, `reduced`, and `animation-only` behavior;
- define a static reduced-motion state;
- use stepped pixel-safe motion and avoid constant idle bouncing;
- add egg/icon art only if a specific discovery or collection interface needs it.

Update the character manifest, accessibility labels, and authored voice pack before marking `ready-for-implementation`.

## Stage 7 — integration and release boundary

Art acceptance is not integration approval. A separate implementation task must explicitly authorize any change to:

- `src/lib/characterRegistry.js` or other application source;
- character ownership, unlock, calendar-arrival, or progression rules;
- existing Founding Friend records or student preferences;
- Supabase schema, RLS, migrations, or production data;
- push, merge, or deployment.

Integration begins in `mock-isolated` review. It must pass responsive, keyboard, focus, reduced-motion, text-zoom, broken-image, and data-boundary checks before any release discussion.

## Failure recovery

- If anatomy is wrong, correct the identity master first, then purpose-author matching habitat and sticker sources.
- If one format alone is wrong, correct only that source family and pin its new accepted version.
- If sticker extraction drops a legitimate disconnected component, adjust the deterministic extractor only after confirming the component belongs to the pose.
- If artwork requires explanatory text to read, simplify the silhouette instead of adding labels.
- If a character duplicates an existing role or silhouette, return to `identity-review` rather than polishing it further.
- If authorization is unclear, stop at the current gate and report the exact next decision.

## Definition of complete

A character creation task is complete at the art-package gate when:

- the identity brief and anatomy invariant are accepted;
- companion, habitat, and all three sticker sources are accepted and versioned;
- accepted versions are pinned in the library manifest;
- all derived outputs and both review boards build reproducibly;
- structural validation passes;
- native-size visual review passes;
- the handoff states unresolved motion, voice, integration, progression, and release gates explicitly.

The workflow is complete when it produces a trustworthy accepted package and an honest boundary—not when every possible future feature is silently bundled into character art.

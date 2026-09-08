# Musical Zoo character workflow — return packet

Recommendation: **accept the app-local character-art workflow as complete**.

## What changed

- Reconciled the older strict four-color/egg-first notes with the accepted Chordillo-aligned three-format system.
- Defined the complete status model from idea through accepted art, optional interaction readiness, integration, and release.
- Locked three purpose-authored interpretations: 32×32 habitat resident, 64×64 interactive companion, and three 768×768 full-art stickers.
- Added a precise anatomy invariant and avoid list for every accepted character.
- Added a central accepted library manifest with exact source-version pins.
- Replaced “pick the newest source” behavior with explicit accepted-version selection.
- Made native assets, stickers, review boards, and validation one repeatable build command.
- Added a safe no-overwrite scaffolder for future character packets.
- Clarified that companions respond to actual student work and do not prompt practice.

## Current accepted cast

Riffin, Boppo, Chordillo, Ringlet, Brumbo, Plinka, Puffino, Cymbi, and Spirlo are accepted at the isolated art-package gate. Puffino, Cymbi, Spirlo, and Plinka use their corrected pinned source versions.

## Primary files

- `character-design/CHARACTER_WORKFLOW.md`
- `character-design/CHARACTER_STYLE_GUIDE.md`
- `character-design/CHARACTER_INTERACTION_GUIDE.md`
- `character-design/CHARACTER_TASK_HANDOFF.md`
- `character-design/characters/_template/CHARACTER.md`
- `character-design/schema/character-art-library.schema.json`
- `concept-art/library-expansion/three-format-v1/character-library.manifest.json`
- `concept-art/library-expansion/three-format-v1/library-config.cjs`
- `concept-art/library-expansion/three-format-v1/scaffold-character.cjs`
- `concept-art/library-expansion/three-format-v1/build-all.cjs`
- the refactored native, sticker, board, and validation scripts in the same folder
- `package.json` scripts `zoo:new-character`, `zoo:build-art`, and `zoo:validate-art`

## Verification

`npm run zoo:build-art` rebuilt and validated the complete package: nine habitat residents, nine companions, twenty-seven stickers, and two review boards. `npm run zoo:new-character -- ... --dry-run` verified the five-file no-overwrite scaffold plan without changing the workspace.

The current report is in `VALIDATION_REPORT.md`.

## Unresolved gates

- App registry wiring and public asset placement.
- Habitat direction/walk-cycle frames.
- Companion reaction animation frames and reduced-motion behavior.
- Optional egg/icon art tied to a named collection interface.
- Complete authored response packs and accessibility copy for characters beyond Riffin.
- Unlock, calendar-arrival, progression, and Founding Friend reconciliation in code.
- Mock-isolated responsive, keyboard, zoom, and reduced-motion app review after integration.
- Push, migration, and deployment.

None of those gates is silently authorized by accepting this workflow.

## Next action

Use `$musical-zoo-character-creator` for the next new character or revision. If the next goal is to place these nine accepted art packages into the app, begin a separately authorized registry-and-mock-review slice.

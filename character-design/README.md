# Musical Zoo character design

This folder is the cold-start authority for designing a Musical Zoo character. The current app-local cast has nine accepted three-format art packages: Riffin, Boppo, Chordillo, Ringlet, Brumbo, Plinka, Puffino, Cymbi, and Spirlo.

The workflow is app-local. Rainbow Heart OS still leaves the shared illustration language open, and art acceptance does not authorize app integration, progression, data changes, push, or deployment.

## Read first

1. `STARTER_TRIO.md` for locked starter identities and legacy-draft reconciliation.
2. `CHARACTER_WORKFLOW.md` for the complete gate-by-gate production path.
3. `CHARACTER_STYLE_GUIDE.md` for the accepted Chordillo-aligned three-format direction.
4. `CHARACTER_INTERACTION_GUIDE.md` if motion, reactions, accessibility copy, or voice are in scope.
5. `CHARACTER_TASK_HANDOFF.md` when character work is delegated or returned to the app task.
6. `concept-art/library-expansion/three-format-v1/character-library.manifest.json` for accepted character identities and exact source-version pins.
7. `concept-art/library-expansion/three-format-v1/PROMPTS.md` and `CORRECTION_PROMPTS_V2.md` for the proven image-generation contracts.
8. The complete packet and source folder for the closest accepted character.

Do not make design decisions after reading only one file. Identity, anatomy, three visual interpretations, response behavior, provenance, and validation are one system.

## Three visual interpretations

- **32×32 habitat resident:** a purpose-authored color-handheld NPC sprite.
- **64×64 companion:** a cute, expressive, animation-ready response character.
- **768×768 stickers:** separate full-art celebrate, encourage, and connect poses.

These are three interpretations of one identity, never one asset resized three ways. An egg/icon is optional and is created only when a real discovery or collection interface requires it.

## Start a new character

Firm up the stable ID, name, animal, integrated instrument, musical role, practice virtue, silhouette anchor, anatomy invariant, and avoid list. Then run a no-write preview:

```powershell
npm run zoo:new-character -- --id new-id --name "New Name" --animal animal --instrument "integrated instrument" --role role --virtue virtue --dry-run
```

Remove `--dry-run` to create the design packet and source workspace. The command refuses to overwrite existing files.

Use the installed `$musical-zoo-character-creator` skill for guided creation or revision.

## Rebuild and validate the accepted library

```powershell
npm run zoo:build-art
npm run zoo:validate-art
```

The build uses only source versions explicitly pinned in the accepted library manifest. A newly generated V2 or V3 remains an experiment until human review changes that pin.

## Completion states

- `accepted-art-package` means identity, companion, habitat resident, and sticker trio are approved, pinned, rebuilt, and validated.
- `ready-for-implementation` additionally requires the requested motion plan, accessibility copy, and deterministic response pack.
- `integrated` requires separate authorization and mock-isolated app review.

The current nine-character library is at `accepted-art-package`. It is intentionally not wired into the application registry yet.

## Preservation rule

Existing student pets are Founding Friends in Legacy Grove. Never overwrite, consume, replace, reset, downgrade, or detach their ownership or progress. A starter or character selection only adds inventory.

# Musical Zoo accepted character library

Status: **accepted app-local three-format art package**

The cast contains nine characters: Riffin, Boppo, Chordillo, Ringlet, Brumbo, Plinka, Puffino, Cymbi, and Spirlo. Each has:

- one purpose-authored 32×32 habitat resident;
- one normalized 64×64 interactive companion;
- three 768×768 full-art stickers: celebrate, encourage, and connect;
- preserved versioned source masters;
- explicit anatomy and accepted-source pins;
- native and sticker review-board evidence.

The six packets under `characters/` and `catalog.json` preserve the historical companion-proposal stage. They remain useful provenance, but the current accepted state is governed by:

- `../CHARACTER_WORKFLOW.md`
- `../CHARACTER_STYLE_GUIDE.md`
- `CHORDILLO_ALIGNMENT_V2.md`
- `../../concept-art/library-expansion/three-format-v1/character-library.manifest.json`
- `../../concept-art/library-expansion/three-format-v1/PROMPTS.md`
- `../../concept-art/library-expansion/three-format-v1/CORRECTION_PROMPTS_V2.md`

## Review artifacts

- `../../concept-art/library-expansion/three-format-v1/musical-zoo-native-sprite-review-v1.png`
- `../../concept-art/library-expansion/three-format-v1/musical-zoo-sticker-review-v1.png`

## Rebuild and validate

From the app root:

```powershell
npm run zoo:build-art
npm run zoo:validate-art
```

The build reads exact accepted source versions from the manifest. It never promotes the newest experimental source automatically.

## Boundary

This is an art package, not an application release. It changes no character registry, unlock logic, progression, student record, migration, production data, push, or deployment. The shared Rainbow Heart illustration language remains open.

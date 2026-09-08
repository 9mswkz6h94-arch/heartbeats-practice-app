# Musical Zoo character workflow — validation report

Date: 2026-09-07

Scope: app-local character-art workflow and accepted nine-character package

## Commands run

```powershell
npm run zoo:build-art
npm run zoo:new-character -- --id test-bird --name "Test Bird" --animal bird --instrument "flute tail" --role breathing --virtue calm-focus --dry-run
```

The build uses project Sharp when installed and otherwise reads the bundled Codex Desktop Sharp runtime. It does not install or change dependencies.

## Passed structural checks

- Passed Draft 2020-12 schema validation for `character-art-library.schema.json` and the accepted library manifest.
- Parsed the central accepted library manifest.
- Confirmed app-local scope and confirmed that the manifest claims neither canonical Rainbow Heart illustration status nor app-integration approval.
- Confirmed all nine stable IDs, names, musical roles, and practice virtues are unique.
- Confirmed every anatomy invariant, silhouette anchor, avoid list, and positive accepted source version exists.
- Confirmed every exact pinned companion, habitat, and sticker source exists and is a PNG.
- Confirmed sticker roles are exactly `celebrate`, `encourage`, and `connect`.
- Refused implicit newest-version selection; only explicit accepted source pins drive the build.

## Passed asset checks

- Nine 32×32 habitat residents: PNG, alpha, visible artwork, transparent canvas/corners, unique hashes, and no more than 16 opaque RGBA colors.
- Nine 256×256 nearest-neighbor habitat previews: PNG, alpha, transparent corners, and unique hashes.
- Nine 64×64 companions: PNG, alpha, visible artwork, transparent canvas/corners, and unique hashes.
- Nine 512×512 nearest-neighbor companion previews: PNG, alpha, transparent corners, and unique hashes.
- Twenty-seven 768×768 sticker outputs: PNG, alpha, visible artwork, transparent canvas/corners, and unique hashes.
- Nine cleaned sticker sheets retain alpha.
- Native and sticker review boards regenerated at the manifest-derived dimensions.

## Passed workflow checks

- One command rebuilt native outputs, sticker outputs, review boards, and validation in order.
- The future-character scaffolder completed a dry run for a valid kebab-case ID.
- The scaffolder reported the character sheet, manifest, voice pack, gate review, and art source-notes paths it would create.
- No test character files were written during the dry run.
- All target files are preflighted before the first write, preventing a partial scaffold when any destination already exists.
- A duplicate dry run for accepted character `riffin` was rejected before any write.

## Human visual evidence retained

- The accepted native and sticker boards remain in `concept-art/library-expansion/three-format-v1/`.
- Re-opened both regenerated boards at original resolution; character labels remain contained and the manifest-driven layout introduced no visible overlap, clipping, or missing art.
- Puffino's horizontal torso accordion, Cymbi's dorsal cymbal wing covers, Spirlo's single stalk-tip eye pair, and Plinka's integrated tine-spines are recorded as pinned anatomy corrections.
- Earlier source versions remain preserved for provenance.

## Intentionally not run

- Application tests or browser review: no runtime component or registry consumes this art package yet.
- Motion, voice-pack, egg/icon, progression, or accessibility validation beyond the documented gates: those are separate future scopes.
- Supabase, production, push, merge, or deployment work.

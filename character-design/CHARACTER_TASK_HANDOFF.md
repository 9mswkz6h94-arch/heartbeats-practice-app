# Character task handoff contract

Use this contract when a character is created or revised in a separate task. It keeps creative work independent while returning predictable, reviewable evidence to the Heart Beats Practice App.

## Authority boundary

A character task may refine the assigned identity. It may not:

- rename a locked starter or change its stable ID, animal, instrument, role, virtue, or starter slot;
- change another accepted character's source-version pins;
- add a character to the accepted library before human three-format review;
- alter the canonical Rainbow Heart illustration language;
- edit app source, registry, progression, student records, migrations, production, push, or deployment;
- overwrite or delete earlier source versions;
- alter or remove Founding Friend ownership or progress.

If the brief conflicts with `STARTER_TRIO.md`, `CHARACTER_WORKFLOW.md`, or the accepted library manifest, stop and report the conflict.

## Required working packet

```text
character-design/characters/<id>/
  CHARACTER.md
  manifest.json
  voice-pack-v<version>.json       # only when response copy is in scope
  GATE_REVIEW.md
  HANDOFF.md

concept-art/library-expansion/three-format-v1/characters/<id>/
  <id>-companion-master-v<N>.png
  <id>-habitat-source-v<N>.png
  <id>-sticker-sheet-source-v<N>.png
```

After acceptance, the deterministic build creates:

```text
  <id>-companion-64-v1.png
  <id>-companion-preview-8x-v1.png
  <id>-habitat-32-v1.png
  <id>-habitat-preview-8x-v1.png
  <id>-sticker-sheet-clean-v1.png
  <id>-sticker-celebrate-768-v1.png
  <id>-sticker-encourage-768-v1.png
  <id>-sticker-connect-768-v1.png
```

Never hand-edit those derived files. Correct the relevant source, save a new source version, update the accepted pin after review, and rebuild.

## `HANDOFF.md` must report

1. Exact scope and locked identity received.
2. Current gate: idea, identity-review, companion-review, three-format-review, accepted-art-package, or ready-for-implementation.
3. Every file created or changed.
4. Exact source versions proposed or accepted.
5. Validation actually performed, with results.
6. Native-size and board-level visual review actually performed.
7. Anatomy invariant and any failures corrected.
8. Visual/editorial compromises, extraction exceptions, or placeholders.
9. Interaction, voice, accessibility, egg, progression, and integration work that remains outside scope.
10. A direct recommendation: accept, revise, or hold.

## Required validation evidence

- Stable ID, name, role, and virtue do not duplicate the accepted cast.
- Every accepted source pin resolves to a PNG and earlier versions remain preserved.
- Habitat output is 32×32 with alpha, transparent corners, visible artwork, and no more than 16 opaque colors.
- Companion output is 64×64 with alpha, transparent corners, visible artwork, and a unique hash.
- Sticker keys are exactly `celebrate`, `encourage`, and `connect`.
- Every sticker is 768×768 with alpha, transparent corners, visible artwork, and a unique hash.
- The anatomy invariant passes in companion, habitat, and every sticker pose.
- Review boards regenerate and reflect the accepted manifest.
- Any authored voice pack uses known intents, safe variables, deterministic reviewed text, and response-only behavior.
- Generated concepts, rejected versions, accepted sources, and derived outputs remain clearly distinguished.

## Originating-task intake

1. Read the returned `HANDOFF.md` and `GATE_REVIEW.md`.
2. Compare identity with the accepted manifest and closest character packet.
3. Inspect only the returned character files; do not clean neighboring untracked work.
4. Review native 32×32 and 64×64 assets before enlarged previews.
5. Review all sticker poses for anatomy, accidental fragments, and emotional meaning.
6. Mark accept, revise, or hold.
7. Pin exact accepted source versions only after acceptance.
8. Run `npm run zoo:build-art` and record the result.
9. Integrate only through a separate explicitly authorized app task.

## Copy-ready task prompt

> Create or revise **[CHARACTER]** using `character-design/CHARACTER_WORKFLOW.md`, `CHARACTER_STYLE_GUIDE.md`, and `CHARACTER_TASK_HANDOFF.md`. Preserve its locked animal, integrated instrument, musical role, practice virtue, silhouette anchor, and anatomy invariant. Create three purpose-authored interpretations: 32×32 habitat resident, 64×64 interactive companion, and full-art celebrate/encourage/connect stickers. Keep every source version, do not edit app code, and stop at each human review gate. Return exact source versions, validation evidence, native-size visual QA, unresolved decisions, and an accept/revise/hold recommendation.

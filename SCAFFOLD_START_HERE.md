# Heart Beats Practice App — Scaffold Sandbox

Read this file first when resuming the migration in a new conversation or agent session.

## Objective

Rebuild the existing Practice App presentation on the neutral Scaffold 0.1.3 foundation. Preserve product behavior, Supabase authorization, student routines, labels, and data semantics. Rainbow Heart identity work happens only after Scaffold is reviewed and accepted.

## Safety boundary

- Production branch: `main` at baseline commit `df56496`.
- Local sandbox branch: `codex/practice-scaffold-sandbox`.
- Worktree: `C:\Users\John\Documents\Claude\Projects\Studio Apps\heartbeats-scaffold-sandbox`.
- Do not push, merge, deploy, or connect production data without Jonathan's explicit approval.
- Do not copy the live `.env.local` into this worktree.
- Use mock-isolated or sandbox-isolated data for interactive review.
- Keep the environment banner until deployment is explicitly approved.

## Canonical references

- `C:\Users\John\Documents\Projects\rainbowheart-os\SCAFFOLD_STYLE_GUIDE.md`
- `C:\Users\John\Documents\Projects\rainbowheart-os\DESIGN_SYSTEM.md`
- `C:\Users\John\Documents\Projects\rainbowheart-os\DESIGN_CONTRACT.json`

Only Scaffold is in scope. All identity work is deferred.

## Current state

Foundation slice started on 2026-08-16:

- Added locally bundled IBM Plex Sans, Sans Condensed, and Mono fonts under `src/assets/fonts`.
- Replaced global brand tokens with Scaffold semantic tokens.
- Kept legacy token aliases temporarily for incremental migration.
- Added reduced-motion handling, visible focus, and a 48px control baseline.
- Removed the Google Fonts network dependency.
- Added a persistent local Sandbox/data-mode banner.
- Migrated entry selection and core authentication screens to Scaffold.
- Replaced emoji-only authentication actions with plain-language labels.
- Verified the entry screen at all four reference widths and core auth at 390px.
- Migrated teacher, student, and parent dashboard shells to Scaffold.
- Added mock-isolated shell URLs: `?review=teacher`, `?review=student`, and `?review=parent`.
- Migrated teacher lesson-prep content and added realistic long-content fixtures to `?review=teacher`.
- Migrated the student daily progress, practice-card list, detail sheet, completion, skip, loading, empty, and error states.
- Added long-content student fixtures to `?review=student`; the fixture is interactive but never reads or writes Supabase.
- Migrated sight reading, badges, the practice pet, and pet collection to Scaffold while preserving microphone fallback, skipping, growth, hatching, merging, and celebrations.

This is not a completed conversion. Component styles still contain hard-coded brand colors, radii, shadows, emoji controls, and one-off type rules.

## Resume procedure

1. Read this file, `DESIGN_HANDOFF.md`, `SCAFFOLD_REVIEW.md`, and `DESIGN_DECISIONS.md`.
2. Run `git status --short --branch` and confirm `codex/practice-scaffold-sandbox`.
3. Never infer deployment approval from permission to edit locally.
4. Work one documented migration slice at a time.
5. Run `npm run build` after each slice and update the handoff/review files.

## Planned slices

1. Global foundation and sandbox boundary.
2. Entry selection and authentication forms. **Implemented; review still needs zoom, long content, and full keyboard traversal.**
3. Shared dashboard shells, navigation, logout controls, and initial loading/empty/error states. **Implemented; deeper content states remain in later slices.**
4. Teacher HUD and lesson-prep surfaces. **Implemented; full keyboard and zoom review remains.**
5. Student practice cards, detail, sight reading, badges, and pets. **Implemented; full keyboard, zoom, and assistive-technology review remains.**
6. Parent dashboard, family onboarding, messaging, and scheduling.
7. Four-viewport, keyboard, zoom, long-content, and reduced-motion review.

## Approval definition

Every applicable row in `SCAFFOLD_REVIEW.md` has evidence and an accepted result. Scaffold approval authorizes a later identity phase; it does not authorize a push.

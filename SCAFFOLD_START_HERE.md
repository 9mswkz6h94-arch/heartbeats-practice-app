# Heart Beats Practice App — Scaffold Sandbox

Read this file first when resuming the migration in a new conversation or agent session.

## Objective

Rebuild the existing Practice App presentation on the neutral Scaffold foundation. Preserve product behavior, Supabase authorization, student routines, labels, and data semantics. The technical Scaffold review is complete, and D-020 now authorizes a mock-only Rainbow Heart identity pilot for the student review surface.

## Safety boundary

- Production branch: `main` at baseline commit `df56496`.
- Local sandbox branch: `codex/practice-scaffold-sandbox`.
- Worktree: `C:\Users\John\Documents\Claude\Projects\Studio Apps\heartbeats-scaffold-sandbox`.
- Do not push, merge, deploy, or connect production data without Jonathan's explicit approval.
- Do not copy the live `.env.local` into this worktree.
- Use mock-isolated or sandbox-isolated data for interactive review.
- Keep the environment banner until deployment is explicitly approved.

## Canonical references

- `C:\Users\John\.codex\skills\rainbowheart-os\SCAFFOLD_STYLE_GUIDE.md`
- `C:\Users\John\.codex\skills\rainbowheart-os\RAINBOW_HEART_STYLE_GUIDE.md`
- `C:\Users\John\.codex\skills\rainbowheart-os\DESIGN_SYSTEM.md`
- `C:\Users\John\.codex\skills\rainbowheart-os\DESIGN_CONTRACT.json`

Scaffold remains the structural foundation. Rainbow Heart identity work is limited to the local mock student review until Jonathan explicitly approves a broader phase.

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
- Migrated the parent family dashboard, child detail, PIN reset, lesson/calendar information, rescheduling, notifications, private chat, and family onboarding surfaces.
- Added mock-isolated parent URLs: `?review=parent` for a linked family and `?review=parent-signup` for onboarding.
- Migrated remaining active teacher/admin presentation for assignments, repertoire, reschedule approval, student management, and parent preview.
- Added `?review=teacher-admin` for long-content/responsive review of requests and assignment operations.
- Completed automated 200%-equivalent layout checks across teacher, teacher-admin, student, parent, and onboarding fixtures.
- Replaced the production Teacher Dashboard composition with the unified Studio/Students workspace while preserving the mock-isolated teacher fixture.
- Added a real teacher-workspace adapter for active students, recurring lesson slots, assignments, practice summaries, guardian links, and private draft counts.
- Prepared teacher-only Lesson Memory migration `017_lesson_memory.sql` plus client data access, saving/recovery states, and student-scoped assignment handoff. The migration is not applied anywhere yet.

The technical Scaffold conversion and automated acceptance review are complete. Any further changes should be targeted review revisions or the separately authorized Rainbow Heart identity phase. The unused standalone `PracticeCard` path is documented legacy code, not part of the active workflow.

On 2026-09-05, the mock `?review=student` surface entered the Rainbow Heart identity pilot at Standard expression with the Craft register. It uses the canonical local brand kit and the Riffin Companion V3 review art. Teacher, parent, authentication, and production surfaces remain on Scaffold.

## Resume procedure

1. Read this file, `DESIGN_HANDOFF.md`, `SCAFFOLD_REVIEW.md`, and `DESIGN_DECISIONS.md`.
2. Run `git status --short --branch` and confirm `codex/practice-scaffold-sandbox`.
3. Never infer deployment approval from permission to edit locally.
4. Work one documented migration slice at a time.
5. Run `npm run build` after each slice and update the handoff/review files.
6. Treat `SQL_MIGRATIONS/017_lesson_memory.sql` as prepared but unapplied until Jonathan separately approves a named Supabase sandbox or production migration.

## Planned slices

1. Global foundation and sandbox boundary.
2. Entry selection and authentication forms. **Implemented; review still needs zoom, long content, and full keyboard traversal.**
3. Shared dashboard shells, navigation, logout controls, and initial loading/empty/error states. **Implemented; deeper content states remain in later slices.**
4. Teacher HUD and lesson-prep surfaces. **Implemented; full keyboard and zoom review remains.**
5. Student practice cards, detail, sight reading, badges, and pets. **Implemented; full keyboard, zoom, and assistive-technology review remains.**
6. Parent dashboard, family onboarding, messaging, and scheduling. **Implemented; full keyboard, zoom, and assistive-technology review remains.**
7. Four-viewport, keyboard, zoom, long-content, and reduced-motion review. **Viewport, zoom-equivalent, long-content, and reduced-motion source checks pass; manual Tab order and assistive-technology review remain.**

## Approval definition

Every applicable row in `SCAFFOLD_REVIEW.md` has evidence and an accepted result. Scaffold approval authorizes a later identity phase; it does not authorize a push.

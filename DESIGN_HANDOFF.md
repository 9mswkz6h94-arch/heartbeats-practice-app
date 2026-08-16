# Design Handoff

**App:** Heart Beats Practice App  
**Branch:** `codex/practice-scaffold-sandbox`  
**Phase:** Scaffold build  
**Contract:** Scaffold 0.1.3  
**Last updated:** 2026-08-16

## Product invariants

- Existing teacher, student, and parent authorization remains unchanged.
- Daily resets, persistent Theory behavior, completion history, and lesson workflows remain unchanged.
- Student-facing navigation and task language remain stable during the visual migration.
- Pets, badges, celebrations, and motivation mechanics remain product features.
- Theme work cannot alter data behavior or privacy boundaries.

## Implemented

- Local-only worktree and branch separated from `main`.
- Scaffold semantic palette, font roles, spacing, geometry, effects, and compatibility aliases.
- Six locally hosted IBM Plex font files at regular and semibold weights.
- Global focus-visible and reduced-motion baselines.
- Persistent Sandbox/data-mode banner.
- Google Fonts removed from `public/index.html`.
- Entry role selection rebuilt with numbered structural rows and plain-language descriptions.
- Teacher, student, kid, and parent authentication surfaces migrated to Scaffold.
- Family code now has a visible/programmatic label.
- PIN utility actions now use `Delete` and `Switch` labels rather than emoji-only controls.
- Success and error messages now expose distinct status/alert semantics.
- Back navigation header now stacks without overlap at the 390px reference width.
- Teacher navigation now uses numbered, fully labeled controls at every viewport; the emoji-only collapsed rail was removed.
- Teacher navigation becomes a three-column tablet grid and a one-column phone stack.
- Student and parent dashboard headers now share the same workspace/title/logout grammar.
- Parent loading, error, and empty states now carry explicit status semantics and recovery copy.
- Added a `mock-isolated` shell review harness (`?review=teacher|student|parent`) that never reads or writes Supabase data.

## Known incomplete areas

- Component CSS still contains legacy hard-coded colors, shadows, pills, and font declarations.
- Emoji used in controls and navigation require a plain-language/semantic review.
- Category colors embedded in JavaScript need structural cues before neutralization.
- The teacher HUD has fixed-window assumptions needing responsive review.
- Mock-isolated data fixtures do not exist yet.
- No visual or assistive-technology review evidence exists yet.

## Verification log

| Date | Slice | Check | Result |
|---|---|---|---|
| 2026-08-16 | Foundation | Source audit | Complete |
| 2026-08-16 | Foundation | Production branch untouched | Confirmed before worktree creation |
| 2026-08-16 | Foundation | Production build with placeholder sandbox credentials | Pass; existing ESLint and bundle-size warnings remain |
| 2026-08-16 | Entry/auth | Production build with placeholder sandbox credentials | Pass; only recorded pre-existing warnings |
| 2026-08-16 | Entry | 390, 768, 1024, and 1440px width checks | Pass; no horizontal scrolling; role targets 83px high |
| 2026-08-16 | Auth | 390px student/teacher/parent checks | Pass; visible labels; controls 48–52px high; no horizontal scrolling |
| 2026-08-16 | Auth header | 390px visual inspection | Pass after replacing absolute Back-button layout |
| 2026-08-16 | Shared shells | Production build in mock-isolated mode | Pass; only recorded pre-existing warnings |
| 2026-08-16 | Teacher shell | 390/768/1024/1440px mock-isolated browser checks | Pass; no horizontal overflow; labeled nav controls 48–52px |
| 2026-08-16 | Student/parent shells | 390/1440px mock-isolated browser checks | Pass; no horizontal overflow; logout controls 48px |

## Deferred maintenance findings

- Create React App and several transitive packages are deprecated.
- The existing bundle is about 828 kB gzipped and would benefit from later code splitting.
- Existing ESLint warnings cover unused values, hook dependency arrays, and a BOM in `src/index.js`.

These are recorded but intentionally not mixed into the Scaffold migration unless they block review.

## Next action

Migrate the teacher lesson-prep content surfaces and verify long names, empty/error states, and tablet behavior inside the new shell.

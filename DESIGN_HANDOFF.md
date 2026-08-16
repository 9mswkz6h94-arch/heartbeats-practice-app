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
- Teacher lesson-prep pulse, triage cards, selected-student detail, assignments, and reach-out panel migrated to Scaffold.
- Student triage cards are now keyboard-operable buttons instead of clickable `div` elements.
- Operational emoji were removed from pulse metrics, preview/reset controls, streak counts, and reach-out headings.
- Teacher loading/error/empty states now name the activity and provide recovery; error includes `Try again`.
- Long-name and long-assignment fixtures were added to the mock teacher view.
- Student daily progress, practice-card list, loading, empty, error/retry, and completion states migrated to Scaffold.
- Practice cards are now semantic buttons with visible focus support and long-content wrapping.
- Practice detail is a responsive dialog with plain-language Close, complete, and skip controls.
- The student review fixture uses realistic long assignment copy and opens an interactive detail sheet without Supabase.
- Sight reading uses Scaffold controls and neutral notation colors while retaining microphone, tap, skip, staff/tab, level, and rotation flows.
- Wide musical notation is contained in its own horizontal scroller and cannot expand the student dashboard.
- Badges now expose their descriptions visibly instead of relying on hover titles.
- Pet growth, naming, listening, eggs, hatching, merging, and collection states use Scaffold structure with plain-language controls.
- Creature and badge artwork remains as motivational content; operational controls no longer depend on emoji.
- Parent family code, child switcher, weekly stats, assignments, repertoire, lesson calendar, PIN reset, reschedule request, text notifications, and private chat migrated to Scaffold.
- Parent and child-detail fetch failures now include named error states and `Try again` recovery.
- Scheduling fields have explicit programmatic labels; child switching exposes its selected state.
- Family onboarding controls have explicit labels, 48px+ targets, and an isolated `?review=parent-signup` fixture.
- Parent chat retains its existing teacher/parent-only data path; no Supabase queries or RLS behavior changed.
- Remaining active teacher/admin surfaces—recent assignments, repertoire, reschedule decisions, student management, assignment editing, and parent preview—now use Scaffold tokens and plain-language controls.
- Added `?review=teacher-admin` with long assignment and reschedule content.
- All five review targets pass a 640px viewport check as the layout equivalent of 200% zoom on a 1280px display.
- The unused standalone `PracticeCard.js`/`.css` pair remains untouched and is not imported by the active student workflow.

## Known incomplete areas

- Component CSS still contains legacy hard-coded colors, shadows, pills, and font declarations.
- Emoji used in controls and navigation require a plain-language/semantic review.
- Category colors embedded in JavaScript need structural cues before neutralization.
- The teacher HUD has fixed-window assumptions needing responsive review.
- Remaining work is a manual Tab-order/focus-clipping pass, assistive-technology review, and final state-completeness sign-off.
- Full keyboard, 200% zoom, and assistive-technology review remains incomplete.

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
| 2026-08-16 | Lesson prep | 390/768/1024/1440px long-content fixture | Pass; no horizontal overflow or clipped headings/titles; controls at least 48px |
| 2026-08-16 | Student practice | Production build in mock-isolated mode | Pass; only recorded pre-existing warnings remain |
| 2026-08-16 | Student practice list | 390/1440px long-content fixture | Pass; no horizontal overflow; card and logout controls at least 48px |
| 2026-08-16 | Practice detail | 390px interactive fixture | Pass; no horizontal overflow; Close 48px and actions 52px high |
| 2026-08-16 | Sight reading | Production build and 390px interactive fixture | Pass; staff scrolls internally; no page overflow; controls 48–52px |
| 2026-08-16 | Badges and pets | 390/1440px mock-isolated fixtures | Pass; no horizontal overflow; operational controls at least 48px |
| 2026-08-16 | Parent family dashboard | Production build and 390/1440px long-content fixture | Pass; no horizontal overflow or clipped names/messages; controls at least 48px |
| 2026-08-16 | Parent scheduling/chat | 390px interactive fixture | Pass; reschedule fields/actions, notifications, and message composer remain contained and labeled |
| 2026-08-16 | Family onboarding | 390px `?review=parent-signup` fixture | Pass; no horizontal overflow; inputs and controls 52–55px high |
| 2026-08-16 | Cross-app zoom equivalent | 640px review of teacher/student/parent/onboarding | Pass; no horizontal overflow or clipped tested headings/controls |
| 2026-08-16 | Teacher admin | 390/640/1440px `?review=teacher-admin` fixture | Pass; no overflow/clipping; controls 48–52px |
| 2026-08-16 | Keyboard names/focus source | Semantic-name audit plus global `:focus-visible` rule | Partial; no unnamed fixture controls found; real Tab traversal remains manual |

## Deferred maintenance findings

- Create React App and several transitive packages are deprecated.
- The existing bundle is about 828 kB gzipped and would benefit from later code splitting.
- Existing ESLint warnings cover unused values, hook dependency arrays, and a BOM in `src/index.js`.

These are recorded but intentionally not mixed into the Scaffold migration unless they block review.

## Next action

Run the manual Tab-order/focus-clipping and assistive-technology review, then prepare the Scaffold acceptance checklist for Jonathan.

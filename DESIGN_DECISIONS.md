# Scaffold Design Decisions

Append new decisions. Supersede older decisions explicitly rather than deleting history.

## D-001 — Local-only migration boundary

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Work occurs on `codex/practice-scaffold-sandbox`. No push, merge, or deployment occurs without Jonathan's explicit approval.
- **Reason:** Children actively use production.

## D-002 — Scaffold-only scope

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Only Scaffold is implemented in this phase. Identity work remains out of scope.
- **Reason:** Structure and accessibility need approval before decoration.

## D-003 — Compatibility aliases

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Existing CSS variables temporarily alias to canonical Scaffold semantic tokens.
- **Reason:** This permits safe incremental migration instead of an all-at-once rewrite.

## D-004 — Stable product behavior

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Preserve routes, labels, task order, data behavior, and motivation mechanics unless a separately documented usability defect is approved.
- **Reason:** The eventual student transition should feel familiar.

## D-005 — No production-connected review

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Do not reuse live Supabase credentials for interactive Scaffold work. Build mock-isolated or sandbox-isolated review first.
- **Reason:** Visual review must not risk active student records.

## D-006 — Plain-language authentication controls

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Role selection uses numbered rows with descriptive text. Authentication headings and PIN utility keys do not depend on emoji for meaning.
- **Reason:** Scaffold requires controls and navigation to remain unambiguous without brand imagery or color.

## D-007 — Static shell review harness

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Dashboard shells may be rendered with static fixtures only when `REACT_APP_REVIEW_DATA_MODE=mock-isolated` and a supported `?review=` value is present.
- **Reason:** Responsive visual review must not require live credentials or risk student records.

## D-008 — Labeled navigation at every width

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Teacher navigation changes layout across breakpoints but never hides its text labels.
- **Reason:** An emoji-only rail contradicts Scaffold’s plain-language and accessible-navigation requirements.

## D-009 — Triage remains warm but structurally explicit

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Keep the no-shame labels `Needs a nudge`, `On a roll`, `Practiced today`, and `Steady`; pair each with a text label and structural leading edge rather than emoji or color alone.
- **Reason:** The language is a product behavior worth preserving, while Scaffold requires state to remain legible without decoration.

## D-010 — Student progress without pressure

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Preserve streaks, clear remaining counts, the completion celebration, and `Skip for today`. Scaffold neutralizes their surfaces but does not remove or shame the underlying choices.
- **Reason:** These mechanics support orientation and motivation for students; they are product behavior rather than Rainbow Heart identity decoration.

## D-011 — Practice cards are native controls

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Render each pending practice card as a semantic button and the expanded card as a labeled dialog with plain-language actions.
- **Reason:** Keyboard and assistive-technology operation should be inherent, while the familiar card-to-detail workflow remains unchanged.

## D-012 — Playful content survives the neutral foundation

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Creature and badge illustrations remain visible as motivational content. Operational meaning and controls use text, structure, and semantic state rather than emoji alone.
- **Reason:** Scaffold is a structural foundation for a later skin, not a removal of product features the students already value.

## D-013 — Wide notation scrolls locally

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Generated staff and tab notation may scroll horizontally inside the sight-reading panel, but must never cause page-level horizontal scrolling.
- **Reason:** Legible musical spacing is more useful than compressing notes, while the surrounding student interface must remain stable on phones.

## D-014 — Parent communication remains private and structurally distinct

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Preserve the existing teacher–parent communication data path and student exclusion. Message ownership uses alignment plus structural borders and author text, not color alone.
- **Reason:** The Scaffold migration must improve legibility without widening access to adult communication.

## D-015 — Scheduling is a request, not a silent calendar mutation

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Keep rescheduling as an explicit parent request with a visible pending state, cancellation action, and teacher confirmation. The calendar link remains a separate action.
- **Reason:** This preserves teacher coordination and prevents a visual redesign from implying that a proposed time is already approved.

## D-016 — Unused legacy practice card stays isolated

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Do not migrate or delete `PracticeCard.js` and `PracticeCard.css` during Scaffold. The active workflow uses `StudentPracticeCards` and `PracticeCardDetail`; no source imports the standalone component.
- **Reason:** Removing dead code is maintenance, not design migration, and reviving it would add an unreviewed path.

## D-017 — Zoom evidence uses the reflow-equivalent viewport

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Record the 640px viewport as automated layout evidence equivalent to 200% zoom on a 1280px viewport, and keep true browser-zoom/manual assistive review separately identified.
- **Reason:** The local browser controller exposes viewport sizing but not browser zoom or reduced-motion emulation; evidence must state that limitation precisely.

## D-018 — Teacher access is invite-only

- **Date:** 2026-08-22
- **Status:** accepted
- **Decision:** The public teacher surface is sign-in only. Teacher status must come from an existing `users.type = 'teacher'` database profile provisioned by a trusted administrator; public signup metadata, missing profiles, and first-login code may never create or promote a teacher.
- **Reason:** Jonathan confirmed that teacher accounts are invite-only. Authorization must be enforced in session resolution and database policy, not only by hiding a signup control.

## D-019 — Account switching clears the local session

- **Date:** 2026-08-22
- **Status:** accepted
- **Decision:** Teacher, parent, and student dashboards expose a plain-language `Switch account` action. One shared handler signs out the current Supabase session with local scope and always returns the device to role selection.
- **Reason:** Families share phones and tablets, and Jonathan must test multiple roles on one phone. Account switching cannot depend on remote session revocation succeeding before the local device becomes usable.

## D-020 — Mock student review begins Rainbow Heart identity pilot

- **Date:** 2026-09-05
- **Status:** accepted for local review
- **Supersedes:** D-002 only for the mock-isolated student review surface; Scaffold remains the structural foundation everywhere.
- **Decision:** Apply Rainbow Heart Style Guide 1.0 at Standard expression with the Craft register to `?review=student`. Use the canonical brand-kit export, keep one bounded Craft spectrum moment in the student header, and preserve existing product behavior and accessibility structure.
- **Reason:** Jonathan explicitly asked to try the accepted Rainbow Heart style-lab direction after completing the Scaffold review. Limiting the first pass to the mock student fixture makes the visual decision reviewable without changing production data, authorization, deployment, or the teacher and parent surfaces.

## D-021 — The Musical Zoo shows one selected place at a time

- **Date:** 2026-09-05
- **Status:** accepted for local review
- **Decision:** Keep the compact Zoo Commons as the default shared view. Once a student selects a habitat or collection destination, that destination replaces the Commons and the Zoo map instead of stacking below them. Keep destination components mounted but hidden so arrangement and collection state survive travel. On phone widths, let the active destination break out to the full content width and give living habitat maps a viewport-scaled play field.
- **Reason:** Jonathan identified the stacked Commons-plus-habitat presentation as visual clutter and asked for a larger mobile habitat view. One visible place better supports the Zoo’s spatial, game-like mental model while preserving one normal page scrollbar.

## D-022 — Unrevealed Zoo discoveries stay invisible

- **Date:** 2026-09-05
- **Status:** accepted for local review
- **Decision:** Show only currently available Zoo destinations and owned scenery. Do not show locked cards, empty collection silhouettes, unlock denominators, progress meters, countdowns, or “one more practice step” teasers. When an underlying event makes something available, its ordinary card simply appears in the appropriate place.
- **Reason:** Jonathan wants the Zoo to feel stress-free and naturally surprising rather than turning practice into a visible collection chase.

## D-023 — Calendar arrivals should reward presence without punishing absence

- **Date:** 2026-09-05
- **Status:** proposed
- **Decision:** Explore calendar-driven Zoo visitors, keepsakes, or environmental moments that are visible only while relevant to a lesson, Studio event, season, or community day. Do not preview unavailable items, show countdowns, record missed silhouettes, remove something already discovered, or make a student’s collection permanently incomplete because they were absent. Prefer a grace window, later return visits, or a teacher/parent recovery path.
- **Reason:** Time-specific surprises can make the Zoo feel alive and connected to real Studio life, but strict “you had to be there” scarcity would recreate the pressure the hidden-discovery rule is intended to remove.

## D-024 — The Zoo may use a cozy top-down pixel-world language

- **Date:** 2026-09-05
- **Status:** proposed for local review
- **Decision:** Present the Musical Zoo as a small explorable world rather than a dashboard grid. Use readable tile paths, environmental landmarks, cream game-style signboards, little destination buildings, stepped NPC travel, and responsive vertical trails on phones. Preserve plain-language labels, 48px targets, focus, reduced motion, and the hidden-discovery rule. Treat this as an app-specific visual extension; it does not define or canonize Rainbow Heart’s still-open illustration, texture, effects, or motion language.
- **Reason:** Jonathan asked for a warmer farm-game feeling similar to the spatial comfort of Stardew Valley. A top-down world supports the existing habitat mental model while remaining original and keeping every location understandable without its artwork.

## D-025 — Lesson Memory is teacher-entered, teacher-only, and deliberate

- **Date:** 2026-09-06
- **Status:** accepted for local implementation; database application remains unapproved
- **Decision:** Connect the unified Teacher Workspace to the app’s real student, lesson, assignment, practice, guardian, and schedule records. Store Lesson Memory as short teacher-entered notes in separate teacher-only tables protected by row-level security. Do not store audio, recordings, transcripts, or student-facing chat in this feature. Wrapping a lesson may create a private assignment suggestion, but nothing reaches the student until the teacher approves it and deliberately publishes an assignment.
- **Reason:** Jonathan approved moving the Teacher Workspace prototype toward real data while preserving the no-recording approach and avoiding automatic assignments that could misrepresent a lesson. The explicit review and publish boundary keeps the teacher in control and keeps private lesson context out of student and parent views.
- **Boundary:** Migration `018_lesson_memory.sql` is prepared locally but has not been applied to any Supabase project. No production data, authorization, deployment, push, or merge is approved by this decision.

## D-026 — Rainbow Heart 2.0 unifies the four local review workspaces

- **Date:** 2026-09-06
- **Status:** accepted for local identity review
- **Decision:** Apply the canonical Rainbow Heart Style Guide and Brand Kit 2.0 Standard expression to the mock-isolated Student, Teacher workspace, Parent, and Family setup review surfaces. Use Inter for the interface, Fraunces only for restrained page-level display moments, Space Mono for measured information, the accepted white/near-black/violet core, 18px ordinary surfaces, 12px controls, role-limited pills, and one exact six-stop Logo Spectrum band per surface. Preserve Scaffold behavior, hierarchy, state cues, accessibility, and privacy boundaries.
- **Reason:** Jonathan explicitly asked for the new guide to carry across these four tabs so the practice app reads as one welcoming Studio system instead of one branded student pilot beside three Scaffold-only workspaces.
- **Supersession:** This supersedes D-020 only for the local student review's Rainbow Heart 1.0 visual recipe and expands the approved local identity-review boundary to the three named review surfaces. The 1.0 pilot remains historical evidence.
- **Boundary:** Production remains Scaffold. This decision does not authorize production behavior or data changes, authentication work, database or migration execution, deployment, push, or merge.

## D-027 — The real local app adopts Rainbow Heart without a data transition

- **Date:** 2026-09-06
- **Status:** accepted for local implementation
- **Decision:** Apply the accepted Rainbow Heart 2.0 Standard identity boundary to the real local entry, authentication, Student, Teacher workspace, Parent, and Family setup shells. Keep the existing component hierarchy, Supabase client, authentication flow, completion history, daily practice state, streak calculation, assignments, badges, and pets exactly as they are.
- **Reason:** Jonathan approved moving beyond the mock review after confirming that student streaks and saved information would survive. This is a presentation-layer adoption, not a data-model or account migration.
- **Evidence:** The identity-only checkpoint preserved matching hashes for the seven practice and persistence files and passed 17 suites / 61 tests. The later D-028 completion pass deliberately extends three of those files without changing their existing database write paths.
- **Boundary:** The change remains local and production deployment stays Scaffold. No database migration, record update, data copy, authorization change, push, merge, or deployment is authorized.

## D-028 — Complete the local workflows without widening production access

- **Date:** 2026-09-06
- **Status:** accepted for local implementation; migrations and release remain unapproved
- **Decision:** Move the reviewed Musical Zoo and response-only companion into the real Student dashboard; move existing pet care and collection inside the Zoo; derive visible Zoo content only from already-earned records; and store new arrangement preferences separately from practice ledgers. Expand the real family wizard with private profile/caregiver details. Keep the Teacher Workspace usable without Lesson Memory, add a local recurring-calendar view, and make the planning helper deterministic and device-local rather than sending private notes to an outside AI service.
- **Reason:** Jonathan authorized an independent completion pass before review, while explicitly requiring existing student streaks and saved data to survive. Separate additive tables, missing-feature fallbacks, and existing practice write paths minimize migration risk while allowing the reviewed interfaces to become real workflows.
- **Evidence:** 22 suites / 77 tests and the optimized build pass. The four mock-isolated workspaces pass the 360/640/1024/1440 responsive matrix with no page overflow, duplicate IDs, broken images, unnamed buttons, or active controls below 40px. Canonical OS, Scaffold Kit, Brand Kit, and connected-app validation pass.
- **Boundary:** Migrations `018`, `019`, and `020` are local review artifacts only. No production migration, record mutation, auth change, external AI call, push, merge, or deployment is authorized.

## D-029 — Finish the live teacher workflow behind an isolated release gate

- **Date:** 2026-09-07
- **Status:** accepted for local implementation; isolated database acceptance required
- **Decision:** Expose Badge Studio, pending reschedule requests, parent-view preview, and assignment reassign/repertoire/remove controls in the real local Teacher Workspace. Store teacher-created celebrations in additive `teacher_badge_awards` records beside the existing automatic `student_badges` ledger. Preserve all earlier badge and practice history, and constrain physical-format choices to non-ordering planning metadata.
- **Reason:** The accepted Teacher redesign contained working review interactions, but several were absent from the live adapter. A separate additive award table and the existing transactional assignment lifecycle close that product gap without rewriting established student records.
- **Evidence:** Static migration invariants, API tests, live-wiring tests, full unit suite, art validation, and optimized build are required locally. SQL execution, real teacher/parent/student RLS checks, keyboard/zoom review, push, migration, and deployment remain separate gates.
- **Boundary:** No production data, vendor, guardian address, order, payment, external message, migration, push, or deployment is authorized by this decision.

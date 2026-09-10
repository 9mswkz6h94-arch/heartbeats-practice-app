# Design Handoff

**App:** Heart Beats Practice App
**Project:** `proj-004`
**Branch:** `codex/practice-scaffold-sandbox`
**Current phase:** Identity review (release candidate)
**Design-system version:** `0.7.0`
**Identity version:** Rainbow Heart Style Guide `2.0.0`
**Last updated:** 2026-09-09

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
- Practice and parent-preview dialogs now move focus inside, trap Tab/Shift+Tab, close on Escape, and restore the triggering control.
- Screen-reader-oriented snapshots confirm named controls and landmark structure across teacher, teacher-admin, student, parent, and onboarding fixtures.
- The technical Scaffold acceptance checklist is complete. This does not authorize production deployment.
- Teacher signup was removed from the public auth surface. Teacher sessions now require an existing teacher profile, and migration `016_invite_only_teachers.sql` replaces the open `users` insert policy with self-service non-teacher inserts only.
- Parent, student, and teacher dashboards now use one shared `Switch account` handler that clears the device-local Supabase session before returning to role selection.
- The production Teacher Dashboard now uses the unified Studio/Students workspace shell instead of separate global assignment and roster tabs.
- The live workspace adapter loads the signed-in teacher’s active students, recurring lesson slots, practice summaries, current assignments, guardian links, and private assignment-draft counts.
- Added local migration `018_lesson_memory.sql` for teacher-only lesson sessions, categorized notes, and assignment suggestions. All three tables enable RLS, grant no anonymous access, and verify the signed-in teacher through the existing student relationship.
- Lesson Memory stores short teacher-entered text only. Its schema contains no audio, recording, or transcript field, and students and parents receive no policies.
- Starting a lesson, saving/removing a note, wrapping the lesson with an atomic private suggestion, and approving the suggestion now have a dedicated data-access layer with explicit loading, saving, error, and recovery states.
- The selected student’s Assignments tab now shows real current work. New assignments remain student-scoped, and an approved Lesson Memory suggestion can prefill the existing assignment form before a deliberate publish.
- Roster management remains available inside Students, and guardian messaging remains separate from private Lesson Memory notes.
- The mock `?review=teacher` workspace remains deterministic and disconnected from Supabase for safe interaction review.
- App governance metadata is aligned to Rainbow Heart OS `0.7.0`; the four local review surfaces now target Rainbow Heart 2.0 while production remains Scaffold.
- Jonathan visually accepted the local Rainbow Heart redesign on 2026-09-09. Production remains Scaffold until the remaining accessibility evidence and a separately authorized deployment are complete.

## Rainbow Heart 2.0 review expansion (2026-09-06)

- Applied the canonical Rainbow Heart Style Guide and Brand Kit 2.0 Standard expression to the mock-isolated Student, Teacher workspace, Parent, and Family setup review surfaces.
- Replaced the historical Atkinson/Georgia/Craft theme import with the canonical local Inter, Fraunces, Space Mono, Logo Spectrum, geometry, focus, and semantic token export.
- Added one bounded six-stop Logo Spectrum band to each coherent review surface; individual spectrum colors do not encode categories, states, users, or tools.
- Mapped the existing Scaffold variables inside the review boundary so hierarchy, state labels, recovery, workflows, and privacy behavior remain unchanged while ordinary cards use 18px geometry and controls use 12px geometry.
- Reserved Fraunces for page-level display moments, kept dense workspace headings in Inter, and retained Space Mono for dates, counts, codes, sequence, and other measured information.
- Standardized selected navigation and primary actions on the accepted violet/action-soft pair, while semantic success, warning, and danger states keep their existing labels and structural cues.
- Production remains Scaffold. No Supabase path, authorization rule, migration, production data, deployment, push, or merge was touched by this identity pass.

## Rainbow Heart 2.0 local application adoption (2026-09-06)

- Extended the accepted Rainbow Heart identity boundary from deterministic review fixtures to the real local entry, loading, authentication, Student, Teacher workspace, Parent, and Family setup shells.
- The local app now uses the canonical Inter, Fraunces, Space Mono, violet action system, 18px surfaces, 12px controls, and one exact Logo Spectrum band at the application boundary.
- The real Student dashboard inherits the reviewed student and Musical Zoo treatment; the live Teacher and Parent workspaces inherit the reviewed shared workspace mappings. Login, role selection, kid access, and the real family wizard received matching identity-only overrides.
- This is not a student-data transition. Practice completions remain accumulated in `completions`; daily checkoffs remain in `daily_practice_status`; badges, pets, assignments, account resolution, and all existing Supabase paths remain unchanged.
- The original identity-only checkpoint recorded matching hashes for the practice and persistence files. The later completion pass deliberately changed `StudentPracticeCards.js`, `studentStats.js`, and `PetWidget.js` to emit companion responses and expose real seven-day/repertoire data; completion writes, daily status writes, streak calculation, badge awards, pet XP, and collection RPCs remain on their existing paths and are covered by the expanded tests.
- Validation passes: 17 suites / 61 tests, optimized build, and mock-isolated phone/desktop browser checks across Student, Teacher, Parent, and Family setup with no horizontal overflow or undersized visible controls.
- The real authenticated dashboards were not opened during review because their normal lifecycle can perform legitimate account backfills. The deterministic review routes remain the safe interactive evidence surface.
- Production remains unchanged until a separately authorized push and deployment. No database migration, data write, auth change, push, or deploy occurred.

## Local workflow completion pass (2026-09-06)

- The real Student dashboard now contains the Musical Zoo. Existing pet growth and collection controls moved into its Caretaker Cabin, so pet features no longer sit as unrelated blocks below the Zoo.
- Live Zoo contents derive from the student’s existing pet, hatched creatures, and completion count. Only already-earned scenery and destinations render; fake visitors and mock practice notes remain confined to the isolated fixture.
- The floating companion now reacts after successful completion or skip events and does not prompt the student to begin. Companion choice and habitat/scenery arrangement use a device-local fallback; migration `020_student_zoo_preferences.sql` adds optional cross-device sync without copying any streak, completion, XP, assignment, pet, or reward ledger.
- The real family wizard now captures preferred name, birthday, derived age, optional pronouns/grade, primary guardian relationship/phone, and optional additional caregiver contacts. Migration `019_family_profiles.sql` keeps additional contacts private with RLS; age is derived and never stored separately.
- The Teacher Workspace remains usable when migration `018_lesson_memory.sql` is absent. Assignments, schedule, progress, roster, and family messages continue to load while Lesson Memory shows a bounded unavailable state.
- Studio Home now has a working recurring-schedule calendar, roster search, real seven-day practice activity, real repertoire titles, and a deterministic local planning helper. The helper reads only notes already in the workspace, calls no outside AI service, and never publishes an assignment.
- The legacy assignment-list Edit control now opens a working teacher edit form while preserving practice steps and completed work. The active parent review fixture now supports student switching, reschedule/cancel, notification preference, and local message interactions.
- The external performance calendar remains deliberately disabled in the live workspace and labeled `Not connected` until a trusted source is selected.
- No migration was applied, no production record was read or changed during interactive review, and no push, merge, or deployment occurred.

## Musical Zoo character library proposal (2026-09-06)

- Added an isolated, app-local companion review library with six post-starter candidates: Ringlet, Brumbo, Plinka, Puffino, Cymbi, and Spirlo.
- Each candidate has a distinct animal silhouette, integrated instrument, musical role, practice virtue, concept packet, proposal manifest, editable 64×64 SVG, transparent native PNG, and 8× nearest-neighbor preview.
- Added one comparison board beside the locked Riffin, Boppo, and Chordillo starter identities plus a proposed app-local style lock derived from the current Musical Zoo evidence.
- Work stops at the companion review gate. No roaming sprites, eggs, motion, stickers, voice packs, progression, registry entries, student records, or app integration were added.
- Rainbow Heart illustration language remains canonically open. This library is a visual proposal for Jonathan's accept/revise/hold review, not a shared identity decision.

## Chordillo-aligned companion proposal (2026-09-06)

- Reworked Riffin, Boppo, Ringlet, Brumbo, Plinka, Puffino, Cymbi, and Spirlo as detailed companion concept masters using Chordillo as the app-local quality anchor.
- Preserved every animal/instrument pairing while adding rounded anatomy, expressive faces, richer hand-pixeled shading, and clearer integrated instrument construction.
- Preserved the original V1 four-color sprites and generated a separate V2 folder with untouched concept masters, derived transparent cutouts, exact prompts, a reproducible comparison-board builder, and a nine-character review board.
- This is a visual review artifact only. It does not add production sprites, motion, stickers, app registry entries, progression, records, migrations, deployment, or a canonical Rainbow Heart illustration decision.

## Musical Zoo three-format character system (2026-09-07)

- Jonathan accepted the Chordillo-aligned nine-character cast and authorized an isolated three-format derivation pass.
- Added nine purpose-authored 32×32 habitat sprites, nine normalized 64×64 interactive companions, and twenty-seven 768×768 transparent full-art stickers across celebrate, encourage, and connect response roles.
- Habitat sprites were redrawn for small-scale movement instead of mechanically shrinking the companion pose. Sticker poses were generated as full art, then isolated by connected figure and normalized with transparent corners and a white die-cut outline.
- Preserved every generation source, the accepted V1/V2 artwork, exact shared prompt contracts, targeted recovery notes, and reproducible native, sticker, board, and validation scripts.
- Added separate native-sprite and sticker review boards using the Rainbow Heart 2.0 typography, geometry, action violet, and single exact six-stop Logo Spectrum band.
- Completed a targeted anatomy correction pass after board review: Puffino's accordion now mounts horizontally across a visible torso, Cymbi's cymbals now sit as dorsal ladybug wing covers instead of front torso discs, and Spirlo now has exactly one pair of stalk-tip eyes in habitat, companion, and sticker formats.
- Rebuilt Plinka's habitat, companion, and sticker anatomy so the graded playable tines are the hedgehog spines themselves; no attached rack, hardware, or second layer of ordinary quills remains.
- Updated sticker isolation to retain nearby layered pose components such as instruments, feet, hands, and wings while continuing to reject neighboring-column spill.
- This is an app-local character-art system. The canonical Rainbow Heart illustration language remains open, and no app source, registry, progression rule, production data, migration, push, or deployment was changed.

## Musical Zoo character workflow and reusable skill (2026-09-07)

- Converted the accepted nine-character art process into a documented workflow from identity brief and anatomy lock through companion review, purpose-authored habitat/sticker formats, versioned correction, acceptance, deterministic build, and handoff.
- Added one accepted library manifest with explicit source-version pins. Builders no longer select the newest file implicitly, so a generated correction cannot replace accepted art until human review changes the pin.
- Refactored native, sticker, review-board, and validation tooling to read the manifest; added one `zoo:build-art` command for the complete deterministic pipeline and one read-only `zoo:validate-art` command.
- Added a safe `zoo:new-character` scaffolder that creates a character sheet, manifest, authored-response template, gate review, and art-source notes while refusing to overwrite existing files.
- Reconciled historical strict four-color and egg-first notes with the accepted three-format direction: 32×32 habitat resident, 64×64 interactive companion, and 768×768 celebrate/encourage/connect stickers. Egg/icon, motion, accessibility copy, and authored response packs remain separate implementation-readiness gates.
- Locked the current response-only behavior in the character guidance. Companions may respond after real student actions but do not prompt practice, return, streak preservation, sharing, or replies.
- Installed and validated the local `$musical-zoo-character-creator` Codex skill with character-contract, prompt-pattern, and integration-boundary references.
- No runtime app source, registry, progression, student data, migration, push, deployment, or canonical Rainbow Heart OS illustration setting changed in this workflow slice.

## Riffin and Ringlet identity correction candidates (2026-09-07)

- Restored Riffin's user-preferred cross-body construction in all three formats: one round cream soundboard belly, exactly three horizontal strings, and one uninterrupted orange tail that curves upward as the guitar neck and ends in exactly three pegs.
- Corrected Ringlet's bell silhouette in all three formats. The earlier exposed round clapper was replaced by one tiny flat clapper recessed high inside the dark bell opening; nothing hangs below the rim or sits between the two separated rabbit feet.
- Preserved both characters' accepted V1 sources and manifest pins. The V2 source files, native assets, stickers, and two review boards are candidate-only outputs pending Jonathan's visual acceptance.
- Added an explicit candidate manifest and `zoo:build-correction-candidates` command. The normal accepted build still defaults to the accepted manifest, while the validator recognizes the proposed gate only when the candidate runner supplies that gate explicitly.
- Candidate validation passes for two unique 32×32 habitat sprites, two unique 64×64 companions, six 768×768 stickers with transparent corners, and two review boards.
- No app source, registry, progression rule, student data, migration, push, deployment, or canonical Rainbow Heart illustration decision changed.

## Accepted Riffin + Ringlet app integration (2026-09-07)

- Jonathan accepted the V2 Riffin and Ringlet corrections. Their accepted source pins now point to V2, and the deterministic full-library build reproduces both characters from those pins.
- Added a non-destructive `zoo:stage-app-art -- --ids <characters>` step that copies only accepted habitat, companion, and sticker outputs into version-controlled public character folders and refuses unknown or unaccepted IDs.
- Added Riffin and Ringlet to one app-local registry with explicit 32px roaming, 64px companion, and three 768px sticker assets, accessible descriptions, and response-only practice lines.
- The mock-isolated Student review exposes both characters in the Caretaker Cabin, Zoo Commons, floating companion, postbox, and Sticker Book. The live student adapter continues to expose only already-owned Riffin; Ringlet is not granted, unlocked, or persisted by this slice.
- Existing XP, streak, completion, pet growth, collection, ownership, assignment, and Supabase paths remain unchanged. No migration was applied and no production record was read or written.
- Browser review confirmed Ringlet selection, roaming presentation, 64px companion presentation, post-work response, and three sticker pages. Phone and desktop checks found no page-level horizontal overflow.
- No push, merge, deployment, or production unlock decision is included in this handoff.

## Complete Musical Zoo cast isolated integration (2026-09-07)

- Jonathan approved moving the complete accepted cast into the app for local review: Riffin, Boppo, Chordillo, Ringlet, Brumbo, Plinka, Puffino, Cymbi, and Spirlo.
- Expanded the single app-local character registry in accepted manifest order. Every entry carries its pinned source versions, 32px roaming sprite, 64px companion portrait, three 768px stickers, accessible descriptions, musical role, practice virtue, habitat greetings, and response-only practice lines.
- Staged all 45 accepted app assets through the deterministic `zoo:stage-app-art` boundary. SHA-256 comparison confirms every public file matches its manifest-pinned build output.
- The mock-isolated Student review now exposes all nine characters in the Caretaker companion picker, Zoo Commons, floating companion, owned-habitat arrangers, habitat greetings, postbox, and a 27-page Sticker Book.
- Live student ownership remains unchanged. The production-facing adapter continues to expose Riffin plus already-owned Founding Friends only, and a regression test rejects every additional registered review character from restored live residency preferences.
- No XP, streak, completion, pet growth, collection, ownership, assignment, Supabase, or authentication path changed. No migration, push, merge, deployment, or production unlock was performed.

## Historical Rainbow Heart 1.0 student identity pilot (2026-09-05)

- Applied the accepted Rainbow Heart Standard expression with the Craft register only to the mock-isolated `?review=student` surface.
- Preserved Scaffold structure and behavior while adopting the canonical Atkinson Hyperlegible interface face, Georgia focal display face, Space Mono measurement face, 12px surfaces, 10px controls, and named pills.
- Added one bounded hard-edge Craft spectrum band as the single identity focal moment in the student viewport.
- Reworked student practice surfaces around warm paper, quiet washes, strong structural rules, and violet interactive affordances without using decorative shadows.
- Added the Riffin Companion V3 review sheet to the floating companion. Its neutral, practice-response, and completion poses are selected from the same transparent source sheet without changing practice behavior.
- Copied the canonical Rainbow Heart brand-kit stylesheet, six font files, and both font licenses into the local app; all copied assets match their canonical SHA-256 hashes.
- Removed the mock student dashboard's fixed inner scroll region so an expanded Musical Zoo uses one normal page scrollbar. The phone header now keeps its wrapped title above the Craft band instead of allowing it to overlap.
- Reworked the Musical Zoo as one visible place at a time: the compact Commons remains the default, while a selected habitat or collection destination replaces the Commons and map instead of stacking beneath them.
- Kept destination components mounted while hidden so habitat arrangement and collection state survive trips back to the Zoo map.
- At phone widths, the active destination now breaks out to the full content width and living habitat maps grow to a viewport-scaled play field without introducing a second vertical scrollbar.
- Removed unavailable Zoo destinations and scenery from the student interface. Locked Riverbank and Rainbow Note Garden cards, unlock progress meters, missing-place denominators, and advance teasers no longer appear.
- New Zoo content now arrives through ordinary reveal: after the mock practice event, Riverbank appears on the map and the Rainbow Note Garden appears in the student’s scenery collection without a prior silhouette or countdown.
- Recorded grace-first calendar arrivals as a proposal rather than implementing a production calendar dependency. The proposal allows timely Studio surprises while rejecting permanent missed-item holes or loss of already discovered content.
- Rebuilt the Musical Zoo map as a cozy top-down pixel world for local review. Available destinations now appear as little buildings and signboards connected by tile paths, a river, a bridge, trees, flowers, and the central Commons rather than as a conventional dashboard grid.
- Carried the same environmental language into the Commons, Melody Meadow, and Rhythm Riverbank with stepped creature movement, purposeful walking animation, game-like world labels, and responsive full-width trail navigation on phones. The visual direction is app-specific and remains proposed rather than becoming a canonical Rainbow Heart illustration system.
- Left teacher, parent, authentication, production data, Supabase authorization, migrations, deployment, and the production app unchanged.

## Teacher Badge Studio local prototype (2026-09-07)

- Added `Badge Studio` as a global Teacher Workspace destination in the mock-isolated review. It is intentionally separate from a selected student's Lesson, Assignments, Progress, and Family tabs so a teacher can recognize more than one student in one deliberate flow.
- Teachers can choose one or more fixture students, start from five strength-based celebration templates, edit the student-facing title and message, choose any of the nine accepted Musical Zoo friends, and preview the result before a separate confirmation step.
- The language recognizes attempts, persistence, listening, curiosity, and collaboration without streaks, rankings, locked rewards, or automatic performance judgments.
- The successful review state explicitly says that no physical order was placed. Refreshing the fixture clears it. The live Teacher Workspace does not supply the Badge Studio renderer, so no production student record can see or receive a custom award from this slice.
- Existing metric-driven badge records remain unchanged. A live teacher-created badge needs a separately reviewed catalog/award schema, teacher-scoped RLS, revocation/audit behavior, student/guardian presentation, and migration testing rather than overloading the current hard-coded `badge_id` table.
- Added `character-design/physical-production/PHYSICAL_REWARDS_BRIEF.md`. It recommends sampling a 3-inch iron-on or sew-on Printful patch before building commerce. Its guardian-owned fulfillment shape keeps a child's name and address out of the teacher workspace.
- Pinback buttons remain an adult/family display option, not the child-wearable default: the current products use a steel safety-pin backing and Printful's listing carries an adult age restriction.
- Plush is feasible as a separate product lane. The brief compares a 200-supporter Makeship campaign, a 50-unit Budsies batch, and a later 500-unit wholesale route, and records the prototype, labeling, testing, certification, tracking, and importer responsibilities that must be resolved before selling a child-directed toy.
- No Supabase table, auth rule, migration, live badge, child profile, guardian address, vendor account, payment, order, push, merge, or deployment changed.

## Live teacher workflow completion (2026-09-07)

- The real local Teacher Workspace now exposes the accepted global Badge Studio, pending family reschedule requests, read-only parent preview, and assignment reassign/repertoire/remove actions.
- Assignment lifecycle actions call the transactional `resolve_practice_assignment` function from migration `017`; removal and reassign language explicitly preserves earlier completion history.
- Migration `021_teacher_badge_awards.sql` adds teacher-created digital celebrations beside, rather than inside or instead of, the existing automatic `student_badges` ledger. Teacher, student, and parent reads are relationship-scoped by RLS; anonymous access is revoked.
- A physical format is planning metadata only. The database constrains `order_status` to `not-requested`, the app never collects an address, and no vendor path exists.
- Student and parent badge showcases can read the teacher-created celebration after migration `021`; a missing table degrades to the established automatic badge experience until the release set is approved.
- These changes are local implementation evidence only. The migration has not been applied, no real badge has been awarded, and no push or deployment occurred.

## Known incomplete areas

- Component CSS still contains legacy hard-coded colors, shadows, pills, and font declarations.
- Emoji used in controls and navigation require a plain-language/semantic review.
- Category colors embedded in JavaScript need structural cues before neutralization.
- The teacher HUD has fixed-window assumptions needing responsive review.
- No blocking Scaffold implementation work remains. A human visual/read-aloud spot check is recommended during Jonathan's acceptance review.
- Full manual keyboard traversal, true 200% browser zoom, reduced-motion operating-system review, and assistive-technology review remain incomplete. Native control semantics and focus styles are present, but the browser controller did not activate controls through its synthetic keyboard command during this pass.
- Migrations `016_invite_only_teachers.sql` through `021_teacher_badge_awards.sql` passed the isolated local Supabase rehearsal, privacy-preserving fingerprints, both SQL verifiers, and teacher/parent/student RLS checks on 2026-09-09. They have not been applied to production.
- The live Studio home now exposes the existing recurring lesson schedule locally. A trusted external performance source is still not connected.
- Publishing an approved suggestion uses the existing assignment creation path and then marks the private draft as published. A later database transaction could make that cross-table handoff fully atomic.
- All nine accepted Musical Zoo characters are wired into the app-local registry and mock-isolated review. Character-specific habitat walk cycles, companion reaction animation frames, optional eggs, and full voice packs remain future integration gates.
- The eight post-starter characters remain review-only. A separate product decision is still required for their grace-first arrival, ownership, and cross-device persistence behavior; the current live adapter deliberately filters them out unless that decision is implemented.
- Teacher-created badges are implemented locally with additive schema and RLS, but isolated-database tests remain incomplete. Award revocation/audit policy and notification choices remain deliberately deferred; the initial live flow is append-only.
- Physical rewards still need a sampled vendor template, final cost/shipping review, guardian opt-in and address handoff, artwork approval, and a documented consumer-product compliance owner. No vendor has been contacted.
- Full manual keyboard traversal, true 200% browser zoom, reduced-motion operating-system review, and assistive-technology review remain release gates for Badge Studio as well as the wider app.
- Non-breaking dependency remediation reduced `npm audit` from 20 high findings to 14. The remaining findings are transitive dependencies of the Create React App 5 build/test toolchain; npm's proposed force fix replaces `react-scripts` with an invalid/breaking version, so a deliberate toolchain migration remains a release-hardening task.

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
| 2026-08-16 | Dialog keyboard behavior | Interactive practice-detail fixture | Pass; focus enters Close, wraps to last/first, Escape closes, and trigger regains focus |
| 2026-08-16 | Screen-reader structure | Semantic snapshots for five review targets | Pass; controls named; primary landmarks and selected states exposed |
| 2026-08-22 | Teacher auth boundary | Source audit plus mock-isolated localhost review | Public signup removed; missing or metadata-only teacher roles are rejected; database hardening migration prepared but not applied |
| 2026-08-22 | Account switching | Production build and shared-handler source verification | Parent, student, and teacher actions call one local-session sign-out path and return to role selection |
| 2026-09-05 | Rainbow Heart student pilot | `npm run test -- --watchAll=false --runInBand` | Pass; 12 suites and 45 tests |
| 2026-09-05 | Rainbow Heart student pilot | Production build | Pass; only the existing Node `fs.F_OK` deprecation warning |
| 2026-09-05 | Rainbow Heart student pilot | 390×844, 768×1024, 1024×768, and 1440×900 mock-isolated browser checks | Pass; no page-level horizontal overflow, clipped primary heading, or visible controls below 48×48 CSS pixels |
| 2026-09-05 | Rainbow Heart student pilot | 640px layout equivalent of 200% zoom on a 1280px viewport | Pass for layout; true browser zoom remains a separate manual check |
| 2026-09-05 | Rainbow Heart student pilot | Companion neutral, practice-response, and completion states | Pass; illustrated sheet resolves to 0%, 50%, and 100% horizontal positions with live response copy |
| 2026-09-05 | Rainbow Heart OS | Canonical system, brand-kit, and connected-app validation | Pass against OS 0.4.0 and Style Guide 1.0.0 |
| 2026-09-05 | Expanded Musical Zoo scroll repair | Expanded-Zoo browser review at 390×844, 768×1024, 1024×768, 1440×900, and 640px zoom-equivalent width | Pass; one page scrollbar, no nested vertical scroller, no horizontal overflow, no undersized visible controls, and the wrapped phone title stays inside its header |
| 2026-09-05 | One-place Musical Zoo navigation | Selected-destination review at 390×844, 768×1024, 1024×768, and 1440×900 | Pass; Commons and map are replaced by exactly one destination, return-to-map restores Commons, Meadow state survives travel, phone habitat is full-bleed with a 574px play field, no horizontal overflow, one page scrollbar, and no visible control below 48×48 CSS pixels |
| 2026-09-05 | One-place Musical Zoo navigation | Test suite, production build, Rainbow Heart OS 0.4.0, and connected-app validation | Pass; 12 suites and 45 tests, optimized build, canonical system/brand-kit checks, and connected-app contract |
| 2026-09-05 | Calm Zoo discovery | Initial and post-practice browser scenarios | Pass; initial map shows four available places and Meadow shows two owned scenery pieces with no locked cards, progress meters, denominators, countdowns, or advance teasers; after one mock practice completion, Riverbank and Rainbow Note Garden appear naturally |
| 2026-09-05 | Calm Zoo discovery | 390×844, 768×1024, 1024×768, and 1440×900 plus test/build checks | Pass; no horizontal overflow, one body scrollbar, no visible control below 48×48 CSS pixels, 12 suites/45 tests, and optimized build |
| 2026-09-05 | Cozy pixel-world Zoo | Four reference viewports plus interactive travel, roaming, greeting, test, build, and Rainbow Heart OS 0.5.0 checks | Pass for local visual review; four available destinations remain pressure-free at every viewport, Riffin advances between route frames, tap-to-greet and return-to-map work, 12 suites/45 tests pass, and the optimized build succeeds. Full keyboard and true 200% zoom review remain separate. |
| 2026-09-06 | Lesson Memory data foundation | `npm test -- --watchAll=false --runInBand` | Pass; 17 suites and 61 tests, including note normalization and migration privacy invariants. |
| 2026-09-06 | Lesson Memory data foundation | Production build | Pass; only the existing Node `fs.F_OK` deprecation warning. |
| 2026-09-06 | Unified Teacher Workspace | Mock-isolated roster → Sam → note → wrap → approve → Assignments flow | Pass; deterministic local fixture only, no Supabase reads or writes, and no browser console errors. |
| 2026-09-06 | Unified Teacher Workspace | 390×844 assignment workspace | Pass after increasing Back and assignment action targets to 48px; no horizontal overflow and no visible control below 48×48 CSS pixels. |
| 2026-09-06 | Rainbow Heart OS | Canonical validation and connected-app metadata validation | Pass against OS 0.6.0; recorded the then-current Rainbow Heart 1.0 student pilot as a legacy slice pending an explicit migration request. |
| 2026-09-06 | Rainbow Heart 2.0 identity expansion | Canonical asset parity | Pass; Brand Kit 2.0 CSS, tokens, Inter, Fraunces, Space Mono, and owner mark copies match the canonical hashes. |
| 2026-09-06 | Rainbow Heart 2.0 identity expansion | Student, Teacher workspace, Parent, and Family setup at 390×844, 768×1024, 1024×768, and 1440×900 | Pass; computed Inter/Fraunces roles and exact Logo Spectrum render, primary headings remain contained, no page-level horizontal overflow occurs, and visible non-choice controls meet the 48px target contract. |
| 2026-09-06 | Rainbow Heart 2.0 identity expansion | Parent and Family setup checkbox rows | Pass; combined labeled targets measure 283×54px and 313×90px at phone width. |
| 2026-09-06 | Rainbow Heart 2.0 identity expansion | 640px layout equivalent | Pass for all four surfaces with no horizontal overflow; true 200% browser zoom remains manual. |
| 2026-09-06 | Rainbow Heart 2.0 identity expansion | Test suite and optimized build | Pass; 17 suites and 61 tests, plus a successful production build with only the existing Node `fs.F_OK` deprecation warning. |
| 2026-09-06 | Rainbow Heart 2.0 identity expansion | Canonical Rainbow Heart OS and connected-app validation | Pass against OS 0.6.0, Style Guide 2.0.0, and Brand Kit 2.0.0. |
| 2026-09-06 | Local workflow completion | Full test suite, optimized build, and diff check | Pass; 22 suites and 77 tests, a clean production build, and no whitespace errors. |
| 2026-09-06 | Character library proposal | Reproducible asset build and independent validation | Pass; six unique 64×64 SVG/PNG companions, exact four-color palettes, binary transparency, six 512×512 previews, one 1728×1728 comparison board, and seven parsed JSON files. No app source is changed or tested by this isolated asset gate. |
| 2026-09-06 | Chordillo-aligned companion proposal | Reproducible cutout and review-board build | Pass; eight detailed concept masters preserved, eight alpha-channel cutouts generated, and one 1728×1800 nine-character comparison board rendered. No app source, production data, registry, migration, deployment, or canonical OS illustration setting changed. |
| 2026-09-07 | Musical Zoo three-format art | Reproducible native, sticker, and review-board builds plus independent asset validation | Pass; 9 unique 32×32 alpha habitat sprites, 9 unique 64×64 alpha companions, 27 unique 768×768 alpha stickers with transparent corners, and 2 review boards. No app source, registry, data, migration, push, deployment, or canonical OS illustration setting changed. |
| 2026-09-07 | Musical Zoo anatomy corrections | Puffino, Cymbi, Spirlo, and Plinka visual QA plus full three-format rebuild | Pass; Puffino's accordion is torso-mounted, Cymbi's cymbals are dorsal, Spirlo has one stalk-tip eye pair, Plinka's playable tines are her spines, all 45 deliverables revalidate, and the remaining sticker sets stay clean. |
| 2026-09-07 | Musical Zoo character workflow | Manifest-pinned full rebuild, package validator, and no-overwrite scaffolder dry run | Pass; exact accepted source versions rebuilt 9 habitat residents, 9 companions, 27 stickers, and 2 review boards; valid test character dry run proposed five files and wrote none. |
| 2026-09-07 | Musical Zoo character skill | Skill Creator quick validation in UTF-8 mode | Pass; `$musical-zoo-character-creator` is installed with valid metadata plus character-contract, prompt-pattern, and integration-boundary references. |
| 2026-09-07 | Riffin + Ringlet correction candidates | Candidate-only build, native-size visual QA, and package validation | Pass; 2 habitat sprites, 2 companions, 6 stickers, and 2 review boards validate without changing accepted source pins or app integration. |
| 2026-09-07 | Riffin + Ringlet accepted art | Manifest-pinned full rebuild and accepted-package validation | Pass; V2 pins reproduce the accepted 32px habitat, 64px companion, and six 768px sticker assets. |
| 2026-09-07 | Riffin + Ringlet isolated app integration | Focused tests, full suite, optimized build, and rendered Student review | Pass; 5 suites/19 tests focused, 22 suites/81 tests full, successful optimized build, Ringlet selection/roaming/response/stickers verified, and no horizontal overflow at 390×844 or 1440×900. Live Ringlet ownership remains intentionally unchanged. |
| 2026-09-07 | Character asset staging and governance | Source/public SHA-256 parity, diff check, canonical OS, and connected-app validation | Pass; all ten staged Riffin/Ringlet assets match their accepted build outputs, no whitespace errors, and metadata validates against Rainbow Heart OS 0.7.0. |
| 2026-09-07 | Complete Musical Zoo cast isolated integration | Focused/full tests, optimized build, art/OS validation, asset parity, and rendered Student review | Pass; 5 focused suites/23 tests, 22 full suites/85 tests, successful optimized build, Rainbow Heart OS 0.7.0 plus connected-app validation, 9 habitat sprites, 9 companions, 27 stickers, and 45/45 staged assets verified. All nine companion choices, habitat placement/greeting, response-only practice behavior, and the 27-page Sticker Book were exercised with no horizontal overflow at 390×844, 768×1024, 1024×768, or 1440×900. Live post-starter ownership remains intentionally unchanged. |
| 2026-09-07 | Teacher Badge Studio local prototype | Multi-recipient compose → physical-plan choice → review → confirm interaction | Pass in `mock-isolated`; Alexandria and Sam receive only a local review result, all nine character choices resolve, and the interface confirms that no physical order was placed. |
| 2026-09-07 | Teacher Badge Studio responsive review | 390×844, 768×1024, 1024×768, and 1440×900 | Pass; no page-level horizontal overflow, broken character images, or tested visible targets below 48×48 CSS pixels. |
| 2026-09-07 | Teacher Badge Studio automated/system gate | Full test suite, optimized build, diff check, canonical OS, and connected-app validation | Pass; 23 suites/90 tests, successful optimized build with only the existing Node `fs.F_OK` deprecation warning, no whitespace errors, and Rainbow Heart OS 0.7.0 plus connected-app metadata validation. |
| 2026-09-07 | Local release-readiness integration | Ordered migration checks, live Teacher wiring tests, full suite, art validation, optimized build, and non-breaking dependency remediation | Pass locally; migrations `016`–`021` validate statically, 27 suites/106 tests pass, 9 habitat sprites/9 companions/27 stickers/2 boards validate, and the optimized build compiles without lint warnings. Audit improves from 20 to 14 high transitive findings; isolated database and manual accessibility gates remain open. |
| 2026-09-09 | Isolated Supabase release rehearsal | Sanitized schema restore, migrations `016`–`021`, before/after fingerprints, SQL verifiers, real-role RLS matrix, authenticated workflows, responsive checks, full validation, and Rainbow Heart OS validation | Pass; all protected ledgers retain their counts, all non-profile ledgers match exactly, expected migration-019 profile shape changes are isolated, role boundaries pass, 28 suites/108 tests and build pass. See `RELEASE_REHEARSAL_2026-09-09.md`. Manual keyboard/true zoom/reduced-motion/assistive-tech and production authorization remain open. |
| 2026-09-09 | Local visual acceptance and accessibility companion pass | Jonathan visual review plus mock-isolated 640px semantic/target scan and operating-environment reduced-motion execution | Visual acceptance passed. All four surfaces have no overflow, unnamed controls, duplicate IDs, or sub-48px effective targets; Student/Zoo has no active animation under the live reduced-motion preference. Keyboard, true 200% zoom, and screen-reader listening remain hands-on. |

## Deferred maintenance findings

- Create React App and several transitive packages are deprecated.
- The existing bundle is about 828 kB gzipped and would benefit from later code splitting.
- Existing ESLint warnings cover unused values, hook dependency arrays, and a BOM in `src/index.js`.

These are recorded but intentionally not mixed into the Scaffold migration unless they block review.

## Next action

Jonathan completes the three remaining hands-on steps in `MANUAL_ACCESSIBILITY_ACCEPTANCE.md`: keyboard traversal, true 200% browser zoom, and screen-reader listening. Then name the production backup/rollback owner and decide how the Create React App dependency findings affect the release timetable. Physical sampling remains a separate purchase requiring approval; do not contact a vendor, purchase, migrate production, push, or deploy from this handoff without separate explicit authorization.

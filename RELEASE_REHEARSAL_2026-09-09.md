# Isolated release rehearsal — 2026-09-09

**App:** Heart Beats Practice App  
**Branch:** `codex/practice-scaffold-sandbox`  
**Environment:** Disposable local Supabase/Docker stack  
**Result:** Database, authorization, workflow, responsive, test, build, artwork, governance, and manual accessibility gates passed. Production authorization remains open.

## Safety boundary

- The linked hosted Supabase project was read only for a schema-only export. No table rows were exported, and no hosted migration or write was performed.
- The export contained 52 public tables and no `COPY` or `INSERT` row statements. Two notification-address literals were replaced with `staging-notifications@example.invalid` before restore.
- Sanitized schema SHA-256: `BAFE4997B896083CA859FCC82FC2701D6760006B93831D4C40FF1D86C9F00EDF`.
- All acceptance data and identities were synthetic. Credentials remain outside the repository.
- The app was pointed at the local isolated stack with review mode off, so real authentication and RLS were exercised. The persistent banner reported `Local isolated staging / Data: isolated-sanitized / Not approved for deployment`.

## Migration and preservation evidence

The local database was reset before the successful rehearsal. The required `vector` extension was enabled, the sanitized schema was restored, and migrations `016`–`021` were applied one at a time with stop-on-error behavior.

Both SQL verifiers passed. The release verifier itself exposed an ambiguous PL/pgSQL loop variable; the source was corrected to use `release_table_name` and then passed inside its rollback-only verification transaction.

| Protected ledger | Before | After | Result |
|---|---:|---:|---|
| users | 2 / `c969e28da701c3d4030adb63fa245874` | 2 / `c969e28da701c3d4030adb63fa245874` | Exact match |
| students | 1 / `040d3180f9b92895e277e1578767f029` | 1 / `2bf582e9e9453e10d9c13957714ee69b` | Count preserved; expected profile-column shape change in migration 019 |
| families | 1 / `590b753bfae2e3c8461e2dbc671b2297` | 1 / `590b753bfae2e3c8461e2dbc671b2297` | Exact match |
| parent_students | 1 / `cc6bce339dd3c6a7a2cc76061f7964a2` | 1 / `8fb758b6b8f0afa47050310c2b5ffb6b` | Count preserved; expected guardian-profile column shape change in migration 019 |
| assignments | 1 / `4daae65783f4949fee30a1fbcb9fe825` | 1 / `4daae65783f4949fee30a1fbcb9fe825` | Exact match |
| practice_steps | 1 / `eb1341f541836c911f5026f4f2abd1cb` | 1 / `eb1341f541836c911f5026f4f2abd1cb` | Exact match |
| completions | 1 / `cc0977003d1fdf81865a48e8eef7d31a` | 1 / `cc0977003d1fdf81865a48e8eef7d31a` | Exact match |
| daily_practice_status | 1 / `be3536de2b15a867596792f8456e3e86` | 1 / `be3536de2b15a867596792f8456e3e86` | Exact match |
| repertoire | 1 / `6ddcfe1d6d9c1b7d9d3f96fde2c6d66b` | 1 / `6ddcfe1d6d9c1b7d9d3f96fde2c6d66b` | Exact match |
| student_badges | 1 / `b8a03ba7703a262acf438548c32df244` | 1 / `b8a03ba7703a262acf438548c32df244` | Exact match |
| pets | 1 / `387b7c199fd26a1f3fa6375f38c64fd0` | 1 / `387b7c199fd26a1f3fa6375f38c64fd0` | Exact match |
| pet_creatures | 1 / `3c7c26fc3369352b2252d69d913f3a1c` | 1 / `3c7c26fc3369352b2252d69d913f3a1c` | Exact match |
| reschedule_requests | 1 / `4a579de30dc5b7d4ce3ed17e2b2af981` | 1 / `4a579de30dc5b7d4ce3ed17e2b2af981` | Exact match |

The live schema's new-user trigger automatically created a pet. The synthetic seed was corrected to update that row instead of inserting a duplicate; no production behavior was changed.

## Real-role authorization matrix

Synthetic primary identities:

- Teacher: `2de21d56-b386-48e1-9fec-6fc71acf9c7a`
- Parent: `eeb5f55b-dd16-48b0-93b6-bdb4081e1ad2`
- Student: `86415a62-5cd8-4521-bbf8-bc284f26b00e`

| Check | Result |
|---|---|
| Anonymous access to lesson sessions, lesson notes, assignment drafts, family guardians, Zoo preferences, and teacher badge awards | Hidden/unaddressable (`404`) |
| Teacher creates lesson, note, assignment draft, and badge award for own student | Passed (`200`/`201`) |
| Parent manages own guardian record | Passed (`201`) |
| Student saves own Zoo preference | Passed (`201`) |
| Teacher reads own family guardian and Zoo preference | Passed |
| Parent cannot read Zoo preference | Passed (zero rows) |
| Student and parent can read the awarded badge | Passed |
| Student and parent cannot read private lesson data | Passed (zero rows) |
| Teacher and student cross-family writes | Rejected (`403`) |
| Parent cross-family read | Passed (zero rows) |
| Public auth signup followed by teacher-profile insert | Auth account allowed; teacher profile rejected (`403`) |

## Authenticated workflow evidence

- Teacher: signed in, loaded only the assigned roster, opened the student workspace, approved a private lesson draft, preserved structured step titles/descriptions in the assignment form, published the assignment, reassigned one active assignment through the UI, archived another through the same authenticated RPC used by the confirmed UI action, retained its completion row, and awarded a digital badge. No physical order path ran.
- Parent: signed in, saw only the linked family, both active assignments, completion history, repertoire, requests, and the teacher-awarded badge. Private lesson notes were absent.
- Student: signed in, completed the remaining practice step, reached today's complete state, opened the Musical Zoo, selected the existing pet as companion, signed out and back in, and confirmed the preference persisted.
- The teacher workspace initially crashed when a draft contained `{title, description}` step objects. The shared normalizer, teacher adapter, form, fixture, and tests now support both legacy strings and structured steps.

## Responsive and automated evidence

- Authenticated Student: 390×844, 768×1024, 1024×768, and 1440×900; no horizontal overflow and no visible non-choice control below 24×24.
- Authenticated Teacher, Parent, and Family setup: 390×844, 768×1024, and 1440×900; no horizontal overflow. The parent checkbox's 13px native input remains inside a 48px labeled row.
- Visible focus: the tested Musical Zoo control received the canonical 3px focus outline. A complete physical Tab traversal was not possible through the controller and remains manual.
- `npm run release:validate`: migration ordering passed, all 45 staged Zoo assets and two boards validated, 28 suites / 108 tests passed, and the optimized build compiled successfully.
- Rainbow Heart OS 0.7.0, Brand Kit 2.0.0, Scaffold Foundation Kit 1.0.1, Spotlight 1.0.0, Prism 1.0.0, and connected-app metadata validation passed.
- `git diff --check` passed.
- `npm audit --omit=dev` reports 32 transitive findings: 9 low, 9 moderate, 14 high, 0 critical. They sit in the Create React App-era dependency tree and require a deliberate toolchain migration rather than an unsafe force-fix.

## Remaining release gates

1. Jonathan's review of the guarded production runbook, including named backup/rollback ownership.
2. A deliberate acceptance or timetable decision for the Create React App dependency findings.
3. Separate explicit authorization for production backup, migrations, push, deployment, and live smoke testing.

The local rehearsal stack may be discarded and recreated. This file contains no passwords, production row data, student names, birthdays, notes, contact details, transcript content, or service keys.

## Post-rehearsal acceptance update

Jonathan visually accepted the local redesign on 2026-09-09. A subsequent mock-isolated companion scan found no horizontal overflow, unnamed visible controls, duplicate IDs, or sub-48px effective targets across Student, Teacher, Parent, and Family setup at the 640px reflow width. The operating environment reported reduced-motion preference and the rendered Student/Zoo surface retained no active animations; transition and animation durations collapsed to 0.01 ms.

Jonathan subsequently confirmed the completed physical keyboard traversal, true 200% browser zoom, and screen-reader listen-through on 2026-09-09. Together with the rendered reduced-motion result, all four checks in `MANUAL_ACCESSIBILITY_ACCEPTANCE.md` passed. Production authorization remains separate.

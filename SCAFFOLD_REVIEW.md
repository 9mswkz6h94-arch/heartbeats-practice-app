# Scaffold Review Matrix

**Project:** `proj-004`
**Design-system version:** `0.7.0`
**Review data mode:** `mock-isolated`
**Last updated:** 2026-09-06

**Status values:** Not started · In progress · Pass · Fail · Blocked · Not applicable

Static inspection is not a pass. Record concrete evidence for every pass.

| Area | Phone | Tablet portrait | Tablet landscape | Desktop | Keyboard | 200% zoom | Long content | Reduced motion | Status / evidence |
|---|---|---|---|---|---|---|---|---|---|
| Entry selection | Pass | Pass | Pass | Pass | Pass | — | — | Pass | Native role buttons, global 3px focus treatment; no overflow at 390/768/1024/1440px |
| Teacher login | Pass | — | — | — | Pass | — | — | Pass | Labeled native fields/buttons; 48–52px controls; global focus treatment |
| Student/kid login | Pass | — | — | — | Pass | — | — | Pass | Labeled family code and PIN controls; no overlap or horizontal overflow |
| Parent login/signup | Pass | — | — | — | Pass | — | — | Pass | Labeled native form controls; onboarding semantic snapshot names every control |
| Teacher HUD/nav | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Named native nav buttons; no overflow at reference or zoom-equivalent widths |
| Lesson prep | Pass | Pass | Pass | Pass | Pass | — | Pass | Pass | Triage cards are native buttons; long-name fixture has no overflow or clipping |
| Student practice list | Pass | — | — | Pass | Pass | Pass | Pass | Pass | Native card buttons; long-content fixture at 390/640/1440px has no overflow |
| Practice detail | Pass | — | — | — | Pass | — | Pass | Pass | Focus enters dialog, wraps both directions, Escape closes, and focus restores; visible 3px ring |
| Sight reading | Pass | — | — | Pass | Pass | — | Pass | Pass | Named native controls; notation scrolls locally without page overflow |
| Pets and badges | Pass | — | — | Pass | Pass | — | Pass | Pass | Plain-language controls; badge descriptions visible; controls ≥48px |
| Parent dashboard | Pass | — | — | Pass | Pass | Pass | Pass | Pass | Named switcher/actions; semantic snapshot confirms selected state and landmarks |
| Family onboarding | Pass | — | — | — | Pass | — | Pass | Pass | Semantic snapshot names all fields/avatar buttons; controls 52–55px |
| Messaging/scheduling | Pass | — | — | Pass | Pass | — | Pass | Pass | Checkbox, phone, reschedule fields, composer, and actions have accessible names |
| Teacher admin/requests | Pass | — | Pass | Pass | Pass | Pass | Pass | Pass | Named request/assignment controls; no overflow/clipping at 390/640/1440px |

## Global contract checks

- [x] Every tested interactive target is at least 48 CSS pixels high; full pointer-target width exceptions rely on a containing label.
- [x] Global 3px focus ring is visible; dialog focus is contained and restored without clipping.
- [x] Tested state fixtures pair color with labels, borders, position, or status text.
- [x] No horizontal page scrolling in tested fixtures at reference and zoom-equivalent widths.
- [x] Migrated loading, empty, error, and recovery states are explicit; fetch failures name the activity and offer retry where applicable.
- [x] Material destructive student removal is separated and confirmed; draft-only removal controls remain immediate.
- [x] Migrated surfaces use interface, display, or measurement roles only.
- [x] Production data and authorization boundaries are unchanged by the Scaffold commits.
- [x] Sandbox banner accurately identifies the active data mode (`mock-isolated`) and deployment status.

## Rainbow Heart 2.0 multi-workspace identity evidence

This evidence covers the mock-isolated Student, Teacher workspace, Parent, and Family setup review surfaces under D-026. Production remains Scaffold.

| Gate | Status | Evidence | Environment | Follow-up |
|---|---|---|---|---|
| Canonical identity assets | Passed | Imported Brand Kit 2.0 CSS/tokens plus Inter, Fraunces, Space Mono, and the owner raster mark; checked copied CSS, token, font, and mark hashes against the canonical kit | Local source | Keep app snapshot aligned when the canonical kit versions |
| Typography roles | Passed | Computed review roots use Inter; page-level `h1` display moments use Fraunces; measured counts, codes, dates, and sequence retain Space Mono | In-app browser, `mock-isolated` | Recheck any new dense workspace component |
| Logo Spectrum boundary | Passed | Exactly one themed root and one exact six-stop Logo Spectrum band render on each tested surface; review-tool chrome remains outside the identity boundary | In-app browser, `mock-isolated` | Keep individual spectrum stops out of categories and states |
| Phone 390×844 | Passed | All four surfaces have zero body-level horizontal overflow and unclipped primary headings | In-app browser, `mock-isolated` | Jonathan visual review |
| Tablet portrait 768×1024 | Passed | All four surfaces have zero body-level horizontal overflow and unclipped primary headings | In-app browser, `mock-isolated` | Jonathan visual review |
| Tablet landscape 1024×768 | Passed | All four surfaces have zero body-level horizontal overflow and unclipped primary headings | In-app browser, `mock-isolated` | Jonathan visual review |
| Desktop 1440×900 | Passed | All four surfaces have zero body-level horizontal overflow and unclipped primary headings | In-app browser, `mock-isolated` | Jonathan visual review |
| Minimum 48×48 touch targets | Passed | No visible button, link, text input, select, or textarea measured below 48px in either dimension; parent and family checkbox rows provide 283×54px and 313×90px combined label targets | In-app browser, `mock-isolated` | Recheck if controls change |
| 200% text zoom | Not tested | All four surfaces pass the 640px layout equivalent with zero horizontal overflow; true browser zoom was not available in the controller | In-app browser, `mock-isolated` | Run true 200% browser-zoom review before production approval |
| Keyboard-only workflow | Not tested | Native controls and prior focus-management behavior remain in place, but a complete manual Tab traversal was not repeated for this identity slice | Local app | Complete before production approval |
| Visible focus | Static review only | Canonical Brand Kit 2.0 supplies the 3px focus token and scoped `:focus-visible` treatment | Local source | Confirm manually before production approval |
| Reduced motion | Static review only | Canonical Brand Kit 2.0 removes effective transition and animation duration under `prefers-reduced-motion` | Local source | Confirm with the operating-system preference before production approval |
| Safe review boundary | Passed | Each route retains the visible `mock-isolated` banner and deterministic fixture; identity wrappers do not change behavior, data access, auth, or privacy | Local source and browser | Keep production Scaffold until separately approved |
| Test/build/system validation | Passed | 17 suites / 61 tests, optimized production build, canonical OS 0.6 validation, Brand Kit 2.0 validation, and connected-app metadata validation all pass | Project and canonical OS terminals | Re-run after material identity changes |

## Rainbow Heart 2.0 local application adoption evidence

This evidence covers D-027: identity wiring around the real local application without changing persistence or deploying it.

| Gate | Status | Evidence | Environment | Follow-up |
|---|---|---|---|---|
| Student data preservation | Passed for identity checkpoint | Pre/post SHA-256 hashes matched exactly during D-027. D-028 later changed companion event and reporting adapters while retaining the existing completion, daily-status, badge, pet-XP, collection, and Supabase write paths | Local source and automated tests | Run authenticated regression against an isolated clone before release |
| Real shell identity wiring | Passed | Entry, loading, authentication, Student, Teacher workspace, Parent, and Family setup now inherit one canonical Rainbow Heart Standard application boundary | Local source and optimized build | Review with authenticated test accounts only in an isolated data environment |
| Safe interactive regression | Passed | All four mock-isolated workspaces pass 390×844 and 1440×900 checks with one themed root, Inter interface roles, Fraunces focal headings, no page horizontal overflow, and no undersized visible controls | In-app browser, `mock-isolated` | Repeat reference matrix after material component changes |
| Automated regression | Superseded by D-028 evidence | The identity checkpoint passed 17 suites / 61 tests; the expanded completion pass is recorded below | Local terminal | Re-run before release |
| Production boundary | Passed | No migration, data write, auth change, push, merge, or deployment performed; `production` remains `scaffold` in the app profile | Local governance and git state | Separate explicit authorization required |

## Local workflow completion evidence

This evidence covers D-028 and remains local-only pending Jonathan’s review.

| Gate | Status | Evidence | Environment | Follow-up |
|---|---|---|---|---|
| Real Student Zoo integration | Passed in source/build | Student dashboard owns the Zoo; existing PetWidget and PetCollection render only inside Caretaker Cabin; completion/skip events drive the response-only companion | Local app and optimized build | Exercise with an isolated student account after migration review |
| Calm earned-content mapping | Passed | Unit tests verify that only already-earned scenery, habitats, and owned hatched friends render; invalid or unowned saved placements are discarded | 4 automated tests | Review reward thresholds before release |
| Zoo preference separation | Static pass | Migration `020` stores only companion/arrangement JSON, enables RLS, revokes anon, and leaves streak/completion/XP/pet/assignment ledgers untouched; device-local fallback works when the table is absent | Migration source and tests | Apply to isolated Supabase and test student write/teacher read/parent denial |
| Family profile privacy | Static pass | Migration `019` keeps caregiver contacts in an RLS table, revokes anon, permits owning-family management and teacher read, and stores birthday rather than duplicate age | Migration source and tests | Apply to isolated Supabase and test parent/teacher/student denial matrix |
| Teacher fallback | Passed | Missing `assignment_drafts` and `family_guardians` are treated as optional feature absence; the rest of the Teacher Workspace remains available | Unit tests and source | Exercise against isolated pre-migration schema |
| Planning helper boundary | Passed | Suggested questions and answers are deterministic from visible local notes; no network/AI request and no automatic assignment publication | 3 automated tests and interactive mock review | Decide later whether a separately governed AI service is desirable |
| Teacher calendar and data | Passed | Calendar expands from real recurring lesson slots; roster search filters; progress uses seven-day completion counts and real repertoire titles | Unit tests and interactive mock review | Connect a performance source separately if approved |
| Parent review interactions | Passed | Active mock fixture supports child switching, reschedule/cancel, notification preference, and local messaging without Supabase access | In-app browser, `mock-isolated` | Real paths remain covered by their existing components |
| Responsive matrix | Passed | Student, Teacher, Parent, and Family setup at 360, 640, 1024, and 1440px: zero horizontal overflow, duplicate IDs, broken images, unnamed buttons, or enabled controls below 40px | In-app browser, `mock-isolated` | Repeat after material layout changes |
| Manual keyboard / true zoom | Not complete | Controls are native and focus styling remains present, but the controller’s synthetic key activation did not trigger the focused review-navigation button; true 200% browser zoom was unavailable | Local browser/source | Manual keyboard, 200% zoom, reduced motion, and assistive-tech checks remain release gates |
| Automated/system validation | Passed | 22 test suites / 77 tests, clean optimized build, `git diff --check`, Rainbow Heart OS 0.6, Scaffold Kit 1.0.1, Brand Kit 2.0, and connected-app metadata validation | Local terminals | Re-run before any approved push |
| Production boundary | Passed | No migrations applied; no live record write; no push, merge, or deployment | Local governance | Jonathan review and separate authorization required |

## Historical Rainbow Heart 1.0 student identity pilot evidence

This additional evidence covers only the local `?review=student` pilot. The earlier Scaffold matrix remains the foundation record.

| Gate | Status | Evidence | Environment | Follow-up |
|---|---|---|---|---|
| Phone 390×844 | Passed | No page overflow or clipped primary heading; visible controls are at least 48×48 CSS pixels | In-app browser, mock fixture | Human visual spot check |
| Tablet portrait 768×1024 | Passed | No page overflow or clipped primary heading | In-app browser, mock fixture | Human visual spot check |
| Tablet landscape 1024×768 | Passed | No page overflow or clipped primary heading | In-app browser, mock fixture | Human visual spot check |
| Desktop 1440×900 | Passed | No page overflow; Rainbow Heart fonts, geometry, and Craft band render as intended | In-app browser, mock fixture | Human visual approval |
| Keyboard-only workflow | Not tested | Native controls and existing dialog focus behavior are preserved, but a complete manual Tab traversal was not repeated for this visual slice | Local app | Complete before production approval |
| Visible focus | Static review only | Existing global focus-visible treatment remains in source | Local source | Confirm manually before production approval |
| Minimum 48×48 touch targets | Passed | All visible controls measured at or above 48×48 at all four reference viewports | In-app browser, mock fixture | Recheck if controls change |
| 200% text zoom | Not tested | The 640px layout equivalent passes without overflow; true browser zoom was not available in this controller | In-app browser, mock fixture | Run true browser-zoom review before production approval |
| Reduced motion | Static review only | Theme-specific transitions are removed under `prefers-reduced-motion`; controller could not emulate the preference | Local source | Confirm with OS preference before production approval |
| No horizontal page scrolling | Passed | Zero page-level overflow at 390, 640, 768, 1024, and 1440px widths; the expanded Zoo uses one body scrollbar with no nested vertical scrolling region | In-app browser, mock fixture | Recheck if layout changes |
| Error and recovery state | Static review only | Identity CSS is scoped to the existing student review and does not alter state logic | Local source | Exercise production-safe error fixture before release |
| Safe review mode verified | Passed | Persistent banner reports `mock-isolated`; interactions reset on reload and do not call Supabase | Local review route | Keep banner until deployment approval |
| One-place Musical Zoo | Passed | Selecting a destination hides the Commons and map, exactly one destination remains visible, returning restores the Commons, and destination state persists | In-app browser, mock fixture | Human visual approval |
| Expanded phone habitat | Passed | At 390×844 the selected destination uses the full 375px content width and the living habitat field grows to 574px; one body scrollbar remains, with no horizontal overflow or undersized visible controls | In-app browser, mock fixture | Recheck if the destination toolbar or habitat controls change |
| Calm Zoo discovery | Passed | Before the event, the Map exposes four available destinations and Meadow exposes two owned scenery pieces; no locked card, missing-place denominator, unlock progress meter, countdown, or advance teaser is visible. After one mock practice completion, Riverbank and Rainbow Note Garden appear as ordinary available cards | In-app browser, mock fixture | Decide whether calendar arrivals receive a separate prototype |
| Cozy pixel-world Zoo | Passed for local visual review | The map renders available places as labeled top-down landmarks on a tiled world at all four reference viewports. Travel, return-to-map, stepped route movement, and tap-to-greet were exercised; no locked-place pressure copy returned. | In-app browser, mock fixture | Jonathan visual approval; complete keyboard and true 200% zoom review before production approval |
| Complete Musical Zoo cast | Passed for local visual review | All nine accepted characters appear in the Caretaker and habitat arranger; selection updates the Commons and floating companion; response copy appears only after an event; the Sticker Book contains 27 pages; visible 32px, 64px, and 768px assets load at native resolution | In-app browser, mock fixture plus automated tests | Decide grace-first arrival and ownership before exposing the eight post-starter characters to live students |
| Unified Teacher Workspace mock flow | Passed | Opened roster, selected Sam, added a teacher note, wrapped the lesson, approved the suggestion, and opened Assignments without a runtime error | In-app browser, `mock-isolated` | Repeat against an isolated Supabase project after migration approval |
| Unified Teacher Workspace phone layout | Passed | At 390×844 the Assignments workspace has no page-level horizontal overflow and no visible control below 48×48 CSS pixels | In-app browser, `mock-isolated` | Recheck after any assignment-form layout change |
| Lesson Memory authorization | Static review only | Migration enables RLS on all three tables, revokes anonymous access, and defines teacher-only ownership policies; automated source invariants pass | Local source | Apply to isolated Supabase and execute teacher/parent/student session checks |

## Teacher Badge Studio local review evidence

This evidence began with the mock-isolated prototype and now includes local live-adapter implementation. It does not approve migration execution, a vendor connection, purchase, or child-directed physical product.

| Gate | Status | Evidence | Environment | Follow-up |
|---|---|---|---|---|
| Information architecture | Passed locally | Badge Studio is a global Teacher destination, absent from each selected student's sub-tabs, and now supplied by the live Teacher adapter | Local source and wiring tests | Repeat with an isolated teacher account |
| Deliberate recognition | Passed | No student is preselected; teacher chooses recipients, editable strength-based copy, a Zoo friend, and a format before a separate confirmation | In-app browser, `mock-isolated` | Test language with teachers and families |
| Pressure-free language | Passed | Five templates avoid streak, rank, perfect, leaderboard, locked-content, and deficit language | Automated helper tests and source | Add future templates through the same language review |
| Safe data boundary | Static pass | Migration `021` stores append-only teacher awards beside automatic badges, relationship-scopes RLS, revokes anon, and constrains `order_status` to `not-requested`; no vendor path or address field exists | Migration/API source and tests | Apply and test with isolated teacher, student, and parent sessions |
| Responsive matrix | Passed | 390×844, 768×1024, 1024×768, and 1440×900 have no horizontal overflow, broken character images, or tested visible controls below 48×48 CSS pixels | In-app browser, `mock-isolated` | Repeat after material layout changes |
| Automated/system validation | Passed locally | 27 test suites / 106 tests, ordered migration checks, art validation, optimized build without lint warnings, and `git diff --check` | Local terminals | Repeat against isolated database and after manual responsive/accessibility review |
| Physical fulfillment | Research only | Printful 3-inch iron-on/sew-on patch is the recommended sample; pinbacks are adult/family display only; no vendor was contacted and no order was placed | Official vendor sources and local brief | Approve art, price, sample purchase, guardian flow, and compliance owner separately |
| Plush feasibility | Research only | Makeship, Budsies, and wholesale routes are documented with current campaign/minimum shapes and CPSC gates | Official vendor and CPSC sources | Choose one lead character and commission only one prototype after approval |
| Manual keyboard / true zoom | Not complete | Native controls and visible focus styling are present, but full keyboard traversal, true 200% zoom, OS reduced motion, and assistive-technology checks were not completed | Local browser/source | Complete before production approval |
| Production boundary | Passed | No migration, real award, student-data write, guardian address, vendor action, payment, push, or deployment occurred | Local governance | Separate explicit authorization required |

## Identity pilot decision

**Status:** Rainbow Heart 2.0 is in local identity review across four mock surfaces; not approved for production
**Decision records:** D-026 supersedes D-020's local visual recipe and expands the review boundary; D-021 and D-022 remain accepted Zoo behavior; D-023 and D-024 remain proposed

## Isolated authenticated release rehearsal

This evidence covers the 2026-09-09 local Supabase rehearsal. Exact fingerprints and status codes are recorded in `RELEASE_REHEARSAL_2026-09-09.md`.

| Gate | Status | Evidence | Environment | Follow-up |
|---|---|---|---|---|
| Ordered migrations 016–021 | Passed | Applied one at a time with stop-on-error behavior; assignment lifecycle and release schema verifiers passed | Disposable local Supabase | Apply to production only after backup and explicit authorization |
| Protected data preservation | Passed | All 13 ledger counts preserved; 11 digests match exactly and two profile-table digests changed only because migration 019 added reviewed columns | Synthetic local data | Repeat immediately before/after any authorized production migration |
| Real-role privacy matrix | Passed | Anonymous tables hidden; private lesson data remains teacher-only; same-family writes/reads succeed; cross-family reads/writes fail; public teacher-profile insert fails | Real local JWT sessions and PostgREST | Keep the matrix in the production runbook |
| Authenticated workflows | Passed | Teacher draft-to-assignment, reassignment, archive-with-history-preservation, and badge award; parent family/history visibility; student completion and Zoo-preference persistence all completed | Local app with review mode off | Jonathan visual acceptance |
| Responsive regression | Passed | Authenticated Student, Teacher, Parent, and Family setup show no horizontal overflow at phone/tablet/desktop reference widths | In-app browser | True 200% zoom remains manual |
| Automated/system validation | Passed | 28 suites / 108 tests, optimized build, migration/art checks, diff check, Rainbow Heart OS 0.7.0 and connected-app metadata | Local terminals | Re-run after any material change |
| Manual accessibility | Partially complete | Live operating-environment reduced-motion preference collapses animations successfully; all four mock surfaces pass the semantic-name/target/reflow companion scan. Physical Tab traversal, true browser zoom, and screen-reader listening remain human checks | Local browser/source | Complete the three remaining steps in `MANUAL_ACCESSIBILITY_ACCEPTANCE.md` |
| Production boundary | Passed | No production rows exported, no hosted write or migration, no push, no merge, and no deployment | Local governance | Separate explicit authorization required |

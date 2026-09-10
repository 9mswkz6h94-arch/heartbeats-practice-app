# Guarded production release runbook

## Execution result — 2026-09-10

The authorized release was executed against the named Netlify and Supabase targets. Hosted backup `1634894437` is the accepted restore point. Migrations `016`–`021`, schema verification, protected-data comparisons, the full local release gate, and Rainbow Heart OS 0.8 validation passed.

The first frontend deploy failed the live banner gate and was immediately rolled back to deploy `6a9c735ad22106000843b295`. Corrective commit `2a23765` was revalidated and deployed as `6aa2b1dde1fc150008906c32`; the public Rainbow Heart entry and all three sign-in routes pass, and the post-deploy protected snapshot is unchanged. Authenticated Student, Teacher, and Parent inside-workspace checks remain pending until Jonathan signs in. The production change window is closed; this runbook is an execution record, not standing authorization for another release.

**App:** Heart Beats Practice App  
**Project:** `proj-004`  
**Prepared:** 2026-09-09  
**Status:** Prepared but not executed; production authorization is still `false`  
**Release branch:** `codex/practice-scaffold-sandbox`  
**Production branch:** `origin/main`  
**Production site:** `heartbeats-practice-app` / `https://heartbeats-practice-app.netlify.app`  
**Current production commit:** `c9de0ae5ad6d5b0b724ac75d89865d9863817437`  

This is the executable release contract for the accepted Rainbow Heart redesign and migrations `016`–`021`. It contains no secrets or production row values. Nothing in this document grants authority to run a production step.

## Release authority and ownership

- **Release and rollback decision owner:** Jonathan Owens.
- **Backup custodian:** Jonathan Owens.
- **Operator:** Codex, only after Jonathan gives the explicit authorization statement at the end of this file.
- **Stop rule:** stop on the first target mismatch, backup failure, migration error, fingerprint mismatch, build failure, privacy regression, or unexpected data change. Do not improvise a production patch.
- **Production boundary:** do not read row values into chat, source control, command output, or release notes. Record only counts, digests, timestamps, command exit status, and deploy identifiers.

## Confirmed release wiring

- GitHub remote: `https://github.com/9mswkz6h94-arch/heartbeats-practice-app.git`.
- Netlify is connected to that repository's `main` branch with build command `npm run build` and publish directory `build`.
- The live Netlify deploy is `ready` at commit `c9de0ae`; pushing `main` will trigger the production build automatically.
- The repository-local ignored `.netlify/state.json` points the CLI at `heartbeats-practice-app`, preventing the user-level Rainbow Heart website link from becoming the accidental target. Still pass `--site heartbeats-practice-app` to every Netlify command.
- The linked Supabase project was previously inspected schema-only. Migrations `016`–`021` have not been applied there.
- The candidate is 14 commits ahead of `origin/main` at preparation time. Record the exact new candidate SHA immediately before release; never release a dirty worktree.

## Blocking environment correction

The production Netlify site currently has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, while this repository uses Create React App and reads `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`. The next build would not receive the required values under the legacy names.

During the authorized release, before pushing `main`:

1. In Netlify project settings for **heartbeats-practice-app**, create `REACT_APP_SUPABASE_URL` with the same secret value currently held by `VITE_SUPABASE_URL`.
2. Create `REACT_APP_SUPABASE_ANON_KEY` with the same secret value currently held by `VITE_SUPABASE_ANON_KEY`.
3. Confirm `REACT_APP_REVIEW_DATA_MODE` has no production value.
4. Confirm `REACT_APP_STAGING_DATABASE_CONFIRMATION` has no production value.
5. Do not print, paste into chat, or commit either Supabase value.

This configuration change is included only if the final authorization explicitly includes the Netlify environment correction.

## Temporary build-tooling exception

The latest `npm audit --omit=dev` result is 9 low, 9 moderate, 14 high, and 0 critical findings. The only direct affected dependency is `react-scripts@5.0.1`; its vulnerable paths are the Create React App build/test toolchain (`@svgr/webpack`, CSS minimization, Jest, source-map loading, webpack-dev-server, and Workbox), not the static browser runtime by itself.

The proposed release decision is a time-bounded exception:

- build only from this trusted repository and reviewed assets;
- never expose the development server publicly;
- do not process untrusted SVG, CSS, source maps, or build inputs;
- do not run `npm audit fix --force`; its proposed `react-scripts` replacement is invalid/breaking for this app;
- begin the Create React App → Vite migration as the first post-release hardening project.

Jonathan must explicitly accept this temporary exception in the release authorization.

## Phase 1 — frozen candidate preflight

Run from the repository root in PowerShell:

```powershell
git status --short
git fetch origin
git rev-list --left-right --count origin/main...HEAD
git rev-parse HEAD
npm run release:validate
node "C:\Users\John\.codex\skills\rainbowheart-os\validation\validate-system.mjs" "C:\Users\John\Documents\Claude\Projects\Studio Apps\heartbeats-scaffold-sandbox"
```

Pass conditions:

- the worktree is clean;
- the branch is `codex/practice-scaffold-sandbox` and contains `origin/main`;
- the recorded candidate SHA matches the checked-out commit;
- migration ordering, 45 Zoo assets, 28 suites / 108 tests, optimized build, and Rainbow Heart OS connected-app validation pass;
- `DESIGN_PROFILE.json` is `production-ready` while `deploymentApproved` and `productionChangesAllowed` remain `false` until the authorized operation begins.

Do not rebase, force-push, or add unrelated changes after this freeze.

## Phase 2 — production backup and privacy-preserving before snapshot

1. Confirm in the Supabase dashboard that the linked project is the Heart Beats production project.
2. Confirm the current hosted backup/PITR status and record its most recent restorable timestamp.
3. Create a fresh on-demand hosted backup if the plan supports it. If it does not, stop unless the most recent restorable point is accepted by Jonathan.
4. Create timestamped schema, role, and data exports in an explicit restricted directory outside this repository. Do not put backups under a synced public folder and never commit them.

Reference Supabase CLI commands, after selecting and verifying the explicit destination directory:

```powershell
.\node_modules\.bin\supabase.cmd db dump --linked --file "<absolute-restricted-backup-directory>\schema.sql"
.\node_modules\.bin\supabase.cmd db dump --linked --role-only --file "<absolute-restricted-backup-directory>\roles.sql"
.\node_modules\.bin\supabase.cmd db dump --linked --data-only --use-copy --file "<absolute-restricted-backup-directory>\data.sql"
Get-FileHash -Algorithm SHA256 "<absolute-restricted-backup-directory>\schema.sql"
Get-FileHash -Algorithm SHA256 "<absolute-restricted-backup-directory>\roles.sql"
Get-FileHash -Algorithm SHA256 "<absolute-restricted-backup-directory>\data.sql"
```

5. Record only backup timestamps, file sizes, hashes, and hosted restore-point status in the private release log.
6. Run `scripts/snapshot-release-data.sql` as the database owner immediately before migration. Save only its 13 protected-table counts and digests. Do not export row contents to the release log.
7. Jonathan confirms the backup artifacts are present and takes ownership of the restore decision.

If any backup or snapshot step fails, stop. Do not migrate.

## Phase 3 — ordered production migrations

Apply exactly these files, one at a time, in order, through the already authenticated Supabase owner session:

1. `SQL_MIGRATIONS/016_invite_only_teachers.sql`
2. `SQL_MIGRATIONS/017_assignment_lifecycle.sql`
3. `SQL_MIGRATIONS/018_lesson_memory.sql`
4. `SQL_MIGRATIONS/019_family_profiles.sql`
5. `SQL_MIGRATIONS/020_student_zoo_preferences.sql`
6. `SQL_MIGRATIONS/021_teacher_badge_awards.sql`

Each file owns its transaction. The operator must wait for success before advancing. On any error, stop and preserve the exact error without exposing row values. Do not skip ahead, edit SQL in the dashboard, or apply a one-off repair outside source control.

After all six succeed:

1. Run `scripts/verify-release-schema.sql`. It performs invariant checks inside a rollback-only transaction.
2. Do **not** run `scripts/verify_assignment_lifecycle.sql` against production; that write-and-rollback workflow has already passed against the isolated clone and belongs in rehearsal, not on the live database.
3. Run `scripts/snapshot-release-data.sql` again and compare every protected count and digest.
4. Require exact count preservation for all 13 ledgers.
5. Require exact digest preservation for every ledger except `students` and `parent_students`; those two digests are expected to change only because migration `019` adds reviewed profile columns. Any other difference blocks the frontend release.

## Phase 4 — production environment and frontend release

1. Complete the two `REACT_APP_*` Netlify environment entries described above without printing their values.
2. Reconfirm the CLI target:

```powershell
netlify.cmd status
```

The output must name `heartbeats-practice-app` and `https://heartbeats-practice-app.netlify.app`. If it names `rainbowheart.studio` or `comforting-blini-3cfbe5`, stop.

3. Update `DESIGN_PROFILE.json` inside the frozen release commit only as part of the authorized release: set `deploymentApproved` and `productionChangesAllowed` to `true`; keep the production surface recorded as Scaffold until the live smoke test passes.
4. Create the final release commit if the approval metadata changed, then rerun `npm run release:validate` and the connected-app validator.
5. Fast-forward production only; never force-push:

```powershell
git push origin HEAD:main
```

6. Watch the Netlify production deploy for the exact pushed commit. Do not manually deploy a different local directory.
7. If the build fails, Netlify keeps the previous ready deploy. Stop and diagnose locally.

## Phase 5 — live smoke test

Use existing authorized accounts and the production URL. Do not create test students, send guardian messages, request physical rewards, or alter real assignments merely for testing.

- Entry: the app loads without a blank screen or missing-environment error.
- Teacher: sign in; confirm Studio Home, Students, Lesson Memory availability, Assignments, and Badge Studio render. Do not publish or award a test item.
- Student: sign in; confirm existing assignments, streak/history, earned badges, pet/Zoo ownership, companion choice, and practice cards remain present.
- Parent: sign in; confirm the correct linked students, practice history, assignments, calendar, badges, and private messages remain scoped correctly.
- Family setup: confirm the route renders and fields are labeled; do not create a test family unless Jonathan separately authorizes that data.
- Responsive: spot-check phone and desktop widths for Student, Teacher, and Parent; confirm no horizontal page scroll.
- Accessibility: confirm visible focus and reduced-motion behavior were not changed by the production build.
- Data: rerun the privacy-preserving snapshot and confirm counts/digests did not drift because of the release itself.

When all checks pass, record the Netlify deploy ID, commit SHA, time, smoke-test result, and backup restore point. Then update the app profile so `surfaces.production` is `rainbow-heart` and return `deploymentApproved` / `productionChangesAllowed` to `false` to close the change window.

## Rollback decision tree

- **Migration or fingerprint failure before push:** do not deploy the frontend. Stop. Jonathan chooses hosted restore/PITR or a reviewed forward fix; never hand-write a down migration in production.
- **Netlify build failure:** keep the current production deploy at `c9de0ae`; no frontend rollback is needed.
- **Frontend regression with healthy data:** restore the previous ready Netlify deploy, `6a9c735ad22106000843b295`, then diagnose locally. The additive database changes may remain if their schema and fingerprints passed.
- **Authorization, privacy, or data-integrity regression:** immediately restore the previous frontend deploy, stop user testing, and have Jonathan decide whether the hosted database restore/PITR must be used.
- **Environment mismatch or blank screen:** restore the previous frontend deploy; verify the two `REACT_APP_*` names and rebuild only after correction.

Never delete or overwrite the backup artifacts until Jonathan explicitly closes the rollback window.

## Explicit authorization required

An authorization equivalent to the following is required before Phase 2 begins:

> I authorize the Heart Beats production backup, the Netlify `REACT_APP_*` environment correction, Supabase migrations 016–021, a fast-forward push to `origin/main`, the Netlify production deployment, and the live smoke test. Jonathan is the backup and rollback decision owner. I accept the temporary Create React App build-tooling exception documented in `PRODUCTION_RELEASE_RUNBOOK.md`.

General encouragement, design acceptance, “move ahead,” or approval of this planning document does not satisfy this production authorization gate.

# Overdue assignment visibility release packet

Status: released 2026-10-06 after fresh backup, production migration, fast-forward push, Netlify deploy, and read-only live smoke verification.

## Exact scope

- Frontend: keep current assignments visible when `deadline < today`; retain daily completion/skip hiding and reset behavior.
- Teacher/parent language: show `Still open · due earlier` rather than punitive overdue wording.
- Database: apply `SQL_MIGRATIONS/027_overdue_practice_visibility.sql` after migrations `016`–`021`. It removes only deadline eligibility predicates from the three practice-write policies and `guard_active_practice_write()`.
- Preserved boundaries: authenticated student ownership, assignment/step matching, archived/memorized exclusion, row locking, RLS, completion history, and teacher-controlled archive/repertoire resolution.
- Rehearsal: run `scripts/verify_overdue_assignment_lifecycle.sql` against a sanitized clone with at least two fixture students with `auth_user_id`. It creates only tagged assignment/step/completion/status rows inside one transaction and rolls them back.

## Required preflight before any live action

1. Confirm the exact release commit contains only the files in this isolated candidate and does not include the pending calendar work.
2. Take a fresh hosted physical backup and record its immutable restore identifier. The 2026-09-10 restore point (`1634894437`, completed 11:16 UTC) is historical evidence only; it is not an automatically accepted October restore point. Stop the release if a fresh verified backup is unavailable or Jonathan has not accepted its identifier.
3. Capture privacy-preserving protected-ledger counts/digests using the existing production runbook. Do not export student names, emails, notes, addresses, or auth tokens.
4. Apply `016`–`021` only if the target is a fresh rehearsal clone; production already has those migrations. Apply `027` exactly once after verifying the preflight fingerprints.
5. Run the overdue rehearsal SQL and the exact release checks. A staging run is required; static Jest coverage alone is not proof of RLS behavior.

## Release sequence after explicit approval

1. Apply `027_overdue_practice_visibility.sql` in the target Supabase project through the reviewed migration path.
2. Re-run the protected-ledger snapshot and confirm no completion, daily-status, assignment, repertoire, badge, pet, or streak rows changed.
3. Fast-forward the reviewed frontend commit to `main`, allow the linked Netlify production deploy, and run read-only authenticated student, teacher, and parent smoke paths. Do not complete or skip work on real student records. Verify the teacher preview remains read-only, archived/memorized cards remain absent, and teacher counts and labels agree. The overdue pending/completion/skip write proof belongs only to the synthetic staging rehearsal.
4. Record migration/deploy IDs, timestamps, smoke results, and any unresolved observation in the production runbook before closing the change window.

## Rollback decision tree

- If the frontend is wrong but the database is healthy, roll back the frontend deploy to the last ready build and leave `027` in place only if the old client cannot issue overdue writes; otherwise use the coordinated database rollback below.
- If the database change must be reversed, obtain the release decision owner's approval, run `SQL_MIGRATIONS/ROLLBACK_027_overdue_practice_visibility.sql` exactly once, and immediately deploy the matching pre-027 frontend. This forward rollback restores deadline predicates without editing historical migration `017` or deleting history.
- If any protected-ledger fingerprint, RLS check, or authenticated read-only smoke test fails, stop the release and restore only the fresh backup that Jonathan accepted for this window using the production runbook. Do not improvise row-level deletes or manual edits.

## Candidate evidence

- `npm run release:check-migrations` includes the new 027 invariants and rejects deadline predicates/destructive history statements in the forward migration.
- `src/lib/assignmentLifecycle.test.js` covers overdue/today/future/undated boundaries and archived/memorized exclusions.
- `src/lib/overdueAssignmentMigration.test.js` covers the forward migration contract, synthetic rehearsal coverage, and rollback packet.
- `scripts/verify_overdue_assignment_lifecycle.sql` is the required sanitized staging proof for allowed overdue pending/completion/skip writes, protected rejection paths, and history preservation.
- Local disposable PostgreSQL rehearsal completed on 2026-10-06 using two synthetic students: migration `027` passed owner overdue completion/pending/completed/skipped writes and rejected cross-user, mismatched-step, archived, and memorized writes; the rollback packet rejected an overdue completion as expected. The container was removed afterward.

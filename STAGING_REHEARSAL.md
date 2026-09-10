# Isolated staging rehearsal

This is the required release gate for the Rainbow Heart redesign. It is deliberately separate from production and must use sanitized data.

## Prerequisites

- A disposable Supabase project or local database restored from a sanitized, schema-complete backup. A schema-only baseline plus deterministic synthetic fixtures is acceptable for a local rehearsal when every protected ledger is populated before the first fingerprint.
- Database-owner access to that isolated clone.
- Three isolated test identities: teacher, parent, and student. Do not reuse production credentials.
- A local `.env.local` pointing only to the isolated project. Start from `.env.staging.example`, replace its placeholders, and keep review mode unset so real authentication and RLS are exercised.

The current repository does **not** contain the original schema baseline. Do not infer it from application queries and do not point this rehearsal at production to compensate.

## Automated preflight

From the repository root:

```powershell
npm ci
npm run release:validate
npm run staging:check-env
```

This checks migration numbering and safety invariants, validates all Zoo artwork, runs the unit/integration suite, and creates a production build.

## Database rehearsal

Save all command output as release evidence. Substitute only the connection string for the isolated clone.

1. Run `scripts/snapshot-release-data.sql` and save the **before** fingerprints.
2. Apply `SQL_MIGRATIONS/016_invite_only_teachers.sql` through `021_teacher_badge_awards.sql`, one at a time and in numeric order.
3. Run `scripts/verify_assignment_lifecycle.sql`.
4. Run `scripts/verify-release-schema.sql`.
5. Run `scripts/snapshot-release-data.sql` again and save the **after** fingerprints.
6. Compare every protected table's count and digest. Any difference blocks release unless the migration intentionally changed that table and the change was separately reviewed. For this set, completion, streak, assignment, repertoire, badge, pet, and creature history must match exactly.

Each migration is transactional. Stop on the first error; do not skip ahead or manually patch the clone until the failure is understood in source control.

If the restored schema depends on extensions that are not enabled in the disposable database, reset that disposable database before retrying. Enable the prerequisite extension explicitly and rerun the restore from the beginning; do not continue from a partial restore.

## Real-role acceptance matrix

With review mode off and the app connected to the isolated clone, test at phone, tablet, and desktop widths:

- Student: sign in, load active practice cards, complete a step, retain streak/history, open and arrange the Musical Zoo, sign out and back in, confirm preferences persist.
- Parent: sign in, see only linked students, inspect practice history, submit the supported family/profile workflow, and confirm no teacher-only notes are visible.
- Teacher: sign in, select a student, save lesson notes, wrap a lesson into an assignment draft, deliberately publish/resolve an assignment, archive/reassign an active assignment, award a digital Badge Studio celebration, and confirm historic completions and automatic badges remain visible.
- Access boundaries: each role must fail to read or mutate another family's records; anonymous requests must not access the five new private tables; public signup must not create a teacher profile.
- Regression: exercise all primary navigation and empty/error/retry states without `?review=` in the URL.

Record the test identity IDs, browser/viewport, pass/fail result, and any console/network errors without copying student names, birthdays, notes, contact details, or transcript content into the evidence.

## Deployment gate

Deployment remains blocked until all fingerprints match, the schema verifier passes, the role matrix is signed off, and rollback/backup ownership is explicit. A production push or migration is a separate, deliberate action after review.

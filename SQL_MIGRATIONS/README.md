# Release migration set

The current unreleased database changes are an ordered, atomic set:

1. `016_invite_only_teachers.sql` — prevents public teacher-profile creation.
2. `017_assignment_lifecycle.sql` — adds assignment archive/reassign actions while preserving completion history.
3. `018_lesson_memory.sql` — adds private teacher lesson notes and assignment drafts.
4. `019_family_profiles.sql` — adds private family profile details and guardian contacts.
5. `020_student_zoo_preferences.sql` — stores display preferences only; it does not move practice, streak, XP, badge, or pet ledger data.
6. `021_teacher_badge_awards.sql` — adds teacher-created digital celebrations beside the existing automatic badge ledger; keepsake choices cannot initiate an order.

Do not run these files directly against production. This repository starts at migration `002` and does not contain the production database's original schema baseline, so `supabase db reset` here cannot reproduce the live database honestly.

Before release, obtain a sanitized schema/data clone in a separate Supabase project and follow [STAGING_REHEARSAL.md](../STAGING_REHEARSAL.md). The rehearsal must apply `016` through `021` exactly once, in order, and preserve every protected-table fingerprint.

Run `npm run release:check-migrations` whenever this set changes. The check rejects duplicate migration numbers, missing transactions, missing release invariants, and destructive completion-history statements.

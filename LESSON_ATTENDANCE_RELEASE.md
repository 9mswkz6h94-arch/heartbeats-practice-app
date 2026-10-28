# Lesson attendance release

Status: prepared; production migration, schedule update, push, and deployment pending backup restore-point acceptance.

The Studio form records a missed lesson, reschedule, no-show, or cancellation, along with a teacher-selected billing status and optional note. The monthly view is on-demand and printable. It does not send invoices, deliver reports automatically, or change Google Calendar.

Migration 028 creates a teacher-scoped table without modifying existing practice history. A disposable PostgreSQL rehearsal checked teacher insert/update, cross-teacher and student denial, and anonymous denial. The review fixture checked a synthetic note and billing edit. No real attendance records were created.

The user's supplied schedule matches 11 distinct active students under one teacher; the two similarly named students remain separate. Preserve existing durations and other fields when updating weekly day and time. Do not write schedule information to repository files.

Next: obtain acceptance of the current hosted restore point, refresh the protected-data baseline, apply migration 028, confirm protections and preserved ledgers, update the 11 weekly lesson times transactionally, verify them, push the isolated release commit, and smoke-test the deployment. Treat Google Calendar integration as separate unfinished work.

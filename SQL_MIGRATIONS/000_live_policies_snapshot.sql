-- Live pg_policies snapshot (public schema) — taken 2026-07-27 AFTER migrations 002+003.
-- Reference only, not runnable. Regenerate:
--   python scripts/supa_sql.py -q "select tablename, policyname, cmd, roles, qual, with_check from pg_policies where schemaname='public' order by tablename, policyname"
/*
[
  {
    "tablename": "assignments",
    "policyname": "assignments_delete",
    "cmd": "DELETE",
    "roles": "{public}",
    "qual": "(teacher_id = auth.uid())",
    "with_check": null
  },
  {
    "tablename": "assignments",
    "policyname": "assignments_insert",
    "cmd": "INSERT",
    "roles": "{public}",
    "qual": null,
    "with_check": "(teacher_id = auth.uid())"
  },
  {
    "tablename": "assignments",
    "policyname": "assignments_select",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "((teacher_id = auth.uid()) OR (student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.auth_user_id = auth.uid()))))",
    "with_check": null
  },
  {
    "tablename": "assignments",
    "policyname": "assignments_update",
    "cmd": "UPDATE",
    "roles": "{public}",
    "qual": "(teacher_id = auth.uid())",
    "with_check": "(teacher_id = auth.uid())"
  },
  {
    "tablename": "assignments",
    "policyname": "parent_read_assignments",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "is_parent_of(student_id)",
    "with_check": null
  },
  {
    "tablename": "butler_messages",
    "policyname": "butler_delete_own",
    "cmd": "DELETE",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "butler_messages",
    "policyname": "butler_insert_own",
    "cmd": "INSERT",
    "roles": "{public}",
    "qual": null,
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "tablename": "butler_messages",
    "policyname": "butler_read_own",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "completions",
    "policyname": "completions_insert",
    "cmd": "INSERT",
    "roles": "{public}",
    "qual": null,
    "with_check": "(student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.auth_user_id = auth.uid())))"
  },
  {
    "tablename": "completions",
    "policyname": "completions_select",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "((student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.auth_user_id = auth.uid()))) OR (student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.teacher_id = auth.uid()))))",
    "with_check": null
  },
  {
    "tablename": "completions",
    "policyname": "parent_read_completions",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "is_parent_of(student_id)",
    "with_check": null
  },
  {
    "tablename": "daily_practice_status",
    "policyname": "daily_practice_status_delete",
    "cmd": "DELETE",
    "roles": "{public}",
    "qual": "(student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.auth_user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "daily_practice_status",
    "policyname": "daily_practice_status_insert",
    "cmd": "INSERT",
    "roles": "{public}",
    "qual": null,
    "with_check": "(student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.auth_user_id = auth.uid())))"
  },
  {
    "tablename": "daily_practice_status",
    "policyname": "daily_practice_status_select",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "((student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.auth_user_id = auth.uid()))) OR (student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.teacher_id = auth.uid()))))",
    "with_check": null
  },
  {
    "tablename": "daily_practice_status",
    "policyname": "daily_practice_status_update",
    "cmd": "UPDATE",
    "roles": "{public}",
    "qual": "(student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.auth_user_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "daily_practice_status",
    "policyname": "parent_read_daily",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "is_parent_of(student_id)",
    "with_check": null
  },
  {
    "tablename": "families",
    "policyname": "family_creator_read",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "(created_by = auth.uid())",
    "with_check": null
  },
  {
    "tablename": "families",
    "policyname": "family_teacher_read",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "(EXISTS ( SELECT 1\n   FROM users u\n  WHERE ((u.id = auth.uid()) AND (u.type = 'teacher'::text))))",
    "with_check": null
  },
  {
    "tablename": "groove_sheets",
    "policyname": "Users manage own groove sheets",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "tablename": "grooves",
    "policyname": "Users manage own grooves",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "tablename": "hotel_tasks",
    "policyname": "console_delete",
    "cmd": "DELETE",
    "roles": "{public}",
    "qual": "is_hotel_admin()",
    "with_check": null
  },
  {
    "tablename": "hotel_tasks",
    "policyname": "console_insert",
    "cmd": "INSERT",
    "roles": "{public}",
    "qual": null,
    "with_check": "is_hotel_admin()"
  },
  {
    "tablename": "hotel_tasks",
    "policyname": "console_select",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "is_hotel_admin()",
    "with_check": null
  },
  {
    "tablename": "hotel_tasks",
    "policyname": "console_update",
    "cmd": "UPDATE",
    "roles": "{public}",
    "qual": "is_hotel_admin()",
    "with_check": null
  },
  {
    "tablename": "kodaly_concepts",
    "policyname": "concepts_manage",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() IS NOT NULL)",
    "with_check": "(auth.uid() IS NOT NULL)"
  },
  {
    "tablename": "kodaly_concepts",
    "policyname": "concepts_read_authenticated",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "(auth.role() = 'authenticated'::text)",
    "with_check": null
  },
  {
    "tablename": "kodaly_lesson_activities",
    "policyname": "lesson_activities_own",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "kodaly_lessons",
    "policyname": "lessons_own",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "kodaly_plan_meta",
    "policyname": "plan_meta_own",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "kodaly_song_concepts",
    "policyname": "song_concepts_own",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(EXISTS ( SELECT 1\n   FROM kodaly_songs s\n  WHERE ((s.id = kodaly_song_concepts.song_id) AND (s.user_id = auth.uid()))))",
    "with_check": null
  },
  {
    "tablename": "kodaly_song_files",
    "policyname": "Users access own song files",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "kodaly_songs",
    "policyname": "Users access own songs",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "kodaly_units",
    "policyname": "units_own",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "kodaly_week_activities",
    "policyname": "week_activities_own",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "kodaly_week_songs",
    "policyname": "week_songs_own",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "kodaly_week_themes",
    "policyname": "week_themes_own",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "kodaly_weeks",
    "policyname": "weeks_own",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "kodaly_year_themes",
    "policyname": "year_themes_own",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "mc_questions",
    "policyname": "authenticated ask questions",
    "cmd": "INSERT",
    "roles": "{authenticated}",
    "qual": null,
    "with_check": "true"
  },
  {
    "tablename": "mc_questions",
    "policyname": "authenticated read questions",
    "cmd": "SELECT",
    "roles": "{authenticated}",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "mission_control_board",
    "policyname": "authenticated read board",
    "cmd": "SELECT",
    "roles": "{authenticated}",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "parent_students",
    "policyname": "parent_insert_own_links",
    "cmd": "INSERT",
    "roles": "{public}",
    "qual": null,
    "with_check": "((parent_auth_user_id = auth.uid()) OR (parent_email = (auth.jwt() ->> 'email'::text)))"
  },
  {
    "tablename": "parent_students",
    "policyname": "parent_read_own_links",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "((parent_auth_user_id = auth.uid()) OR (parent_email = (auth.jwt() ->> 'email'::text)))",
    "with_check": null
  },
  {
    "tablename": "parent_students",
    "policyname": "parent_update_own_links",
    "cmd": "UPDATE",
    "roles": "{public}",
    "qual": "((parent_auth_user_id = auth.uid()) OR (parent_email = (auth.jwt() ->> 'email'::text)))",
    "with_check": null
  },
  {
    "tablename": "parent_students",
    "policyname": "teacher_manage_parent_links",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "is_teacher_of(student_id)",
    "with_check": "is_teacher_of(student_id)"
  },
  {
    "tablename": "practice_steps",
    "policyname": "parent_read_steps",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "(EXISTS ( SELECT 1\n   FROM assignments a\n  WHERE ((a.id = practice_steps.assignment_id) AND is_parent_of(a.student_id))))",
    "with_check": null
  },
  {
    "tablename": "practice_steps",
    "policyname": "practice_steps_delete",
    "cmd": "DELETE",
    "roles": "{public}",
    "qual": "(assignment_id IN ( SELECT assignments.id\n   FROM assignments\n  WHERE (assignments.teacher_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "practice_steps",
    "policyname": "practice_steps_insert",
    "cmd": "INSERT",
    "roles": "{public}",
    "qual": null,
    "with_check": "(assignment_id IN ( SELECT assignments.id\n   FROM assignments\n  WHERE (assignments.teacher_id = auth.uid())))"
  },
  {
    "tablename": "practice_steps",
    "policyname": "practice_steps_select",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "(assignment_id IN ( SELECT assignments.id\n   FROM assignments\n  WHERE ((assignments.teacher_id = auth.uid()) OR (assignments.student_id IN ( SELECT students.id\n           FROM students\n          WHERE (students.auth_user_id = auth.uid()))))))",
    "with_check": null
  },
  {
    "tablename": "practice_steps",
    "policyname": "practice_steps_update",
    "cmd": "UPDATE",
    "roles": "{public}",
    "qual": "(assignment_id IN ( SELECT assignments.id\n   FROM assignments\n  WHERE (assignments.teacher_id = auth.uid())))",
    "with_check": null
  },
  {
    "tablename": "repertoire",
    "policyname": "parent_read_repertoire",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "is_parent_of(student_id)",
    "with_check": null
  },
  {
    "tablename": "repertoire",
    "policyname": "repertoire_insert",
    "cmd": "INSERT",
    "roles": "{public}",
    "qual": null,
    "with_check": "((student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.auth_user_id = auth.uid()))) OR (student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.teacher_id = auth.uid()))))"
  },
  {
    "tablename": "repertoire",
    "policyname": "repertoire_select",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "((student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.auth_user_id = auth.uid()))) OR (student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.teacher_id = auth.uid()))))",
    "with_check": null
  },
  {
    "tablename": "room_messages",
    "policyname": "room_delete_own",
    "cmd": "DELETE",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "room_messages",
    "policyname": "room_insert_own",
    "cmd": "INSERT",
    "roles": "{public}",
    "qual": null,
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "tablename": "room_messages",
    "policyname": "room_read_own",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "setlists",
    "policyname": "del",
    "cmd": "DELETE",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "setlists",
    "policyname": "ins",
    "cmd": "INSERT",
    "roles": "{public}",
    "qual": null,
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "tablename": "setlists",
    "policyname": "sel",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "setlists",
    "policyname": "upd",
    "cmd": "UPDATE",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "songs",
    "policyname": "delete own songs",
    "cmd": "DELETE",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "songs",
    "policyname": "insert own songs",
    "cmd": "INSERT",
    "roles": "{public}",
    "qual": null,
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "tablename": "songs",
    "policyname": "select own songs",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "songs",
    "policyname": "update own songs",
    "cmd": "UPDATE",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "student_badges",
    "policyname": "parent_read_sbadges",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "is_parent_of(student_id)",
    "with_check": null
  },
  {
    "tablename": "student_badges",
    "policyname": "student_badges_insert",
    "cmd": "INSERT",
    "roles": "{public}",
    "qual": null,
    "with_check": "((student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.auth_user_id = auth.uid()))) OR (student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.teacher_id = auth.uid()))))"
  },
  {
    "tablename": "student_badges",
    "policyname": "student_badges_select",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "((student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.auth_user_id = auth.uid()))) OR (student_id IN ( SELECT students.id\n   FROM students\n  WHERE (students.teacher_id = auth.uid()))))",
    "with_check": null
  },
  {
    "tablename": "students",
    "policyname": "Allow student to see own data",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "(auth.uid() IN ( SELECT users.id\n   FROM users\n  WHERE (users.email = (auth.jwt() ->> 'email'::text))))",
    "with_check": null
  },
  {
    "tablename": "students",
    "policyname": "parent_insert_kids",
    "cmd": "INSERT",
    "roles": "{public}",
    "qual": null,
    "with_check": "((status = 'pending'::text) AND (family_id IN ( SELECT families.id\n   FROM families\n  WHERE (families.created_by = auth.uid()))))"
  },
  {
    "tablename": "students",
    "policyname": "parent_read_students",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "is_parent_of(id)",
    "with_check": null
  },
  {
    "tablename": "students",
    "policyname": "students_delete",
    "cmd": "DELETE",
    "roles": "{public}",
    "qual": "(teacher_id = auth.uid())",
    "with_check": null
  },
  {
    "tablename": "students",
    "policyname": "students_insert",
    "cmd": "INSERT",
    "roles": "{public}",
    "qual": null,
    "with_check": "(teacher_id = auth.uid())"
  },
  {
    "tablename": "students",
    "policyname": "students_select",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "((teacher_id = auth.uid()) OR (auth_user_id = auth.uid()) OR ((auth_user_id IS NULL) AND (email = auth.email())))",
    "with_check": null
  },
  {
    "tablename": "students",
    "policyname": "students_update",
    "cmd": "UPDATE",
    "roles": "{public}",
    "qual": "((teacher_id = auth.uid()) OR (auth_user_id = auth.uid()) OR ((auth_user_id IS NULL) AND (email = auth.email())))",
    "with_check": "((teacher_id = auth.uid()) OR (auth_user_id = auth.uid()))"
  },
  {
    "tablename": "study_documents",
    "policyname": "Users access own documents",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "tab_sheets",
    "policyname": "Users manage own tab_sheets",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "tabs",
    "policyname": "Users manage own tabs",
    "cmd": "ALL",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "user_facts",
    "policyname": "users read own facts",
    "cmd": "SELECT",
    "roles": "{authenticated}",
    "qual": "((auth.jwt() ->> 'email'::text) = user_email)",
    "with_check": null
  },
  {
    "tablename": "users",
    "policyname": "Allow anonymous signup",
    "cmd": "INSERT",
    "roles": "{public}",
    "qual": null,
    "with_check": "true"
  },
  {
    "tablename": "users",
    "policyname": "Allow user to see own data",
    "cmd": "SELECT",
    "roles": "{public}",
    "qual": "(auth.uid() = id)",
    "with_check": null
  }
]

*/

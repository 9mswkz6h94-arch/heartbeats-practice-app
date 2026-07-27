# Parent Dashboard + Communication Log — Implementation Plan

**Written:** 2026-07-16 · **For:** any model/session picking up this work
**Repo:** `C:\Users\John\Documents\heartbeats-practice-app` · GitHub `9mswkz6h94-arch/heartbeats-practice-app` · Netlify auto-deploys `main`

**Deployment (re-established 2026-07-16):** Netlify site `heartbeats-practice-app` (id `3a104fd1-ff58-4d3e-af74-7aedb1e12221`) → `https://heartbeats-practice-app.netlify.app`, builds `main` with `npm run build` → `build/`, env `REACT_APP_SUPABASE_URL` + `REACT_APP_SUPABASE_ANON_KEY`.
⚠️ **Incident note:** the original Netlify site of this name was at some point re-linked to the **rainbro** repo and given the `rainbro.app` domain, leaving the practice app with no deployment and its URL serving Rainbro's login. Fixed by renaming that site to `rainbro` (site id `de90f038-…`, keeps `rainbro.app`) and creating this fresh site. **Never repurpose an existing Netlify site for a different app — create a new site.** If the practice app URL ever serves the wrong app again, run `netlify sites:list` and check which repo each site points at.

## What we're building

Parents get their own login and a read-only dashboard showing each of their children's
practice activity (weekly summary, current assignments, badges, repertoire), plus a
**teacher↔parent chat per student** with opt-in notifications.

**Decisions already made with Jonathan (do not re-litigate):**
1. **Students never see the communication log.** No student RLS on comm tables at all. Chat is teacher↔parent only.
2. **Parents get a real Supabase login** (not shared links, not PDFs) — role `parent`, mirroring the existing student pattern.
3. **Chat is quiet by default; notifying is an explicit per-message choice by the teacher** ("📣 Notify parent" checkbox). Parents get no notify option — their replies just show an unread badge on the teacher dashboard.
4. **Notifications are pointers, not content** ("New message from Heart Beats about Emma — open the app") — for privacy and so the app stays the single source of truth.
5. **Email first (Resend via Supabase Edge Function), SMS via Twilio later.** Notification delivery is best-effort; chat must work 100% without it (Jonathan's standing reliability rule: local-first, graceful degradation, or it gets abandoned).
6. **The app gets reskinned to match the rainbowheart.studio brand** (Phase R below): Fraunces headings, **Atkinson Hyperlegible body everywhere** (Jonathan chose it over keeping OpenDyslexic — it's in the studio's font stack AND accessibility-designed), studio neutrals + rainbow accent palette.

## Current app architecture (verified 2026-07-16)

- **Create React App** (react-scripts 5), NOT Vite. `npm start` → localhost:3000. Env vars are `REACT_APP_SUPABASE_URL` / `REACT_APP_SUPABASE_ANON_KEY` (in Netlify env + local `.env`).
- **No router.** `src/App.js` holds a `screen` state string (`selection`, `teacher-login`, `student-login`, `teacher-dashboard`, `student-dashboard`) and switches on it.
- **Roles** come from JWT `user_metadata.role` (set at signup), falling back to a `users.type` DB lookup. `resolveSession()` in App.js routes by role.
- **Student pattern to copy for parents:** teacher creates a `students` row with name+email; student signs up with that email; on first login App.js matches by email and back-fills `students.auth_user_id`. So `students.id ≠ auth.uid()` — the auth link is a separate column.
- **Tables in use:** `users`, `students`, `assignments`, `practice_steps`, `completions`, `badges`, `student_badges`, `repertoire`, `daily_practice_status`.
- **Key components:** `TeacherDashboard` (tabs), `TeacherLessonPrepDashboard` (student list + detail, computes weekly stats), `StudentManager` (add students), `StudentPracticeCards` (student practice UI; has a `readOnly` prop already), `AssignmentForm`, `BadgeShowcase`.
- **Light theme**, tokens in `src/index.css` `:root` (already uses brand purple `#6C5CE7` but with purple-tinted neutrals — Phase R aligns them to studio neutrals). Historical gotcha: form selects once shipped unreadable during a dark-theme era; whenever you style a `<select>`, verify contrast explicitly.
- **Fonts today:** OpenDyslexic via CDN `<link>` in `public/index.html`. Phase R replaces this.
- Component CSS is well-tokenized — only ~20 hardcoded hex values total, half in `AssignmentList.css` (category colors).

## Phase 0 — Fix the auth foundation FIRST

Do not build parents on top of broken auth.

**0a. Student login loop bug.** Project note (`Projects/Projects/Studio Student Practice App.md`) lists next action: "Debug student login loop issue (migrated to studio Supabase)". Reproduce with a student account. Suspect area: `resolveSession()` in `App.js` — the email→students match, and the SSO-token path at the top of App.js (leftover from the abandoned token-passing design; the project note says SSO was ditched for independent auth per app — consider deleting `applySSOTokenFromURL` entirely).

**0b. Verify live RLS policies — the repo's SQL is untrustworthy.** `SQL_MIGRATIONS/add_daily_practice_status.sql` has a policy `USING (student_id = auth.uid())`, but `student_id` references `students.id`, which never equals `auth.uid()` (see student pattern above). Either the live DB has different (fixed) policies — there's a commit "RLS fixes" — or students are silently failing writes. In the Supabase SQL editor run:
```sql
select tablename, policyname, cmd, qual, with_check from pg_policies where schemaname = 'public';
```
Save the output into `SQL_MIGRATIONS/000_live_policies_snapshot.sql` so the repo reflects reality. The correct shape for student self-access is:
```sql
USING (student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid()))
```

**0c. Honest streak.** `fetchStreak` in `StudentPracticeCards.js` counts *total unique practice days ever*, not consecutive days, but displays "X day streak". Either compute a real consecutive-day streak (walk unique days backwards from today, allow yesterday as anchor) or relabel to "days practiced". Ask Jonathan which; real streak is the likely answer since badges key off `streak_7`/`streak_30` (`src/lib/badgeLogic.js`).

**Acceptance:** a student can sign up, log in, land on dashboard, complete a step, log out/in again without loops; `daily_practice_status` rows visibly written under RLS.

## Phase R — Rainbowheart brand reskin

Independent of the parent work — can run any time after Phase 0, but **must land before Phase 3/4** so the new parent UI is built on-brand instead of restyled later. Reference app: `C:\Users\John\Documents\Projects\rainbowheart-studio` (`src/index.css` + `index.html`).

**R1. Fonts.** In `public/index.html`, replace the OpenDyslexic CDN `<link>` with:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Fraunces:opsz,wght@9..144,400;9..144,700&display=swap" rel="stylesheet" />
```
In `src/index.css`:
```css
body { font-family: 'Atkinson Hyperlegible', Arial, sans-serif; }
h1, h2, h3 { font-family: 'Fraunces', Georgia, serif; }
code { font-family: 'Space Mono', Menlo, Consolas, monospace; } /* optional; only add Space Mono to the link if actually used */
```
Decision context: Jonathan explicitly chose Atkinson Hyperlegible app-wide (it's in the studio brand stack and is accessibility-designed) over keeping OpenDyslexic. Remove every `OpenDyslexic` reference (`grep -rn OpenDyslexic public src`).

**R2. Token swap** in `src/index.css` `:root` — align to studio values, keep the app's extra semantic tokens:
```css
:root {
  /* Rainbow accents — copied from rainbowheart-studio, used for category chips */
  --red:    #FF6B6B;
  --orange: #FF9F43;
  --yellow: #FECA57;
  --teal:   #1DD1A1;
  --blue:   #54A0FF;
  --purple: #A29BFE;
  --pink:   #FD79A8;

  --primary:        #6C5CE7;   /* unchanged — already on brand */
  --primary-dark:   #5849BE;   /* unchanged */
  --primary-light:  #ede9fb;   /* keep (app-specific) */
  --text:           #2D3436;   /* was #1a1a1a */
  --text-muted:     #636E72;   /* was #4a4a6a */
  --bg:             #ffffff;
  --bg-subtle:      #F8F9FA;   /* was purple-tinted #f7f6ff */
  --border:         #E9ECEF;   /* was purple-tinted #d4d0f0 */
  --shadow:         0 4px 24px rgba(0,0,0,0.08);   /* was purple-tinted */
  --shadow-lg:      0 8px 32px rgba(0,0,0,0.14);   /* studio's --shadow-hover */
  --radius:         12px;      /* already matches */
  --radius-sm:      8px;       /* already matches */
  /* keep --success/--danger/--warning/--info families as-is (studio has no equivalents) */
}
```

**R3. Category chips → rainbow accents.** The 5 assignment categories currently use generic colors (mostly hardcoded in `AssignmentList.css` — 7 hex values live there). Re-map to the brand accents: Warmup `var(--red)`, Technique `var(--yellow)`, Theory `var(--teal)`, Pieces `var(--blue)`, Performance `var(--purple)`. Update wherever category colors appear (grep for the old hex values across `src/`). Keep chip text readable — dark text `#2D3436` on these mid-tone accents, not white.

**R4. Hardcoded-hex sweep.** ~20 total across component CSS (`grep -rno '#[0-9a-fA-F]\{3,8\}' src/App.css src/components/*.css`). Replace each with the nearest token; anything genuinely one-off (e.g. celebration gradient) may stay but should use brand accent colors.

**R5. Typography pass.** App title, dashboard headers, card titles → Fraunces; everything else inherits Atkinson from `body`. Keep the emoji-forward, playful tone (streak flame, badges, celebrations) — the reskin changes palette/type, not personality.

**Acceptance:** no `OpenDyslexic` references remain; side-by-side with rainbowheart.studio the apps read as siblings (same purple, same neutrals, Fraunces headings); category chips use the rainbow accents; student practice flow visually unchanged in layout/behavior; mobile at 375px holds.

## Phase 1 — Schema migration (parents + comm log)

Create `SQL_MIGRATIONS/002_parents_and_comm_log.sql`, run it in the Supabase SQL editor:

```sql
-- Parents link to students by email (mirrors the students pattern).
-- One row per (parent, child); siblings = multiple rows with same email.
CREATE TABLE IF NOT EXISTS parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_email TEXT NOT NULL,
  parent_name TEXT,
  parent_auth_user_id UUID,            -- back-filled on first parent login
  notify_email BOOLEAN DEFAULT TRUE,   -- parent's opt-in, editable by parent
  notify_sms BOOLEAN DEFAULT FALSE,    -- phase 6 (Twilio), keep column now
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_email, student_id)
);
CREATE INDEX IF NOT EXISTS idx_parent_students_email ON parent_students(parent_email);
CREATE INDEX IF NOT EXISTS idx_parent_students_student ON parent_students(student_id);

-- One thread per student, teacher <-> parent(s). Students NEVER get policies here.
CREATE TABLE IF NOT EXISTS communication_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,             -- auth.uid() of writer
  author_role TEXT NOT NULL CHECK (author_role IN ('teacher','parent')),
  body TEXT NOT NULL,
  notify BOOLEAN DEFAULT FALSE,        -- teacher's per-message "📣 notify" ask
  notified_at TIMESTAMPTZ,             -- set by edge function on successful send
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comm_log_student ON communication_log(student_id, created_at);

-- Unread tracking: one row per (user, student thread).
CREATE TABLE IF NOT EXISTS comm_thread_reads (
  user_id UUID NOT NULL,               -- auth.uid()
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, student_id)
);

ALTER TABLE parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE comm_thread_reads ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user a parent of this student?
-- Email match works before auth link; auth id match after.
CREATE OR REPLACE FUNCTION is_parent_of(sid UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM parent_students ps
    WHERE ps.student_id = sid
      AND (ps.parent_auth_user_id = auth.uid()
           OR ps.parent_email = auth.jwt()->>'email')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is the current user the teacher of this student?
CREATE OR REPLACE FUNCTION is_teacher_of(sid UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM students s WHERE s.id = sid AND s.teacher_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- parent_students: teacher manages; parent reads own rows + updates own notify prefs
CREATE POLICY teacher_manage_parent_links ON parent_students
  FOR ALL USING (is_teacher_of(student_id)) WITH CHECK (is_teacher_of(student_id));
CREATE POLICY parent_read_own_links ON parent_students
  FOR SELECT USING (parent_auth_user_id = auth.uid() OR parent_email = auth.jwt()->>'email');
CREATE POLICY parent_update_own_links ON parent_students
  FOR UPDATE USING (parent_auth_user_id = auth.uid() OR parent_email = auth.jwt()->>'email');

-- communication_log: teacher + linked parents read/write. No student policies (intentional).
CREATE POLICY comm_read ON communication_log
  FOR SELECT USING (is_teacher_of(student_id) OR is_parent_of(student_id));
CREATE POLICY comm_write ON communication_log
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
    AND ((author_role = 'teacher' AND is_teacher_of(student_id))
      OR (author_role = 'parent'  AND is_parent_of(student_id)))
  );

-- comm_thread_reads: own rows only
CREATE POLICY reads_own ON comm_thread_reads
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Parents get read-only visibility into their children's practice data.
-- (Verify existing table policies from Phase 0 snapshot before adding; names must not collide.)
CREATE POLICY parent_read_students   ON students               FOR SELECT USING (is_parent_of(id));
CREATE POLICY parent_read_assign     ON assignments            FOR SELECT USING (is_parent_of(student_id));
CREATE POLICY parent_read_steps      ON practice_steps         FOR SELECT USING (
  EXISTS (SELECT 1 FROM assignments a WHERE a.id = assignment_id AND is_parent_of(a.student_id)));
CREATE POLICY parent_read_completion ON completions            FOR SELECT USING (is_parent_of(student_id));
CREATE POLICY parent_read_daily      ON daily_practice_status  FOR SELECT USING (is_parent_of(student_id));
CREATE POLICY parent_read_sbadges    ON student_badges         FOR SELECT USING (is_parent_of(student_id));
CREATE POLICY parent_read_repertoire ON repertoire             FOR SELECT USING (is_parent_of(student_id));
```

Notes:
- `badges` (definitions table) likely already has public/authenticated read; verify in the Phase 0 snapshot.
- If `assignments`/`repertoire` don't have a `student_id` column under those exact names, adjust — check the live schema (`select column_name from information_schema.columns where table_name='...'`).
- `SECURITY DEFINER` on the helpers avoids RLS recursion (policies on `students` calling a function that reads `students`).

**Acceptance:** migration runs clean; a test parent row + email-matched login can `select` a child's assignments in the SQL editor via `set request.jwt.claims` simulation or just via the app in Phase 3.

## Phase 2 — Parent auth + routing

1. **`App.js`:** add `parent` to `resolveSession()`: query `parent_students` by `session.user.email`, back-fill `parent_auth_user_id` where null (copy the student linking block), collect the student ids, route to new screen `parent-dashboard`. If no rows: banner "No student is linked to this email yet — ask your teacher to add you," stay signed in (same UX as the student miss case).
2. **Selection screen:** third button "Parent" → `parent-login`.
3. **`ParentLogin.js`:** copy `StudentLogin.js`, `role: "parent"` in signup metadata, adjust copy ("use the email your teacher has on file for you, not your child's email").
4. Remove the "Parents: create the account here" note from `StudentLogin.js` — that flow is now the Parent button.

**Acceptance:** parent signs up → lands on parent dashboard shell listing their children's names; sibling case (two `parent_students` rows) shows both.

## Phase 3 — Parent dashboard (read-only)

`src/components/ParentDashboard.js` + `.css`:

- **Child switcher** tabs at top (only if >1 child).
- **This-week card** per child: sessions this week, days practiced, badges earned — port the stats logic from `TeacherLessonPrepDashboard.js` (it already computes weekly summaries from `completions`; extract shared logic into `src/lib/studentStats.js` rather than duplicating).
- **Current assignments** list: title, category color chip (5 categories: warmup red / technique yellow / theory green / pieces blue / performance purple), steps with today's status from `daily_practice_status`. Read-only — do NOT reuse the non-readOnly write path of `StudentPracticeCards`; either use its existing `readOnly={true}` mode or a simpler flat list.
- **Badges** via existing `BadgeShowcase.js`.
- **Repertoire** (songs memorized) simple list.
- **Notification preference toggle** ("Email me when the teacher sends a flagged message") writing `parent_students.notify_email`.
- Header with child name, logout. Mobile-first — parents will use phones.

**Acceptance:** parent sees live data for each child; nothing on this screen can write to practice tables (watch the network tab); mobile layout holds at 375px.

## Phase 4 — Communication log (teacher↔parent)

`src/components/CommLog.js` + `.css`, shared by both roles, props: `{ studentId, role }`.

- Message list ascending, author label ("Jonathan" / parent name), timestamp, newest visible (scroll to bottom).
- Compose box. **Teacher only:** "📣 Notify parent" checkbox → sets `notify: true` on insert. Parent compose has no checkbox, always `notify: false`.
- On mount + on send: upsert `comm_thread_reads` `last_read_at = now()`.
- Unread badge = messages with `created_at > last_read_at` authored by the other role.
- Teacher-side messages with `notified_at` show a small "📣 notified" tick; `notify && !notified_at` shows "📣 pending" (honest degradation).

**Wire-in:**
- **Teacher:** `TeacherLessonPrepDashboard` student detail gets a "Parent chat" section (or tab) with `CommLog role="teacher"`; student list rows show unread badges. This doubles as the lesson-notes channel — post-lesson note = a normal (silent) message.
- **Teacher:** `StudentManager` gets "Add parent" (name, email, pick child/children) writing `parent_students` rows, and shows linked parents per student.
- **Parent:** `CommLog role="parent"` at the bottom of each child's dashboard view; unread badge on the child switcher tab.
- Optional polish: Supabase realtime subscription on `communication_log` filtered by `student_id` — nice, not required; plain refetch-on-focus is acceptable v1.

**Acceptance:** teacher posts silent message → parent sees it on next load, no notification row; teacher posts flagged message → `notify=true` persisted; parent reply → teacher sees unread badge; a logged-in **student** account gets zero rows from `communication_log` (verify explicitly).

## Phase 5 — Email notifications (last; app is fully usable without it)

- Supabase **Database Webhook** on `INSERT` into `communication_log` (filter in-function: only act when `notify = true`) → **Edge Function** `notify-parent`:
  1. Look up student name + `parent_students` rows where `notify_email = true`.
  2. Send via **Resend** (`RESEND_API_KEY` as function secret): subject "New message from Heart Beats about {student first name}", body = pointer + link to `https://heartbeats-practice-app.netlify.app` — **never the message content**.
  3. On success `update communication_log set notified_at = now() where id = ...` (service role key; idempotent — skip if already set, so retries never double-send).
- Failure mode: `notified_at` stays null, UI shows "📣 pending", message unaffected. No retry queue needed v1.
- Sender domain: can start with Resend's shared onboarding domain; proper `heartbeats` domain DNS later.
- **Phase 6 (parked):** Twilio SMS for `notify_sms = true` parents — needs A2P 10DLC registration; the Twilio dev-kit skills are installed when that day comes.

**Acceptance:** flagged message → email arrives with no message content in it → "📣 notified" tick appears. Kill the function → flagged message still posts, shows "pending", nothing breaks.

## Backlog spotted during review (not this build)

- Daily-reset logic in `StudentPracticeCards.fetchAssignmentsAndStatus` is N+1 (per-step deletes/inserts, and a per-record delete loop that re-issues the same broad delete). Replace with one delete + one bulk upsert.
- `completions.completed_at` is inserted as a bare date string — fine, but streak logic should be timezone-aware when fixed (Phase 0c).
- Dead SSO code removal if not already done in Phase 0a.

## Working agreements for the executing model

- One phase per commit (or a few focused commits per phase); push to `main` deploys to Netlify automatically. Test locally with `npm start` first.
- Every new form control gets explicit background + text color (never rely on browser defaults for `<select>` — this shipped unreadable once). Use the tokens from Phase R.
- New UI built after Phase R uses the brand tokens/fonts from day one; if a phase lands before Phase R, don't hand-tune colors — use existing tokens so the swap carries it.
- SQL runs in the Supabase dashboard SQL editor; commit every migration file to `SQL_MIGRATIONS/` so the repo stays the source of truth (numbered: `000_`, `002_`...).
- Jonathan's reliability rule is a hard constraint: each phase must leave the app fully working; notification failure must never block or lose a message.
- Update `Projects/Projects/Studio Student Practice App.md` (Obsidian vault) progress section + `nextAction` as phases complete, then run `python sync-dashboard.py "msg"` from `C:\Users\John\Documents\Projects`.

---

## ADDENDUM 2026-07-27 — Family signup + kid PIN login SHIPPED (supersedes parts of Phase 2)

Jonathan asked for parent-driven onboarding, so the parent flow now works the opposite
direction from Phase 2 above: **parents sign up first and create their kids** (teacher no
longer has to pre-create student rows for new families; the old teacher-driven flow still
works for legacy/edge cases).

What landed (see `SQL_MIGRATIONS/002_families_and_parent_signup.sql` + `src/lib/familyAuth.js`):
- **FamilySignup wizard** — parent account → add kids (name, instrument, avatar, 4-digit PIN)
  → family code recap screen. Kid accounts are real Supabase users with synthetic emails
  (`kid-<student_id>@kids.heartbeats.app`), password = `hb-<FAMILY_CODE>-<pin>`, created on a
  secondary non-persisting client so the parent stays signed in. Per-kid retry on partial failure.
- **KidLogin** — family code (localStorage-remembered) → tap avatar → PIN pad. Anon RPC
  `get_family_kids(code)` powers the picker. Legacy email login kept as fallback link.
- **families / parent_students tables** — `parent_students` matches this plan's Phase 1 shape,
  so Phases 3–5 (parent dashboard data, comm log, notifications) build on it unchanged.
- **Auto-attach + approval** — DB trigger assigns the default teacher; new kids are
  `students.status='pending'` and hidden from lesson-prep/assignment lists until approved in
  StudentManager's new approval queue. (Jonathan chose approve-gate over invite codes.)
- **ParentDashboard v1 shell** — kid list + family code + status; Phase 3 replaces its body.
- Phase 2's "ParentLogin copied from StudentLogin" happened, but sign-in only; signup lives in
  the wizard. The comm-log migration should now be numbered **003**.

⚠️ Deploy order: **run migration 002 + turn OFF "Confirm email" in Supabase auth settings
BEFORE pushing this code** — the client now selects/filters `students.status`, which errors
until the column exists. PIN resets need an edge function (no service key client-side) — parked.

---

## ADDENDUM 2026-07-27 — Phase 6 (SMS) built, BLOCKED on Twilio account

Jonathan asked for real texting to parents, not just the in-app comm log (which was already
shipped and verified working — commit `8236d8d`, tested end-to-end against the live DB). This
is the parked "Phase 6" from the original plan, pulled forward ahead of Phase 5 email.

What landed (code deployed, not yet functional — needs Twilio credentials):
- `SQL_MIGRATIONS/008_sms_notifications.sql` — adds `parent_students.parent_phone`
  (`notify_sms` already existed from migration 002, unused until now).
- `src/components/NotificationSettings.js` + `.css` — parent-facing "Text me when the
  teacher sends a flagged message" toggle + phone input, wired into `KidPracticePanel`
  (interactive/parent mode only) above `CommLog`. Writes to the parent's own
  `parent_students` row (`parent_update_own_links` RLS policy already covers it, verified
  against `pg_policies`).
- `supabase/functions/notify-parent-sms/index.ts` (deployed via
  `npx supabase functions deploy notify-parent-sms --project-ref fcamjkfgxywsyjcdmrrd --use-api`)
  — verifies caller is the message's teacher, looks up parents with `notify_sms=true` and a
  phone on file, sends a **pointer-only** SMS via Twilio's REST API (never message content,
  matching the plan's privacy rule), marks `notified_at`. Needs function secrets
  `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` (not set yet).
- `CommLog.js` — after a flagged send, fire-and-forgets a call to `notify-parent-sms`
  (`.catch(() => {})` — never blocks or fails the message itself, per the reliability rule).

**Deliberate deviation from the original Phase 5 spec:** that called for a Supabase Database
Webhook triggering the function on INSERT. Built as a direct client-side `functions.invoke()`
instead (matches the existing `reset-kid-pin` pattern already in this codebase) — simpler,
no webhook config needed, same fire-and-forget safety guarantee.

**Blocked on:** Jonathan doesn't have a Twilio account yet. Needs to sign up at
twilio.com/try-twilio, buy a number, and either verify test recipient numbers (trial, up to 5)
or complete toll-free verification (recommended over A2P 10DLC for a small studio — faster,
less paperwork) before real parents can receive texts. Once he has SID/Auth Token/number:
`npx supabase secrets set TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_FROM_NUMBER=... --project-ref fcamjkfgxywsyjcdmrrd`.
Phase 5 (email via Resend) is still unbuilt and not blocking this.

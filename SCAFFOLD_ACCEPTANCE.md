# Scaffold Acceptance Handoff

**App:** Heart Beats Practice App  
**Contract:** Scaffold 0.1.3  
**Branch:** `codex/practice-scaffold-sandbox`  
**Date:** 2026-08-16  
**Technical status:** Ready for Jonathan's local acceptance review  
**Deployment status:** Not approved

## What is complete

- Neutral Scaffold foundation, local fonts, semantic tokens, square geometry, and reduced-motion baseline.
- Entry, authentication, teacher, student, parent, onboarding, messaging, scheduling, and active admin surfaces.
- Mock-isolated review fixtures that never read or write Supabase.
- Phone, tablet, desktop, long-content, and 200%-reflow-equivalent checks.
- Named controls, landmark/heading review, explicit operational states, and 48px control baseline.
- Dialog focus entry, containment, Escape close, and trigger restoration.
- Production build with placeholder sandbox credentials.

## Product behavior preserved

- Daily practice resets and persistent Theory behavior.
- Completion history, badges, streaks, pet growth, celebrations, and skip-without-shame flows.
- Teacher controls, parent scheduling requests, notifications, and teacher-parent-only chat boundaries.
- Existing Supabase queries, authorization, and RLS assumptions.

## Local review links

- `http://127.0.0.1:3000/?review=teacher`
- `http://127.0.0.1:3000/?review=teacher-admin`
- `http://127.0.0.1:3000/?review=student`
- `http://127.0.0.1:3000/?review=parent`
- `http://127.0.0.1:3000/?review=parent-signup`

## Acceptance boundary

Accepting Scaffold means the neutral structural foundation is ready for the later Rainbow Heart skin phase. It does **not** authorize a merge, push, deployment, production-data connection, or live student transition.

Recommended final human check: move through the five links, use Tab/Shift+Tab, and have the browser read one representative teacher, student, and parent screen aloud. Record only concrete revisions; identity preferences belong to the later skin phase.

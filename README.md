# Heart Beats Practice App

Rainbow Heart Studio’s shared practice workspace for students, families, and teachers. It includes assignment and practice tracking, private lesson continuity, family scheduling, the Musical Zoo companion experience, automatic milestones, and teacher-created celebrations.

## Local setup

```powershell
npm ci
npm start
```

Real account flows require `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` in an ignored `.env.local` file.

For deterministic design review with no Supabase traffic, set:

```text
REACT_APP_REVIEW_DATA_MODE=mock-isolated
```

Then use `?review=student`, `?review=teacher`, `?review=parent`, or `?review=parent-signup`. The persistent sandbox banner is part of the safety boundary.

## Validation

```powershell
npm run release:validate
```

That command checks the ordered release migrations, validates the three-format Musical Zoo art library, runs the complete test suite, and builds the optimized app. Useful focused commands are:

```powershell
npm run release:check-migrations
npm run zoo:validate-art
npm test -- --watchAll=false --runInBand
npm run build
```

## Database and release safety

The repository does not contain the production database’s original schema baseline. Do not use these partial migrations to invent a fresh production-equivalent database and do not run the unreleased set directly against production.

Read [SQL_MIGRATIONS/README.md](SQL_MIGRATIONS/README.md) for the canonical `016`–`021` order and [STAGING_REHEARSAL.md](STAGING_REHEARSAL.md) for the required sanitized-clone, data-fingerprint, RLS, responsive, and accessibility gates.

Deployment is not approved by a successful local build. Production migration, push, and deployment are separate deliberate actions after the rehearsal evidence is reviewed.

## Stack

- React 18 / Create React App 5
- Supabase PostgreSQL and Auth
- Netlify
- Rainbow Heart OS 0.7 / Rainbow Heart Brand Kit 2.0 / Scaffold Foundation Kit 1.0.1

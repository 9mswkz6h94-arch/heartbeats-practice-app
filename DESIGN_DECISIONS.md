# Scaffold Design Decisions

Append new decisions. Supersede older decisions explicitly rather than deleting history.

## D-001 — Local-only migration boundary

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Work occurs on `codex/practice-scaffold-sandbox`. No push, merge, or deployment occurs without Jonathan's explicit approval.
- **Reason:** Children actively use production.

## D-002 — Scaffold-only scope

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Only Scaffold is implemented in this phase. Identity work remains out of scope.
- **Reason:** Structure and accessibility need approval before decoration.

## D-003 — Compatibility aliases

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Existing CSS variables temporarily alias to canonical Scaffold semantic tokens.
- **Reason:** This permits safe incremental migration instead of an all-at-once rewrite.

## D-004 — Stable product behavior

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Preserve routes, labels, task order, data behavior, and motivation mechanics unless a separately documented usability defect is approved.
- **Reason:** The eventual student transition should feel familiar.

## D-005 — No production-connected review

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Do not reuse live Supabase credentials for interactive Scaffold work. Build mock-isolated or sandbox-isolated review first.
- **Reason:** Visual review must not risk active student records.

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

## D-006 — Plain-language authentication controls

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Role selection uses numbered rows with descriptive text. Authentication headings and PIN utility keys do not depend on emoji for meaning.
- **Reason:** Scaffold requires controls and navigation to remain unambiguous without brand imagery or color.

## D-007 — Static shell review harness

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Dashboard shells may be rendered with static fixtures only when `REACT_APP_REVIEW_DATA_MODE=mock-isolated` and a supported `?review=` value is present.
- **Reason:** Responsive visual review must not require live credentials or risk student records.

## D-008 — Labeled navigation at every width

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Teacher navigation changes layout across breakpoints but never hides its text labels.
- **Reason:** An emoji-only rail contradicts Scaffold’s plain-language and accessible-navigation requirements.

## D-009 — Triage remains warm but structurally explicit

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Keep the no-shame labels `Needs a nudge`, `On a roll`, `Practiced today`, and `Steady`; pair each with a text label and structural leading edge rather than emoji or color alone.
- **Reason:** The language is a product behavior worth preserving, while Scaffold requires state to remain legible without decoration.

## D-010 — Student progress without pressure

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Preserve streaks, clear remaining counts, the completion celebration, and `Skip for today`. Scaffold neutralizes their surfaces but does not remove or shame the underlying choices.
- **Reason:** These mechanics support orientation and motivation for students; they are product behavior rather than Rainbow Heart identity decoration.

## D-011 — Practice cards are native controls

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Render each pending practice card as a semantic button and the expanded card as a labeled dialog with plain-language actions.
- **Reason:** Keyboard and assistive-technology operation should be inherent, while the familiar card-to-detail workflow remains unchanged.

## D-012 — Playful content survives the neutral foundation

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Creature and badge illustrations remain visible as motivational content. Operational meaning and controls use text, structure, and semantic state rather than emoji alone.
- **Reason:** Scaffold is a structural foundation for a later skin, not a removal of product features the students already value.

## D-013 — Wide notation scrolls locally

- **Date:** 2026-08-16
- **Status:** accepted
- **Decision:** Generated staff and tab notation may scroll horizontally inside the sight-reading panel, but must never cause page-level horizontal scrolling.
- **Reason:** Legible musical spacing is more useful than compressing notes, while the surrounding student interface must remain stable on phones.

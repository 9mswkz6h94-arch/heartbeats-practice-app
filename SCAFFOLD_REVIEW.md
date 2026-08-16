# Scaffold Review Matrix

**Status values:** Not started · In progress · Pass · Fail · Blocked · Not applicable

Static inspection is not a pass. Record concrete evidence for every pass.

| Area | Phone | Tablet portrait | Tablet landscape | Desktop | Keyboard | 200% zoom | Long content | Reduced motion | Status / evidence |
|---|---|---|---|---|---|---|---|---|---|
| Entry selection | Pass | Pass | Pass | Pass | In progress | — | — | Pass | No horizontal overflow at 390/768/1024/1440px; role controls 83px high |
| Teacher login | Pass | — | — | — | In progress | — | — | Pass | 390px source/browser check; labeled fields and 48–52px controls |
| Student/kid login | Pass | — | — | — | In progress | — | — | Pass | 390px visual/browser check; family code labeled; no overlap or horizontal overflow |
| Parent login/signup | Pass | — | — | — | In progress | — | — | Pass | Parent login checked at 390px; family signup remains for its later slice |
| Teacher HUD/nav | Pass | Pass | Pass | Pass | In progress | Pass | Pass | Pass | No overflow at reference widths or 640px zoom equivalent; labeled controls 48–52px |
| Lesson prep | Pass | Pass | Pass | Pass | In progress | — | Pass | Pass | Long-name/assignment mock fixture: no overflow or clipping; controls ≥48px |
| Student practice list | Pass | — | — | Pass | In progress | Pass | Pass | Pass | Long-content fixture at 390/640/1440px; no horizontal overflow; native card buttons ≥48px |
| Practice detail | Pass | — | — | — | In progress | — | Pass | Pass | Interactive fixture at 390px; no overflow; Close 48px and actions 52px; labeled dialog |
| Sight reading | Pass | — | — | Pass | In progress | — | Pass | Pass | 390px interactive fixture: notation scrolls locally; page has no overflow; controls ≥48px; desktop containment checked |
| Pets and badges | Pass | — | — | Pass | In progress | — | Pass | Pass | 390/1440px mock fixtures: no overflow; controls ≥48px; badge descriptions visible |
| Parent dashboard | Pass | — | — | Pass | In progress | Pass | Pass | Pass | Linked-family fixture at 390/640/1440px; no overflow/clipping; controls ≥48px |
| Family onboarding | Pass | — | — | — | In progress | — | Pass | Pass | `?review=parent-signup` at 390px; inputs and controls 52–55px; no page overflow |
| Messaging/scheduling | Pass | — | — | Pass | In progress | — | Pass | Pass | Parent fixture at 390/1440px; labeled reschedule fields, private chat, notification settings; no overflow |
| Teacher admin/requests | Pass | — | Pass | Pass | In progress | Pass | Pass | Pass | `?review=teacher-admin` at 390/640/1440px; no overflow/clipping; controls 48–52px |

## Global contract checks

- [x] Every tested interactive target is at least 48 CSS pixels high; full pointer-target width exceptions rely on a containing label.
- [ ] Focus is visible and unclipped.
- [x] Tested state fixtures pair color with labels, borders, position, or status text.
- [x] No horizontal page scrolling in tested fixtures at reference and zoom-equivalent widths.
- [ ] Loading, empty, error, and recovery states are explicit.
- [ ] Destructive actions are separated and confirmed.
- [x] Migrated surfaces use interface, display, or measurement roles only.
- [x] Production data and authorization boundaries are unchanged by the Scaffold commits.
- [x] Sandbox banner accurately identifies the active data mode (`mock-isolated`) and deployment status.

# Scaffold Review Matrix

**Status values:** Not started · In progress · Pass · Fail · Blocked · Not applicable

Static inspection is not a pass. Record concrete evidence for every pass.

| Area | Phone | Tablet portrait | Tablet landscape | Desktop | Keyboard | 200% zoom | Long content | Reduced motion | Status / evidence |
|---|---|---|---|---|---|---|---|---|---|
| Entry selection | Pass | Pass | Pass | Pass | In progress | — | — | Pass | No horizontal overflow at 390/768/1024/1440px; role controls 83px high |
| Teacher login | Pass | — | — | — | In progress | — | — | Pass | 390px source/browser check; labeled fields and 48–52px controls |
| Student/kid login | Pass | — | — | — | In progress | — | — | Pass | 390px visual/browser check; family code labeled; no overlap or horizontal overflow |
| Parent login/signup | Pass | — | — | — | In progress | — | — | Pass | Parent login checked at 390px; family signup remains for its later slice |
| Teacher HUD/nav | Pass | Pass | Pass | Pass | In progress | — | In progress | Pass | Mock-isolated shell: no overflow; all labels retained; controls 48–52px |
| Lesson prep | Pass | Pass | Pass | Pass | In progress | — | Pass | Pass | Long-name/assignment mock fixture: no overflow or clipping; controls ≥48px |
| Student practice list | Pass | — | — | Pass | In progress | — | Pass | Pass | Mock-isolated long-content fixture at 390/1440px; no horizontal overflow; native card buttons ≥48px |
| Practice detail | Pass | — | — | — | In progress | — | Pass | Pass | Interactive fixture at 390px; no overflow; Close 48px and actions 52px; labeled dialog |
| Sight reading | — | — | — | — | — | — | — | — | Not started |
| Pets and badges | — | — | — | — | — | — | — | — | Not started |
| Parent dashboard | Pass | — | — | Pass | In progress | — | In progress | Pass | Mock-isolated shell and empty state checked at 390/1440px |
| Messaging/scheduling | — | — | — | — | — | — | — | — | Not started |

## Global contract checks

- [ ] Every interactive target is at least 48×48 CSS pixels. Entry/auth sample passed; app-wide review remains.
- [ ] Focus is visible and unclipped.
- [ ] No state depends on color alone.
- [ ] No horizontal page scrolling at reference widths.
- [ ] Loading, empty, error, and recovery states are explicit.
- [ ] Destructive actions are separated and confirmed.
- [ ] Typography uses interface, display, or measurement roles only.
- [ ] Production data and authorization boundaries are unchanged.
- [x] Sandbox banner accurately identifies the active data mode (`mock-isolated`) and deployment status.

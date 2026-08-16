# Scaffold Review Matrix

**Status values:** Not started · In progress · Pass · Fail · Blocked · Not applicable

Static inspection is not a pass. Record concrete evidence for every pass.

| Area | Phone | Tablet portrait | Tablet landscape | Desktop | Keyboard | 200% zoom | Long content | Reduced motion | Status / evidence |
|---|---|---|---|---|---|---|---|---|---|
| Entry selection | Pass | Pass | Pass | Pass | In progress | — | — | Pass | No horizontal overflow at 390/768/1024/1440px; role controls 83px high |
| Teacher login | Pass | — | — | — | In progress | — | — | Pass | 390px source/browser check; labeled fields and 48–52px controls |
| Student/kid login | Pass | — | — | — | In progress | — | — | Pass | 390px visual/browser check; family code labeled; no overlap or horizontal overflow |
| Parent login/signup | Pass | — | — | — | In progress | — | — | Pass | Parent login checked at 390px; family signup remains for its later slice |
| Teacher HUD/nav | — | — | — | — | — | — | — | — | Not started |
| Lesson prep | — | — | — | — | — | — | — | — | Not started |
| Student practice list | — | — | — | — | — | — | — | — | Not started |
| Practice detail | — | — | — | — | — | — | — | — | Not started |
| Sight reading | — | — | — | — | — | — | — | — | Not started |
| Pets and badges | — | — | — | — | — | — | — | — | Not started |
| Parent dashboard | — | — | — | — | — | — | — | — | Not started |
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

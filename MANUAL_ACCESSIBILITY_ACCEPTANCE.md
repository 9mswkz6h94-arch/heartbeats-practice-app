# Manual accessibility acceptance

**App:** Heart Beats Practice App  
**Project:** `proj-004`  
**Environment:** Local mock-isolated review routes only  
**Status:** Reduced-motion execution passed; keyboard, true zoom, and screen-reader confirmation remain  

These four checks close the rendered accessibility gate that automated source, viewport, test, and build validation cannot prove. Use the mock-isolated routes below; they do not read or write Supabase.

## Review routes

| Workspace | Route |
|---|---|
| Student | `http://localhost:3000/?review=student` |
| Teacher | `http://localhost:3000/?review=teacher` |
| Parent | `http://localhost:3000/?review=parent` |
| Family setup | `http://localhost:3000/?review=parent-signup` |

Every route must retain the `mock-isolated` safety banner.

## 1. Keyboard-only workflow

Keep the mouse still after loading each route.

1. Press `Tab` repeatedly, then repeat part of the route with `Shift+Tab`.
2. Confirm every interactive control receives a clearly visible focus outline that is not clipped.
3. Use `Enter` or `Space` to activate navigation, cards, Zoo destinations, and ordinary buttons.
4. In the Student route, open a practice card. Confirm focus moves into the dialog, Tab stays inside it, `Escape` closes it, and focus returns to the card that opened it.
5. Open the Musical Zoo and confirm its travel, return, caretaker, companion, and habitat controls remain reachable without a pointer.
6. In Teacher, Parent, and Family setup, confirm every labeled field and action is reachable in a sensible reading order.

**Pass when:** there is no keyboard trap, focus never disappears, no active control is skipped, activation works, and dialog focus is contained and restored.

Result: ☐ Pass ☐ Issue found  
Notes:

## 2. True 200% browser zoom

Use the browser's Zoom menu and select exactly `200%` rather than resizing the window. Review all four routes.

1. Confirm there is no horizontal page scrollbar.
2. Confirm headings, labels, badges, cards, forms, and buttons wrap without clipping or overlap.
3. Confirm Student practice and Zoo dialogs remain fully reachable by ordinary vertical scrolling.
4. Confirm the Teacher navigation and Family setup fields remain in reading order.
5. Reset browser zoom to `100%` when finished.

**Pass when:** all content and controls remain available at 200%, the page reflows vertically, and no two-dimensional page scrolling is required.

Result: ☐ Pass ☐ Issue found  
Notes:

## 3. Reduced motion

Temporarily turn off animation effects in the operating system's accessibility settings, then reload the Student route.

1. Open the Musical Zoo and travel between the Commons and a habitat.
2. Confirm roaming, bobbing, celebration, and companion animation stop or become effectively instantaneous.
3. Confirm every control and status remains understandable without movement.
4. Restore the operating-system preference afterward if desired.

**Pass when:** the app preserves all meaning and operation without ongoing or disorienting motion.

Result: ☒ Rendered pass on 2026-09-09 ☐ Human comfort issue  
Notes: The operating environment reported `prefers-reduced-motion: reduce`. No visible element retained an active CSS animation, and global transition/animation duration resolved to 0.01 ms.

## 4. Screen-reader spot check

Use Narrator, NVDA, VoiceOver, or another familiar screen reader on the four mock routes.

1. Navigate by landmarks and headings. Confirm each workspace has a clear banner, main region, and heading hierarchy.
2. Navigate by buttons and form fields. Confirm controls announce their purpose rather than an emoji or visual position alone.
3. On Student, confirm practice progress, earned badge names, Zoo controls, and the practice dialog are understandable.
4. On Teacher, confirm workspace navigation, selected state, private-note labels, assignments, and Badge Studio controls are distinguishable.
5. On Parent and Family setup, confirm student names, practice status, relationship fields, optional fields, errors, and actions are announced with context.
6. Confirm status and error messages are announced when they appear.

**Pass when:** the reading order matches the visual order, landmarks/headings provide orientation, controls have useful names and states, and essential meaning never depends on color, emoji, or motion.

Result: ☐ Pass ☐ Issue found  
Notes:

## Automated companion evidence

At the 640px reflow width, Student, Teacher, Parent, and Family setup each retained the `mock-isolated` banner with:

- zero horizontal page overflow;
- zero unnamed visible controls;
- zero duplicate element IDs;
- zero visible control targets below 48×48 CSS pixels, including combined checkbox labels;
- one main landmark and a visible heading structure.

This supports the manual pass but does not replace true browser zoom, physical Tab traversal, or listening with an assistive technology.

## Confirmation

Reply with either:

`Keyboard, zoom, and screen reader pass.`

or:

`Issue: [workspace] / [check] / [what happened].`

Do not mark the production accessibility gate complete until Jonathan reports the hands-on result.

# Musical Zoo character interaction guide

## Goal

The selected companion should notice completed actions like a warm practice buddy without becoming noisy, repetitive, judgmental, or emotionally demanding. Character dialogue is authored and deterministic; it is not generated live by an AI model.

The current product boundary is **response-only**. A companion may react after the student starts, completes, skips, listens, discovers, or receives something. It does not prompt the student to begin, return, continue, protect a streak, share, or reply. Legacy intent names may remain in the catalog for compatibility, but `session_welcome`, `return_after_break`, and `share_practice_prompt` are not active character behaviors without a later explicit product decision.

## Three response levels

### 1. Micro reactions

Used after an ordinary practice step. These should disappear automatically and never interrupt the next action.

- One short sentence, ideally under eight words.
- A tiny two-frame motion or bounce.
- No button and no required dismissal.
- Default examples: “Nice work.” “That one’s done!” “A brave try.”
- Context example: “Nice work finishing those scales.”

Students may reduce micro-reaction frequency or turn text off while keeping animation.

### 2. Progress reactions

Used when remaining work changes meaningfully.

- “Three more pieces to go.”
- “You’re halfway through today’s practice.”
- “Warmup finished. Your hands are ready.”
- “Only one card left when you’re ready.”

Progress language is informational, not urgent. Never say “hurry,” “don’t stop,” “you should,” or imply disappointment.

### 3. Milestone moments

Reserved for daily completion, badges, memorized songs, pet growth, eggs, habitats, and character discoveries. These may play a larger response animation. They do not open a share prompt under the current response-only boundary.

## Interaction intents

The authored catalog contains the following intents. Only event-backed response intents should be activated in the current app:

- `session_welcome`
- `step_complete_generic`
- `step_complete_warmup`
- `step_complete_scales`
- `step_complete_theory`
- `step_complete_piece`
- `remaining_count`
- `halfway_today`
- `last_item`
- `session_complete`
- `return_after_break`
- `skip_accepted`
- `badge_unlocked`
- `song_memorized`
- `pet_growth`
- `egg_earned`
- `habitat_unlocked`
- `sticker_received`
- `friend_practiced_digest`
- `share_practice_prompt`
- `listening_started`
- `listening_stopped`
- `network_retry`

## More useful companion moments

- Acknowledge a student-initiated start after it happens, not as a prompt.
- Acknowledge a first attempt on a newly assigned piece.
- Notice repeated work without judging accuracy: “You came back to that part.”
- Mark transitions: warmup to repertoire, theory to playing, or final card.
- Welcome returning students without mentioning how long they were gone.
- Normalize skipping: “Saved for another day.”
- Explain unlocks in character voice.
- Deliver parent, teacher, and friend stickers.
- React to ambient playing with animation only so microphone use does not become constant dialogue.
- Keep instrument facts in the character sheet unless a later response surface is explicitly approved.

## A deep well without a writing nightmare

Use a hybrid authored-combination system:

1. **Intent templates** define safe sentence grammar.
2. **Character voice atoms** supply approved openers, action phrases, and closers.
3. **Safe context variables** add assignment category, remaining count, or display title.
4. **Combination IDs** identify the exact tuple used.
5. **Per-student history** prevents recent reuse.

Example grammar:

`{celebration} {completion_phrase} {optional_context}`

A pack might combine six celebrations, eight completion phrases, and six context endings for up to 288 possible combinations from twenty authored fragments. Capacity is calculated from the actual pack; do not copy an example count into a manifest. Each permitted combination must be expanded and reviewed so every result sounds natural.

Do not use unrestricted synonym substitution or generated text at runtime.

## Repetition controls

- Store `student_id`, `character_id`, `intent`, `combination_id`, and `shown_at` in interaction history.
- Never reuse the same combination until all eligible combinations for that intent have been shown.
- Avoid reusing any fragment from the previous five micro reactions when alternatives exist.
- Use a deterministic shuffled deck per student, character, intent, and content-pack version.
- Resetting or upgrading a content pack creates a new deck without deleting history.
- High-frequency micro reactions need the deepest pools; rare milestone messages need only a few excellent lines.
- Repeated visual reactions are acceptable more often than repeated text.

“Years without repetition” should be treated as a content-capacity goal, not an absolute promise. The system can report remaining unseen combinations and tell us where a voice pack needs expansion.

## Safe context variables

Allowed:

- First name or parent-approved display name.
- Teacher-authored assignment title after plain-text sanitization.
- Controlled assignment category label.
- Remaining item count.
- Character, badge, habitat, or sticker name from the catalog.

Not allowed:

- Accuracy claims unless a feature truly measured them.
- Emotional claims about the child.
- Comparisons with other students.
- Exact practice duration in social messages.
- Shame language about gaps, skips, streak loss, or incomplete work.
- Unreviewed user text inside student-to-student communication.

## Frequency and accessibility

- Never show more than one text reaction for a single action.
- Do not stack messages; newest micro reaction replaces the previous one.
- Never use a companion notification or idle state to initiate practice.
- Provide `full`, `reduced`, and `animation-only` companion settings.
- Respect reduced-motion preferences.
- Every message is available to assistive technology without stealing focus.
- Character dialogue must not cover practice controls or require a timed response.

## Content workflow

- Voice packs are versioned JSON files reviewed like code.
- New packs may be released seasonally or alongside new characters.
- Weekly variety comes from activating a reviewed pack, not live generation.
- Automated tests validate required intents, allowed variables, maximum length, duplicate combinations, and forbidden phrases.

## Voice-pack review checklist

- `characterId` matches the folder and manifest ID.
- Pack version increases when reviewed content changes after release.
- Every intent name exists in `interactions/interaction-intents-v1.json`.
- Every template variable is allowed for that intent.
- Every possible atom combination is expanded, counted, and reviewed—not sampled.
- Manifest intent and combination counts match the validated pack.
- Micro reactions are ideally under eight words; longer exceptions are intentional and documented.
- No line claims accuracy, emotion, comparison, urgency, guilt, streak loss, or disappointment without an explicitly valid measured context.
- Teacher-authored titles and approved display names are sanitized before insertion.
- No runtime synonym generation, unrestricted interpolation, or live AI-generated child-facing text.
- Repetition behavior uses the deterministic per-student shuffled deck and retains history across pack upgrades.

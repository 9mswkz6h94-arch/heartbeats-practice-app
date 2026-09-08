# Musical Zoo character-design session — handoff report

**Repo:** `C:\Users\John\Documents\Claude\Projects\Studio Apps\heartbeats-scaffold-sandbox`
**Scope worked in:** `character-design/` and `concept-art/` only, per explicit instruction partway through the session.
**Nothing outside those two folders was modified.** Confirmed by grep across the whole repo for "tempo"/"ringlet" — the only hits outside those two folders are unrelated matches on the substring "tempo" inside the word "temporarily"/"Temporary" in `CHARACTER_STYLE_GUIDE.md`, `DESIGN_DECISIONS.md`, `SCAFFOLD_START_HERE.md`, `src/components/ScaffoldShellReview.js`, and `src/index.css`. None of those are real references to anything built this session.

---

## 1. What this session was asked to do

Starting point: review `CHARACTER_INTERACTION_GUIDE.md`, `README.md`, and Riffin's `CHARACTER.md` to understand the Musical Zoo companion-character system. From there the ask evolved into:

1. Design one member of the "starter trio" (your choice) — built **Tempo**.
2. Discover that **Lyra** already existed in `character-design/characters/lyra/` (in progress from two other tools, referred to as "Codex" and "Antigravity") and was presumed to be the harmony starter.
3. Design a third character avoiding collision with Lyra — built **Ringlet** (listening role).
4. Discover pre-existing, more-finished-looking concept art (`concept-art/musical-zoo-starter-trio-*.png`, 3 versions) that fixes the *actual* starter trio as **melody (fox) / rhythm (frog) / harmony (armadillo)** — a fact that existed on disk the whole time but wasn't in any of the text docs.
5. Reconcile: revise Tempo from tortoise → **frog** to match the established rhythm concept art; reclassify Ringlet as a **non-starter, post-starter-unlock candidate** since "listening" was never the real third slot.
6. Produce a full first-pass asset set for Tempo (sprites, animation frames, stickers) as a proof-of-concept for whether the design docs are robust enough to hand to a fresh chat.

---

## 2. Current state of each character

### Riffin (melody) — untouched, pre-existing, most mature
- Fox + acoustic guitar. Has real production-looking sprites already.
- Not modified this session. Only read for reference.
- `character-design/characters/riffin/CHARACTER.md`
- `character-design/characters/riffin/manifest.json`
- `character-design/characters/riffin/voice-pack-v1.json`
- Sprites already existed at `concept-art/sprites/riffin-*.png` before this session — not touched.

### Tempo (rhythm) — built and finished this session, full asset set
- Frog + hand-drum-belly. `starterRole: "rhythm"`. Practice virtue: steady persistence.
- Originally designed as a **tortoise**; revised to **frog** after the concept-art discovery, since the concept art already established frog=rhythm and a tortoise would have duplicated the role with the wrong animal.
- Full first-pass asset set produced (see §4 below): 64×64 companion, 32×32 roaming, 16×16 egg, 2-frame idle/dance/celebrate animations, and all 3 stickers — each as an editable SVG source *and* a rasterized transparent PNG *and* an 8×-scaled preview PNG.
- **Status remains `"concept"`** — nothing here has had human review/approval yet, and there's no actual pixel-artist pass. Treat everything as a first draft, not final art.
- Docs:
  - `character-design/characters/tempo/CHARACTER.md`
  - `character-design/characters/tempo/manifest.json`
  - `character-design/characters/tempo/voice-pack-v1.json`

### Ringlet (listening) — built this session, **not a starter**
- Rabbit + hand-bell. `starterRole` is explicitly `null` — this is a proposed **post-starter unlock**, not part of the trio, because the trio's third slot is harmony (already visually spoken for by the armadillo concept art), not listening.
- Only the design docs exist — **no sprites were produced for Ringlet**. If you want the same asset-production pass done for it, that's a clean next step.
- Docs:
  - `character-design/characters/ringlet/CHARACTER.md`
  - `character-design/characters/ringlet/manifest.json`
  - `character-design/characters/ringlet/voice-pack-v1.json`

### Lyra (harmony) — untouched, contested, non-compliant
- Owl on a music stand. Exists as **two independent, non-identical WIP attempts** referred to in conversation as belonging to "Codex" and "Antigravity" (this session did not determine which files on disk belong to which — there is only one `characters/lyra/` folder, so if both tools are or were writing to it, one may have overwritten the other; this needs a human check).
- **Left completely untouched**, per your explicit instruction.
- Known problems, for whoever picks this up:
  - `manifest.json` **fails schema validation** — missing `schemaVersion`, `id` (uses `characterId` instead), `animal`, `instrument`, `musicalRole`, `practiceVirtue`, `palette`, `accessibility`, `legacy`, `status`. Uses a different shape entirely (`displayName`, a flat `stickers` array instead of celebrate/encourage/connect keys).
  - No integrated instrument — the owl is "perched on a music stand," which is a held/adjacent prop, not anatomy. This breaks the style guide's #1 character-recipe rule.
  - Sticker names ("happy hoot," "thoughtful gaze," "focused wing") don't clearly map to the required celebrate/encourage/connect meanings.
  - Adds an intent (`special_animation`) not present in `character-design/interactions/interaction-intents-v1.json`, and describes 4 animation states, exceeding the documented 3-animation (idle/dance/celebrate) budget.
  - One dialogue line ("My tail is still humming") appears to be copy-pasted from Riffin's fox-tail joke and doesn't fit an owl.
  - Doesn't match the pre-existing armadillo+xylophone harmony concept art at all (different animal, no integrated instrument).
- Files (read-only, for reference):
  - `character-design/characters/lyra/CHARACTER.md`
  - `character-design/characters/lyra/manifest.json`
  - `character-design/characters/lyra/voice-pack-v1.json`
  - `character-design/characters/lyra/sprite64.png`, `sprite32.png`, `egg.png`, `sticker_happy.png`

---

## 3. The concept art nobody had written down

`concept-art/musical-zoo-starter-trio-concept-v1.png` (painterly), `-8bit-concept-v2.png` (pixel), and `-handheld-color-v3.png` (flat palette pass) all show the same three characters:

- **Melody:** orange fox, guitar-body torso — matches Riffin.
- **Rhythm:** green frog with a drum belly, holding mallets in both hands.
- **Harmony:** purple armadillo whose banded shell doubles as a xylophone/piano-key strip.

This is a genuinely good design (especially the armadillo) but **exists only as unlabeled PNGs** — no `musicalRole`, `practiceVirtue`, or `instrument` field anywhere states this is the canonical trio. This caused the entire Tempo/Ringlet mixup this session: three different tools independently guessed at "what's the third starter" and got three different answers (Codex/Antigravity → owl for harmony, this session → tortoise for rhythm then rabbit for a nonexistent "listening" slot) before the concept art was found by accident when you asked to see the character images.

**This is the single highest-value fix for the guide docs** — see §6.

Also worth noting: the frog in the concept art *holds* mallets, which breaks the style guide's own "integrated instrument, not a prop" rule. Tempo's design keeps the frog+drum idea but has it tap its own belly instead of holding sticks, specifically to fix that conflict — so Tempo is not a literal reproduction of the concept art, it's a compliant version of the same idea.

---

## 4. Full file inventory (everything created this session)

### Character design docs (6 files)
- `character-design/characters/tempo/CHARACTER.md`
- `character-design/characters/tempo/manifest.json`
- `character-design/characters/tempo/voice-pack-v1.json`
- `character-design/characters/ringlet/CHARACTER.md`
- `character-design/characters/ringlet/manifest.json`
- `character-design/characters/ringlet/voice-pack-v1.json`

### Tempo sprite assets (33 files, all in `concept-art/sprites/`)

Each of these 11 "poses" has three files: an editable `.svg` source, a rasterized native-resolution `.png`, and an 8×-scaled `-preview-8x.png` for easy viewing.

| Pose | Base filename |
|---|---|
| 64×64 companion | `tempo-64x64-v1` |
| 32×32 roaming | `tempo-32x32-v1` |
| 16×16 egg | `tempo-egg-16x16-v1` |
| Idle frame 1 | `tempo-idle-1-64x64-v1` |
| Idle frame 2 (1px head bob) | `tempo-idle-2-64x64-v1` |
| Dance frame 1 | `tempo-dance-1-64x64-v1` |
| Dance frame 2 (drumhead pulse) | `tempo-dance-2-64x64-v1` |
| Celebrate frame 1 | `tempo-celebrate-1-64x64-v1` |
| Celebrate frame 2 (paws lift + sparkle) | `tempo-celebrate-2-64x64-v1` |
| Sticker: celebrate ("Big Beat") | `tempo-sticker-celebrate-64x64-v1` |
| Sticker: encourage ("Steady Steps") | `tempo-sticker-encourage-64x64-v1` |
| Sticker: connect ("Round Groove") | `tempo-sticker-connect-64x64-v1` |

All of these are referenced from `character-design/characters/tempo/manifest.json`'s `assets` block, using relative paths like `../../../concept-art/sprites/tempo-64x64-v1.png`.

**No files were created for Ringlet's sprites, or for Riffin/Lyra at all.**

---

## 5. Technical obstacles hit, and how they were worked around

1. **Browser preview tool couldn't screenshot local files.** Navigating to a `file://` URL reported success but then every follow-up call (`screenshot`, `get_page_text`) failed with "No site is open in this tab." The tool's own message hinted why: "files outside the project folder render as static snapshots." Workaround: started a throwaway `python -m http.server` inside the project folder and previewed over `http://127.0.0.1:8734/...` instead — that worked immediately. Worth knowing for any future session doing visual/pixel-art iteration in this environment.

2. **No SVG-to-PNG rasterizer was installed.** Checked and struck out on `cairosvg` (Python), `rsvg-convert`, `inkscape`, and ImageMagick (`magick`/`convert` — the only `convert` on PATH is Windows' own unrelated file-conversion utility). Pillow (PIL) *was* available. Since every sprite in this style is just axis-aligned solid-color `<rect>` elements (no paths, curves, or gradients), I wrote a ~30-line rasterizer that parses the SVG's rects with `xml.etree` and draws them directly onto a transparent RGBA canvas at exact integer coordinates using Pillow — no anti-aliasing is possible because it never does anything but flat-fill exact pixel rectangles. Verified it against the browser-rendered version first; pixel-for-pixel identical.
   - **This rasterizer is fragile by design** — it only understands `<rect>`. If anyone ever authors a sprite with circles, paths, or transforms, it will silently produce nothing for those elements. Fine for this project's current style; worth being explicit about that constraint if it gets reused.
   - The script itself lives only in this session's scratchpad (`.../scratchpad/rasterize.py`), not in the repo. If you want it kept as a real project tool, it should be copied in and cleaned up — right now it's throwaway.

3. **Caught my own color mistake.** The first draft of Tempo's eyes used `#FFE9B8` — which is actually *Ringlet's* light accent, not Tempo's (`#FFD866`). Caught and fixed before rasterizing final assets, but it's a real failure mode worth guarding against systematically (see suggestion in §6) — it's easy to bleed one character's palette into another when iterating on several at once.

4. **The 16×16 egg is the weakest asset.** Getting a smooth teardrop silhouette out of hand-placed rectangles at 16×16 is hard — the result reads as a rounded, tapered blob (fixed once from an even worse "rounded cross" first attempt) but is still blockier than Riffin's egg, which has a smoother curve and internal color-blotch texture. This might just be an inherently hard manual-pixel-art problem at that resolution, not a one-off mistake.

---

## 6. Gaps in the existing guide docs (suggested fixes)

These are documentation gaps this session ran into directly — not stylistic opinions:

1. **The starter trio's actual composition is undocumented in text anywhere.** It only exists as an unlabeled concept-art PNG. This is what caused the whole Tempo/Ringlet/Lyra mixup. *Fix:* add a short, explicit statement to `README.md` or a new `STARTERS.md` — e.g. "The three starters are melody (fox), rhythm (frog), harmony (armadillo). See `concept-art/musical-zoo-starter-trio-handheld-color-v3.png` for the reference design." One sentence would have prevented this entire session's confusion.

2. **No documented sprite file-naming/path convention.** The `{id}-{size}-v{n}.png` + `../../../concept-art/sprites/` relative-path pattern only exists by example in Riffin's `manifest.json` — nothing in `README.md` or `CHARACTER_STYLE_GUIDE.md` states it as a rule. Should be written down explicitly, including the `-preview-8x` convention for human-reviewable scaled copies.

3. **No documented pixel-art authoring technique.** The style guide states the *rules* (4 colors, integer coordinates, no anti-aliasing, 1px outline) but not a *method* for actually hitting them by hand — e.g., the outline-then-inset-fill layering trick, or using small corner-notch cuts to fake rounded corners on a rectangular grid. A short appendix with a worked example (even just Riffin's actual rect list annotated) would make this repeatable by someone who isn't already a pixel artist.

4. **No required contrast/legibility check step.** Nothing in "definition of ready" says a sprite must be visually checked against the shared light UI background (`#E9F0D0`) before being considered done — I improvised that check this session (rendering against both a transparent checker and the actual UI color). Worth promoting to an explicit checklist item.

5. **No practice-virtue vocabulary.** The style guide lists the seven `musicalRole` values but has no equivalent list for practice virtues, so avoiding an accidental reskin (e.g. Tempo's "steady persistence" vs. a hypothetical near-duplicate) was a judgment call, not something checkable against a written list.

6. **Sticker display names aren't a documented required field.** Riffin's and Tempo's sheets both give each sticker a short name ("Big Riff," "Big Beat," etc.) but this isn't called out as required anywhere in the schema or style guide — worth promoting to an explicit field.

7. **No automated palette-conformance check.** The color-bleed mistake in §5.3 would be caught instantly by a script that opens each character's exported PNGs and asserts every non-transparent pixel matches one of that character's four declared palette colors. This seems like a cheap, high-value addition to whatever "automated tests" the interaction guide already promises for voice packs (`CHARACTER_INTERACTION_GUIDE.md` §"Content workflow" mentions tests for intents/variables/length/duplicates/forbidden phrases — a palette check belongs in that same family).

---

## 7. Open items that need a human (or the original chat) to decide

1. **Lyra/harmony is contested and non-compliant.** Two independent WIP attempts exist (or existed) under one folder, neither matches the established armadillo concept art, and the current on-disk version fails schema validation. This needs a decision about which effort (if either) continues, and then a compliance pass — not something any of the parallel AI sessions should resolve unilaterally.
2. **Ringlet's fate.** It's a solid, spec-compliant design but isn't part of the starter trio. Decide whether it's worth carrying forward as the first post-starter unlock, or whether it should be shelved.
3. **Whether to keep the custom rasterizer.** Right now it's a throwaway script in this session's scratchpad. If PNG production export is going to be a recurring need, it should either be adopted properly (copied into the repo, documented, maybe extended to handle more SVG shapes) or replaced with a real tool (installing `cairosvg` or similar) rather than reinvented per session.
4. **The concept art vs. the guides.** Someone should decide whether `concept-art/musical-zoo-starter-trio-*.png` is genuinely authoritative (in which case it needs to be written into the docs per §6.1) or just exploratory brainstorming that happens to look polished (in which case Tempo's frog redesign was based on a false premise and should be revisited).

---

## 8. How to remove everything from this session, if you go a different direction

Nothing outside the paths below was touched, so a clean revert is just deleting these paths. Two independent units — remove either or both:

**Remove Tempo entirely (docs + all sprite assets):**
```bash
rm -rf "character-design/characters/tempo"
rm -f concept-art/sprites/tempo-*
```

**Remove Ringlet entirely (docs only — no sprites exist for it):**
```bash
rm -rf "character-design/characters/ringlet"
```

Nothing else references either character ID anywhere in the repo (verified by a full-repo grep for "tempo" and "ringlet" immediately before writing this report — the only other hits are unrelated matches on the substring "tempo" inside "temporarily"/"Temporary"). Deleting these two folders and the sprite files fully undoes this session with no dangling references, no schema/registry entries to clean up elsewhere, and no risk to Riffin, Lyra, or any Founding Friend/Legacy Grove data (none of that was touched or read in a way that could affect it).

---

## 9. Suggested next steps (pick any)

- Write the starter-trio fact into the docs (§6.1) — highest value, lowest effort.
- Decide Lyra's fate and, if it continues, bring it into schema/style compliance.
- Run the same full asset-production pass on Ringlet that Tempo just got, if it's being kept.
- Get real human/artist eyes on Tempo's first-pass sprites before treating any of it as final — everything produced this session is explicitly a first draft, not approved art.
- Decide whether to formalize the rect-based SVG rasterizer as a real project tool.

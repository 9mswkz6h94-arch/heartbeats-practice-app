# Musical Zoo character library expansion

**Status:** proposed app-local design direction  
**Date:** 2026-09-16  
**Scope:** character identity, space residency, and future integration boundaries

## The idea in one sentence

Keep the accepted nine-character cast as the small group of friends who can travel with a student, then grow the world with home-bound residents who make one habitat feel deep without adding another global choice to the companion picker.

This is a design proposal, not an app-registry, progression, database, or release change.

## Two character tiers

### Core Friends

The existing accepted library remains the core cast:

- Riffin, Boppo, and Chordillo are the locked starter trio.
- Ringlet, Brumbo, Plinka, Puffino, Cymbi, and Spirlo are the accepted post-starter library.
- A core friend may be selected as the response-only companion, appear in the Commons, live in more than one owned habitat, and have the full sticker treatment.
- “Core” describes the character's world role. It does not automatically grant that character to a live student; ownership and arrival remain separate decisions.

### Home-bound Residents

New expansion characters are residents of one named place.

- A resident has one home habitat and does not appear in the global companion picker by default.
- The first app surface is its purpose-authored 32×32 habitat NPC. The companion and three sticker interpretations are still created and versioned in the character packet so the identity remains coherent, but those larger surfaces stay unexposed until a later promotion decision.
- A resident can greet, roam, and occasionally meet another resident in its home habitat. It does not prompt practice, comment on accuracy, rank students, or imply that an empty home is a problem.
- A resident may later be promoted to Core Friend, but promotion is an explicit review decision rather than an automatic side effect of popularity or time.

### Visitors (later)

Calendar or Studio-event characters should be a third, deliberately smaller tier:

- Visitors appear in one place for a reviewed event window and return through a grace window or later visit.
- They are never previewed as missing, never removed from a student's collection, and never create a permanent “you had to be there” hole.
- Visitors are not part of the first expansion wave. Keep them separate from resident ownership until D-023 receives a concrete implementation decision.

## Space jobs

The existing destinations keep their current meanings:

| Space ID | World job | Character policy |
| --- | --- | --- |
| `commons` | Shared social paths | Core companion plus approved visitors; no permanent resident roster in the first wave |
| `meadow` | Melody Meadow | Home for melody-adjacent residents such as articulation and tone color |
| `riverbank` | Rhythm Riverbank | Home for pulse, subdivision, rests, and other time-space residents |
| `cabin` | Caretaker Cabin | Care, eggs, naming, and collection management; not a habitat |
| `museum` | Founding Friends Museum | Static Legacy Grove exhibits only; do not turn the archive into a living roster |
| `stickers` | Sticker Book | Keepsakes and shared encouragement; not a habitat |

The resident model deliberately gives the two living habitats more depth without making every destination another character list.

## First resident wave (identity briefs)

These four are high-confidence proposals for `identity-review`. No art has been generated or accepted for them.

### Piplet — Melody Meadow

- **ID:** `piplet`
- **Creature + integrated instrument:** Sparrow whose beak forms one short piccolo tube
- **Musical role:** Articulation — clear starts, stops, and tiny separations
- **Practice virtue:** Clear beginnings
- **Personality promise:** Piplet makes every entrance feel possible.
- **Silhouette anchor:** A teardrop beak and quick folded wings
- **Anatomy invariant:** The single beak is the whole piccolo mechanism, with exactly three small finger holes along its lower edge; the body keeps two wings and two feet.
- **Avoid:** Separate flute, chest pipe, extra beaks or holes, dangling tube, or a sharp weapon-like beak
- **Home behavior:** Short right-facing hops between meadow flowers; a tiny head dip when another resident passes

### Melloo — Melody Meadow

- **ID:** `melloo`
- **Creature + integrated instrument:** Young deer whose antlers form one tuned-chime rack
- **Musical role:** Timbre — noticing the color and texture inside a sound
- **Practice virtue:** Curious noticing
- **Personality promise:** Melloo listens for the shade inside a sound.
- **Silhouette anchor:** Two branching antlers with a small, readable chime cluster
- **Anatomy invariant:** Exactly two antlers frame one attached three-bar chime rack; the chimes stay anchored between the antlers and never hang from the torso.
- **Avoid:** Crown, extra horns, loose bells, dangling ornaments, or a second instrument
- **Home behavior:** Slow, side-to-side meadow wandering with a gentle antler tilt at route meetings

### Clakka — Rhythm Riverbank

- **ID:** `clakka`
- **Creature + integrated instrument:** Fiddler crab whose two front claws are a castanet pair
- **Musical role:** Subdivision — finding the little steps between larger beats
- **Practice virtue:** Patient counting
- **Personality promise:** Clakka finds the tiny steps between the big beats.
- **Silhouette anchor:** One broad claw and one smaller claw held as a friendly, readable pair
- **Anatomy invariant:** The two front claws are the only castanet mechanism, each a single hinged shell pair; no castanet is carried outside the crab body.
- **Avoid:** Separate clackers, drum, mallets, extra claws, sharp pincers, or a human hand shape
- **Home behavior:** Sideways walks along the river edge, pausing at stepping stones in a two-beat pattern

### Reedle — Rhythm Riverbank

- **ID:** `reedle`
- **Creature + integrated instrument:** Beaver whose broad paddle tail is one reed-pipe board
- **Musical role:** Rests and space — making room around a sound
- **Practice virtue:** Leaving room
- **Personality promise:** Reedle knows the quiet gaps help music breathe.
- **Silhouette anchor:** A broad flat tail with three clean vertical reed slots
- **Anatomy invariant:** The tail itself is one reed-pipe board with exactly three visible slots; there is no second flute, mouthpiece, or instrument on the chest.
- **Avoid:** Loose reeds, chest instrument, multiple tails, metronome, dangling tubes, or a tail that reads as a separate prop
- **Home behavior:** Gentle water-edge loops with a still pause beside the reeds before continuing

## How the library can become large without becoming noisy

Use a catalog/residency split rather than adding more special cases to the UI:

```text
characterCatalog
  identity + art versions + voice pack + tier

spaceRoster
  space ID + resident IDs + route family + encounter rules

student ownership
  explicit IDs only; home-bound residents stay filtered to their home space
```

Proposed metadata, to be added only in a separately authorized implementation task:

```json
{
  "tier": "resident",
  "homeSpace": "meadow",
  "surfacePolicy": {
    "habitat": true,
    "companion": false,
    "stickers": false,
    "commons": false
  }
}
```

The existing `owned_character_ids` seam can remain the persistent inventory boundary. The UI adapter should filter by `surfacePolicy` rather than duplicating IDs across companion, Commons, and habitat code.

### Population rhythm

- Keep four or fewer residents visible in one habitat at a time, matching the current readable play-field scale.
- Maintain a larger discovered roster behind the habitat, but never show a “complete set,” missing denominator, locked silhouette, or fill-the-homes meter to students.
- Let empty space read as breathing room. The map may say “friends exploring” rather than “2 of 4 homes filled.”
- Use the existing calm cadence as the default arrival idea: an earned resident egg around every ten XP (about two weeks at a steady pace), with no decay or missed-day penalty. The teacher/admin grant workflow and any resident-reveal migration remain separate work.

## Art and interaction gates

Every resident still follows the accepted Musical Zoo contract:

1. identity-review with a stable ID, integrated instrument, musical role, virtue, silhouette anchor, anatomy invariant, and avoid list;
2. companion-review for the medium identity master;
3. three-format-review for purpose-authored habitat, companion, and sticker sources;
4. deterministic build, native-size review, and exact source-version pins;
5. response-only copy and reduced-motion behavior if the resident is ever promoted beyond its habitat.

The first resident wave should stop after identity review until the four briefs are accepted. Do not generate a bulk art batch for all future residents before the silhouettes and instrument fusions are human-reviewed.

## Open decisions before implementation

- Confirm whether “resident-only” means discoverable inventory with a home restriction, or ambient residents that can be met without ownership.
- Confirm whether Meadow and Riverbank are the only first-wave homes, or whether a new living destination should be designed before more characters are commissioned.
- Decide whether resident greetings are purely ambient or may be tapped for a tiny authored hello; either way, preserve response-only practice behavior.
- Define the teacher/admin grant workflow for explicit resident IDs before any live student receives one.
- Human-review the four identity briefs above, then promote only the strongest two into companion masters first.

## Current recommendation

**Proceed with the resident model, but start with two characters, not a flood:** Piplet for Melody Meadow and Clakka for Rhythm Riverbank. They add two unused musical lenses—articulation and subdivision—and their silhouettes are immediately distinct from the accepted cast. Melloo and Reedle should remain the next pair after the first two pass identity review.

No app code, registry entry, migration, progression rule, production record, push, or deployment was changed while preparing this proposal.

# Lyra the Armadillo

## Overview
Lyra is a friendly armadillo who loves music and carries a tiny xylophone on her back. She encourages students with steady, rhythmic cues and celebrates progress with playful percussion beats.

## Visual Style
- **Primary palette**: Warm earth tones—soft browns and muted golds.
- **64×64 companion sprite**: Armadillo standing upright, holding a miniature xylophone.
- **32×32 roaming sprite**: Simplified armadillo silhouette with a gentle sway.
- **16×16 egg**: Earth‑colored egg with a subtle musical note pattern.
- **Stickers**: Happy strum, thoughtful tap, focused rhythm.

> Note: The artwork files are pending; placeholders will be replaced once new concept art is available.

## Personality Traits (voice pack)
- Curious
- Gentle
- Melodic
- Wise

## Avoided Phrases
- Pressure, guilt, comparisons, accuracy claims.

## Special Animations
Lyra can perform a few lightweight, non‑intrusive animations that reinforce the musical theme without disrupting practice:
- **Flutters gently** – a brief wing flutter when a micro‑reaction appears.
- **Spreads wings** – a small wing‑spread animation for progress milestones.
- **Twirls a musical note** – a rotating note that appears beside the avatar during `step_complete_*` intents.
- **Perches on a staff** – Lyra hops onto a musical staff graphic when the session is completed.
These are expressed via the new `special_animation` intent and can be triggered alongside existing intents.

## Usage Notes
- Follow the interaction guide for intent handling.
- Validate the manifest with `schema/character-manifest.schema.json` before committing.
- Run automated tests (`npm test` in the repo) to ensure all required intents are present and length limits are respected.

import itertools
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
CHARACTER_DIR = ROOT / "character-design" / "characters" / "riffin"
SPRITE_DIR = ROOT / "concept-art" / "sprites"
UI_BACKGROUND = (233, 240, 208, 255)
OUTLINE = (32, 25, 35, 255)


def load_sprite(name):
    return Image.open(SPRITE_DIR / name).convert("RGBA")


def scaled_frame(name, scale=4, padding=16):
    sprite = load_sprite(name).resize((64 * scale, 64 * scale), Image.Resampling.NEAREST)
    frame = Image.new("RGBA", (64 * scale + padding * 2, 64 * scale + padding * 2), UI_BACKGROUND)
    frame.alpha_composite(sprite, (padding, padding))
    return frame.convert("P", palette=Image.Palette.ADAPTIVE, colors=8)


def save_animation(output, frame_names, duration):
    frames = [scaled_frame(name) for name in frame_names]
    frames[0].save(
        SPRITE_DIR / output,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=0,
        disposal=2,
        optimize=False,
    )


def font(size):
    candidates = [
        Path("C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/segoeui.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def make_phone_sheet():
    canvas = Image.new("RGBA", (390, 844), UI_BACKGROUND)
    draw = ImageDraw.Draw(canvas)
    title_font = font(24)
    body_font = font(15)
    tiny_font = font(12)

    draw.text((24, 24), "Riffin phone-size review", fill=OUTLINE, font=title_font)
    draw.text((24, 62), "Native 64 px companion", fill=OUTLINE, font=body_font)
    companion = load_sprite("riffin-64x64-v2.png")
    canvas.alpha_composite(companion, (163, 92))

    draw.text((24, 184), "Native 64 px stickers (no labels)", fill=OUTLINE, font=body_font)
    sticker_names = [
        "riffin-sticker-celebrate-v2.png",
        "riffin-sticker-encourage-v2.png",
        "riffin-sticker-connect-v2.png",
    ]
    for x, name in zip((57, 163, 269), sticker_names):
        canvas.alpha_composite(load_sprite(name), (x, 220))

    draw.line((24, 316, 366, 316), fill=OUTLINE, width=2)
    draw.text((24, 340), "4x nearest-neighbor inspection", fill=OUTLINE, font=body_font)
    enlarged = companion.resize((256, 256), Image.Resampling.NEAREST)
    canvas.alpha_composite(enlarged, (67, 380))

    prompts = [
        "1. Fox at first glance?",
        "2. Acoustic-guitar body?",
        "3. Three strings + three pegs?",
        "4. Friendly practice companion?",
    ]
    y = 674
    for prompt in prompts:
        draw.text((34, y), "[ ] " + prompt, fill=OUTLINE, font=tiny_font)
        y += 32

    canvas.convert("RGB").save(SPRITE_DIR / "riffin-v2-phone-scale-review.png")


def expand_voice_pack():
    pack = json.loads((CHARACTER_DIR / "voice-pack-v2.json").read_text(encoding="utf-8"))
    catalog = json.loads(
        (ROOT / "character-design" / "interactions" / "interaction-intents-v1.json").read_text(encoding="utf-8")
    )

    sections = []
    total = 0
    long_micro = 0

    for intent, data in pack["intents"].items():
        level = catalog["intents"][intent]["level"]
        variables = catalog["intents"][intent]["variables"]
        atoms = {key: value for key, value in data.items() if key != "templates"}
        lines = []

        for template in data["templates"]:
            keys = re.findall(r"{([^}]+)}", template)
            pools = [atoms.get(key, ["{" + key + "}"]) for key in keys]
            for values in itertools.product(*pools):
                text = template
                atom_parts = []
                for key, value in zip(keys, values):
                    text = text.replace("{" + key + "}", value)
                    atom_parts.append(f"{key}={value}")
                total += 1
                word_count = len(re.findall(r"\b[\w’'-]+\b", text))
                flagged = level == "micro" and word_count > 8
                if flagged:
                    long_micro += 1
                combination_id = f"riffin-v2:{intent}:{len(lines) + 1:03d}"
                lines.append(
                    f"- [ ] `{combination_id}` — {text}  "
                    f"\n  Words: {word_count}; "
                    f"{'**FLAG: micro reaction exceeds 8 words**; ' if flagged else ''}"
                    f"atoms: {', '.join(atom_parts) if atom_parts else 'static template'}"
                )

        sections.append(
            f"## `{intent}`\n\n"
            f"Level: **{level}**  \n"
            f"Allowed variables: {', '.join(f'`{v}`' for v in variables) if variables else 'none'}  \n"
            f"Expanded combinations: **{len(lines)}**\n\n"
            + "\n".join(lines)
        )

    header = f"""# Riffin Voice Pack V2 — exhaustive review

Generated from `voice-pack-v2.json`. This is an editorial review artifact, not runtime content.

## Review instructions

For every line, check the box only if it:

- sounds naturally like Riffin;
- is shame-free and non-comparative;
- makes no unmeasured accuracy or emotional claim;
- works with every visible safe variable placeholder;
- feels appropriate for its response level;
- is concise enough for a child-facing companion bubble.

Mark proposed edits directly beneath a rejected line. Do not change runtime text until the edited combinations are regenerated and recounted.

## Capacity summary

- Catalog intents implemented: **{len(pack['intents'])} of {len(catalog['intents'])}**
- Expanded combinations: **{total}**
- Micro combinations over the preferred eight-word target: **{long_micro}**
- Human line-by-line approval: **pending**

"""
    output = header + "\n".join(sections) + "\n"
    (CHARACTER_DIR / "VOICE_REVIEW_V2.md").write_text(output, encoding="utf-8")
    return total, long_micro


save_animation(
    "riffin-idle-v2-review.gif",
    ["riffin-idle-01-v2.png", "riffin-idle-02-v2.png"],
    650,
)
save_animation(
    "riffin-dance-v2-review.gif",
    ["riffin-dance-01-v2.png", "riffin-dance-02-v2.png"],
    220,
)
save_animation(
    "riffin-celebrate-v2-review.gif",
    ["riffin-celebrate-01-v2.png", "riffin-celebrate-02-v2.png"],
    300,
)
make_phone_sheet()
count, flagged = expand_voice_pack()
assert count == 175, count
print(f"Built Riffin review pack: 3 GIFs, phone sheet, {count} voice lines, {flagged} long micro flags.")

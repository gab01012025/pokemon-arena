#!/usr/bin/env python3
"""
Fill missing skill images ONLY. Does NOT touch existing images.
For each missing skill icon (0.png - 3.png), generates a type-colored
icon using the Pokemon's portrait as the base artwork.
"""

import os
import math
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILLS_DIR = os.path.join(BASE_DIR, "public", "skills")
PORTRAITS_DIR = os.path.join(BASE_DIR, "public", "pokemon-anime")
ICON_SIZE = 54

TYPE_COLORS = {
    "fire": (240, 128, 48), "water": (104, 144, 240), "grass": (120, 200, 80),
    "electric": (248, 208, 48), "psychic": (248, 88, 136), "fighting": (192, 48, 40),
    "dark": (112, 88, 72), "poison": (160, 64, 160), "ghost": (112, 88, 152),
    "ground": (224, 192, 104), "flying": (168, 144, 240), "rock": (184, 160, 56),
    "bug": (168, 184, 32), "ice": (152, 216, 216), "steel": (184, 184, 208),
    "dragon": (112, 56, 248), "fairy": (238, 153, 172), "normal": (168, 168, 120),
}

# All Pokemon in the game with their types — matches play/page.tsx
GAME_POKEMON = {
    1: "grass", 4: "fire", 7: "water", 25: "electric", 133: "normal",
    52: "normal", 10: "bug", 13: "bug", 16: "flying", 19: "normal",
    21: "flying", 23: "poison", 27: "ground", 29: "poison", 32: "poison",
    37: "fire", 58: "fire", 77: "fire", 60: "water", 116: "water",
    129: "water", 63: "psychic", 92: "ghost", 66: "fighting", 74: "rock",
    81: "electric", 147: "dragon", 43: "grass", 35: "fairy", 39: "fairy",
    104: "ground", 109: "poison", 100: "electric", 79: "water",
    41: "poison", 46: "bug", 48: "bug", 50: "ground", 54: "water",
    56: "fighting", 69: "grass", 72: "water", 83: "normal", 84: "normal",
    86: "water", 88: "poison", 90: "water", 95: "rock", 96: "psychic",
    98: "water", 102: "grass", 106: "fighting", 107: "fighting",
    108: "normal", 111: "ground", 113: "normal", 114: "grass",
    115: "normal", 118: "water", 120: "water", 122: "psychic",
    123: "bug", 124: "ice", 125: "electric", 126: "fire", 127: "bug",
    128: "normal", 131: "water", 132: "normal", 137: "normal",
    138: "rock", 140: "rock", 142: "rock", 143: "normal",
    # Mission Pokemon
    155: "fire", 158: "water", 152: "grass", 179: "electric", 403: "electric",
    255: "fire", 258: "water", 252: "grass", 447: "fighting", 570: "dark",
    280: "psychic", 371: "dragon", 359: "dark", 656: "water",
    610: "dragon", 633: "dark", 636: "bug", 679: "steel",
    374: "steel", 778: "ghost", 885: "dragon", 443: "dragon",
    722: "grass", 246: "rock",
}

# Variation offsets for 4 skills - each gets a slightly different crop/tint
SKILL_VARIATIONS = [
    {"zoom": 1.0, "offset": (0, 0), "brightness": 0.95, "tint_strength": 0.15},
    {"zoom": 1.3, "offset": (5, -5), "brightness": 0.85, "tint_strength": 0.25},
    {"zoom": 1.5, "offset": (-5, 5), "brightness": 0.80, "tint_strength": 0.35},
    {"zoom": 1.2, "offset": (3, 3), "brightness": 0.90, "tint_strength": 0.20},
]


def create_skill_from_portrait(portrait_path: str, pokemon_type: str, skill_index: int) -> Image.Image:
    """Create a skill icon from the Pokemon's portrait."""
    size = ICON_SIZE
    color = TYPE_COLORS.get(pokemon_type, TYPE_COLORS["normal"])
    var = SKILL_VARIATIONS[skill_index % 4]

    try:
        portrait = Image.open(portrait_path).convert("RGBA")
    except Exception:
        return create_fallback_icon(pokemon_type)

    w, h = portrait.size

    # Zoom and offset for variation
    zoom = var["zoom"]
    ox, oy = var["offset"]
    crop_size = int(min(w, h) / zoom)
    cx = w // 2 + ox - crop_size // 2
    cy = h // 2 + oy - crop_size // 2
    cx = max(0, min(cx, w - crop_size))
    cy = max(0, min(cy, h - crop_size))

    cropped = portrait.crop((cx, cy, cx + crop_size, cy + crop_size))
    cropped = cropped.resize((size, size), Image.LANCZOS)

    # Create base with dark background
    icon = Image.new("RGBA", (size, size), (10, 10, 20, 255))
    icon.paste(cropped, (0, 0), cropped)

    # Convert to RGB — NO color tint, just clean image
    rgb = icon.convert("RGB")
    rgb = ImageEnhance.Contrast(rgb).enhance(1.1)
    rgb = ImageEnhance.Brightness(rgb).enhance(var["brightness"])

    final = rgb.convert("RGB")
    return final


def create_fallback_icon(pokemon_type: str) -> Image.Image:
    """Pure type-colored glow icon (no portrait available)."""
    size = ICON_SIZE
    color = TYPE_COLORS.get(pokemon_type, TYPE_COLORS["normal"])
    icon = Image.new("RGB", (size, size), (10, 10, 20))
    draw = ImageDraw.Draw(icon)
    center = size // 2
    for y in range(size):
        for x in range(size):
            dx, dy = (x - center) / center, (y - center) / center
            dist = min(1.0, math.sqrt(dx * dx + dy * dy))
            glow = max(0, 1.0 - dist) * 0.5
            r = int(10 + color[0] * glow)
            g = int(10 + color[1] * glow)
            b = int(20 + color[2] * glow)
            draw.point((x, y), fill=(min(255, r), min(255, g), min(255, b)))
    draw.rectangle([0, 0, size - 1, size - 1], outline=(0, 0, 0))
    draw.rectangle([1, 1, size - 2, size - 2], outline=color)
    return icon


def main():
    filled = 0
    skipped = 0
    no_portrait = 0

    for pokemon_id, pokemon_type in sorted(GAME_POKEMON.items()):
        poke_dir = os.path.join(SKILLS_DIR, str(pokemon_id))
        os.makedirs(poke_dir, exist_ok=True)

        portrait_path = os.path.join(PORTRAITS_DIR, f"{pokemon_id}.png")
        has_portrait = os.path.exists(portrait_path)

        for i in range(4):
            skill_path = os.path.join(poke_dir, f"{i}.png")
            if os.path.exists(skill_path):
                skipped += 1
                continue

            # Generate missing skill icon
            if has_portrait:
                icon = create_skill_from_portrait(portrait_path, pokemon_type, i)
            else:
                icon = create_fallback_icon(pokemon_type)
                no_portrait += 1

            icon.save(skill_path, "PNG", optimize=True)
            filled += 1

    print(f"Filled: {filled}, Skipped (existing): {skipped}, No portrait: {no_portrait}")


if __name__ == "__main__":
    main()

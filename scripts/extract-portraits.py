#!/usr/bin/env python3
"""
Extract Pokemon portrait images from arena-game.app character cards.
Portrait is in top-left of card, roughly 130x130px, below the orange header bar.
"""

import os
from PIL import Image, ImageEnhance

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ANIME_DIR = os.path.join(BASE_DIR, "public", "pokemon-anime")
DOWNLOADS = os.path.expanduser("~/Downloads")

CARDS = {
    "Bulbasaur.png": (1, "Bulbasaur"),
    "Charmander.png": (4, "Charmander"),
    "Squirtle.png": (7, "Squirtle"),
    "Chansey.png": (113, "Chansey"),
}

# Fixed layout constants for arena-game.app cards (565px wide)
PORTRAIT_LEFT = 12
PORTRAIT_TOP = 38      # below orange name header
PORTRAIT_SIZE = 120     # square crop


def extract_portrait(img_path, dex, name):
    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    pixels = img.load()

    # Find the orange header bar bottom edge
    header_bottom = PORTRAIT_TOP
    for y in range(10, 60):
        orange = 0
        for x in range(0, w // 3):
            r, g, b = pixels[x, y]
            if r > 170 and g > 80 and b < 100:
                orange += 1
        if orange > w // 8:
            header_bottom = y + 1

    # Portrait starts right after header
    crop_top = header_bottom + 2
    crop_left = PORTRAIT_LEFT

    # Find the actual image boundary: scan to find where the
    # portrait image content ends (where it meets white/card background)
    # The portrait is on the left side, text is on the right

    # Find right edge of portrait: look for where content stops and text/whitespace begins
    img_right = crop_left + PORTRAIT_SIZE
    for x in range(crop_left + 80, crop_left + 180):
        if x >= w:
            break
        # Check if this column is mostly white/light (card background)
        light = 0
        for y in range(crop_top + 20, crop_top + 100):
            r, g, b = pixels[x, y]
            if r > 235 and g > 235 and b > 235:
                light += 1
        if light > 40:  # mostly white column = edge of portrait
            img_right = x - 2
            break

    # Find bottom edge of portrait
    img_bottom = crop_top + PORTRAIT_SIZE
    for y in range(crop_top + 80, crop_top + 180):
        if y >= h:
            break
        light = 0
        for x in range(crop_left + 10, min(img_right, crop_left + 120)):
            r, g, b = pixels[x, y]
            if r > 235 and g > 235 and b > 235:
                light += 1
        if light > 50:  # mostly white row = bottom of portrait
            img_bottom = y - 2
            break

    actual_w = img_right - crop_left
    actual_h = img_bottom - crop_top
    size = min(actual_w, actual_h)

    print(f"  Card: {w}x{h}, header_bottom: {header_bottom}")
    print(f"  Portrait area: ({crop_left},{crop_top}) to ({img_right},{img_bottom}) = {actual_w}x{actual_h}")

    # Crop square portrait
    crop = img.crop((crop_left, crop_top, crop_left + size, crop_top + size))

    # Resize to 200x200
    portrait = crop.resize((200, 200), Image.Resampling.LANCZOS)
    portrait = ImageEnhance.Contrast(portrait).enhance(1.05)

    out_path = os.path.join(ANIME_DIR, f"{dex}.png")
    portrait.save(out_path, "PNG", optimize=True)
    print(f"  Saved: {out_path} ({size}x{size} -> 200x200)")


def main():
    os.makedirs(ANIME_DIR, exist_ok=True)
    for filename, (dex, name) in CARDS.items():
        filepath = os.path.join(DOWNLOADS, filename)
        if not os.path.exists(filepath):
            print(f"[SKIP] {filename}")
            continue
        print(f"[{name}] #{dex}:")
        extract_portrait(filepath, dex, name)
    print("\nDone!")


if __name__ == "__main__":
    main()

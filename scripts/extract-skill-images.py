#!/usr/bin/env python3
"""
Extract skill images from arena-game.app character card PNGs.
Layout: portrait at top, divider, then 2x2 grid of skills.
Each skill box has: white gap, orange title bar, black border, then artwork.

Key insight: the white+title area varies per card (20px on Bulbasaur,
39px on Chansey). We detect the black border line dynamically per box,
then crop exactly 65px of artwork below it.
"""

import os
from PIL import Image, ImageEnhance

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILLS_DIR = os.path.join(BASE_DIR, "public", "skills")
DOWNLOADS = os.path.expanduser("~/Downloads")
ICON_SIZE = 54
ARTWORK_SIZE = 65  # Proven size from Bulbasaur

CARDS = {
    "Bulbasaur.png": (1, "Bulbasaur"),
    "Charmander.png": (4, "Charmander"),
    "Squirtle.png": (7, "Squirtle"),
    "Chansey.png": (113, "Chansey"),
}


def find_divider_y(img):
    w, h = img.size
    pixels = img.load()
    for y in range(h // 4, 3 * h // 4):
        gray_count = 0
        for x in range(w // 4, 3 * w // 4):
            r, g, b = pixels[x, y]
            if 120 < r < 195 and 120 < g < 195 and 120 < b < 195:
                gray_count += 1
        if gray_count > w // 8:
            return y
    return int(h * 0.35)


def find_artwork_start(img, bx1, by1, bx2):
    """
    Find where the artwork starts within a skill box by detecting
    the black border line (the last dark row before artwork begins).
    Returns the Y coordinate of the first artwork row.
    """
    pixels = img.load()
    scan_x_start = bx1 + 10
    scan_x_end = min(bx1 + 80, bx2)
    scan_width = scan_x_end - scan_x_start

    for dy in range(0, 50):
        y = by1 + dy
        dark_count = 0
        for x in range(scan_x_start, scan_x_end):
            r, g, b = pixels[x, y]
            brightness = (r + g + b) / 3
            if brightness < 20:
                dark_count += 1
        # A row is the black border if >50% of pixels are very dark
        if dark_count > scan_width * 0.5:
            # Artwork starts 1px below the black border line
            return y + 1

    # Fallback: assume 22px title bar
    return by1 + 22


def extract_skills(img_path, dex, name):
    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    mid_x = w // 2

    divider_y = find_divider_y(img)
    skills_start = divider_y + 20
    row_h = (h - skills_start) // 2

    # 4 skill boxes in 2x2 grid
    boxes = [
        (5, skills_start, mid_x - 5, skills_start + row_h),
        (mid_x + 5, skills_start, w - 5, skills_start + row_h),
        (5, skills_start + row_h, mid_x - 5, h - 5),
        (mid_x + 5, skills_start + row_h, w - 5, h - 5),
    ]

    out_dir = os.path.join(SKILLS_DIR, str(dex))
    os.makedirs(out_dir, exist_ok=True)

    for i, (bx1, by1, bx2, by2) in enumerate(boxes):
        # Find where artwork actually starts (after title bar + black border)
        art_y = find_artwork_start(img, bx1, by1, bx2)
        art_x = bx1 + 11  # Skip left border (black line at ~x+10)

        # Crop exactly ARTWORK_SIZE x ARTWORK_SIZE of pure artwork
        crop = img.crop((art_x, art_y, art_x + ARTWORK_SIZE, art_y + ARTWORK_SIZE))
        tw, th = crop.size
        print(f"  Skill {i}: art_start=dy{art_y - by1}, crop {tw}x{th}")

        # Resize to final icon size
        icon = crop.resize((ICON_SIZE, ICON_SIZE), Image.Resampling.LANCZOS)
        icon = ImageEnhance.Contrast(icon).enhance(1.05)
        icon = ImageEnhance.Color(icon).enhance(1.05)

        out_path = os.path.join(out_dir, f"{i}.png")
        icon.save(out_path, "PNG", optimize=True)

    return 4


def main():
    total = 0
    for filename, (dex, name) in CARDS.items():
        filepath = os.path.join(DOWNLOADS, filename)
        if not os.path.exists(filepath):
            print(f"[SKIP] {filename} not found")
            continue
        print(f"[{name}] #{dex}:")
        total += extract_skills(filepath, dex, name)
    print(f"\nDone! {total} skill images.")


if __name__ == "__main__":
    main()

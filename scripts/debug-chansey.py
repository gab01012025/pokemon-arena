#!/usr/bin/env python3
"""Debug: Extract raw skill box areas from Chansey card to see exact layout."""
import os
from PIL import Image

DOWNLOADS = os.path.expanduser("~/Downloads")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BASE_DIR, "scripts", "_debug_crops")
os.makedirs(OUT_DIR, exist_ok=True)

for name in ["Bulbasaur", "Chansey"]:
    img = Image.open(os.path.join(DOWNLOADS, f"{name}.png")).convert("RGB")
    w, h = img.size
    mid_x = w // 2
    pixels = img.load()

    # Find divider
    divider_y = None
    for y in range(h // 4, 3 * h // 4):
        gray_count = 0
        for x in range(w // 4, 3 * w // 4):
            r, g, b = pixels[x, y]
            if 120 < r < 195 and 120 < g < 195 and 120 < b < 195:
                gray_count += 1
        if gray_count > w // 8:
            divider_y = y
            break
    if not divider_y:
        divider_y = int(h * 0.35)

    skills_start = divider_y + 20
    row_h = (h - skills_start) // 2

    print(f"\n=== {name} ===")
    print(f"Card: {w}x{h}, divider_y={divider_y}, skills_start={skills_start}, row_h={row_h}")

    # Extract skill box 3 (bottom-right) - most problematic
    bx1, by1 = mid_x + 5, skills_start + row_h
    bx2, by2 = w - 5, h - 5
    print(f"Box 3: ({bx1},{by1})-({bx2},{by2})")

    # Save full box 3
    full_box = img.crop((bx1, by1, bx2, by2))
    full_box.save(os.path.join(OUT_DIR, f"{name}_box3_full.png"))

    # Save just the top portion to see title bar
    top_strip = img.crop((bx1, by1, bx1 + 100, by1 + 40))
    top_strip.save(os.path.join(OUT_DIR, f"{name}_box3_top40.png"))

    # Scan vertically to find title bar end
    center_x = bx1 + 50
    print(f"Vertical scan at x={center_x}:")
    for dy in range(0, 40):
        y = by1 + dy
        r, g, b = pixels[center_x, y]
        brightness = (r + g + b) / 3
        is_orange = r > 180 and g > 100 and g < 180 and b < 100
        is_white = brightness > 220
        is_dark = brightness < 30
        tag = ""
        if is_orange:
            tag = " <-- ORANGE TITLE"
        elif is_white:
            tag = " <-- WHITE"
        elif is_dark:
            tag = " <-- DARK/BORDER"
        print(f"  dy={dy:2d} y={y}: rgb({r:3d},{g:3d},{b:3d}) brightness={brightness:.0f}{tag}")

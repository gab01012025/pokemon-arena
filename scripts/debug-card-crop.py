#!/usr/bin/env python3
"""
Debug: Extract a wider view of each skill box to see where artwork starts/ends.
"""
import os
from PIL import Image

DOWNLOADS = os.path.expanduser("~/Downloads")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BASE_DIR, "scripts", "_debug_crops")
os.makedirs(OUT_DIR, exist_ok=True)


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


# Use Bulbasaur as reference
img = Image.open(os.path.join(DOWNLOADS, "Bulbasaur.png")).convert("RGB")
w, h = img.size
mid_x = w // 2
divider_y = find_divider_y(img)
skills_start = divider_y + 20
row_h = (h - skills_start) // 2

print(f"Card: {w}x{h}, divider_y={divider_y}, skills_start={skills_start}, row_h={row_h}")

# Extract full skill box 0 (top-left) for analysis
bx1, by1, bx2, by2 = (5, skills_start, mid_x - 5, skills_start + row_h)
print(f"Box 0: ({bx1},{by1})-({bx2},{by2})")

# Save the full skill box
full_box = img.crop((bx1, by1, bx2, by2))
full_box.save(os.path.join(OUT_DIR, "full_box_0.png"))
print(f"Saved full_box_0.png: {full_box.size}")

# Save the current 80x80 crop area
ix = bx1 + 8
iy = by1 + 25
current_crop = img.crop((ix, iy, ix + 80, iy + 80))
current_crop.save(os.path.join(OUT_DIR, "current_crop_0.png"))
print(f"Current crop: ({ix},{iy})-({ix+80},{iy+80})")

# Now let's analyze pixel colors to find the artwork boundary
# The artwork area should have colorful pixels, while the border/background is lighter
pixels = img.load()

# Scan horizontal line at artwork center to find left/right edges
center_y = iy + 40
print(f"\nHorizontal scan at y={center_y}:")
for x in range(bx1, bx1 + 100):
    r, g, b = pixels[x, center_y]
    brightness = (r + g + b) / 3
    if brightness > 200:
        marker = " <-- BRIGHT"
    elif brightness > 150:
        marker = " <-- LIGHT"
    else:
        marker = ""
    if x < bx1 + 20 or marker:
        print(f"  x={x}: rgb({r},{g},{b}) brightness={brightness:.0f}{marker}")

# Scan vertical line at artwork center
center_x = ix + 40
print(f"\nVertical scan at x={center_x}:")
for y in range(by1, by1 + 35):
    r, g, b = pixels[center_x, y]
    brightness = (r + g + b) / 3
    if brightness > 200:
        marker = " <-- BRIGHT"
    elif brightness > 150:
        marker = " <-- LIGHT"
    else:
        marker = ""
    print(f"  y={y}: rgb({r},{g},{b}) brightness={brightness:.0f}{marker}")

# Also save crops with different inner margins to compare
for margin in [4, 6, 8, 10]:
    inner = img.crop((ix + margin, iy + margin, ix + 80 - margin, iy + 80 - margin))
    inner = inner.resize((54, 54), Image.LANCZOS)
    inner.save(os.path.join(OUT_DIR, f"inner_margin_{margin}.png"))
    print(f"\nSaved inner_margin_{margin}.png (crop {margin}px from each edge)")

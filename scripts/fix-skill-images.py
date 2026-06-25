#!/usr/bin/env python3
"""
Fix skill images:
1. 54x54 card-extracted images → center-crop 5px borders → save as clean PNG
2. 320x180+ landscape anime screenshots → center-crop to square → resize to 54x54 → save as PNG
3. Fix JPEG-as-PNG files (wrong extension)
"""

from PIL import Image
import os
import sys

SKILLS_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'skills')
TARGET_SIZE = 54  # Match the existing good format

# All Pokemon IDs used in the game
ALL_IDS = [
    1, 4, 7, 25, 133, 52, 10, 13, 16, 19, 21, 23, 27, 29, 32, 37, 58, 77,
    60, 116, 129, 63, 92, 66, 74, 81, 147, 43, 35, 39, 104, 109, 100, 79,
    41, 46, 48, 50, 54, 56, 69, 72, 83, 84, 86, 88, 90, 95, 96, 98, 102,
    106, 107, 108, 111, 113, 114, 115, 118, 120, 122, 123, 124, 125, 126,
    127, 128, 131, 132, 137, 138, 140, 142, 143,
    # Mission Pokemon
    155, 158, 152, 179, 403, 255, 258, 252, 447, 570, 280, 371, 359, 656,
    610, 633, 636, 679, 374, 778, 885, 443, 722, 246,
]

BORDER_CROP = 5  # pixels to crop from each side of 54x54 images

def process_image(filepath):
    """Process a single skill image file."""
    try:
        img = Image.open(filepath)
        w, h = img.size

        # Convert to RGB if needed (handles RGBA, palette, etc.)
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGB')

        if w == TARGET_SIZE and h == TARGET_SIZE:
            # Already correct size (54x54 card icon)
            # Center-crop to remove card borders
            inner = img.crop((
                BORDER_CROP,
                BORDER_CROP,
                w - BORDER_CROP,
                h - BORDER_CROP
            ))
            # Resize back to target size for consistency
            result = inner.resize((TARGET_SIZE, TARGET_SIZE), Image.LANCZOS)
        else:
            # Landscape screenshot (320x180 etc.) — center-crop to square
            min_dim = min(w, h)
            left = (w - min_dim) // 2
            top = (h - min_dim) // 2
            square = img.crop((left, top, left + min_dim, top + min_dim))
            result = square.resize((TARGET_SIZE, TARGET_SIZE), Image.LANCZOS)

        # Save as actual PNG (fixes JPEG-as-PNG issues)
        result.save(filepath, 'PNG')
        return True
    except Exception as e:
        print(f"  ERROR processing {filepath}: {e}", file=sys.stderr)
        return False

def main():
    processed = 0
    errors = 0
    missing = 0

    for pokemon_id in ALL_IDS:
        folder = os.path.join(SKILLS_DIR, str(pokemon_id))
        if not os.path.isdir(folder):
            missing += 4
            continue

        for i in range(4):
            filepath = os.path.join(folder, f'{i}.png')
            if os.path.isfile(filepath):
                if process_image(filepath):
                    processed += 1
                else:
                    errors += 1
            else:
                missing += 1

    print(f"Processed: {processed}, Errors: {errors}, Missing: {missing}")

if __name__ == '__main__':
    main()

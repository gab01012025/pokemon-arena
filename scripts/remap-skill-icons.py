#!/usr/bin/env python3
"""
Remap scraped ataquepokedex attack images to match the game's move structure.
Reads manifest.json (game moves) and attacks-data.json (scraped data),
then copies the best matching scraped image to the correct skill icon path.
"""

import json
import os
import shutil
from difflib import SequenceMatcher

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILLS_DIR = os.path.join(BASE_DIR, "public", "skills")

# Load data files
with open(os.path.join(SKILLS_DIR, "manifest.json")) as f:
    manifest = json.load(f)

with open(os.path.join(SKILLS_DIR, "attacks-data.json")) as f:
    scraped = json.load(f)

# Build a lookup: pokemon_dex -> {attack_name: raw_image_path}
# Using raw images (full size) instead of processed icons
scraped_lookup = {}
for poke_name, poke_data in scraped.items():
    dex = poke_data['dex']
    attacks = {}
    for atk in poke_data['attacks']:
        name = atk['name'].lower().strip()
        raw = atk.get('raw', '')
        icon = atk.get('icon', '')
        if raw or icon:
            attacks[name] = {
                'raw': os.path.join(BASE_DIR, 'public', raw.lstrip('/')) if raw else '',
                'icon': os.path.join(BASE_DIR, 'public', icon.lstrip('/')) if icon else '',
                'index': atk['index'],
            }
    scraped_lookup[dex] = attacks
    # Also store by name for fuzzy matching
    scraped_lookup[poke_name.lower()] = attacks


def fuzzy_match(move_name: str, candidates: dict) -> str | None:
    """Find the best fuzzy match for a move name in the candidates."""
    move_lower = move_name.lower().strip()

    # Exact match
    if move_lower in candidates:
        return move_lower

    # Partial match (contains)
    for name in candidates:
        if move_lower in name or name in move_lower:
            return name

    # Fuzzy match
    best_score = 0
    best_name = None
    for name in candidates:
        score = SequenceMatcher(None, move_lower, name).ratio()
        if score > best_score and score > 0.6:
            best_score = score
            best_name = name

    return best_name


def main():
    total_remapped = 0
    total_missing = 0
    total_pokemon = 0

    for poke_id, poke_data in sorted(manifest.items(), key=lambda x: int(x[0])):
        poke_name = poke_data['name']
        dex = int(poke_id)

        # Get scraped attacks for this Pokemon
        attacks = scraped_lookup.get(dex, {})
        if not attacks:
            # Try by name
            attacks = scraped_lookup.get(poke_name.lower(), {})

        if not attacks:
            print(f"[{poke_id}] {poke_name}: NO SCRAPED DATA")
            continue

        total_pokemon += 1
        remapped = 0

        for move in poke_data['moves']:
            move_name = move['name']
            icon_path = os.path.join(BASE_DIR, 'public', move['icon'].lstrip('/'))

            # Find matching attack
            match_key = fuzzy_match(move_name, attacks)

            if match_key:
                match = attacks[match_key]
                # Use the raw (full-size) image as the new icon
                source = match.get('raw', '') or match.get('icon', '')
                if source and os.path.exists(source):
                    # Copy as the skill icon (overwrite)
                    os.makedirs(os.path.dirname(icon_path), exist_ok=True)
                    shutil.copy2(source, icon_path)
                    remapped += 1
                    total_remapped += 1
                else:
                    total_missing += 1
            else:
                total_missing += 1

        if remapped > 0:
            print(f"[{poke_id}] {poke_name}: {remapped}/{len(poke_data['moves'])} moves remapped")
        else:
            print(f"[{poke_id}] {poke_name}: 0 matches found")

    print()
    print(f"=== RESULTS ===")
    print(f"Pokemon processed: {total_pokemon}")
    print(f"Moves remapped:    {total_remapped}")
    print(f"Moves missing:     {total_missing}")


if __name__ == '__main__':
    main()

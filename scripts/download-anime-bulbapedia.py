#!/usr/bin/env python3
"""
Download anime-style Pokemon images from Bulbapedia archives.
Uses the MediaWiki API to find anime screenshots for each Pokemon.
"""

import json
import os
import time
import urllib.request
import urllib.parse
import sys

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'pokemon-anime')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Series preference (newest = best quality anime art)
SERIES_PRIORITY = ['JN', 'HZ', 'SM', 'XY', 'BW', 'DP', 'AG', 'OS', 'Anime']

# All Pokemon in the game: name -> dex number
POKEMON = {
    'Bulbasaur': 1, 'Ivysaur': 2, 'Venusaur': 3,
    'Charmander': 4, 'Charmeleon': 5, 'Charizard': 6,
    'Squirtle': 7, 'Wartortle': 8, 'Blastoise': 9,
    'Caterpie': 10, 'Metapod': 11, 'Butterfree': 12,
    'Weedle': 13, 'Kakuna': 14, 'Beedrill': 15,
    'Pidgey': 16, 'Pidgeotto': 17, 'Pidgeot': 18,
    'Rattata': 19, 'Raticate': 20,
    'Spearow': 21, 'Fearow': 22,
    'Ekans': 23, 'Arbok': 24,
    'Pikachu': 25, 'Raichu': 26,
    'Sandshrew': 27, 'Sandslash': 28,
    'Nidoran♀': 29, 'Nidorina': 30, 'Nidoqueen': 31,
    'Nidoran♂': 32, 'Nidorino': 33, 'Nidoking': 34,
    'Clefairy': 35, 'Clefable': 36,
    'Vulpix': 37, 'Ninetales': 38,
    'Jigglypuff': 39, 'Wigglytuff': 40,
    'Zubat': 41,
    'Oddish': 43, 'Gloom': 44, 'Vileplume': 45,
    'Diglett': 50,
    'Meowth': 52, 'Persian': 53,
    'Psyduck': 54, 'Golduck': 55,
    'Mankey': 56,
    'Growlithe': 58, 'Arcanine': 59,
    'Poliwag': 60, 'Poliwhirl': 61, 'Poliwrath': 62,
    'Abra': 63, 'Kadabra': 64, 'Alakazam': 65,
    'Machop': 66, 'Machoke': 67, 'Machamp': 68,
    'Bellsprout': 69,
    'Tentacool': 72,
    'Geodude': 74, 'Graveler': 75,
    'Ponyta': 77, 'Rapidash': 78,
    'Slowpoke': 79, 'Slowbro': 80,
    'Magnemite': 81, 'Magneton': 82,
    'Grimer': 88,
    'Gastly': 92, 'Haunter': 93, 'Gengar': 94,
    'Onix': 95,
    'Voltorb': 100, 'Electrode': 101,
    'Exeggcute': 102, 'Exeggutor': 103,
    'Cubone': 104, 'Marowak': 105,
    'Hitmonlee': 106, 'Hitmonchan': 107,
    'Koffing': 109, 'Weezing': 110,
    'Rhyhorn': 111,
    'Chansey': 113,
    'Tangela': 114,
    'Horsea': 116, 'Seadra': 117,
    'Staryu': 120,
    'Electabuzz': 125,
    'Magmar': 126,
    'Magikarp': 129, 'Gyarados': 130,
    'Lapras': 131,
    'Ditto': 132,
    'Eevee': 133, 'Vaporeon': 134, 'Jolteon': 135, 'Flareon': 136,
    'Snorlax': 143,
    'Articuno': 144, 'Zapdos': 145, 'Moltres': 146,
    'Dratini': 147, 'Dragonair': 148, 'Dragonite': 149,
    'Mewtwo': 150, 'Mew': 151,
    # Gen 2
    'Chikorita': 152, 'Bayleef': 153, 'Meganium': 154,
    'Cyndaquil': 155, 'Quilava': 156, 'Typhlosion': 157,
    'Totodile': 158, 'Croconaw': 159, 'Feraligatr': 160,
    'Mareep': 179, 'Flaaffy': 180, 'Ampharos': 181,
    'Espeon': 196, 'Umbreon': 197,
    'Raikou': 243, 'Entei': 244, 'Suicune': 245,
    'Larvitar': 246, 'Pupitar': 247, 'Tyranitar': 248,
    'Lugia': 249, 'Ho-Oh': 250, 'Celebi': 251,
    # Gen 3
    'Treecko': 252, 'Grovyle': 253, 'Sceptile': 254,
    'Torchic': 255, 'Combusken': 256, 'Blaziken': 257,
    'Mudkip': 258, 'Marshtomp': 259, 'Swampert': 260,
    'Ralts': 280, 'Kirlia': 281, 'Gardevoir': 282,
    'Absol': 359,
    'Bagon': 371, 'Shelgon': 372, 'Salamence': 373,
    'Beldum': 374, 'Metang': 375, 'Metagross': 376,
    # Gen 4
    'Shinx': 403, 'Luxio': 404, 'Luxray': 405,
    'Gible': 443, 'Gabite': 444, 'Garchomp': 445,
    'Riolu': 447, 'Lucario': 448,
    'Leafeon': 470, 'Glaceon': 471,
    # Gen 5
    'Zorua': 570, 'Zoroark': 571,
    'Axew': 610, 'Fraxure': 611, 'Haxorus': 612,
    'Deino': 633, 'Zweilous': 634, 'Hydreigon': 635,
    'Larvesta': 636, 'Volcarona': 637,
    # Gen 6
    'Froakie': 656, 'Frogadier': 657, 'Greninja': 658,
    'Honedge': 679, 'Doublade': 680, 'Aegislash': 681,
    'Sylveon': 700,
    # Gen 7
    'Rowlet': 722, 'Dartrix': 723, 'Decidueye': 724,
    'Mimikyu': 778,
    # Gen 8
    'Dreepy': 885, 'Drakloak': 886, 'Dragapult': 887,
    # Gen 1 extra
    'Scizor': 212,
}

# Special name mappings for Bulbapedia filenames
BULBA_NAME_MAP = {
    'Nidoran♀': 'Nidoran♀',
    'Nidoran♂': 'Nidoran♂',
    'Ho-Oh': 'Ho-Oh',
}


def get_anime_images(dex_num: int, name: str) -> list:
    """Query Bulbapedia API for anime images of a Pokemon."""
    prefix = f"{dex_num:03d}{name}"
    url = (
        f"https://archives.bulbagarden.net/w/api.php?"
        f"action=query&list=allimages&aiprefix={urllib.parse.quote(prefix)}"
        f"&ailimit=30&format=json"
    )

    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'PokemonArena/1.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())

        images = data.get('query', {}).get('allimages', [])

        # Filter for anime images only, exclude Mega/Giga/Ash variants
        anime_images = []
        for img in images:
            n = img['name']
            if 'anime' not in n.lower():
                continue
            # Skip variant forms
            if any(x in n for x in ['Mega', 'Giga', '-Ash', 'Totem', 'Alola']):
                continue
            anime_images.append(img)

        return anime_images
    except Exception as e:
        print(f"  API error for {name}: {e}")
        return []


def pick_best_image(images: list) -> dict | None:
    """Pick the best anime image based on series preference."""
    if not images:
        return None

    # Score each image by series
    def score(img):
        name = img['name']
        for i, series in enumerate(SERIES_PRIORITY):
            if f'_{series}_' in name or f'_{series}_anime' in name:
                # Prefer variant 1 (no number suffix) over numbered variants
                if '_2.' in name or '_3.' in name or '_4.' in name:
                    return i * 10 + 5
                return i * 10
        return 999  # Unknown series, lowest priority

    images.sort(key=score)
    return images[0]


def download_image(url: str, filepath: str) -> bool:
    """Download an image from URL to filepath."""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'PokemonArena/1.0'})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            if len(data) < 500:  # Too small, probably an error page
                return False
            with open(filepath, 'wb') as f:
                f.write(data)
        return True
    except Exception as e:
        print(f"  Download error: {e}")
        return False


def main():
    total = len(POKEMON)
    downloaded = 0
    skipped = 0
    failed = 0
    kept_existing = 0

    print(f"Downloading anime images for {total} Pokemon from Bulbapedia...")
    print(f"Output: {OUTPUT_DIR}")
    print()

    for i, (name, dex_num) in enumerate(sorted(POKEMON.items(), key=lambda x: x[1]), 1):
        filepath = os.path.join(OUTPUT_DIR, f"{dex_num}.png")
        bulba_name = BULBA_NAME_MAP.get(name, name)

        sys.stdout.write(f"[{i}/{total}] {name} (#{dex_num})... ")
        sys.stdout.flush()

        # Query API for anime images
        images = get_anime_images(dex_num, bulba_name)

        if not images:
            # Try without special characters
            clean_name = name.replace('♀', '_f').replace('♂', '_m').replace('-', '')
            if clean_name != bulba_name:
                images = get_anime_images(dex_num, clean_name)

        best = pick_best_image(images)

        if best:
            if download_image(best['url'], filepath):
                print(f"OK ({best['name']})")
                downloaded += 1
            else:
                print(f"DOWNLOAD FAILED - keeping existing")
                kept_existing += 1
        else:
            if os.path.exists(filepath):
                print(f"NO ANIME IMG - keeping existing artwork")
                kept_existing += 1
            else:
                print(f"NO IMAGE FOUND")
                failed += 1

        # Rate limit - be nice to Bulbapedia
        time.sleep(0.3)

    print()
    print(f"=== Results ===")
    print(f"Downloaded anime images: {downloaded}")
    print(f"Kept existing artwork:   {kept_existing}")
    print(f"Failed (no image):       {failed}")
    print(f"Total:                   {total}")


if __name__ == '__main__':
    main()

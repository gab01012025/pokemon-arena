#!/usr/bin/env python3
"""
Scrape ataquepokedex.blogspot.com for ALL Pokemon attack data and images.
Downloads attack images and builds a JSON mapping file.

Output:
  - public/skills/{pokemonName}/{attackName}.png  (attack images)
  - public/skills/attacks-data.json               (full mapping)
"""

import json
import os
import re
import sys
import time
import urllib.request
import urllib.parse
from io import BytesIO

import requests
from bs4 import BeautifulSoup
from PIL import Image, ImageDraw, ImageEnhance

# ==================== CONFIG ====================
ICON_SIZE = 54
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "public", "skills")
HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

TYPE_COLORS = {
    "fire": (240, 128, 48), "water": (104, 144, 240), "grass": (120, 200, 80),
    "electric": (248, 208, 48), "psychic": (248, 88, 136), "fighting": (192, 48, 40),
    "dark": (112, 88, 72), "poison": (160, 64, 160), "ghost": (112, 88, 152),
    "ground": (224, 192, 104), "flying": (168, 144, 240), "rock": (184, 160, 56),
    "bug": (168, 184, 32), "ice": (152, 216, 216), "steel": (184, 184, 208),
    "dragon": (112, 56, 248), "fairy": (238, 153, 172), "normal": (168, 168, 120),
}

# Pokemon name -> dex number mapping (matching the game's roster)
POKEMON_DEX = {
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
    'Nidoran': 29, 'Nidorina': 30, 'Nidoqueen': 31,
    'Nidorino': 33, 'Nidoking': 34,
    'Clefairy': 35, 'Clefable': 36,
    'Vulpix': 37, 'Ninetales': 38,
    'Jigglypuff': 39, 'Wigglytuff': 40,
    'Zubat': 41,
    'Oddish': 43, 'Gloom': 44, 'Vileplume': 45,
    'Paras': 46, 'Parasect': 47,
    'Venomoth': 49,
    'Diglett': 50, 'Dugtrio': 51,
    'Meowth': 52, 'Persian': 53,
    'Psyduck': 54, 'Golduck': 55,
    'Mankey': 56, 'Primeape': 57,
    'Growlithe': 58, 'Arcanine': 59,
    'Poliwag': 60, 'Poliwrath': 62,
    'Abra': 63, 'Kadabra': 64, 'Alakazam': 65,
    'Machop': 66, 'Machoke': 67, 'Machamp': 68,
    'Bellsprout': 69, 'Weepinbell': 70, 'Victreebel': 71,
    'Tentacool': 72, 'Tentacruel': 73,
    'Geodude': 74, 'Golem': 76,
    'Ponyta': 77, 'Rapidash': 78,
    'Slowpoke': 79, 'Slowbro': 80,
    'Magnemite': 81, 'Magneton': 82,
    'Doduo': 84, 'Dodrio': 85,
    'Seel': 86, 'Dewgong': 87,
    'Grimer': 88, 'Muk': 89,
    'Cloyster': 91,
    'Gastly': 92, 'Haunter': 93, 'Gengar': 94,
    'Onix': 95,
    'Drowzee': 96,
    'Krabby': 98, 'Kingler': 99,
    'Voltorb': 100, 'Electrode': 101,
    'Exeggcute': 102, 'Exeggutor': 103,
    'Cubone': 104, 'Marowak': 105,
    'Hitmonlee': 106, 'Hitmonchan': 107,
    'Koffing': 109, 'Weezing': 110,
    'Rhyhorn': 111, 'Rhydon': 112,
    'Chansey': 113,
    'Kangaskhan': 115,
    'Horsea': 116,
    'Goldeen': 118, 'Seaking': 119,
    'Staryu': 120,
    'Mr. Mime': 122,
    'Scyther': 123,
    'Electabuzz': 125,
    'Magmar': 126,
    'Pinsir': 127,
    'Tauros': 128,
    'Magikarp': 129, 'Gyarados': 130,
    'Lapras': 131,
    'Ditto': 132,
    'Eevee': 133, 'Vaporeon': 134, 'Jolteon': 135, 'Flareon': 136,
    'Porygon': 137,
    'Omanyte': 138, 'Omastar': 139,
    'Kabuto': 140,
    'Aerodactyl': 142,
    'Snorlax': 143,
    'Articuno': 144, 'Zapdos': 145, 'Moltres': 146,
    'Dratini': 147, 'Dragonair': 148, 'Dragonite': 149,
    'Mewtwo': 150,
}

# All Pokemon page URLs from the blogspot
POKEMON_PAGES = {
    'Bulbasaur': 'https://ataquepokedex.blogspot.com/2018/11/bulbasaur.html',
    'Ivysaur': 'https://ataquepokedex.blogspot.com/2018/08/ivysaur.html',
    'Venusaur': 'https://ataquepokedex.blogspot.com/2018/10/venusaur.html',
    'Charmander': 'https://ataquepokedex.blogspot.com/2017/11/charmander.html',
    'Charmeleon': 'https://ataquepokedex.blogspot.com/2018/08/charmeleon.html',
    'Charizard': 'https://ataquepokedex.blogspot.com/2018/09/charizard.html',
    'Squirtle': 'https://ataquepokedex.blogspot.com/2018/11/squirtle.html',
    'Wartortle': 'https://ataquepokedex.blogspot.com/2018/08/wartortle.html',
    'Blastoise': 'https://ataquepokedex.blogspot.com/2018/11/blastoise.html',
    'Caterpie': 'https://ataquepokedex.blogspot.com/2018/08/caterpie.html',
    'Metapod': 'https://ataquepokedex.blogspot.com/2018/08/metapod.html',
    'Butterfree': 'https://ataquepokedex.blogspot.com/2018/09/butterfree.html',
    'Weedle': 'https://ataquepokedex.blogspot.com/2018/11/weedle.html',
    'Kakuna': 'https://ataquepokedex.blogspot.com/2019/12/kakuna.html',
    'Beedrill': 'https://ataquepokedex.blogspot.com/2018/09/beedrill.html',
    'Pidgey': 'https://ataquepokedex.blogspot.com/2018/09/pidgey.html',
    'Pidgeotto': 'https://ataquepokedex.blogspot.com/2020/01/pidgeotto.html',
    'Pidgeot': 'https://ataquepokedex.blogspot.com/2018/09/pidgeot.html',
    'Rattata': 'https://ataquepokedex.blogspot.com/2018/11/rattata.html',
    'Raticate': 'https://ataquepokedex.blogspot.com/2020/03/raticate.html',
    'Spearow': 'https://ataquepokedex.blogspot.com/2020/04/spearow.html',
    'Fearow': 'https://ataquepokedex.blogspot.com/2018/11/fearow.html',
    'Ekans': 'https://ataquepokedex.blogspot.com/2020/02/ekans.html',
    'Arbok': 'https://ataquepokedex.blogspot.com/2018/08/arbok.html',
    'Pikachu': 'https://ataquepokedex.blogspot.com/2018/08/pikachu.html',
    'Raichu': 'https://ataquepokedex.blogspot.com/2019/10/raichu.html',
    'Sandshrew': 'https://ataquepokedex.blogspot.com/2019/12/sandshrew.html',
    'Sandslash': 'https://ataquepokedex.blogspot.com/2020/03/sandslash.html',
    'Nidoran': 'https://ataquepokedex.blogspot.com/2018/10/nidoran.html',
    'Nidorina': 'https://ataquepokedex.blogspot.com/2019/10/nidorina.html',
    'Nidoqueen': 'https://ataquepokedex.blogspot.com/2019/02/nidoqueen.html',
    'Nidorino': 'https://ataquepokedex.blogspot.com/2018/12/nidorino.html',
    'Nidoking': 'https://ataquepokedex.blogspot.com/2018/10/nidoking.html',
    'Clefairy': 'https://ataquepokedex.blogspot.com/2020/01/clefairy.html',
    'Clefable': 'https://ataquepokedex.blogspot.com/2020/01/clefable.html',
    'Vulpix': 'https://ataquepokedex.blogspot.com/2018/09/vulpix.html',
    'Ninetales': 'https://ataquepokedex.blogspot.com/2016/09/ninetales.html',
    'Jigglypuff': 'https://ataquepokedex.blogspot.com/2018/11/jigglypuff.html',
    'Zubat': 'https://ataquepokedex.blogspot.com/2019/04/zubat.html',
    'Oddish': 'https://ataquepokedex.blogspot.com/2018/08/oddish.html',
    'Gloom': 'https://ataquepokedex.blogspot.com/2019/10/gloom.html',
    'Vileplume': 'https://ataquepokedex.blogspot.com/2018/11/vileplume.html',
    'Paras': 'https://ataquepokedex.blogspot.com/2020/03/paras.html',
    'Parasect': 'https://ataquepokedex.blogspot.com/2020/03/parasect_7.html',
    'Venomoth': 'https://ataquepokedex.blogspot.com/2018/10/venomoth.html',
    'Diglett': 'https://ataquepokedex.blogspot.com/2018/11/diglett.html',
    'Dugtrio': 'https://ataquepokedex.blogspot.com/2018/11/dugtrio.html',
    'Meowth': 'https://ataquepokedex.blogspot.com/2020/03/meowth.html',
    'Persian': 'https://ataquepokedex.blogspot.com/2018/08/persian.html',
    'Psyduck': 'https://ataquepokedex.blogspot.com/2020/02/psyduck.html',
    'Golduck': 'https://ataquepokedex.blogspot.com/2018/11/golduck.html',
    'Mankey': 'https://ataquepokedex.blogspot.com/2018/10/mankey.html',
    'Primeape': 'https://ataquepokedex.blogspot.com/2021/04/primeape.html',
    'Growlithe': 'https://ataquepokedex.blogspot.com/2020/04/growlithe.html',
    'Arcanine': 'https://ataquepokedex.blogspot.com/2018/11/arcanine.html',
    'Poliwag': 'https://ataquepokedex.blogspot.com/2018/12/poliwag.html',
    'Poliwrath': 'https://ataquepokedex.blogspot.com/2020/05/poliwrath.html',
    'Abra': 'https://ataquepokedex.blogspot.com/2018/08/abra.html',
    'Kadabra': 'https://ataquepokedex.blogspot.com/2020/04/kadabra.html',
    'Alakazam': 'https://ataquepokedex.blogspot.com/2018/11/alakazam.html',
    'Machop': 'https://ataquepokedex.blogspot.com/2020/04/machop.html',
    'Machoke': 'https://ataquepokedex.blogspot.com/2019/04/machoke.html',
    'Machamp': 'https://ataquepokedex.blogspot.com/2018/10/machamp.html',
    'Bellsprout': 'https://ataquepokedex.blogspot.com/2019/12/bellsprout.html',
    'Weepinbell': 'https://ataquepokedex.blogspot.com/2018/09/weepinbell.html',
    'Victreebel': 'https://ataquepokedex.blogspot.com/2019/12/victreebel.html',
    'Tentacool': 'https://ataquepokedex.blogspot.com/2019/12/tentacool.html',
    'Tentacruel': 'https://ataquepokedex.blogspot.com/2019/12/tentacruel.html',
    'Geodude': 'https://ataquepokedex.blogspot.com/2018/08/geodude.html',
    'Golem': 'https://ataquepokedex.blogspot.com/2018/11/golem.html',
    'Ponyta': 'https://ataquepokedex.blogspot.com/2018/10/ponyta.html',
    'Rapidash': 'https://ataquepokedex.blogspot.com/2020/02/rapidash.html',
    'Slowpoke': 'https://ataquepokedex.blogspot.com/2019/12/slowpoke.html',
    'Slowbro': 'https://ataquepokedex.blogspot.com/2019/12/slowbro.html',
    'Magnemite': 'https://ataquepokedex.blogspot.com/2018/11/magnemite.html',
    'Magneton': 'https://ataquepokedex.blogspot.com/2020/04/magneton.html',
    'Doduo': 'https://ataquepokedex.blogspot.com/2020/03/doduo.html',
    'Dodrio': 'https://ataquepokedex.blogspot.com/2020/03/dodrio.html',
    'Seel': 'https://ataquepokedex.blogspot.com/2018/11/seel.html',
    'Dewgong': 'https://ataquepokedex.blogspot.com/2016/09/dewgong.html',
    'Grimer': 'https://ataquepokedex.blogspot.com/2018/12/grimer.html',
    'Muk': 'https://ataquepokedex.blogspot.com/2018/12/muk.html',
    'Cloyster': 'https://ataquepokedex.blogspot.com/2020/05/cloyster.html',
    'Gastly': 'https://ataquepokedex.blogspot.com/2020/04/gastly.html',
    'Haunter': 'https://ataquepokedex.blogspot.com/2019/12/haunter.html',
    'Gengar': 'https://ataquepokedex.blogspot.com/2018/09/gengar.html',
    'Onix': 'https://ataquepokedex.blogspot.com/2018/08/onix.html',
    'Drowzee': 'https://ataquepokedex.blogspot.com/2018/11/drowzee.html',
    'Krabby': 'https://ataquepokedex.blogspot.com/2018/12/krabby.html',
    'Kingler': 'https://ataquepokedex.blogspot.com/2020/04/kingler.html',
    'Electrode': 'https://ataquepokedex.blogspot.com/2018/10/electrode.html',
    'Cubone': 'https://ataquepokedex.blogspot.com/2018/12/cubone.html',
    'Marowak': 'https://ataquepokedex.blogspot.com/2018/12/marowak.html',
    'Hitmonlee': 'https://ataquepokedex.blogspot.com/2018/09/hitmonlee.html',
    'Hitmonchan': 'https://ataquepokedex.blogspot.com/2020/04/hitmonchan.html',
    'Koffing': 'https://ataquepokedex.blogspot.com/2020/04/koffing.html',
    'Weezing': 'https://ataquepokedex.blogspot.com/2018/11/weezing.html',
    'Rhyhorn': 'https://ataquepokedex.blogspot.com/2019/11/rhyhorn.html',
    'Rhydon': 'https://ataquepokedex.blogspot.com/2020/05/rhydon.html',
    'Chansey': 'https://ataquepokedex.blogspot.com/2018/12/chansey.html',
    'Kangaskhan': 'https://ataquepokedex.blogspot.com/2018/11/kangaskhan.html',
    'Horsea': 'https://ataquepokedex.blogspot.com/2018/09/horsea.html',
    'Goldeen': 'https://ataquepokedex.blogspot.com/2019/12/goldeen.html',
    'Seaking': 'https://ataquepokedex.blogspot.com/2019/12/seaking.html',
    'Staryu': 'https://ataquepokedex.blogspot.com/2016/09/staryu.html',
    'Mr. Mime': 'https://ataquepokedex.blogspot.com/2019/04/mr-mime.html',
    'Scyther': 'https://ataquepokedex.blogspot.com/2018/12/scyther.html',
    'Electabuzz': 'https://ataquepokedex.blogspot.com/2018/09/electabuzz.html',
    'Magmar': 'https://ataquepokedex.blogspot.com/2018/09/magmar.html',
    'Pinsir': 'https://ataquepokedex.blogspot.com/2020/04/pinsir.html',
    'Tauros': 'https://ataquepokedex.blogspot.com/2020/03/taurus.html',
    'Magikarp': 'https://ataquepokedex.blogspot.com/2018/08/magikarp.html',
    'Gyarados': 'https://ataquepokedex.blogspot.com/2018/09/gyarados.html',
    'Lapras': 'https://ataquepokedex.blogspot.com/2019/08/lapras.html',
    'Ditto': 'https://ataquepokedex.blogspot.com/2018/08/ditto.html',
    'Eevee': 'https://ataquepokedex.blogspot.com/2018/09/eevee.html',
    'Vaporeon': 'https://ataquepokedex.blogspot.com/2018/11/vaporeon.html',
    'Jolteon': 'https://ataquepokedex.blogspot.com/2018/10/jolteon.html',
    'Flareon': 'https://ataquepokedex.blogspot.com/2018/11/flareon.html',
    'Porygon': 'https://ataquepokedex.blogspot.com/2019/10/porygon.html',
    'Omanyte': 'https://ataquepokedex.blogspot.com/2020/03/omanyte.html',
    'Omastar': 'https://ataquepokedex.blogspot.com/2020/03/omastar.html',
    'Kabuto': 'https://ataquepokedex.blogspot.com/2018/12/kabuto.html',
    'Aerodactyl': 'https://ataquepokedex.blogspot.com/2019/12/aerodactyl.html',
    'Snorlax': 'https://ataquepokedex.blogspot.com/2018/10/snorlax.html',
    'Articuno': 'https://ataquepokedex.blogspot.com/2020/03/articuno.html',
    'Zapdos': 'https://ataquepokedex.blogspot.com/2018/08/zapdos.html',
    'Moltres': 'https://ataquepokedex.blogspot.com/2019/02/moltres.html',
    'Dratini': 'https://ataquepokedex.blogspot.com/2018/12/dratini.html',
    'Dragonair': 'https://ataquepokedex.blogspot.com/2018/12/dragonair.html',
    'Dragonite': 'https://ataquepokedex.blogspot.com/2019/05/dragonite.html',
    'Mewtwo': 'https://ataquepokedex.blogspot.com/2018/10/mewtwo.html',
}


def scrape_pokemon_page(name: str, url: str) -> list[dict]:
    """Scrape a single Pokemon page and extract all attacks with images."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')

        # Find the post body
        post_body = soup.find('div', class_='post-body') or soup.find('div', class_='entry-content')
        if not post_body:
            print(f"  [WARN] No post body found for {name}")
            return []

        attacks = []
        # Strategy: find all images in the post body that are from blogger
        # Then look at surrounding text for attack names

        # Get ALL text content to parse attack names
        full_text = post_body.get_text(separator='\n')

        # Find all images
        all_images = post_body.find_all('img')
        blogger_images = []
        for img in all_images:
            src = img.get('src', '') or img.get('data-src', '')
            if not src:
                continue
            # Accept blogger images and other hosted images
            if 'blogger.googleusercontent.com' in src or 'bp.blogspot.com' in src:
                blogger_images.append((img, src))

        # Parse attack names from text
        # Pattern: "Name: X" or "Nome: X" or just standalone attack names
        lines = full_text.split('\n')

        # Track image index
        img_idx = 0

        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue

            # Look for "Name:" pattern
            name_match = re.match(r'(?:Name|Nome)\s*:\s*(.+)', line, re.IGNORECASE)
            if name_match:
                attack_name = name_match.group(1).strip()

                # Look for PT name in next line
                pt_name = ''
                if i + 1 < len(lines):
                    pt_match = re.match(r'(?:PT|Pt)\s*:\s*(.+)', lines[i+1].strip(), re.IGNORECASE)
                    if pt_match:
                        pt_name = pt_match.group(1).strip()

                # Find the nearest blogger image BEFORE this text
                # The image usually comes before the name
                image_url = ''
                if img_idx < len(blogger_images):
                    image_url = blogger_images[img_idx][1]
                    img_idx += 1

                attacks.append({
                    'name': attack_name,
                    'name_pt': pt_name,
                    'image_url': image_url,
                })

        # If the name-based parsing found nothing, try alternative parsing
        if not attacks:
            # Some pages use different formats - try to extract from image alt text
            # or just pair images with text blocks
            text_blocks = []
            current_text = []

            for elem in post_body.children:
                if hasattr(elem, 'name') and elem.name == 'br':
                    if current_text:
                        text_blocks.append(' '.join(current_text))
                        current_text = []
                elif hasattr(elem, 'string') and elem.string:
                    current_text.append(elem.string.strip())
                elif hasattr(elem, 'get_text'):
                    t = elem.get_text(strip=True)
                    if t:
                        current_text.append(t)

            if current_text:
                text_blocks.append(' '.join(current_text))

            # Try to match images with text
            for img, src in blogger_images:
                # Try to find attack name from image filename or alt
                alt = img.get('alt', '') or img.get('title', '')

                # Get text near the image
                attack_name = alt
                if not attack_name:
                    # Try to extract from URL
                    url_parts = src.split('/')
                    for part in url_parts:
                        if '.png' in part or '.jpg' in part:
                            # Clean the filename
                            clean = part.replace('.png', '').replace('.jpg', '')
                            clean = re.sub(r'^\d+_?', '', clean)
                            clean = clean.replace('_', ' ').replace('+', ' ')
                            # Remove common prefixes
                            clean = re.sub(r'^(Ash|May|Dawn|Brock|Misty|Gary)[\s_]', '', clean)
                            # Remove Pokemon name
                            clean = re.sub(re.escape(name) + r'[\s_]?', '', clean, flags=re.IGNORECASE)
                            if clean and len(clean) > 2:
                                attack_name = clean.strip()

                if not attack_name:
                    # Use parent element text
                    parent = img.parent
                    if parent:
                        sibs = parent.find_next_siblings(string=True, limit=3)
                        for sib in sibs:
                            t = str(sib).strip()
                            if t and len(t) > 2 and len(t) < 50:
                                name_m = re.match(r'(?:Name|Nome)\s*:\s*(.+)', t, re.IGNORECASE)
                                if name_m:
                                    attack_name = name_m.group(1).strip()
                                    break

                if attack_name and src:
                    attacks.append({
                        'name': attack_name,
                        'name_pt': '',
                        'image_url': src,
                    })

        # Deduplicate
        seen = set()
        unique_attacks = []
        for atk in attacks:
            key = atk['name'].lower()
            if key not in seen:
                seen.add(key)
                unique_attacks.append(atk)

        return unique_attacks

    except Exception as e:
        print(f"  [ERR] Failed to scrape {name}: {e}")
        return []


def download_attack_image(url: str, filepath: str) -> bool:
    """Download an attack image and process it into a 54x54 icon."""
    try:
        # Fix URL - ensure https
        if url.startswith('http://'):
            url = 'https://' + url[7:]

        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()

        if len(resp.content) < 200:
            return False

        img = Image.open(BytesIO(resp.content)).convert("RGBA")

        # Crop to square (center crop)
        w, h = img.size
        if w > h:
            left = (w - h) // 2
            img = img.crop((left, 0, left + h, h))
        elif h > w:
            top = (h - w) // 2
            img = img.crop((0, top, w, top + w))

        # Resize to icon size
        img = img.resize((ICON_SIZE, ICON_SIZE), Image.Resampling.LANCZOS)

        # Enhance contrast/saturation for the dark game UI
        rgb = img.convert("RGB")
        rgb = ImageEnhance.Contrast(rgb).enhance(1.15)
        rgb = ImageEnhance.Color(rgb).enhance(1.2)
        rgb = ImageEnhance.Brightness(rgb).enhance(0.92)

        # Save
        final = rgb.convert("RGB")
        final.save(filepath, "PNG", optimize=True)
        return True

    except Exception as e:
        print(f"    [ERR] Download {url[:80]}: {e}")
        return False


def download_raw_image(url: str, filepath: str) -> bool:
    """Download raw attack image without processing."""
    try:
        if url.startswith('http://'):
            url = 'https://' + url[7:]

        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()

        if len(resp.content) < 200:
            return False

        with open(filepath, 'wb') as f:
            f.write(resp.content)
        return True

    except Exception as e:
        print(f"    [ERR] Download raw {url[:80]}: {e}")
        return False


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    total = len(POKEMON_PAGES)
    all_data = {}
    total_attacks = 0
    total_images = 0
    failed_pages = []

    print(f"Scraping ataquepokedex.blogspot.com - {total} Pokemon pages")
    print(f"Output: {OUTPUT_DIR}")
    print()

    for i, (name, url) in enumerate(sorted(POKEMON_PAGES.items()), 1):
        dex_num = POKEMON_DEX.get(name, 0)
        sys.stdout.write(f"[{i}/{total}] {name} (#{dex_num})... ")
        sys.stdout.flush()

        attacks = scrape_pokemon_page(name, url)

        if not attacks:
            print("NO ATTACKS FOUND")
            failed_pages.append(name)
            time.sleep(0.5)
            continue

        # Create directory for this Pokemon
        pokemon_dir = os.path.join(OUTPUT_DIR, str(dex_num) if dex_num else name.lower())
        os.makedirs(pokemon_dir, exist_ok=True)

        # Download each attack image
        downloaded = 0
        attack_list = []

        for j, attack in enumerate(attacks):
            img_url = attack.get('image_url', '')
            if not img_url:
                attack_list.append({
                    'index': j,
                    'name': attack['name'],
                    'name_pt': attack.get('name_pt', ''),
                    'icon': '',
                    'raw': '',
                })
                continue

            # Download as icon (54x54)
            icon_path = os.path.join(pokemon_dir, f"{j}.png")
            # Download raw image too
            raw_path = os.path.join(pokemon_dir, f"{j}_raw.png")

            icon_ok = download_attack_image(img_url, icon_path)
            raw_ok = download_raw_image(img_url, raw_path)

            if icon_ok:
                downloaded += 1
                total_images += 1

            attack_list.append({
                'index': j,
                'name': attack['name'],
                'name_pt': attack.get('name_pt', ''),
                'icon': f"/skills/{dex_num if dex_num else name.lower()}/{j}.png" if icon_ok else '',
                'raw': f"/skills/{dex_num if dex_num else name.lower()}/{j}_raw.png" if raw_ok else '',
                'source_url': img_url,
            })

            time.sleep(0.15)  # Rate limit

        total_attacks += len(attacks)

        all_data[name] = {
            'dex': dex_num,
            'url': url,
            'attacks': attack_list,
        }

        print(f"{len(attacks)} attacks, {downloaded} images downloaded")
        time.sleep(0.3)  # Rate limit between pages

    # Save JSON mapping
    json_path = os.path.join(OUTPUT_DIR, "attacks-data.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)

    print()
    print("=" * 50)
    print(f"RESULTS:")
    print(f"  Pokemon scraped:  {len(all_data)}/{total}")
    print(f"  Total attacks:    {total_attacks}")
    print(f"  Images downloaded: {total_images}")
    print(f"  Failed pages:     {len(failed_pages)}")
    if failed_pages:
        print(f"  Failed: {', '.join(failed_pages)}")
    print(f"  Data file:        {json_path}")
    print()


if __name__ == '__main__':
    main()

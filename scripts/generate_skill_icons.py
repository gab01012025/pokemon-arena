#!/usr/bin/env python3
"""
Pokemon Arena - Skill Icon Generator v5
========================================
Downloads anime screenshots of Pokemon moves from Fandom Wiki, picking
the best image for each specific Pokemon+Move combination.

Strategy:
1. For each unique move, fetch ALL anime images from the Fandom move page
2. For each Pokemon+Move, pick the image that best matches that Pokemon
   (e.g., Charizard's Flamethrower → "Ash Charizard Flamethrower.png")
3. Fallback to Bulbapedia game screenshots
4. Final fallback to generated type-colored icon

Source: Pokemon Fandom Wiki (pokemon.fandom.com) + Bulbapedia
Output: public/skills/{pokemonId}/{moveIndex}.png
"""

import os
import re
import time
import json
import math
import shutil
from io import BytesIO

import requests
from PIL import Image, ImageDraw, ImageEnhance

# ==================== CONFIG ====================
ICON_SIZE = 54
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "skills")
CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".move_image_cache_v5")
HEADERS = {"User-Agent": "PokemonArenaBot/1.0 (educational fan project; skill icons)"}
FANDOM_API = "https://pokemon.fandom.com/api.php"
BULBA_API = "https://bulbapedia.bulbagarden.net/w/api.php"

TYPE_COLORS = {
    "fire": (240, 128, 48), "water": (104, 144, 240), "grass": (120, 200, 80),
    "electric": (248, 208, 48), "psychic": (248, 88, 136), "fighting": (192, 48, 40),
    "dark": (112, 88, 72), "poison": (160, 64, 160), "ghost": (112, 88, 152),
    "ground": (224, 192, 104), "flying": (168, 144, 240), "rock": (184, 160, 56),
    "bug": (168, 184, 32), "ice": (152, 216, 216), "steel": (184, 184, 208),
    "dragon": (112, 56, 248), "fairy": (238, 153, 172), "normal": (168, 168, 120),
}

# ==================== POKEMON DATA (from data.ts) ====================
ALL_POKEMON = {
    1: {"name": "Bulbasaur", "types": ["grass", "poison"]},
    2: {"name": "Ivysaur", "types": ["grass", "poison"]},
    3: {"name": "Venusaur", "types": ["grass", "poison"]},
    4: {"name": "Charmander", "types": ["fire"]},
    5: {"name": "Charmeleon", "types": ["fire"]},
    6: {"name": "Charizard", "types": ["fire", "flying"]},
    7: {"name": "Squirtle", "types": ["water"]},
    8: {"name": "Wartortle", "types": ["water"]},
    9: {"name": "Blastoise", "types": ["water"]},
    10: {"name": "Caterpie", "types": ["bug"]},
    11: {"name": "Metapod", "types": ["bug"]},
    12: {"name": "Butterfree", "types": ["bug", "flying"]},
    13: {"name": "Weedle", "types": ["bug", "poison"]},
    14: {"name": "Kakuna", "types": ["bug", "poison"]},
    15: {"name": "Beedrill", "types": ["bug", "poison"]},
    16: {"name": "Pidgey", "types": ["normal", "flying"]},
    17: {"name": "Pidgeotto", "types": ["normal", "flying"]},
    18: {"name": "Pidgeot", "types": ["normal", "flying"]},
    19: {"name": "Rattata", "types": ["normal"]},
    20: {"name": "Raticate", "types": ["normal"]},
    21: {"name": "Spearow", "types": ["normal", "flying"]},
    22: {"name": "Fearow", "types": ["normal", "flying"]},
    23: {"name": "Ekans", "types": ["poison"]},
    24: {"name": "Arbok", "types": ["poison"]},
    25: {"name": "Pikachu", "types": ["electric"]},
    26: {"name": "Raichu", "types": ["electric"]},
    29: {"name": "NidoranF", "types": ["poison"]},
    30: {"name": "Nidorina", "types": ["poison"]},
    31: {"name": "Nidoqueen", "types": ["poison", "ground"]},
    32: {"name": "NidoranM", "types": ["poison"]},
    33: {"name": "Nidorino", "types": ["poison"]},
    34: {"name": "Nidoking", "types": ["poison", "ground"]},
    35: {"name": "Clefairy", "types": ["fairy"]},
    36: {"name": "Clefable", "types": ["fairy"]},
    37: {"name": "Vulpix", "types": ["fire"]},
    38: {"name": "Ninetales", "types": ["fire"]},
    39: {"name": "Jigglypuff", "types": ["normal", "fairy"]},
    40: {"name": "Wigglytuff", "types": ["normal", "fairy"]},
    43: {"name": "Oddish", "types": ["grass", "poison"]},
    44: {"name": "Gloom", "types": ["grass", "poison"]},
    45: {"name": "Vileplume", "types": ["grass", "poison"]},
    52: {"name": "Meowth", "types": ["normal"]},
    53: {"name": "Persian", "types": ["normal"]},
    54: {"name": "Psyduck", "types": ["water"]},
    55: {"name": "Golduck", "types": ["water"]},
    58: {"name": "Growlithe", "types": ["fire"]},
    59: {"name": "Arcanine", "types": ["fire"]},
    60: {"name": "Poliwag", "types": ["water"]},
    61: {"name": "Poliwhirl", "types": ["water"]},
    62: {"name": "Poliwrath", "types": ["water", "fighting"]},
    63: {"name": "Abra", "types": ["psychic"]},
    64: {"name": "Kadabra", "types": ["psychic"]},
    65: {"name": "Alakazam", "types": ["psychic"]},
    66: {"name": "Machop", "types": ["fighting"]},
    67: {"name": "Machoke", "types": ["fighting"]},
    68: {"name": "Machamp", "types": ["fighting"]},
    74: {"name": "Geodude", "types": ["rock", "ground"]},
    75: {"name": "Graveler", "types": ["rock", "ground"]},
    76: {"name": "Golem", "types": ["rock", "ground"]},
    77: {"name": "Ponyta", "types": ["fire"]},
    78: {"name": "Rapidash", "types": ["fire"]},
    79: {"name": "Slowpoke", "types": ["water", "psychic"]},
    80: {"name": "Slowbro", "types": ["water", "psychic"]},
    81: {"name": "Magnemite", "types": ["electric", "steel"]},
    82: {"name": "Magneton", "types": ["electric", "steel"]},
    92: {"name": "Gastly", "types": ["ghost", "poison"]},
    93: {"name": "Haunter", "types": ["ghost", "poison"]},
    94: {"name": "Gengar", "types": ["ghost", "poison"]},
    100: {"name": "Voltorb", "types": ["electric"]},
    101: {"name": "Electrode", "types": ["electric"]},
    104: {"name": "Cubone", "types": ["ground"]},
    105: {"name": "Marowak", "types": ["ground"]},
    109: {"name": "Koffing", "types": ["poison"]},
    110: {"name": "Weezing", "types": ["poison"]},
    115: {"name": "Kangaskhan", "types": ["normal"]},
    116: {"name": "Horsea", "types": ["water"]},
    117: {"name": "Seadra", "types": ["water"]},
    129: {"name": "Magikarp", "types": ["water"]},
    130: {"name": "Gyarados", "types": ["water", "flying"]},
    133: {"name": "Eevee", "types": ["normal"]},
    134: {"name": "Vaporeon", "types": ["water"]},
    135: {"name": "Jolteon", "types": ["electric"]},
    136: {"name": "Flareon", "types": ["fire"]},
    142: {"name": "Aerodactyl", "types": ["rock", "flying"]},
    144: {"name": "Articuno", "types": ["ice", "flying"]},
    145: {"name": "Zapdos", "types": ["electric", "flying"]},
    146: {"name": "Moltres", "types": ["fire", "flying"]},
    147: {"name": "Dratini", "types": ["dragon"]},
    148: {"name": "Dragonair", "types": ["dragon"]},
    149: {"name": "Dragonite", "types": ["dragon", "flying"]},
    151: {"name": "Mew", "types": ["psychic"]},
}

# Evolution families — for finding relevant images
EVOLUTION_FAMILIES = {
    1: ["Bulbasaur", "Ivysaur", "Venusaur"],
    4: ["Charmander", "Charmeleon", "Charizard"],
    7: ["Squirtle", "Wartortle", "Blastoise"],
    10: ["Caterpie", "Metapod", "Butterfree"],
    13: ["Weedle", "Kakuna", "Beedrill"],
    16: ["Pidgey", "Pidgeotto", "Pidgeot"],
    19: ["Rattata", "Raticate"],
    21: ["Spearow", "Fearow"],
    23: ["Ekans", "Arbok"],
    25: ["Pikachu", "Raichu"],
    29: ["Nidoran", "Nidorina", "Nidoqueen"],
    32: ["Nidoran", "Nidorino", "Nidoking"],
    35: ["Clefairy", "Clefable"],
    37: ["Vulpix", "Ninetales"],
    39: ["Jigglypuff", "Wigglytuff"],
    43: ["Oddish", "Gloom", "Vileplume"],
    52: ["Meowth", "Persian"],
    54: ["Psyduck", "Golduck"],
    58: ["Growlithe", "Arcanine"],
    60: ["Poliwag", "Poliwhirl", "Poliwrath"],
    63: ["Abra", "Kadabra", "Alakazam"],
    66: ["Machop", "Machoke", "Machamp"],
    74: ["Geodude", "Graveler", "Golem"],
    77: ["Ponyta", "Rapidash"],
    79: ["Slowpoke", "Slowbro"],
    81: ["Magnemite", "Magneton"],
    92: ["Gastly", "Haunter", "Gengar"],
    100: ["Voltorb", "Electrode"],
    104: ["Cubone", "Marowak"],
    109: ["Koffing", "Weezing"],
    116: ["Horsea", "Seadra"],
    129: ["Magikarp", "Gyarados"],
    133: ["Eevee", "Vaporeon", "Jolteon", "Flareon"],
    147: ["Dratini", "Dragonair", "Dragonite"],
}


def get_family_names(pokemon_name: str) -> list[str]:
    """Get all Pokemon names in the same evolution family."""
    for family in EVOLUTION_FAMILIES.values():
        for name in family:
            if name.lower() == pokemon_name.lower() or pokemon_name.lower().startswith(name.lower()):
                return family
    return [pokemon_name]


# ==================== MOVES (exact match from data.ts) ====================
DEFAULT_MOVES = {
    "fire": [("Flamethrower", "fire"), ("Ember", "fire"), ("Fire Fang", "fire"), ("Recover", "normal")],
    "water": [("Hydro Pump", "water"), ("Water Gun", "water"), ("Aqua Tail", "water"), ("Recover", "normal")],
    "grass": [("Solar Beam", "grass"), ("Razor Leaf", "grass"), ("Vine Whip", "grass"), ("Synthesis", "grass")],
    "electric": [("Thunderbolt", "electric"), ("Thunder Shock", "electric"), ("Thunder", "electric"), ("Charge", "electric")],
    "psychic": [("Psychic", "psychic"), ("Psybeam", "psychic"), ("Hypnosis", "psychic"), ("Barrier", "psychic")],
    "fighting": [("Close Combat", "fighting"), ("Karate Chop", "fighting"), ("Brick Break", "fighting"), ("Bulk Up", "fighting")],
    "ghost": [("Shadow Ball", "ghost"), ("Shadow Claw", "ghost"), ("Hex", "ghost"), ("Curse", "ghost")],
    "dark": [("Dark Pulse", "dark"), ("Bite", "dark"), ("Crunch", "dark"), ("Nasty Plot", "dark")],
    "poison": [("Sludge Bomb", "poison"), ("Poison Jab", "poison"), ("Toxic", "poison"), ("Recover", "normal")],
    "ground": [("Earthquake", "ground"), ("Dig", "ground"), ("Rock Slide", "rock"), ("Recover", "normal")],
    "flying": [("Brave Bird", "flying"), ("Air Slash", "flying"), ("Aerial Ace", "flying"), ("Roost", "flying")],
    "rock": [("Rock Slide", "rock"), ("Rock Throw", "rock"), ("Ancient Power", "rock"), ("Recover", "normal")],
    "bug": [("Bug Buzz", "bug"), ("X-Scissor", "bug"), ("Signal Beam", "bug"), ("Recover", "normal")],
    "ice": [("Ice Beam", "ice"), ("Aurora Beam", "ice"), ("Blizzard", "ice"), ("Recover", "normal")],
    "steel": [("Flash Cannon", "steel"), ("Metal Claw", "steel"), ("Iron Tail", "steel"), ("Iron Defense", "steel")],
    "dragon": [("Dragon Pulse", "dragon"), ("Dragon Claw", "dragon"), ("Outrage", "dragon"), ("Recover", "normal")],
    "fairy": [("Moonblast", "fairy"), ("Dazzling Gleam", "fairy"), ("Draining Kiss", "fairy"), ("Charm", "fairy")],
    "normal": [("Body Slam", "normal"), ("Tackle", "normal"), ("Quick Attack", "normal"), ("Recover", "normal")],
}

CUSTOM_MOVES = {
    10: [("Tackle", "normal"), ("String Shot", "bug"), ("Bug Bite", "bug"), ("Recover", "normal")],
    13: [("Poison Sting", "poison"), ("String Shot", "bug"), ("Bug Bite", "bug"), ("Recover", "normal")],
    35: [("Pound", "normal"), ("Metronome", "normal"), ("Moonblast", "fairy"), ("Recover", "normal")],
    39: [("Pound", "normal"), ("Sing", "normal"), ("Double Slap", "normal"), ("Recover", "normal")],
    81: [("Thunder Shock", "electric"), ("Flash Cannon", "steel"), ("Thunderbolt", "electric"), ("Iron Defense", "steel")],
    100: [("Thunder Shock", "electric"), ("Thunderbolt", "electric"), ("Self-Destruct", "normal"), ("Charge", "electric")],
    104: [("Bone Club", "ground"), ("Bonemerang", "ground"), ("Headbutt", "normal"), ("Recover", "normal")],
    115: [("Mega Punch", "normal"), ("Dizzy Punch", "normal"), ("Outrage", "dragon"), ("Recover", "normal")],
    129: [("Splash", "normal"), ("Tackle", "normal"), ("Flail", "normal"), ("Splash", "normal")],
    142: [("Rock Slide", "rock"), ("Aerial Ace", "flying"), ("Ancient Power", "rock"), ("Roost", "flying")],
    144: [("Blizzard", "ice"), ("Ice Beam", "ice"), ("Sheer Cold", "ice"), ("Roost", "flying")],
    145: [("Thunder", "electric"), ("Thunderbolt", "electric"), ("Drill Peck", "flying"), ("Roost", "flying")],
    146: [("Fire Blast", "fire"), ("Flamethrower", "fire"), ("Air Slash", "flying"), ("Roost", "flying")],
    147: [("Dragon Rage", "dragon"), ("Twister", "dragon"), ("Wrap", "normal"), ("Recover", "normal")],
    151: [("Psychic", "psychic"), ("Aura Sphere", "fighting"), ("Ancient Power", "rock"), ("Transform", "normal")],
}

# Fandom page title overrides
FANDOM_TITLE = {
    "Psychic": "Psychic_(move)", "Recover": "Recover", "Rest": "Rest",
    "Charm": "Charm_(move)", "Sing": "Sing_(move)", "Charge": "Charge_(move)",
    "Curse": "Curse_(move)", "Transform": "Transform_(move)", "Wrap": "Wrap_(move)",
    "Splash": "Splash_(move)", "Pound": "Pound_(move)", "Spark": "Spark_(move)",
    "Dig": "Dig_(move)", "Roost": "Roost_(move)", "Synthesis": "Synthesis_(move)",
    "Toxic": "Toxic_(move)", "Flail": "Flail_(move)", "Metronome": "Metronome_(move)",
    "Barrier": "Barrier_(move)", "Hypnosis": "Hypnosis_(move)",
    "Headbutt": "Headbutt_(move)", "Bite": "Bite_(move)", "Crunch": "Crunch_(move)",
    "Outrage": "Outrage_(move)", "Tackle": "Tackle_(move)", "Thunder": "Thunder_(move)",
    "Blizzard": "Blizzard_(move)", "Hex": "Hex_(move)", "Twister": "Twister_(move)",
    "Rollout": "Rollout_(move)", "Ember": "Ember_(move)", "Bonemerang": "Bonemerang",
    "Sheer Cold": "Sheer_Cold",
}

BULBA_TITLE = {
    "Thunder Shock": "Thunder_Shock", "Fire Fang": "Fire_Fang",
    "Hydro Pump": "Hydro_Pump", "Water Gun": "Water_Gun",
    "Aqua Tail": "Aqua_Tail", "Solar Beam": "Solar_Beam",
    "Razor Leaf": "Razor_Leaf", "Vine Whip": "Vine_Whip",
    "Close Combat": "Close_Combat", "Karate Chop": "Karate_Chop",
    "Brick Break": "Brick_Break", "Bulk Up": "Bulk_Up",
    "Shadow Ball": "Shadow_Ball", "Shadow Claw": "Shadow_Claw",
    "Dark Pulse": "Dark_Pulse", "Nasty Plot": "Nasty_Plot",
    "Sludge Bomb": "Sludge_Bomb", "Poison Jab": "Poison_Jab",
    "Rock Slide": "Rock_Slide", "Brave Bird": "Brave_Bird",
    "Air Slash": "Air_Slash", "Aerial Ace": "Aerial_Ace",
    "Rock Throw": "Rock_Throw", "Ancient Power": "Ancient_Power",
    "Bug Buzz": "Bug_Buzz", "Signal Beam": "Signal_Beam",
    "Ice Beam": "Ice_Beam", "Aurora Beam": "Aurora_Beam",
    "Flash Cannon": "Flash_Cannon", "Metal Claw": "Metal_Claw",
    "Iron Tail": "Iron_Tail", "Iron Defense": "Iron_Defense",
    "Dragon Pulse": "Dragon_Pulse", "Dragon Claw": "Dragon_Claw",
    "Dazzling Gleam": "Dazzling_Gleam", "Draining Kiss": "Draining_Kiss",
    "Body Slam": "Body_Slam", "Quick Attack": "Quick_Attack",
    "Dragon Rage": "Dragon_Rage", "String Shot": "String_Shot",
    "Bug Bite": "Bug_Bite", "Double Slap": "Double_Slap",
    "Sonic Boom": "Sonic_Boom", "Magnet Rise": "Magnet_Rise",
    "Freeze-Dry": "Freeze-Dry", "Drill Peck": "Drill_Peck",
    "Fire Blast": "Fire_Blast", "Aura Sphere": "Aura_Sphere",
    "Wing Attack": "Wing_Attack", "Mega Punch": "Mega_Punch",
    "Dizzy Punch": "Dizzy_Punch", "Self-Destruct": "Self-Destruct",
    "X-Scissor": "X-Scissor", "Soft-Boiled": "Soft-Boiled",
    "Poison Sting": "Poison_Sting", "Bone Club": "Bone_Club",
    "Sheer Cold": "Sheer_Cold", "Thunder Shock": "Thunder_Shock",
}


def get_moves_for_pokemon(poke_id: int, poke_types: list) -> list:
    if poke_id in CUSTOM_MOVES:
        return CUSTOM_MOVES[poke_id]
    return DEFAULT_MOVES.get(poke_types[0], DEFAULT_MOVES["normal"])


# ==================== IMAGE DOWNLOAD ====================

def fetch_fandom_move_images(move_name: str) -> list[str]:
    """Fetch all anime-style image filenames from a Fandom move page."""
    title = FANDOM_TITLE.get(move_name, move_name.replace(" ", "_"))
    move_lower = move_name.lower().replace(" ", "").replace("-", "")

    try:
        resp = requests.get(FANDOM_API, params={
            "action": "query", "titles": title, "prop": "images",
            "format": "json", "imlimit": 500,
        }, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        pages = data.get("query", {}).get("pages", {})
        results = []
        for pid, page in pages.items():
            if pid == "-1":
                break
            for img in page.get("images", []):
                t = img["title"].replace("File:", "")
                t_lower = t.lower().replace(" ", "").replace("-", "")

                # Must contain the move name and be PNG
                if move_lower not in t_lower or not t.endswith(".png"):
                    continue

                # Skip numbered sprites, generation badges, game screenshots
                if re.match(r"^\d{3,4}", t):
                    continue
                skip = ["Generation ", "Flag ", "Masters ", "Battrio", "Channel ",
                        "Stadium ", "Colosseum ", "Copycat ", "PO.png"]
                if any(s in t for s in skip):
                    continue

                results.append(t)

        return results

    except Exception as e:
        print(f"    [ERR] Fandom page query for {move_name}: {e}")
        return []


def download_fandom_image(filename: str) -> Image.Image | None:
    """Download a specific image file from Fandom wiki."""
    safe = filename.replace(" ", "_").replace("/", "_").replace(":", "_")
    cache_path = os.path.join(CACHE_DIR, f"f_{safe}")
    if os.path.exists(cache_path):
        try:
            return Image.open(cache_path).convert("RGBA")
        except Exception:
            pass

    try:
        resp = requests.get(FANDOM_API, params={
            "action": "query", "titles": f"File:{filename}",
            "prop": "imageinfo", "iiprop": "url",
            "format": "json", "iiurlwidth": 480,
        }, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        pages = data.get("query", {}).get("pages", {})
        for pid, page in pages.items():
            if pid == "-1":
                return None
            info = page.get("imageinfo", [{}])[0]
            url = info.get("thumburl") or info.get("url")
            if not url:
                return None

            img_resp = requests.get(url, headers=HEADERS, timeout=15)
            img_resp.raise_for_status()
            img = Image.open(BytesIO(img_resp.content)).convert("RGBA")
            img.save(cache_path)
            return img

    except Exception as e:
        print(f"    [ERR] Download {filename}: {e}")
        return None


def download_bulbapedia_image(move_name: str) -> Image.Image | None:
    """Fallback: Download game screenshot from Bulbapedia."""
    safe = move_name.replace(" ", "_").replace("/", "_")
    cache_path = os.path.join(CACHE_DIR, f"b_{safe}.png")
    if os.path.exists(cache_path):
        try:
            return Image.open(cache_path).convert("RGBA")
        except Exception:
            pass

    title = BULBA_TITLE.get(move_name, move_name.replace(" ", "_"))
    try:
        resp = requests.get(BULBA_API, params={
            "action": "query", "titles": f"{title}_(move)",
            "prop": "pageimages", "format": "json", "pithumbsize": 400,
        }, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        pages = data.get("query", {}).get("pages", {})
        for pid, page in pages.items():
            thumb = page.get("thumbnail", {})
            if thumb.get("source"):
                img_resp = requests.get(thumb["source"], headers=HEADERS, timeout=15)
                img_resp.raise_for_status()
                img = Image.open(BytesIO(img_resp.content)).convert("RGBA")
                img.save(cache_path)
                return img
    except Exception as e:
        print(f"    [ERR] Bulbapedia {move_name}: {e}")
    return None


def pick_best_image_for_pokemon(image_filenames: list[str], pokemon_name: str) -> str | None:
    """Pick the best anime screenshot for a specific Pokemon from a list of filenames."""
    if not image_filenames:
        return None

    family = get_family_names(pokemon_name)

    def score(filename: str) -> int:
        s = 0
        fl = filename.lower()
        # Highest: exact Pokemon name match
        if pokemon_name.lower() in fl:
            s += 1000
        # High: evolution family match
        for fam in family:
            if fam.lower() in fl:
                s += 500
                break
        # Medium: Ash's Pokemon (iconic anime images)
        if "ash " in fl.lower():
            s += 100
        # Slight boost: known trainers
        for trainer in ["brock ", "misty ", "red's ", "gary "]:
            if trainer in fl.lower():
                s += 50
                break
        # Prefer shorter filenames (cleaner screenshots)
        s -= len(filename) // 30
        return s

    ranked = sorted(image_filenames, key=score, reverse=True)
    return ranked[0]


# ==================== ICON CREATION ====================

def create_skill_icon(artwork: Image.Image, move_type: str) -> Image.Image:
    """Create a 54x54 skill icon from artwork."""
    size = ICON_SIZE
    color = TYPE_COLORS.get(move_type, TYPE_COLORS["normal"])

    w, h = artwork.size
    if w > h:
        left = (w - h) // 2
        artwork = artwork.crop((left, 0, left + h, h))
    elif h > w:
        top = (h - w) // 2
        artwork = artwork.crop((0, top, w, top + w))

    cropped = artwork.resize((size, size), Image.Resampling.LANCZOS)
    icon = Image.new("RGBA", (size, size), (10, 10, 20, 255))
    icon.paste(cropped, (0, 0), cropped)

    rgb = icon.convert("RGB")
    rgb = ImageEnhance.Contrast(rgb).enhance(1.15)
    rgb = ImageEnhance.Color(rgb).enhance(1.25)
    rgb = ImageEnhance.Brightness(rgb).enhance(0.88)
    icon = rgb.convert("RGBA")

    # Vignette
    vignette = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette)
    for i in range(5):
        alpha = int(160 * (1 - i / 5))
        vdraw.rectangle([i, i, size - 1 - i, size - 1 - i], outline=(5, 5, 15, alpha))
    icon = Image.alpha_composite(icon, vignette)

    # Type border
    border = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(border)
    bdraw.rectangle([0, 0, size - 1, size - 1], outline=(0, 0, 0, 255))
    bdraw.rectangle([1, 1, size - 2, size - 2], outline=(*color, 220))
    icon = Image.alpha_composite(icon, border)

    final = Image.new("RGB", (size, size), (10, 10, 20))
    final.paste(icon, (0, 0), icon)
    return final


def create_fallback_icon(move_type: str) -> Image.Image:
    """Fallback type-colored icon."""
    size = ICON_SIZE
    color = TYPE_COLORS.get(move_type, TYPE_COLORS["normal"])
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
    draw.rectangle([1, 1, size - 2, size - 2], outline=(*color,))
    return icon


# ==================== MAIN ====================

def generate_all_icons():
    os.makedirs(CACHE_DIR, exist_ok=True)
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 1. Collect unique moves
    all_moves: dict[str, str] = {}
    for poke_id, poke_data in ALL_POKEMON.items():
        moves = get_moves_for_pokemon(poke_id, poke_data["types"])
        for move_name, move_type in moves:
            if move_name not in all_moves:
                all_moves[move_name] = move_type

    print(f"Found {len(all_moves)} unique moves")
    print()

    # 2. For each move, fetch all anime image filenames from Fandom
    print("Step 1: Fetching anime image lists from Fandom Wiki...")
    move_anime_images: dict[str, list[str]] = {}  # move_name -> [filenames]
    move_bulba_cache: dict[str, Image.Image | None] = {}  # move_name -> fallback image

    for i, (move_name, move_type) in enumerate(sorted(all_moves.items())):
        images = fetch_fandom_move_images(move_name)
        move_anime_images[move_name] = images
        count = len(images)
        if count > 0:
            print(f"  [{i+1}] {move_name}: {count} anime images")
        else:
            print(f"  [{i+1}] {move_name}: 0 anime → will use Bulbapedia")
            # Pre-fetch Bulbapedia fallback
            move_bulba_cache[move_name] = download_bulbapedia_image(move_name)
            time.sleep(0.3)

        if i < len(all_moves) - 1:
            time.sleep(0.3)

    print()

    # 3. For each Pokemon, pick the best image per move and generate icons
    print("Step 2: Generating Pokemon-specific skill icons...")
    total = len(ALL_POKEMON)
    generated = 0
    stats = {"anime": 0, "bulba": 0, "fallback": 0}
    downloaded_images_cache: dict[str, Image.Image] = {}  # filename -> Image

    for poke_id, poke_data in sorted(ALL_POKEMON.items()):
        poke_name = poke_data["name"]
        moves = get_moves_for_pokemon(poke_id, poke_data["types"])
        poke_dir = os.path.join(OUTPUT_DIR, str(poke_id))
        os.makedirs(poke_dir, exist_ok=True)

        for i, (move_name, move_type) in enumerate(moves):
            img = None
            source = ""

            # Try Fandom anime - pick best for this Pokemon
            anime_files = move_anime_images.get(move_name, [])
            if anime_files:
                best = pick_best_image_for_pokemon(anime_files, poke_name)
                if best:
                    # Download if not cached
                    if best not in downloaded_images_cache:
                        dl = download_fandom_image(best)
                        if dl:
                            downloaded_images_cache[best] = dl
                            time.sleep(0.2)
                    img = downloaded_images_cache.get(best)
                    if img:
                        source = "anime"

            # Fallback: Bulbapedia
            if not img:
                if move_name in move_bulba_cache:
                    img = move_bulba_cache[move_name]
                else:
                    img = download_bulbapedia_image(move_name)
                    move_bulba_cache[move_name] = img
                    time.sleep(0.3)
                if img:
                    source = "bulba"

            # Create icon
            if img:
                icon = create_skill_icon(img, move_type)
                stats[source] += 1
            else:
                icon = create_fallback_icon(move_type)
                stats["fallback"] += 1

            output_path = os.path.join(poke_dir, f"{i}.png")
            icon.save(output_path, "PNG", optimize=True)

        generated += 1
        if generated % 15 == 0:
            print(f"  {generated}/{total} Pokemon done...")

    print(f"\n  Done! {generated} Pokemon, {generated * 4} total icons")
    print(f"  Anime: {stats['anime']} | Bulbapedia: {stats['bulba']} | Fallback: {stats['fallback']}")

    # 4. Manifest
    manifest = {}
    for poke_id, poke_data in sorted(ALL_POKEMON.items()):
        moves = get_moves_for_pokemon(poke_id, poke_data["types"])
        manifest[str(poke_id)] = {
            "name": poke_data["name"],
            "moves": [
                {"name": m[0], "type": m[1], "icon": f"/skills/{poke_id}/{i}.png"}
                for i, m in enumerate(moves)
            ]
        }
    manifest_path = os.path.join(OUTPUT_DIR, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\nManifest: {manifest_path}")


if __name__ == "__main__":
    generate_all_icons()

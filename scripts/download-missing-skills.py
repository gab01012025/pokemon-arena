#!/usr/bin/env python3
"""
Download real anime skill images from Fandom Wiki for Pokemon
that currently have portrait-based placeholder icons.
Only replaces specific Pokemon+indices. Does NOT touch other images.
"""

import os
import time
from io import BytesIO

import requests
from PIL import Image, ImageDraw, ImageEnhance

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILLS_DIR = os.path.join(BASE_DIR, "public", "skills")
CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".move_image_cache_v5")
ICON_SIZE = 54
HEADERS = {"User-Agent": "PokemonArenaBot/1.0 (educational fan project; skill icons)"}
FANDOM_API = "https://pokemon.fandom.com/api.php"
BULBA_API = "https://bulbapedia.bulbagarden.net/w/api.php"

# Pokemon that need ALL 4 skill images (had no folder)
FULL_REPLACE = {
    48: ("Venonat", "bug", ["Tackle", "Poison Powder", "Confusion", "Psybeam"]),
    83: ("Farfetchd", "normal", ["Peck", "Slash", "Swords Dance", "Brave Bird"]),
    90: ("Shellder", "water", ["Tackle", "Icicle Spear", "Withdraw", "Ice Beam"]),
    102: ("Exeggcute", "grass", ["Barrage", "Hypnosis", "Confusion", "Solar Beam"]),
    108: ("Lickitung", "normal", ["Lick", "Stomp", "Slam", "Body Slam"]),
    114: ("Tangela", "grass", ["Vine Whip", "Stun Spore", "Mega Drain", "Power Whip"]),
    124: ("Jynx", "ice", ["Pound", "Lovely Kiss", "Ice Punch", "Blizzard"]),
}

# Pokemon that need specific indices only (had incomplete sets)
PARTIAL_REPLACE = {
    46: ("Paras", "bug", {1: "Stun Spore", 2: "Leech Life", 3: "Slash"}),
    50: ("Diglett", "ground", {1: "Mud-Slap", 2: "Dig", 3: "Earthquake"}),
    72: ("Tentacool", "water", {1: "Water Pulse", 2: "Acid", 3: "Bubble Beam"}),
    84: ("Doduo", "normal", {1: "Fury Attack", 2: "Drill Peck", 3: "Tri Attack"}),
    88: ("Grimer", "poison", {1: "Sludge"}),
    132: ("Ditto", "normal", {1: "Tackle", 2: "Struggle", 3: "Body Slam"}),
    137: ("Porygon", "normal", {1: "Psybeam", 2: "Tri Attack", 3: "Hyper Beam"}),
    138: ("Omanyte", "rock", {1: "Bite", 2: "Ancient Power", 3: "Hydro Pump"}),
    140: ("Kabuto", "rock", {1: "Aqua Jet", 2: "Ancient Power", 3: "Rock Slide"}),
}

# Fandom page title overrides (moves that conflict with other pages)
FANDOM_TITLE = {
    "Psychic": "Psychic_(move)", "Recover": "Recover", "Tackle": "Tackle_(move)",
    "Charm": "Charm_(move)", "Sing": "Sing_(move)", "Charge": "Charge_(move)",
    "Curse": "Curse_(move)", "Transform": "Transform_(move)", "Wrap": "Wrap_(move)",
    "Splash": "Splash_(move)", "Pound": "Pound_(move)", "Slash": "Slash_(move)",
    "Dig": "Dig_(move)", "Roost": "Roost_(move)", "Synthesis": "Synthesis_(move)",
    "Toxic": "Toxic_(move)", "Flail": "Flail_(move)", "Lick": "Lick_(move)",
    "Barrier": "Barrier_(move)", "Hypnosis": "Hypnosis_(move)", "Stomp": "Stomp_(move)",
    "Headbutt": "Headbutt_(move)", "Bite": "Bite_(move)", "Crunch": "Crunch_(move)",
    "Slam": "Slam_(move)", "Scratch": "Scratch_(move)", "Peck": "Peck_(move)",
    "Outrage": "Outrage_(move)", "Thunder": "Thunder_(move)", "Confusion": "Confusion_(move)",
    "Blizzard": "Blizzard_(move)", "Hex": "Hex_(move)", "Barrage": "Barrage_(move)",
    "Twister": "Twister_(move)", "Ember": "Ember_(move)", "Struggle": "Struggle_(move)",
    "Withdraw": "Withdraw_(move)", "Disable": "Disable_(move)", "Acid": "Acid_(move)",
}

TYPE_COLORS = {
    "fire": (240, 128, 48), "water": (104, 144, 240), "grass": (120, 200, 80),
    "electric": (248, 208, 48), "psychic": (248, 88, 136), "fighting": (192, 48, 40),
    "dark": (112, 88, 72), "poison": (160, 64, 160), "ghost": (112, 88, 152),
    "ground": (224, 192, 104), "flying": (168, 144, 240), "rock": (184, 160, 56),
    "bug": (168, 184, 32), "ice": (152, 216, 216), "steel": (184, 184, 208),
    "dragon": (112, 56, 248), "fairy": (238, 153, 172), "normal": (168, 168, 120),
}

# Move type overrides (when the move type differs from Pokemon type)
MOVE_TYPES = {
    "Tackle": "normal", "Scratch": "normal", "Pound": "normal", "Peck": "flying",
    "Slash": "normal", "Stomp": "normal", "Slam": "normal", "Body Slam": "normal",
    "Struggle": "normal", "Fury Attack": "normal", "Lick": "ghost", "Barrage": "normal",
    "Confusion": "psychic", "Psybeam": "psychic", "Hypnosis": "psychic",
    "Poison Powder": "poison", "Stun Spore": "grass", "Poison Sting": "poison",
    "Sludge": "poison", "Sludge Bomb": "poison", "Acid": "poison",
    "Leech Life": "bug", "Mud-Slap": "ground", "Dig": "ground", "Earthquake": "ground",
    "Water Pulse": "water", "Bubble Beam": "water", "Water Gun": "water",
    "Hydro Pump": "water", "Aqua Jet": "water",
    "Swords Dance": "normal", "Brave Bird": "flying", "Drill Peck": "flying",
    "Tri Attack": "normal", "Hyper Beam": "normal",
    "Icicle Spear": "ice", "Withdraw": "water", "Ice Beam": "ice", "Ice Punch": "ice",
    "Blizzard": "ice", "Lovely Kiss": "normal",
    "Vine Whip": "grass", "Mega Drain": "grass", "Power Whip": "grass",
    "Solar Beam": "grass", "Transform": "normal",
    "Ancient Power": "rock", "Rock Slide": "rock", "Bite": "dark",
    "Disable": "normal",
}


def fetch_fandom_images(move_name: str, pokemon_name: str) -> list[str]:
    """Fetch anime image filenames from Fandom move page, sorted by relevance to Pokemon."""
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
                t_lower = t.lower()
                if not t.endswith(".png"):
                    continue
                # Must relate to the move
                if move_lower not in t_lower.replace(" ", "").replace("-", ""):
                    continue
                # Skip numbered sprites, non-anime images
                import re
                if re.match(r"^\d{3,4}", t):
                    continue
                skip = ["Generation ", "Flag ", "Masters ", "Battrio", "Channel ",
                        "Stadium ", "Colosseum ", "Copycat ", "PO.png", "GO "]
                if any(s in t for s in skip):
                    continue
                results.append(t)

        # Sort by relevance to this Pokemon
        poke_lower = pokemon_name.lower()
        def score(fn):
            fl = fn.lower()
            s = 0
            if poke_lower in fl:
                s += 1000
            if "ash " in fl:
                s += 50
            return s

        results.sort(key=score, reverse=True)
        return results

    except Exception as e:
        print(f"    [ERR] Fandom query {move_name}: {e}")
        return []


def download_fandom_image(filename: str) -> Image.Image | None:
    """Download image from Fandom wiki."""
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
            os.makedirs(CACHE_DIR, exist_ok=True)
            img.save(cache_path)
            return img
    except Exception as e:
        print(f"    [ERR] Download {filename[:60]}: {e}")
        return None


def download_bulbapedia(move_name: str) -> Image.Image | None:
    """Fallback: Download from Bulbapedia."""
    safe = move_name.replace(" ", "_").replace("/", "_")
    cache_path = os.path.join(CACHE_DIR, f"b_{safe}.png")
    if os.path.exists(cache_path):
        try:
            return Image.open(cache_path).convert("RGBA")
        except Exception:
            pass

    title = move_name.replace(" ", "_")
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
                os.makedirs(CACHE_DIR, exist_ok=True)
                img.save(cache_path)
                return img
    except Exception as e:
        print(f"    [ERR] Bulbapedia {move_name}: {e}")
    return None


def create_icon(artwork: Image.Image, move_type: str) -> Image.Image:
    """Create a 54x54 skill icon from artwork."""
    size = ICON_SIZE
    color = TYPE_COLORS.get(move_type, TYPE_COLORS["normal"])

    w, h = artwork.size
    # Center crop to square
    if w > h:
        left = (w - h) // 2
        artwork = artwork.crop((left, 0, left + h, h))
    elif h > w:
        top = (h - w) // 2
        artwork = artwork.crop((0, top, w, top + w))

    cropped = artwork.resize((size, size), Image.LANCZOS)
    icon = Image.new("RGBA", (size, size), (10, 10, 20, 255))
    icon.paste(cropped, (0, 0), cropped)

    rgb = icon.convert("RGB")
    rgb = ImageEnhance.Contrast(rgb).enhance(1.15)
    rgb = ImageEnhance.Color(rgb).enhance(1.2)
    rgb = ImageEnhance.Brightness(rgb).enhance(0.9)

    return rgb


def get_skill_image(move_name: str, pokemon_name: str, move_type: str) -> Image.Image | None:
    """Try to get a skill image from Fandom, then Bulbapedia."""
    # Try Fandom first
    filenames = fetch_fandom_images(move_name, pokemon_name)
    if filenames:
        # Try the best match first, then others
        for fn in filenames[:3]:
            img = download_fandom_image(fn)
            if img:
                return create_icon(img, move_type)
            time.sleep(0.2)

    # Fallback: Bulbapedia
    img = download_bulbapedia(move_name)
    if img:
        return create_icon(img, move_type)

    return None


def main():
    os.makedirs(CACHE_DIR, exist_ok=True)
    downloaded = 0
    failed = 0

    # Process full replacements (all 4 indices)
    print("=== FULL REPLACEMENTS ===")
    for poke_id, (poke_name, poke_type, moves) in sorted(FULL_REPLACE.items()):
        print(f"[{poke_id}] {poke_name}:")
        poke_dir = os.path.join(SKILLS_DIR, str(poke_id))
        os.makedirs(poke_dir, exist_ok=True)

        for i, move_name in enumerate(moves):
            move_type = MOVE_TYPES.get(move_name, poke_type)
            icon = get_skill_image(move_name, poke_name, move_type)
            if icon:
                out = os.path.join(poke_dir, f"{i}.png")
                icon.save(out, "PNG", optimize=True)
                print(f"  [{i}] {move_name} -> OK")
                downloaded += 1
            else:
                print(f"  [{i}] {move_name} -> FAILED")
                failed += 1
            time.sleep(0.3)

    # Process partial replacements (specific indices)
    print("\n=== PARTIAL REPLACEMENTS ===")
    for poke_id, (poke_name, poke_type, moves_dict) in sorted(PARTIAL_REPLACE.items()):
        print(f"[{poke_id}] {poke_name}:")
        poke_dir = os.path.join(SKILLS_DIR, str(poke_id))
        os.makedirs(poke_dir, exist_ok=True)

        for idx, move_name in sorted(moves_dict.items()):
            move_type = MOVE_TYPES.get(move_name, poke_type)
            icon = get_skill_image(move_name, poke_name, move_type)
            if icon:
                out = os.path.join(poke_dir, f"{idx}.png")
                icon.save(out, "PNG", optimize=True)
                print(f"  [{idx}] {move_name} -> OK")
                downloaded += 1
            else:
                print(f"  [{idx}] {move_name} -> FAILED")
                failed += 1
            time.sleep(0.3)

    print(f"\n=== RESULTS ===")
    print(f"Downloaded: {downloaded}")
    print(f"Failed: {failed}")


if __name__ == "__main__":
    main()

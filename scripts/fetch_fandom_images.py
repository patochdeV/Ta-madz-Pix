#!/usr/bin/env python3
"""
Script pour télécharger les images de personnages Tamagotchi Pix directement depuis Fandom
"""

import urllib.request
import urllib.error
import json
import re
from pathlib import Path
import time

FANDOM_URL = "https://tamagotchi.fandom.com/wiki/Tamagotchi_Pix/Character_list"
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "images" / "characters"
HTML_FILE = Path(__file__).parent.parent / "public" / "characters-list.html"

# Map des noms de personnages avec variantes
CHARACTER_NAMES = {
    "Mametchi": ["Mametchi"],
    "Kuchipatchi": ["Kuchipatchi", "Kutchipatchi"],
    "Tamagotchi": ["Tamagotchi"],
    "Violetchi": ["Violetchi"],
    "Gourmetchi": ["Gourmetchi"],
    "Cheeritchi": ["Cheeritchi"],
    "Himetchi": ["Himetchi"],
    "KuroMametchi": ["KuroMametchi", "Kuro Mametchi"],
    "Mimitchi": ["Mimitchi"],
    "Kikitchi": ["Kikitchi"],
    "Terukerotchi": ["Terukerotchi"],
    "Haretchi": ["Haretchi"],
    "Mokokotchi": ["Mokokotchi"],
    "Soyofuwatchi": ["Soyofuwatchi"],
    "Kurupoyotchi": ["Kurupoyotchi"],
    "Tororitchi": ["Tororitchi"],
    "Fuyofuyotchi": ["Fuyofuyotchi"],
    "Chiroritchi": ["Chiroritchi"],
    "Mokumokutchi": ["Mokumokutchi"],
    "Mimitamatchi": ["Mimitamatchi"],
    "Awamokotchi": ["Awamokotchi"],
    "Gozarutchi": ["Gozarutchi"],
    "Ninjanyatchi": ["Ninjanyatchi"],
    "Weeptchi": ["Weeptchi"],
    "Neliatchi": ["Neliatchi"],
    "Shimagurutchi": ["Shimagurutchi"],
    "Memetchi": ["Memetchi"],
    "Paintotchi": ["Paintotchi"],
    "Coffretchi": ["Coffretchi"],
    "Murachakitchi": ["Murachakitchi"],
    "Momotchi": ["Momotchi"],
    "Orenetchi": ["Orenetchi"],
    "Sebiretchi": ["Sebiretchi"],
    "Charatchi": ["Charatchi"],
    "Puchitomatchi": ["Puchitomatchi"],
    "Tantotchi": ["Tantotchi"],
    "Androtchi": ["Androtchi"],
    "Sweetchi": ["Sweetchi"],
    "Lovelitchi": ["Lovelitchi"],
    "Maskutchi": ["Maskutchi", "Masktchi"],
}

def fetch_page(url):
    """Récupérer le contenu d'une page"""
    try:
        req = urllib.request.Request(
            url,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"❌ Erreur téléchargement ({url}): {e}")
        return None

def extract_image_urls_from_html(html):
    """Extraire les URLs complètes d'images du HTML"""
    images = {}
    
    # Pattern pour les images Fandom CDN
    # Les images sont généralement dans des URLs comme:
    # https://static.wikia.nocookie.net/tamagotchi/images/...
    pattern = r'https://static\.wikia\.nocookie\.net/[^"\'s]+\.(?:png|jpg|webp|gif)'
    
    for match in re.finditer(pattern, html):
        url = match.group(0)
        # Extraire le nom du fichier
        try:
            filename = url.split('/')[-1].split('?')[0]
            # Chercher le nom du personnage dans les données adjacentes
            start = max(0, match.start() - 500)
            context = html[start:match.start()]
            
            # Chercher un nom de personnage dans le contexte
            for char_key, char_names in CHARACTER_NAMES.items():
                for name in char_names:
                    if name.lower() in context.lower():
                        if char_key not in images:
                            images[char_key] = url
                        break
        except:
            pass
    
    return images

def get_character_images():
    """Récupérer les images depuis Fandom"""
    print("🌐 Récupération de la page Fandom...")
    html = fetch_page(FANDOM_URL)
    
    if not html:
        print("❌ Impossible de récupérer la page")
        return {}
    
    images = extract_image_urls_from_html(html)
    return images

def download_images(image_map):
    """Télécharger les images"""
    print(f"\n📥 Téléchargement de {len(image_map)} images...")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    downloaded = {}
    for char_name, url in image_map.items():
        filename = f"{char_name.lower()}.png"
        filepath = OUTPUT_DIR / filename
        
        try:
            if filepath.exists():
                print(f"  ✓ {char_name} (existant)")
                downloaded[char_name] = f"assets/images/characters/{filename}"
                continue
            
            print(f"  ↓ {char_name}...", end=" ", flush=True)
            req = urllib.request.Request(
                url,
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            
            with urllib.request.urlopen(req, timeout=10) as response:
                content = response.read()
                with open(filepath, 'wb') as f:
                    f.write(content)
                print("✓")
                downloaded[char_name] = f"assets/images/characters/{filename}"
                time.sleep(0.3)  # Éviter de surcharger
        except Exception as e:
            print(f"✗")
    
    return downloaded

def main():
    """Fonction principale"""
    print("=" * 70)
    print("🎮 Extraction des images Tamagotchi Pix depuis Fandom")
    print("=" * 70)
    
    # Récupérer les images
    image_map = get_character_images()
    
    if not image_map:
        print("\n⚠ Aucune image trouvée")
        return
    
    print(f"\n✓ {len(image_map)} images détectées")
    
    # Télécharger les images
    downloaded = download_images(image_map)
    
    # Sauvegarder le mapping
    mapping_file = OUTPUT_DIR.parent / "character-images.json"
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(downloaded, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Mapping sauvegardé: {mapping_file}")
    print(f"📊 Images téléchargées: {len(downloaded)}")

if __name__ == "__main__":
    main()

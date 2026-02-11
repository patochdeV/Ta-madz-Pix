#!/usr/bin/env python3
"""
Script pour extraire les images des personnages Tamagotchi Pix
depuis les sources web et valider les URLs
"""

import urllib.request
import urllib.error
import json
from pathlib import Path

# URLs des sources
FANDOM_URL = "https://tamagotchi.fandom.com/wiki/Tamagotchi_Pix/Character_list"
MRBLINKY_BASE = "https://mrblinky.net/tama/pix/download/"

# Liste des personnages et leurs images potentielles
characters = {
    "Mametchi": ["mametchi.png", "mame.png"],
    "Kuchipatchi": ["kuchipatchi.png", "kuchi.png"],
    "Tamagotchi": ["tamagotchi.png", "tama.png"],
    "Violetchi": ["violetchi.png", "violet.png"],
    "Gourmetchi": ["gourmetchi.png"],
    "Cheeritchi": ["cheeritchi.png"],
    "Himetchi": ["himetchi.png"],
    "KuroMametchi": ["kuromametchi.png"],
    "Mimitchi": ["mimitchi.png"],
    "Kikitchi": ["kikitchi.png"],
    "Terukerotchi": ["terukerotchi.png"],
    "Haretchi": ["haretchi.png"],
    "Mokokotchi": ["mokokotchi.png"],
    "Ninjanyatchi": ["ninjanyatchi.png"],
    "Gozarutchi": ["gozarutchi.png"],
}

def check_image_url(url):
    """Vérifier si une URL d'image existe"""
    try:
        req = urllib.request.Request(url, method='HEAD')
        response = urllib.request.urlopen(req, timeout=5)
        return response.status == 200
    except (urllib.error.URLError, urllib.error.HTTPError, Exception):
        return False

def find_valid_images():
    """Chercher les images valides pour chaque personnage"""
    results = {}
    
    for char_name, filenames in characters.items():
        print(f"\nRecherche d'images pour {char_name}...")
        found = False
        
        for filename in filenames:
            url = MRBLINKY_BASE + filename
            print(f"  Vérification: {url}...", end=" ")
            
            if check_image_url(url):
                print("✓ TROUVÉE")
                results[char_name] = url
                found = True
                break
            else:
                print("✗")
        
        if not found:
            print(f"  ⚠ Aucune image trouvée pour {char_name}")
            results[char_name] = None
    
    return results

if __name__ == "__main__":
    print("🔍 Extraction des images Tamagotchi Pix...")
    print("=" * 50)
    
    valid_images = find_valid_images()
    
    print("\n" + "=" * 50)
    print("📊 Résumé:")
    print(f"  Personnages trouvés: {len([v for v in valid_images.values() if v])}/{len(valid_images)}")
    
    # Sauvegarder les résultats
    output_file = Path(__file__).parent.parent / "data" / "image-mapping.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(valid_images, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Résultats sauvegardés dans: {output_file}")

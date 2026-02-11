#!/usr/bin/env python3
"""
Script pour télécharger les images des personnages Tamagotchi Pix
depuis mrblinky.net et d'autres sources
"""

import urllib.request
import urllib.error
import json
from pathlib import Path
import time

# Configurations
MRBLINKY_BASE = "https://mrblinky.net/tama/pix/download/"
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "images" / "characters"
DATA_FILE = Path(__file__).parent.parent / "public" / "characters-list.html"

# Mapping des personnages avec leurs noms de fichiers possibles
CHARACTER_IMAGE_MAP = {
    "Mametchi": ["mametchi.png"],
    "Kuchipatchi": ["kutchipatchi.png", "kuchipatchi.png"],
    "Tamagotchi": ["tamagotchi.png", "00-tamagotchi.png"],
    "Violetchi": ["violetchi.png"],
    "Gourmetchi": ["gourmetchi.png"],
    "Cheeritchi": ["cheeritchi.png"],
    "Gamer Tamagotchi": ["gamer_tamagotchi.png", "gamertchi.png"],
    "Fashiontchi": ["fashiontchi.png"],
    "Himespetchi": ["himespetchi.png"],
    "Cybertchi": ["cybertchi.png"],
    "Witchtchi": ["witchtchi.png"],
    "Angelchi": ["angelchi.png"],
    "Demonchi": ["demonchi.png"],
    "Koffitchi": ["koffitchi.png"],
    "Lovelin": ["lovelin.png"],
    "Chamametchi": ["chamametchi.png"],
    "Oniontchi": ["oniontchi.png"],
    "Komainu": ["komainu.png"],
    "Ginjirotchi": ["ginjirotchi.png"],
    "Zurugitchi": ["zurugitchi.png"],
    "Megumi": ["megumi.png"],
    "Monsieur Tamagotchi": ["monsieur_tamagotchi.png"],
    "Thecatchi": ["thecatchi.png"],
    "Himetchi": ["himetchi.png"],
    "KuroMametchi": ["kuromametchi.png", "kuro_mametchi.png"],
    "Mimitchi": ["mimitchi.png"],
    "Kikitchi": ["kikitchi.png"],
    "Terukerotchi": ["terukerotchi.png"],
    "Haretchi": ["haretchi.png"],
    "Mokokotchi": ["mokokotchi.png"],
    "Soyofuwatchi": ["soyofuwatchi.png"],
    "Kurupoyotchi": ["kurupoyotchi.png"],
    "Tororitchi": ["tororitchi.png"],
    "Fuyofuyotchi": ["fuyofuyotchi.png"],
    "Chiroritchi": ["chiroritchi.png"],
    "Mokumokutchi": ["mokumokutchi.png"],
    "Mimitamatchi": ["mimitamatchi.png"],
    "Awamokotchi": ["awamokotchi.png"],
    "Gozarutchi": ["gozarutchi.png"],
    "Ninjanyatchi": ["ninjanyatchi.png"],
    "Weeptchi": ["weeptchi.png"],
    "Neliatchi": ["neliatchi.png"],
    "Shimagurutchi": ["shimagurutchi.png"],
    "Memetchi": ["memetchi.png"],
    "Paintotchi": ["paintotchi.png"],
    "Coffretchi": ["coffretchi.png"],
    "Murachakitchi": ["murachakitchi.png"],
    "Momotchi": ["momotchi.png"],
    "Orenetchi": ["orenetchi.png"],
    "Sebiretchi": ["sebiretchi.png"],
    "Charatchi": ["charatchi.png"],
    "Puchitomatchi": ["puchitomatchi.png"],
    "Tantotchi": ["tantotchi.png"],
}

def download_image(url, filename):
    """Télécharger une image et la sauvegarder localement"""
    try:
        filepath = OUTPUT_DIR / filename
        
        # Vérifier si l'image existe déjà
        if filepath.exists():
            print(f"  ✓ {filename} existe déjà")
            return str(filepath.relative_to(OUTPUT_DIR.parent.parent))
        
        print(f"  ↓ {filename}...", end=" ", flush=True)
        
        # Télécharger avec timeout
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            content = response.read()
            
            # Sauvegarder le fichier
            with open(filepath, 'wb') as f:
                f.write(content)
            
            print(f"✓ ({len(content)} bytes)")
            return str(filepath.relative_to(OUTPUT_DIR.parent.parent))
            
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(f"✗ 404 Not Found")
        else:
            print(f"✗ HTTP {e.code}")
    except urllib.error.URLError:
        print(f"✗ Connection Error")
    except Exception as e:
        print(f"✗ {type(e).__name__}")
    
    return None

def main():
    """Fonction principale"""
    print("🎮 Téléchargement des images Tamagotchi Pix")
    print("=" * 60)
    
    # Vérifier que le dossier existe
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    download_map = {}
    successful = 0
    failed = 0
    
    for char_name, filenames in CHARACTER_IMAGE_MAP.items():
        print(f"\n📌 {char_name}")
        
        found = False
        for filename in filenames:
            url = MRBLINKY_BASE + filename
            result = download_image(url, filename)
            
            if result:
                download_map[char_name] = result
                successful += 1
                found = True
                time.sleep(0.5)  # Éviter de surcharger le serveur
                break
        
        if not found:
            print(f"  ⚠ Aucune image trouvée")
            failed += 1
    
    # Sauvegarder le mapping
    print("\n" + "=" * 60)
    print(f"📊 Résumé:")
    print(f"  ✓ Téléchargées: {successful}")
    print(f"  ✗ Échouées: {failed}")
    
    mapping_file = OUTPUT_DIR.parent / "character-images.json"
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(download_map, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Mapping sauvegardé: {mapping_file}")
    return download_map

if __name__ == "__main__":
    main()

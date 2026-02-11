#!/usr/bin/env python3
"""
Script pour extraire les images des personnages Tamagotchi Pix depuis le Fandom
et mettre à jour le fichier HTML
"""

import urllib.request
import urllib.error
import json
import re
from pathlib import Path
from urllib.parse import urljoin
import time

FANDOM_URL = "https://tamagotchi.fandom.com/wiki/Tamagotchi_Pix/Character_list"
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "images" / "characters"
HTML_FILE = Path(__file__).parent.parent / "public" / "characters-list.html"

def fetch_fandom_page():
    """Récupérer la page du Fandom"""
    print("🔍 Récupération de la page Fandom...")
    try:
        req = urllib.request.Request(
            FANDOM_URL,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        print(f"❌ Erreur lors de la récupération: {e}")
        return None

def extract_character_images(html_content):
    """Extraire les images des personnages du HTML"""
    print("📸 Extraction des images...")
    
    # Pattern pour trouver les images avec titre et lien
    # Cherche les balises img avec src et les titres correspondants
    pattern = r'<(a|img)[^>]*(?:href|data-src)="([^"]*?/[^/"]*?(?:Pix|pix).*?\.(?:png|jpg|gif|webp))(?:\|[^"]*)?[^>]*title="([^"]*?)"'
    
    images = {}
    
    # Chercher les images dans les infobox
    infobox_pattern = r'infobox-image-image[^>]*>.*?<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"'
    
    # Pattern plus spécifique pour les personnages
    char_img_pattern = r'<img[^>]*src="([^"]*?/[^/"]*?(?:png|jpg|webp)[^"]*)"[^>]*alt="([^"]+)"'
    
    for match in re.finditer(char_img_pattern, html_content):
        url, alt_text = match.groups()
        if 'Tamagotchi' in alt_text or 'tama' in alt_text.lower():
            char_name = alt_text.strip()
            if char_name and url:
                images[char_name] = url
                print(f"  ✓ {char_name}: {url.split('/')[-1]}")
    
    # Chercher aussi dans les href d'images
    wiki_links = re.findall(r'<a href="(/wiki/File:[^"]+)"[^>]*>([^<]+)</a>', html_content)
    for link, title in wiki_links:
        if any(x in title.lower() for x in ['pix', 'character', 'tamagotchi']):
            # Convertir le lien wiki en URL d'image
            img_url = f"https://tamagotchi.fandom.com{link}"
            print(f"  Found link: {title}")
    
    return images

def download_image(url, filename):
    """Télécharger une image"""
    try:
        filepath = OUTPUT_DIR / filename
        if filepath.exists():
            return str(filepath.relative_to(OUTPUT_DIR.parent.parent))
        
        print(f"  ↓ {filename}...", end=" ", flush=True)
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            content = response.read()
            with open(filepath, 'wb') as f:
                f.write(content)
            print(f"✓")
            return str(filepath.relative_to(OUTPUT_DIR.parent.parent))
    except Exception as e:
        print(f"✗ {e}")
        return None

def main():
    """Fonction principale"""
    print("=" * 70)
    print("🎮 Extraction des images Tamagotchi Pix depuis Fandom")
    print("=" * 70)
    
    # Créer le dossier s'il n'existe pas
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Récupérer la page
    html_content = fetch_fandom_page()
    if not html_content:
        return
    
    # Extraire les images
    character_images = extract_character_images(html_content)
    
    print(f"\n📊 {len(character_images)} personnages trouvés")
    
    # Sauvegarder le mapping
    mapping_file = OUTPUT_DIR.parent / "character-images-fandom.json"
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(character_images, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Mapping sauvegardé: {mapping_file}")
    print("\nContenu du mapping:")
    for char, url in list(character_images.items())[:10]:
        print(f"  {char}: {url}")

if __name__ == "__main__":
    main()

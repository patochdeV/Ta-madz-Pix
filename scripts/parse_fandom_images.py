#!/usr/bin/env python3
"""
Parser pour extraire les images du wiki Fandom Tamagotchi Pix
et créer un mapping JSON pour l'application
"""

import urllib.request
import re
import json
from pathlib import Path
from html.parser import HTMLParser

class FandomImageParser(HTMLParser):
    """Parser HTML pour extraire les images Fandom"""
    
    def __init__(self):
        super().__init__()
        self.images = {}
        self.current_char = None
        self.in_gallery = False
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        if tag == 'div' and 'class' in attrs_dict:
            if 'gallery' in attrs_dict.get('class', ''):
                self.in_gallery = True
                
        if tag == 'img' and self.in_gallery:
            src = attrs_dict.get('src', '')
            alt = attrs_dict.get('alt', '')
            
            if src and alt:
                # Beautify le src pour en faire une URL complète
                if not src.startswith('http'):
                    src = 'https://static.wikia.nocookie.net' + src
                    
                self.images[alt] = src

def fetch_fandom_page():
    """Récupérer la page Fandom"""
    url = "https://tamagotchi.fandom.com/wiki/Tamagotchi_Pix/Character_list"
    print(f"🌐 Récupération de {url}...")
    
    try:
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def extract_image_urls(html):
    """Extraire les URLs d'images du HTML"""
    images = {}
    
    # Pattern pour images Fandom CDN
    pattern = r'https://static\.wikia\.nocookie\.net/tamagotchi/images/[^"\'s<>]+'
    
    for match in re.finditer(pattern, html):
        url = match.group(0)
        # Essayer d'extraire le nom du fichier
        try:
            filename = url.split('/')[-1].split('?')[0]
            # NettoyerFormat du nom (par exemple: "200px-Mametchi.png")
            clean_name = re.sub(r'^\d+px-', '', filename)
            clean_name = clean_name.replace('.png', '').replace('.jpg', '')
            
            if clean_name and clean_name not in images:
                images[clean_name] = url
        except:
            pass
    
    return images

def extract_character_names(html):
    """Extraire les noms des personnages"""
    names = set()
    
    # Chercher les titres de section h2/h3 avec noms de personnages
    pattern = r'<[h2|h3]>([A-Za-z]+(?:tchi|chi|tch)?)</[h2|h3]>'
    for match in re.finditer(pattern, html):
        name = match.group(1).strip()
        if len(name) > 2:
            names.add(name)
    
    return names

def main():
    """Fonction principale"""
    print("=" * 70)
    print("🎮 Extraction des images depuis Fandom Tamagotchi Pix")
    print("=" * 70)
    
    # Récupérer la page
    html = fetch_fandom_page()
    if not html:
        return
    
    # Extraire les images
    print("\n🔍 Extraction des images...")
    images = extract_image_urls(html)
    
    print(f"✓ {len(images)} images trouvées")
    
    # Afficher un aperçu
    print("\n📸 Aperçu des images trouvées:")
    for name, url in list(images.items())[:15]:
        size = len(url)
        print(f"  • {name}: {url[:60]}...")
    
    # Sauvegarder
    output_file = Path(__file__).parent.parent / "data" / "fandom-images.json"
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(images, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Sauvegardé: {output_file}")

if __name__ == "__main__":
    main()

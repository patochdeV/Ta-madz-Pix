#!/usr/bin/env python3
import json
import requests
from bs4 import BeautifulSoup
from typing import List, Dict

def extract_fandom_characters() -> List[Dict]:
    """Extraire les personnages du wiki Fandom Tamagotchi Pix"""
    url = "https://tamagotchi.fandom.com/wiki/Tamagotchi_Pix/Character_list"
    
    try:
        response = requests.get(url, timeout=10)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.content, 'html.parser')
        
        characters = []
        
        # Trouver tous les tableaux contenant les personnages
        tables = soup.find_all('table', {'class': 'wikitable'})
        
        for table in tables:
            rows = table.find_all('tr')[1:]  # Sauter l'en-tête
            
            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 2:
                    try:
                        # Extraire les informations de base
                        char_data = {}
                        
                        # Nom
                        name_cell = cells[0]
                        name_link = name_cell.find('a')
                        if name_link:
                            char_data['name'] = name_link.get_text(strip=True)
                        else:
                            char_data['name'] = name_cell.get_text(strip=True)
                        
                        # Continue avec les autres cellules selon la structure du tableau
                        if len(cells) >= 2:
                            char_data['rawData'] = [cell.get_text(strip=True) for cell in cells]
                        
                        if char_data.get('name') and len(char_data['name']) > 0:
                            characters.append(char_data)
                    except Exception as e:
                        print(f"Erreur lors du traitement d'une ligne: {e}")
                        continue
        
        return characters
    except Exception as e:
        print(f"Erreur lors de la récupération de la page Fandom: {e}")
        return []

def extract_pixfavourites() -> List[Dict]:
    """Extraire les personnages du site pixfavourites"""
    url = "https://pixfavourites.tiddlyhost.com/"
    
    try:
        response = requests.get(url, timeout=10)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.content, 'html.parser')
        
        characters = []
        
        # Analyser le contenu spécifique du site TiddlyWiki
        # Les données peuvent être dans des divs ou des sections spécifiques
        # Cette partie dépendra de la structure réelle du site
        
        return characters
    except Exception as e:
        print(f"Erreur lors de la récupération de la page pixfavourites: {e}")
        return []

if __name__ == "__main__":
    print("📥 Récupération des données du wiki Fandom...")
    fandom_chars = extract_fandom_characters()
    print(f"✓ {len(fandom_chars)} personnages trouvés sur Fandom")
    
    print("\n📥 Récupération des données de pixfavourites...")
    pixfav_chars = extract_pixfavourites()
    print(f"✓ {len(pixfav_chars)} personnages trouvés sur pixfavourites")
    
    # Fusionner et organiser les données
    output = {
        "metadata": {
            "source": ["https://tamagotchi.fandom.com/wiki/Tamagotchi_Pix/Character_list", "https://pixfavourites.tiddlyhost.com/"],
            "timestamp": __import__('datetime').datetime.now().isoformat(),
            "totalCharacters": len(fandom_chars) + len(pixfav_chars)
        },
        "characters": fandom_chars + pixfav_chars
    }
    
    # Sauvegarder en JSON
    output_path = "/workspaces/Ta-madz-Pix/data/pix-characters-full.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ Données sauvegardées dans {output_path}")

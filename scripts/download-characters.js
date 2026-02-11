#!/usr/bin/env node
/**
 * Télécharge les images des personnages Tamagotchi Pix
 * Exécution: node scripts/download-characters.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const MRBLINKY_BASE = 'https://mrblinky.net/tama/pix/download/';
const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'images', 'characters');
const DATA_FILE = path.join(__dirname, '..', 'data', 'tamagotchi-pix-characters-full.json');

// Map of character name -> possible filenames from mrblinky
const CHARACTER_FILES = {
  'Mametchi': 'mametchi.png',
  'Kuchipatchi': 'kuchipatchi.png',
  'Tamagotchi': 'tamagotchi.png',
  'Violetchi': 'violetchi.png',
  'Gourmetchi': 'gourmetchi.png',
  'Cheeritchi': 'cheeritchi.png',
  'Gamer Tamagotchi': 'gamer_tamagotchi.png',
  'Fashiontchi': 'fashiontchi.png',
  'Himespetchi': 'himespetchi.png',
  'Cybertchi': 'cybertchi.png',
  'Witchtchi': 'witchtchi.png',
  'Angelchi': 'angelchi.png',
  'Demonchi': 'demonchi.png',
  'Koffitchi': 'koffitchi.png',
  'Lovelin': 'lovelin.png',
  'Chamametchi': 'chamametchi.png',
  'Oniontchi': 'oniontchi.png',
  'Komainu': 'komainu.png',
  'Ginjirotchi': 'ginjirotchi.png',
  'Zurugitchi': 'zurugitchi.png',
  'Megumi': 'megumi.png',
  'Monsieur Tamagotchi': 'monsieur_tamagotchi.png',
  'Thecatchi': 'thecatchi.png',
  'Himetchi': 'himetchi.png',
  'KuroMametchi': 'kuromametchi.png',
  'Mimitchi': 'mimitchi.png',
  'Kikitchi': 'kikitchi.png',
  'Terukerotchi': 'terukerotchi.png',
  'Haretchi': 'haretchi.png',
  'Mokokotchi': 'mokokotchi.png',
  'Soyofuwatchi': 'soyofuwatchi.png',
  'Kurupoyotchi': 'kurupoyotchi.png',
  'Tororitchi': 'tororitchi.png',
  'Fuyofuyotchi': 'fuyofuyotchi.png',
  'Chiroritchi': 'chiroritchi.png',
  'Mokumokutchi': 'mokumokutchi.png',
  'Mimitamatchi': 'mimitamatchi.png',
  'Awamokotchi': 'awamokotchi.png',
  'Gozarutchi': 'gozarutchi.png',
  'Ninjanyatchi': 'ninjanyatchi.png',
  'Weeptchi': 'weeptchi.png',
  'Neliatchi': 'neliatchi.png',
  'Shimagurutchi': 'shimagurutchi.png',
  'Memetchi': 'memetchi.png',
  'Paintotchi': 'paintotchi.png',
  'Coffretchi': 'coffretchi.png',
  'Murachakitchi': 'murachakitchi.png',
  'Momotchi': 'momotchi.png',
  'Orenetchi': 'orenetchi.png',
  'Sebiretchi': 'sebiretchi.png',
  'Charatchi': 'charatchi.png',
  'Puchitomatchi': 'puchitomatchi.png',
  'Tantotchi': 'tantotchi.png',
};

// Créer le dossier assets/images/characters s'il n'existe pas
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Fonction pour télécharger une image
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filePath);

    protocol
      .get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close(() => resolve(true));
          });
        } else {
          file.close();
          fs.unlink(filePath, () => {});
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      })
      .on('error', (err) => {
        file.close();
        fs.unlink(filePath, () => {});
        reject(err);
      });
  });
}

async function main() {
  console.log('🎮 Téléchargement des images Tamagotchi Pix');
  console.log('='.repeat(60));

  let downloaded = 0;
  let failed = 0;
  const results = {};

  // Extraire les noms des personnages depuis le JSON
  let characters = [];
  try {
    const fullData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    characters = fullData.characters || [];
  } catch (e) {
    console.error('❌ Impossible de lire', DATA_FILE);
    process.exit(1);
  }

  // Télécharger les images
  for (const char of characters) {
    const charName = char.name;
    const filename = CHARACTER_FILES[charName];

    if (!filename) {
      if (charName !== 'Pikachu' && charName !== 'Gudetama') {
        console.log(`⏭️  ${charName} - pas de mapping`);
      }
      continue;
    }

    const url = MRBLINKY_BASE + filename;
    const filePath = path.join(ASSETS_DIR, filename);

    // Vérifier si l'image existe déjà
    if (fs.existsSync(filePath)) {
      console.log(`✓ ${charName} (${filename}) - fichier existe déjà`);
      results[charName] = filename;
      continue;
    }

    process.stdout.write(`⬇️  ${charName} (${filename})... `);

    try {
      await downloadImage(url, filePath);
      console.log('✓');
      results[charName] = filename;
      downloaded++;
    } catch (error) {
      console.log(`✗ ${error.message}`);
      failed++;
    }

    // Délai pour ne pas surcharger le serveur
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Résumé:`);
  console.log(`  ✓ Téléchargées: ${downloaded}`);
  console.log(`  ✓ Existantes: ${Object.keys(results).length - downloaded}`);
  console.log(`  ✗ Échouées: ${failed}`);

  // Sauvegarder le mapping
  const mappingFile = path.join(ASSETS_DIR, '..', 'character-images-mapping.json');
  fs.writeFileSync(mappingFile, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n✅ Mapping sauvegardé: ${mappingFile}`);
}

main().catch((err) => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Télécharge TOUTES les images des personnages depuis plusieurs sources
 * Sources: mrblinky.net, Fandom Wiki, PokeAPI, fallbacks alternatifs
 * Exécution: node scripts/fetch-all-character-images.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'images', 'characters');
const DATA_FILE = path.join(__dirname, '..', 'data', 'tamagotchi-pix-characters-full.json');
const FANDOM_FILE = path.join(__dirname, '..', 'data', 'fandom-images.json');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Charger les mappings existants
let fandomMapping = {};
try {
  fandomMapping = JSON.parse(fs.readFileSync(FANDOM_FILE, 'utf8'));
} catch (e) {
  console.log('⚠️  Impossible de lire fandom-images.json');
}

const fullData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const characters = fullData.characters || [];

// Définir les sources possibles pour chaque personnage
function getSourcesToTry(charData) {
  const sources = [];
  const charName = charData.name;

  // Source 1: Fandom direct URL si disponible
  if (fandomMapping[charName]) {
    sources.push({
      url: fandomMapping[charName],
      name: 'Fandom Direct',
      filename: `${charName.replace(/\s+/g, '_')}_fandom.png`,
    });
  }

  // Source 2: mrblinky.net variations
  const mrblinkyVariants = [
    charData.imageUrl || charData.spriteUrl || '',
    charName.toLowerCase().replace(/\s+/g, '_') + '.png',
    charName.toLowerCase().replace(/\s+/g, '') + '.png',
  ].filter((f) => f && !f.startsWith('http'));

  for (const variant of mrblinkyVariants) {
    sources.push({
      url: `https://mrblinky.net/tama/pix/download/${variant}`,
      name: 'mrblinky (https)',
      filename: variant,
    });
    sources.push({
      url: `http://mrblinky.net/tama/pix/download/${variant}`,
      name: 'mrblinky (http)',
      filename: variant,
    });
  }

  // Source 3: Special cases
  if (charName === 'Pikachu') {
    sources.push({
      url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      name: 'PokeAPI',
      filename: 'pikachu_pokeapi.png',
    });
  }

  if (charName === 'Gudetama') {
    sources.push({
      url: 'https://sanrio.com/wp-content/uploads/2023/01/gudetama-1.png',
      name: 'Sanrio',
      filename: 'gudetama_sanrio.png',
    });
  }

  return sources;
}

// Fonction pour télécharger une image
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = 8000;
    const file = fs.createWriteStream(filePath);
    const req = protocol.get(url, { timeout }, (response) => {
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
    });

    req.on('timeout', () => {
      req.abort();
      file.close();
      fs.unlink(filePath, () => {});
      reject(new Error('Timeout'));
    });

    req.on('error', (err) => {
      file.close();
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('🎮 Téléchargement TOTAL des images Tamagotchi Pix');
  console.log('='.repeat(70));

  let totalDownloaded = 0;
  let totalExisting = 0;
  const downloadedMap = {};

  for (const charData of characters) {
    const charName = charData.name;
    const sources = getSourcesToTry(charData);

    // Chercher si une image existe déjà pour ce personnage
    let alreadyExists = false;
    const existingFiles = fs
      .readdirSync(ASSETS_DIR)
      .filter((f) => f.toLowerCase().includes(charName.toLowerCase().replace(/\s+/g, '')) || f.toLowerCase().includes(charName.toLowerCase().replace(/\s+/g, '_')));

    if (existingFiles.length > 0) {
      console.log(`✓ ${charName.padEnd(25)} - fichier existe (${existingFiles[0]})`);
      downloadedMap[charName] = existingFiles[0];
      totalExisting++;
      continue;
    }

    // Essayer chaque source jusqu'à succès
    let downloaded = false;
    for (const source of sources) {
      if (downloaded) break;

      process.stdout.write(`⬇️  ${charName.padEnd(25)} (${source.name.padEnd(15)})... `);

      try {
        const filePath = path.join(ASSETS_DIR, source.filename);

        // Vérifier si le fichier existe déjà
        if (fs.existsSync(filePath)) {
          console.log('✓ (déjà présent)');
          downloadedMap[charName] = source.filename;
          downloaded = true;
          break;
        }

        await downloadImage(source.url, filePath);
        console.log('✓');
        downloadedMap[charName] = source.filename;
        downloaded = true;
        totalDownloaded++;
      } catch (error) {
        // Silent fail - essayer la source suivante
        process.stdout.write(`✗ (${error.message}) `);
      }
    }

    if (!downloaded) {
      console.log('');
      console.log(`  ⚠️  Aucune source n'a fonctionné pour ${charName}`);
    }

    // Délai pour ne pas surcharger les serveurs
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(70));
  console.log(`📊 Résumé:`);
  console.log(`  ✓ Téléchargées: ${totalDownloaded}`);
  console.log(`  ✓ Existantes: ${totalExisting}`);
  console.log(`  📦 Total: ${totalDownloaded + totalExisting}/${characters.length}`);

  // Sauvegarder le mapping
  const mappingPath = path.join(ASSETS_DIR, '..', 'character-images-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(downloadedMap, null, 2), 'utf8');
  console.log(`\n✅ Mapping sauvegardé: character-images-mapping.json`);
  console.log(`✅ Images sauvegardées dans: ${ASSETS_DIR}`);
}

main().catch((err) => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Convertit les images du dossier characters en base64 et génère embedded-character-images.ts
 * Exécution: node scripts/convert-images-to-base64.js
 */

const fs = require('fs');
const path = require('path');

const CHARACTERS_DIR = path.join(__dirname, '..', 'assets', 'images', 'characters');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'embedded-character-images.ts');

// Fonction pour nettoyer le nom de fichier en nom de personnage
function filenameToPecharacterName(filename) {
  // Enlever l'extension
  let name = filename.split('.')[0];
  
  // Enlever les numéros entre parenthèses à la fin : "(1)" -> ""
  name = name.replace(/\s*\(\d+\)$/, '');
  
  // Remplacer les underscores par des espaces
  name = name.replace(/_/g, ' ');
  
  // Remplacer les tirets par des espaces
  name = name.replace(/-/g, ' ');
  
  // Formater: "Mametchi blue" -> "Mametchi Blue"
  name = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return name;
}

function main() {
  try {
    // Lire tous les fichiers du dossier
    const files = fs.readdirSync(CHARACTERS_DIR)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext);
      })
      .sort();

    if (files.length === 0) {
      console.error('❌ Aucune image trouvée dans le dossier', CHARACTERS_DIR);
      process.exit(1);
    }

    console.log(`📸 Traitement de ${files.length} images...`);

    const imageData = {};
    
    files.forEach((file, index) => {
      const filePath = path.join(CHARACTERS_DIR, file);
      const imageBuffer = fs.readFileSync(filePath);
      const base64 = imageBuffer.toString('base64');
      
      // Déterminer le type MIME
      const ext = path.extname(file).toLowerCase();
      let mimeType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.gif') mimeType = 'image/gif';
      
      const characterName = filenameToPecharacterName(file);
      const dataUrl = `data:${mimeType};base64,${base64}`;
      
      imageData[characterName] = dataUrl;
      
      console.log(`  ✓ ${index + 1}/${files.length} - ${characterName} (${file})`);
    });

    // Générer le fichier TypeScript
    let tsContent = `// Embedded character images (auto-generated from assets/images/characters/)
export const embeddedCharacterImages: Record<string, string> = {
`;

    Object.entries(imageData).forEach(([name, dataUrl]) => {
      tsContent += `  '${name}': '${dataUrl}',\n`;
    });

    tsContent += `};\n`;

    fs.writeFileSync(OUTPUT_FILE, tsContent);
    
    console.log(`\n✅ Fichier généré avec succès: ${OUTPUT_FILE}`);
    console.log(`📊 ${Object.keys(imageData).length} images intégrées`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();

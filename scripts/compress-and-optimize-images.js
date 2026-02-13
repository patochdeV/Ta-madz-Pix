#!/usr/bin/env node
/**
 * Script pour compresser les images et créer deux fichiers TypeScript:
 * - embedded-character-images-core.ts: 10 images essentielles (chargées au démarrage)
 * - embedded-character-images-extra.ts: 40 images supplémentaires (chargées à la demande)
 */

const fs = require("fs");
const path = require("path");
const execSync = require("child_process").execSync;

const CHARACTERS_DIR = path.join(__dirname, "../assets/images/characters");
const OUTPUT_DIR = path.join(__dirname, "../data");
const CORE_OUTPUT = path.join(OUTPUT_DIR, "embedded-character-images-core.ts");
const EXTRA_OUTPUT = path.join(OUTPUT_DIR, "embedded-character-images-extra.ts");

// Images essentielles à charger au démarrage (les plus populaires/utilisées)
const CORE_CHARACTERS = [
  "Tamagotchi",
  "Mametchi",
  "Kuchipatchi",
  "Violetchi",
  "Maskutchi",
  "Tsunotchi",
  "Gozarutchi",
  "Chamametchi",
  "Youkotchi",
  "Nyatchi",
];

// Fonction pour convertir les noms de fichiers en noms de caractères
function filenameToPecharacterName(filename) {
  return filename
    .replace(/\.\w+$/, "")
    .replace(/\s*\(\d+\)\s*/g, "")
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Fonction pour compresser une image WebP/PNG avec ffmpeg
function compressImage(inputPath) {
  try {
    const ext = path.extname(inputPath).toLowerCase();

    // Utiliser ffmpeg pour compresser l'image
    // Pour WebP: réduire la qualité de 80 (défaut) à 60-70
    // Pour PNG: utiliser cwebp pour convertir en WebP compressé
    if (ext === ".webp") {
      const tempPath = inputPath.replace(/\.webp$/, "-temp.webp");
      try {
        execSync(
          `ffmpeg -i "${inputPath}" -q:v 60 "${tempPath}" -y 2>/dev/null`,
          { stdio: "pipe" }
        );
        if (fs.existsSync(tempPath)) {
          fs.renameSync(tempPath, inputPath);
        }
      } catch (e) {
        console.warn(`⚠️  Compression échouée pour ${path.basename(inputPath)}, utilisation du fichier original`);
      }
    } else if ([".png", ".jpg", ".jpeg", ".gif"].includes(ext)) {
      // Convertir PNG/JPG en WebP compressé
      const webpPath = inputPath.replace(/\.\w+$/, ".webp");
      try {
        execSync(
          `ffmpeg -i "${inputPath}" -q:v 65 "${webpPath}" -y 2>/dev/null`,
          { stdio: "pipe" }
        );
        if (fs.existsSync(webpPath)) {
          fs.unlinkSync(inputPath);
          return webpPath;
        }
      } catch (e) {
        console.warn(`⚠️  Conversion échouée pour ${path.basename(inputPath)}`);
      }
    }
  } catch (e) {
    console.warn(`⚠️  Erreur lors du traitement de ${path.basename(inputPath)}`);
  }
  return inputPath;
}

console.log("🖼️  Compression et optimisation des images...\n");

// Parcourir le dossier des images
const files = fs
  .readdirSync(CHARACTERS_DIR)
  .filter((file) => [".webp", ".png", ".jpeg", ".jpg", ".gif"].includes(path.extname(file).toLowerCase()))
  .sort();

console.log(`📊 ${files.length} images trouvées\n`);

// Créer les maps core et extra
const coreMap = {};
const extraMap = {};
let compressedCount = 0;

files.forEach((file, idx) => {
  const filePath = path.join(CHARACTERS_DIR, file);
  const characterName = filenameToPecharacterName(file);
  const isCore = CORE_CHARACTERS.some((core) =>
    characterName.toLowerCase().includes(core.toLowerCase())
  );

  // Afficher la progression
  const prefix = isCore ? "⭐" : "  ";
  console.log(`${prefix} [${idx + 1}/${files.length}] ${characterName}...`);

  // Compresser l'image
  const compressedPath = compressImage(filePath);

  // Lire et encoder en base64
  const imageBuffer = fs.readFileSync(compressedPath);
  const base64Data = imageBuffer.toString("base64");

  // Déterminer le type MIME
  const ext = path.extname(compressedPath).toLowerCase();
  const mimeTypes = {
    webp: "image/webp",
    png: "image/png",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    gif: "image/gif",
  };
  const mimeType = mimeTypes[ext.slice(1)] || "image/webp";

  // Créer la data URL
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  // Ajouter à la map appropriée
  if (isCore) {
    coreMap[characterName] = dataUrl;
  } else {
    extraMap[characterName] = dataUrl;
  }

  compressedCount++;
});

// Écrire le fichier core
const coreContent = `// Images essentielles (chargées au démarrage)
// Auto-généré par scripts/compress-and-optimize-images.js
export const embeddedCharacterImagesCore: Record<string, string> = ${JSON.stringify(coreMap, null, 2)};
`;

fs.writeFileSync(CORE_OUTPUT, coreContent, "utf8");
console.log(`\n✅ Fichier généré: ${CORE_OUTPUT}`);
console.log(`   📦 ${Object.keys(coreMap).length} images essentielles`);

// Écrire le fichier extra
const extraContent = `// Images supplémentaires (chargées à la demande)
// Auto-généré par scripts/compress-and-optimize-images.js
export const embeddedCharacterImagesExtra: Record<string, string> = ${JSON.stringify(extraMap, null, 2)};
`;

fs.writeFileSync(EXTRA_OUTPUT, extraContent, "utf8");
console.log(`✅ Fichier généré: ${EXTRA_OUTPUT}`);
console.log(`   📦 ${Object.keys(extraMap).length} images supplémentaires`);

// Statistiques
const coreSize = fs.statSync(CORE_OUTPUT).size;
const extraSize = fs.statSync(EXTRA_OUTPUT).size;
const totalSize = coreSize + extraSize;

console.log(`\n📊 Statistiques:`);
console.log(`   ⭐ Core:  ${(coreSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   📦 Extra: ${(extraSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   📈 Total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`\n✨ Compression terminée! L'app démarrera avec ${Object.keys(coreMap).length} images rapides.`);

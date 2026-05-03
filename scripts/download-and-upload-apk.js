#!/usr/bin/env node
/**
 * Télécharge l'APK depuis EAS Build et l'upload sur GitHub Releases
 * Usage: node scripts/download-and-upload-apk.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const RELEASES_DIR = path.join(__dirname, '..', 'releases');

// Fonction pour télécharger un fichier
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

// Fonction pour obtenir l'URL de l'APK depuis EAS
function getLatestBuildUrl() {
  try {
    const output = execSync('npx eas build:list --json', { encoding: 'utf8' });
    const builds = JSON.parse(output);

    // Trouver la build Android terminée la plus récente (preview ou production)
    const androidBuild = builds.find(build =>
      build.platform === 'android' &&
      build.status === 'finished' &&
      (build.profile === 'production' || build.profile === 'preview')
    );

    if (!androidBuild) {
      throw new Error('Aucune build Android terminée trouvée');
    }

    console.log(`📋 Build trouvée: ${androidBuild.profile} (version ${androidBuild.versionCode})`);
    return androidBuild.applicationArchiveUrl;
  } catch (error) {
    console.error('Erreur lors de la récupération des builds:', error.message);
    throw error;
  }
}

// Fonction principale
async function main() {
  console.log('🔄 Recherche de la dernière build Android...');

  try {
    const apkUrl = getLatestBuildUrl();
    if (!apkUrl) {
      console.log('❌ Aucune build terminée trouvée. Attendez que la build se termine.');
      return;
    }

    console.log('📥 URL de l\'APK trouvée:', apkUrl);

    // Créer le répertoire releases s'il n'existe pas
    if (!fs.existsSync(RELEASES_DIR)) {
      fs.mkdirSync(RELEASES_DIR, { recursive: true });
    }

    // Nom du fichier APK
    const apkName = 'tama-pix-codes-v1.0.2.apk';
    const apkPath = path.join(RELEASES_DIR, apkName);

    console.log('⬇️ Téléchargement de l\'APK...');
    await downloadFile(apkUrl, apkPath);

    const stats = fs.statSync(apkPath);
    console.log(`✅ APK téléchargée: ${apkName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

    // Créer un commit et push
    console.log('📤 Commit et push des changements...');
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "feat: mise à jour APK v1.0.2 avec corrections codes QR"`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });

    // Créer une release GitHub
    console.log('🏷️ Création d\'une release GitHub...');
    const tagName = 'tama-pix-codes-v1.0.2';
    const releaseNotes = `# Tama Pix Codes v1.0.2

## ✨ Nouvelles fonctionnalités

- **Codes QR embarqués** : Tous les 242 codes QR sont maintenant intégrés dans l'application
- **Chargement instantané** : Plus besoin de connexion internet pour afficher les codes QR
- **Performance améliorée** : L'application se charge plus rapidement

## 🐛 Corrections

- Correction de l'affichage des codes QR qui ne se chargeaient pas
- Amélioration de la gestion d'erreur pour les codes QR indisponibles
- Optimisation des dépendances Expo

## 📱 Téléchargement

[Télécharger l'APK](${apkUrl})

## 🔧 Changements techniques

- Génération automatique des codes QR en base64
- Fallback sur URL externe si nécessaire
- Mise à jour des packages Expo pour la compatibilité
`;

    execSync(`gh release create "${tagName}" "${apkPath}" --title "Tama Pix Codes v1.0.2" --notes "${releaseNotes}"`, { stdio: 'inherit' });

    console.log('🎉 Release créée avec succès !');
    console.log(`📋 Tag: ${tagName}`);
    console.log(`📁 APK: ${apkName}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();

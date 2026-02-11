const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets', 'images', 'characters');
const outFile = path.join(__dirname, '..', 'data', 'local-character-images.ts');

function build() {
  const files = [];
  try {
    files.push(...fs.readdirSync(assetsDir));
  } catch (e) {
    // directory missing or empty
  }

  const entries = files
    .filter((f) => /\.(png|jpg|jpeg|webp|gif)$/i.test(f))
    .map((f) => {
      const name = path.basename(f, path.extname(f));
      // Try to derive a character key from filename (best-effort)
      // Keep filename as-is in value require
      return `  "${name}": require("../assets/images/characters/${f}"),`;
    });

  const content = `// Generated file — run scripts/generate_local_image_map.js after downloading images\nexport const localCharacterImages: Record<string, any> = {\n${entries.join('\n')}\n};\n`;

  fs.writeFileSync(outFile, content, 'utf8');
  console.log(`Wrote ${outFile} with ${entries.length} entries`);
}

if (require.main === module) build();

module.exports = { build };

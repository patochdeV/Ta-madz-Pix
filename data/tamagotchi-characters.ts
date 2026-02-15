export interface TamaCharacter {
  id: string;
  name: string;
  description: string;
  spriteUrl: string;
  spriteSource?: any;
  favoriteItemIds: string[];
  preferedCategories: string[];
  rarity: "common" | "uncommon" | "rare" | "legendary" | "special" | "very-rare";
  evolves_from?: string;
  evolves_to?: string[];
}

// Charger les données complètes exportées en JSON
// Utilise require pour la compatibilité avec la configuration TypeScript du projet
const fullData = require("./tamagotchi-pix-characters-full.json");
let fandomImages: Record<string, string> = {};
try {
  fandomImages = require("./fandom-images.json");
} catch (e) {
  // fallback vide si le fichier n'existe pas
  fandomImages = {};
}

// Images embarquées (base64 data URLs) - chargement optimisé
// Core: images essentielles chargées au démarrage (0.69 MB)
let embeddedImagesCore: Record<string, string> | null = null;
let embeddedImagesCoreLoaded = false;

// Extra: images supplémentaires chargées à la demande (1.18 MB)
let embeddedImagesExtra: Record<string, string> | null = null;
let embeddedImagesExtraLoaded = false;

function getEmbeddedImagesCore(): Record<string, string> {
  if (!embeddedImagesCoreLoaded) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      embeddedImagesCore = require("./embedded-character-images-core").embeddedCharacterImagesCore || {};
    } catch (e) {
      embeddedImagesCore = {};
    }
    embeddedImagesCoreLoaded = true;
  }
  return embeddedImagesCore || {};
}

function getEmbeddedImagesExtra(): Record<string, string> {
  if (!embeddedImagesExtraLoaded) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      embeddedImagesExtra = require("./embedded-character-images-extra").embeddedCharacterImagesExtra || {};
    } catch (e) {
      embeddedImagesExtra = {};
    }
    embeddedImagesExtraLoaded = true;
  }
  return embeddedImagesExtra || {};
}

function getEmbeddedImage(characterName: string): string | undefined {
  // Chercher d'abord dans le core (toujours disponible)
  const core = getEmbeddedImagesCore();
  if (core[characterName]) return core[characterName];
  
  // Chercher ensuite dans l'extra (charge à la demande)
  const extra = getEmbeddedImagesExtra();
  return extra[characterName];
}

// Mapping local généré (peut être vide). Ce fichier est créé par `scripts/generate_local_image_map.js`
let localImages: Record<string, any> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  localImages = require("./local-character-images").localCharacterImages || {};
} catch (e) {
  localImages = {};
}

function resolveImageUrl(characterName: string, imageField: string) {
  // Priorité (du plus fiable au moins fiable):
  // 1. Images embarquées (base64) - core + extra
  const embeddedImage = getEmbeddedImage(characterName);
  if (embeddedImage) return embeddedImage;
  // 2. Mapping fandom (URLs complets)
  if (fandomImages[characterName]) return fandomImages[characterName];
  if (!imageField) return "";
  if (imageField.startsWith("http://") || imageField.startsWith("https://")) return imageField;

  // Fallback: miroir mrblinky
  const mrblinkyUrl = `https://mrblinky.net/tama/pix/download/${imageField}`;
  return mrblinkyUrl;
}

export const tamaCharacters: TamaCharacter[] = (fullData.characters || []).map((c: any, idx: number) => {
  const idStr = c.id ? String(c.id) : `tama-${idx}`;
  const spriteUrl = resolveImageUrl(c.name, c.imageUrl || c.spriteUrl || "");
  const spriteSource = localImages[c.name] || undefined;

  return {
    id: idStr,
    name: c.name || `Unknown ${idStr}`,
    description: c.description || "",
    spriteUrl: spriteUrl,
    spriteSource: spriteSource,
    favoriteItemIds: (c.preferences && c.preferences.favoriteItemIds) || [],
    preferedCategories: c.preferences && c.preferences.likesItems ? c.preferences.likesItems : (c.preferedCategories || []),
    rarity: (c.evolution && c.evolution.rarity) || (c.rarity as any) || "common",
    evolves_from: (c.evolution && c.evolution.evolvesFrom && c.evolution.evolvesFrom[0]) || c.evolves_from || undefined,
    evolves_to: (c.evolution && c.evolution.evolvesTo) || c.evolves_to || [],
  };
});

export function getCharacterById(id: string): TamaCharacter | undefined {
  return tamaCharacters.find((char) => String(char.id) === String(id) || char.id === id || char.name === id);
}

export function searchCharacters(query: string): TamaCharacter[] {
  const lowerQuery = query.toLowerCase();
  return tamaCharacters.filter(
    (char) =>
      (char.name && char.name.toLowerCase().includes(lowerQuery)) ||
      (char.description && char.description.toLowerCase().includes(lowerQuery))
  );
}

export function getCharactersByRarity(rarity: TamaCharacter["rarity"]): TamaCharacter[] {
  return tamaCharacters.filter((char) => char.rarity === rarity);
}

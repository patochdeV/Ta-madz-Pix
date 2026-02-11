export interface TamaCharacter {
  id: string;
  name: string;
  description: string;
  spriteUrl: string;
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

function resolveImageUrl(characterName: string, imageField: string) {
  // Priorité : mapping fandomImages (URL complète), sinon static.wikia path si imageField semble être un nom de fichier, sinon mrblinky fallback
  if (fandomImages[characterName]) return fandomImages[characterName];
  if (!imageField) return "";
  if (imageField.startsWith("http://") || imageField.startsWith("https://")) return imageField;
  // si imageField ressemble à un nom de fichier, tenter CDN Fandom
  return `https://static.wikia.nocookie.net/tamagotchi/images/${imageField}`;
}

export const tamaCharacters: TamaCharacter[] = (fullData.characters || []).map((c: any, idx: number) => {
  const idStr = c.id ? String(c.id) : `tama-${idx}`;
  const sprite = resolveImageUrl(c.name, c.imageUrl || c.spriteUrl || "");
  return {
    id: idStr,
    name: c.name || `Unknown ${idStr}`,
    description: c.description || "",
    spriteUrl: sprite,
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

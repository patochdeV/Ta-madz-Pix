import { useMemo, useRef, useCallback, useEffect } from "react";

// Cache pour les images extra
let embeddedImagesExtraCache: Record<string, string> | null = null;
let extraImagesLoadPromise: Promise<Record<string, string>> | null = null;

/**
 * Hook optimisé pour charger les images embarquées (core + extra)
 * Le core est chargé immédiatement, l'extra à la demande
 */
export function useEmbeddedImages() {
  const extraLoadedRef = useRef(false);
  const extraQueueRef = useRef<Set<string>>(new Set());

  // Charger le core une seule fois
  const coreImages = useMemo(() => {
    try {
      return require("../data/embedded-character-images-core").embeddedCharacterImagesCore || {};
    } catch (e) {
      return {};
    }
  }, []);

  // Charger les images extra de manière lazy
  const loadExtraImages = useCallback(async (): Promise<Record<string, string>> => {
    // Si déjà chargées, retourner le cache
    if (embeddedImagesExtraCache) {
      return embeddedImagesExtraCache;
    }

    // Si chargement en cours, attendre
    if (extraImagesLoadPromise) {
      return extraImagesLoadPromise;
    }

    // Commencer le chargement
    extraImagesLoadPromise = (async () => {
      try {
        const extra = require("../data/embedded-character-images-extra").embeddedCharacterImagesExtra || {};
        embeddedImagesExtraCache = extra;
        return extra;
      } catch (e) {
        console.warn("Erreur lors du chargement des images extra:", e);
        return {};
      }
    })();

    return extraImagesLoadPromise;
  }, []);

  // Queue les images pour chargement
  const queueImageLoad = useCallback((characterName: string) => {
    if (!embeddedImagesExtraCache && !extraLoadedRef.current) {
      extraQueueRef.current.add(characterName);
    }
  }, []);

  // Chercher une image (core ou extra)
  const getImage = useCallback(
    (characterName: string): string | undefined => {
      // Essayer le core d'abord (rapide)
      if (coreImages[characterName]) {
        return coreImages[characterName];
      }

      // Si en cache, retourner
      if (embeddedImagesExtraCache?.[characterName]) {
        return embeddedImagesExtraCache[characterName];
      }

      // Queue pour chargement futur
      queueImageLoad(characterName);
      return undefined;
    },
    [coreImages, queueImageLoad]
  );

  // Charger les images extra au premier besoin
  useEffect(() => {
    if (extraQueueRef.current.size > 0 && !extraLoadedRef.current) {
      extraLoadedRef.current = true;
      loadExtraImages();
    }
  }, [loadExtraImages]);

  return {
    getImage,
    coreImages,
    // Pré-charger certaines images
    preloadImages: (characterNames: string[]) => {
      characterNames.forEach((name) => queueImageLoad(name));
      if (!extraLoadedRef.current && characterNames.length > 0) {
        extraLoadedRef.current = true;
        loadExtraImages();
      }
    },
  };
}

import { useMemo, useCallback } from "react";

/**
 * Cache en mémoire pour les données calculées
 * Évite les recalculs inutiles
 */
const dataCache = new Map<string, any>();

/**
 * Hook pour mettre en cache les données calculées
 * Utile pour éviter les recalculs massifs dans les listes
 */
export function useCachedData<T>(
  key: string,
  computeData: () => T,
  dependencies: any[] = []
): T {
  return useMemo(() => {
    // Vérifier le cache
    if (dataCache.has(key)) {
      return dataCache.get(key);
    }

    // Calculer et mettre en cache
    const result = computeData();
    dataCache.set(key, result);
    return result;
  }, [key, ...dependencies]);
}

/**
 * Fonction pour vider le cache si nécessaire
 */
export function clearDataCache(pattern?: string) {
  if (!pattern) {
    dataCache.clear();
  } else {
    const regex = new RegExp(pattern);
    dataCache.forEach((_, key) => {
      if (regex.test(key)) {
        dataCache.delete(key);
      }
    });
  }
}

/**
 * Hook pour optimiser les recherches et les filtrage
 * Mémoize les résultats de recherche pour éviter les recalculs
 */
export function useMemoizedSearch<T>(
  items: T[],
  query: string,
  searchFn: (item: T, query: string) => boolean
) {
  return useMemo(() => {
    if (!query) return items;
    return items.filter((item) => searchFn(item, query));
  }, [items, query, searchFn]);
}

/**
 * Hook pour optimiser les listes avec virtualisation mentale
 * Retourne un callback pour déterminer quels items doivent être rendus
 */
export function useVisibleRange(
  itemCount: number,
  visiblePerScreen: number = 10
) {
  return useCallback(
    (scrollOffset: number) => {
      const itemHeight = 100; // Hauteur estimée
      const startIndex = Math.max(
        0,
        Math.floor(scrollOffset / itemHeight) - 1
      );
      const endIndex = Math.min(
        itemCount - 1,
        startIndex + visiblePerScreen + 1
      );
      return { startIndex, endIndex };
    },
    [itemCount, visiblePerScreen]
  );
}

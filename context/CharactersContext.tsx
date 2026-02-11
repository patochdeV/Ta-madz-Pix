import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CHARACTERS_STORAGE_KEY = "tama_favorite_characters";

interface CharactersContextValue {
  favoriteCharacters: string[];
  toggleFavoriteCharacter: (characterId: string) => void;
  isFavoriteCharacter: (characterId: string) => boolean;
}

const CharactersContext = createContext<CharactersContextValue | null>(null);

export function CharactersProvider({ children }: { children: ReactNode }) {
  const [favoriteCharacters, setFavoriteCharacters] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(CHARACTERS_STORAGE_KEY).then((data) => {
      if (data) setFavoriteCharacters(JSON.parse(data));
    });
  }, []);

  const toggleFavoriteCharacter = (characterId: string) => {
    setFavoriteCharacters((prev) => {
      const next = prev.includes(characterId)
        ? prev.filter((id) => id !== characterId)
        : [...prev, characterId];
      AsyncStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isFavoriteCharacter = (characterId: string) =>
    favoriteCharacters.includes(characterId);

  const value = useMemo(
    () => ({
      favoriteCharacters,
      toggleFavoriteCharacter,
      isFavoriteCharacter,
    }),
    [favoriteCharacters]
  );

  return (
    <CharactersContext.Provider value={value}>
      {children}
    </CharactersContext.Provider>
  );
}

export function useCharacters() {
  const ctx = useContext(CharactersContext);
  if (!ctx)
    throw new Error("useCharacters must be used within CharactersProvider");
  return ctx;
}

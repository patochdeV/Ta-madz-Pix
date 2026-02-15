import React, { memo, useMemo } from "react";
import { Image, ImageProps } from "react-native";

export interface OptimizedCharacterImageProps extends Omit<ImageProps, "source"> {
  characterName: string;
  characterImageUrl?: string;
  fallbackUrl?: string;
}

/**
 * Composant Image optimisé pour afficher les images de caractères
 * Gère le fallback et la memoization
 */
export const OptimizedCharacterImage = memo(
  function OptimizedCharacterImage({
    characterName,
    characterImageUrl,
    fallbackUrl,
    style,
    ...imageProps
  }: OptimizedCharacterImageProps) {
    const source = useMemo(() => {
      // Préférer l'URL directe si disponible
      if (characterImageUrl) {
        if (characterImageUrl.startsWith("data:")) {
          return { uri: characterImageUrl };
        }
        return { uri: characterImageUrl };
      }

      // Utiliser le fallback
      if (fallbackUrl) {
        return { uri: fallbackUrl };
      }

      // Placeholder par défaut
      return require("../assets/images/icon.png");
    }, [characterImageUrl, fallbackUrl]);

    return (
      <Image
        source={source}
        style={style}
        {...imageProps}
      />
    );
  },
  (prevProps, nextProps) => {
    // Memoization personnalisée: comparaison des props importantes
    return (
      prevProps.characterName === nextProps.characterName &&
      prevProps.characterImageUrl === nextProps.characterImageUrl &&
      prevProps.fallbackUrl === nextProps.fallbackUrl &&
      JSON.stringify(prevProps.style) === JSON.stringify(nextProps.style)
    );
  }
);

OptimizedCharacterImage.displayName = "OptimizedCharacterImage";

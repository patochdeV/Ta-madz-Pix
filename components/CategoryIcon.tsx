import React, { memo } from "react";
import { Ionicons, MaterialIcons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";

export interface CategoryIconProps {
  icon: string;
  iconFamily: string;
  color: string;
  size?: number;
}

/**
 * Composant icon memoized pour éviter les re-rendersiniutiles
 * Memoized car il reçoit toujours les mêmes props
 */
export const CategoryIcon = memo(function CategoryIcon({
  icon,
  iconFamily,
  color,
  size = 28,
}: CategoryIconProps) {
  switch (iconFamily) {
    case "MaterialIcons":
      return <MaterialIcons name={icon as any} size={size} color={color} />;
    case "MaterialCommunityIcons":
      return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
    case "Feather":
      return <Feather name={icon as any} size={size} color={color} />;
    default:
      return <Ionicons name={icon as any} size={size} color={color} />;
  }
}, (prevProps, nextProps) => {
  // Retourner true si les props sont identiques (pas de re-render)
  return (
    prevProps.icon === nextProps.icon &&
    prevProps.iconFamily === nextProps.iconFamily &&
    prevProps.color === nextProps.color &&
    prevProps.size === nextProps.size
  );
});

CategoryIcon.displayName = "CategoryIcon";

import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import { getCharacterById } from "@/data/tamagotchi-characters";
import { useCharacters } from "@/context/CharactersContext";
import { allItems, getCategoryById } from "@/data/tamagotchi-items";
import Colors from "@/constants/colors";

function RarityColor(rarity: string): string {
  const colors = {
    common: "#6B7280",
    uncommon: "#10B981",
    rare: "#8B5CF6",
    legendary: "#F59E0B",
  };
  return colors[rarity as keyof typeof colors] || "#6B7280";
}

export default function CharacterDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFavoriteCharacter, toggleFavoriteCharacter } = useCharacters();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const character = useMemo(() => {
    if (!id) return null;
    return getCharacterById(id);
  }, [id]);

  const favoriteItems = useMemo(() => {
    if (!character) return [];
    return allItems.filter((item) =>
      character.favoriteItemIds.includes(item.id)
    );
  }, [character]);

  if (!character) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Personnage non trouvé</Text>
      </View>
    );
  }

  const isFav = isFavoriteCharacter(character.id);
  const rarityColor = RarityColor(character.rarity);

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <LinearGradient
        colors={["#FFF5F0", "#FDE8E0", "#F5E6FF"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.header}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="chevron-back" size={28} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {character.name}
        </Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            toggleFavoriteCharacter(character.id);
          }}
          style={({ pressed }) => [
            styles.favoriteButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={28}
            color={isFav ? "#FF6B9D" : Colors.light.tabIconDefault}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <Animated.View entering={FadeIn} style={styles.mainCard}>
          <LinearGradient
            colors={["#FFFFFF", "#F9F5FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardContent}
          >
            <View style={styles.spriteSection}>
              <View style={styles.spriteBg}>
                <Image
                  source={{ uri: character.spriteUrl }}
                  style={styles.sprite}
                  contentFit="contain"
                />
              </View>
              <View
                style={[
                  styles.rarityBadge,
                  { backgroundColor: rarityColor + "20", borderColor: rarityColor },
                ]}
              >
                <View style={styles.rarityContent}>
                  <Ionicons name="star" size={16} color={rarityColor} />
                  <Text style={[styles.rarityText, { color: rarityColor }]}>
                    {character.rarity === "common"
                      ? "Commun"
                      : character.rarity === "uncommon"
                      ? "Rare"
                      : character.rarity === "rare"
                      ? "Très rare"
                      : "Légendaire"}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.description}>{character.description}</Text>

            {character.evolves_from && (
              <View style={styles.evolutionInfo}>
                <Ionicons name="arrow-up" size={16} color="#8B5CF6" />
                <Text style={styles.evolutionText}>
                  Évolue de: {getCharacterById(character.evolves_from)?.name}
                </Text>
              </View>
            )}

            {character.evolves_to && (
              <View style={styles.evolutionInfo}>
                <Ionicons name="arrow-down" size={16} color="#8B5CF6" />
                <Text style={styles.evolutionText}>
                  Peut évoluer en: {getCharacterById(character.evolves_to)?.name}
                </Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(100)} style={styles.section}>
          <Text style={styles.sectionTitle}>Catégories préférées</Text>
          <View style={styles.categoriesGrid}>
            {character.preferedCategories.map((catId) => {
              const cat = getCategoryById(catId as any);
              return (
                <View
                  key={catId}
                  style={[
                    styles.categoryCard,
                    { backgroundColor: (cat?.color || "#FF6B9D") + "20" },
                  ]}
                >
                  <View
                    style={[
                      styles.categoryIconBg,
                      { backgroundColor: cat?.color || "#FF6B9D" },
                    ]}
                  >
                    <Ionicons
                      name={cat?.icon as any || "square"}
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryCardText,
                      { color: cat?.color || "#FF6B9D" },
                    ]}
                  >
                    {cat?.name || catId}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {favoriteItems.length > 0 && (
          <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>Items préférés</Text>
            <View style={styles.itemsList}>
              {favoriteItems.map((item) => {
                const cat = getCategoryById(item.category);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push({
                        pathname: "/item/[id]",
                        params: { id: item.id },
                      });
                    }}
                    style={({ pressed }) => [
                      styles.itemCard,
                      { transform: [{ scale: pressed ? 0.97 : 1 }] },
                    ]}
                  >
                    <View
                      style={[
                        styles.itemSpriteBg,
                        { backgroundColor: (cat?.color || "#FF6B9D") + "20" },
                      ]}
                    >
                      <Image
                        source={{ uri: item.spriteUrl }}
                        style={styles.itemSprite}
                        contentFit="contain"
                      />
                    </View>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemCategory}>{cat?.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    color: "#000",
    marginHorizontal: 12,
  },
  favoriteButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  mainCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardContent: {
    padding: 20,
  },
  spriteSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  spriteBg: {
    width: 140,
    height: 140,
    borderRadius: 20,
    backgroundColor: "#FFF5F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#FFE0E6",
  },
  sprite: {
    width: 120,
    height: 120,
  },
  rarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  rarityContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rarityText: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
  },
  description: {
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
    color: "#333",
    lineHeight: 24,
    marginBottom: 16,
  },
  evolutionInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF6" + "10",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
    gap: 8,
  },
  evolutionText: {
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: "#8B5CF6",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: "#000",
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  categoryIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryCardText: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    textAlign: "center",
  },
  itemsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  itemCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  itemSpriteBg: {
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  itemSprite: {
    width: 60,
    height: 60,
  },
  itemName: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    color: "#000",
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 11,
    fontFamily: "Nunito_400Regular",
    color: "#999",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    color: "#666",
  },
});

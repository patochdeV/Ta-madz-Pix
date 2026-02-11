import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  TextInput,
  Platform,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { tamaCharacters, searchCharacters, type TamaCharacter } from "@/data/tamagotchi-characters";
import { useCharacters } from "@/context/CharactersContext";
import { getCategoryById } from "@/data/tamagotchi-items";
import Colors from "@/constants/colors";

function RarityBadge({ rarity }: { rarity: string }) {
  const rarityConfig = {
    common: { color: "#6B7280", label: "Commun" },
    uncommon: { color: "#10B981", label: "Rare" },
    rare: { color: "#8B5CF6", label: "Très rare" },
    legendary: { color: "#F59E0B", label: "Légendaire" },
  };

  // Normaliser la valeur de rareté et fournir un fallback
  const key = (String(rarity || "").toLowerCase() || "common").replace(/\s+/g, "-");
  const config = (rarityConfig as any)[key] || { color: "#6B7280", label: String(rarity || "Commun") };

  return (
    <View
      style={[
        styles.rarityBadge,
        { backgroundColor: config.color + "20", borderColor: config.color },
      ]}
    >
      <Text style={[styles.rarityLabel, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

function CharacterCard({ character }: { character: TamaCharacter }) {
  const { isFavoriteCharacter, toggleFavoriteCharacter } = useCharacters();
  const isFav = isFavoriteCharacter(character.id);

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({
          pathname: "/characters/[id]",
          params: { id: character.id },
        });
      }}
      style={({ pressed }) => [
        styles.characterCard,
        { transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <LinearGradient
        colors={["#FFF5F0", "#FDE8E0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardBackground}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleSection}>
            <Text style={styles.characterName}>{character.name}</Text>
            <RarityBadge rarity={character.rarity} />
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleFavoriteCharacter(character.id);
            }}
            hitSlop={12}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={24}
              color={isFav ? "#FF6B9D" : Colors.light.tabIconDefault}
            />
          </Pressable>
        </View>

        <View style={styles.spriteContainer}>
          <Image
            source={{ uri: character.spriteUrl }}
            style={styles.characterSprite}
            contentFit="contain"
          />
        </View>

        <Text style={styles.characterDescription} numberOfLines={2}>
          {character.description}
        </Text>

        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesLabel}>Préférences:</Text>
          <View style={styles.categoriesList}>
            {character.preferedCategories.map((catId) => {
              const cat = getCategoryById(catId as any);
              return (
                <View
                  key={catId}
                  style={[
                    styles.categoryTag,
                    { backgroundColor: (cat?.color || "#FF6B9D") + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryTagText,
                      { color: cat?.color || "#FF6B9D" },
                    ]}
                  >
                    {cat?.name || catId}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function CharactersScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCharacters = useMemo(() => {
    if (!searchQuery.trim()) return tamaCharacters;
    return searchCharacters(searchQuery);
  }, [searchQuery]);

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
        <Text style={styles.headerTitle}>Personnages</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={Colors.light.tabIconDefault}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Chercher un personnage..."
          placeholderTextColor={Colors.light.tabIconDefault}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => setSearchQuery("")}
            hitSlop={8}
            style={styles.clearButton}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={20}
              color={Colors.light.tabIconDefault}
            />
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredCharacters}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 50)}
            style={{ paddingHorizontal: 16, marginBottom: 12 }}
          >
            <CharacterCard character={item} />
          </Animated.View>
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="magnify-close"
              size={48}
              color={Colors.light.tabIconDefault}
            />
            <Text style={styles.emptyText}>
              Aucun personnage trouvé
            </Text>
          </View>
        }
      />
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
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    color: "#000",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Nunito_400Regular",
    fontSize: 16,
    color: "#000",
  },
  clearButton: {
    padding: 8,
  },
  scrollContent: {
    paddingTop: 8,
  },
  characterCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardBackground: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  characterName: {
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    color: "#000",
    marginBottom: 8,
  },
  rarityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  rarityLabel: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
  },
  spriteContainer: {
    alignItems: "center",
    marginVertical: 16,
    minHeight: 120,
    backgroundColor: "#FFFFFF40",
    borderRadius: 12,
  },
  characterSprite: {
    width: 100,
    height: 100,
  },
  characterDescription: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: "#666",
    marginBottom: 12,
  },
  categoriesSection: {
    marginTop: 12,
  },
  categoriesLabel: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    color: "#999",
    marginBottom: 8,
  },
  categoriesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryTagText: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    color: Colors.light.tabIconDefault,
  },
});

import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { allItems, getCategoryById, type TamaItem } from "@/data/tamagotchi-items";
import { useFavorites } from "@/context/FavoritesContext";
import Colors from "@/constants/colors";

function FavItemCard({ item, index }: { item: TamaItem; index: number }) {
  const { toggleFavorite } = useFavorites();
  const category = getCategoryById(item.category);

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({ pathname: "/item/[id]", params: { id: item.id } });
        }}
        style={({ pressed }) => [
          styles.itemCard,
          { transform: [{ scale: pressed ? 0.97 : 1 }] },
        ]}
      >
        <View style={[styles.spriteWrap, { backgroundColor: (category?.color || "#FF6B9D") + "12" }]}>
          <Image
            source={{ uri: item.spriteUrl }}
            style={styles.sprite}
            contentFit="contain"
          />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemCategory}>{category?.name}</Text>
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggleFavorite(item.id);
          }}
          hitSlop={12}
        >
          <Ionicons name="heart" size={22} color={Colors.light.tint} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { favorites } = useFavorites();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const favItems = useMemo(
    () => allItems.filter((item) => favorites.includes(item.id)),
    [favorites]
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFF5F0", "#FDE8E0", "#F5E6FF"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>Favoris</Text>
          <Text style={styles.headerCount}>{favItems.length} objets</Text>
        </View>
      </View>

      {favItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={56} color={Colors.light.tabIconDefault} />
          <Text style={styles.emptyTitle}>Pas encore de favoris</Text>
          <Text style={styles.emptySubtitle}>
            Appuyez sur le c\u0153ur pour ajouter des objets ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={favItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <FavItemCard item={item} index={index} />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20) },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={favItems.length > 0}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
  },
  headerText: {
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
    color: Colors.light.tint,
  },
  headerCount: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    color: Colors.light.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: Colors.light.text,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 12,
    gap: 14,
  },
  spriteWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sprite: {
    width: 36,
    height: 36,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: Colors.light.text,
  },
  itemCategory: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
});

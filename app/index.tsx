import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { categories, allItems } from "@/data/tamagotchi-items";
import { useFavorites } from "@/context/FavoritesContext";
import Colors from "@/constants/colors";

function CategoryIcon({ icon, iconFamily, color, size = 28 }: { icon: string; iconFamily: string; color: string; size?: number }) {
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
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { favorites } = useFavorites();
  const { width } = useWindowDimensions();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const cardWidth = (width - 20 * 2 - 12) / 2;

  const handleCategoryPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/category/[id]", params: { id: categoryId } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <LinearGradient
        colors={["#FFF5F0", "#FDE8E0", "#F5E6FF"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20) },
        ]}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Tama Pix</Text>
            <Text style={styles.subtitle}>Catalogue de codes QR</Text>
          </View>
          <View style={styles.headerButtons}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/search");
              }}
              style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons name="search" size={22} color={Colors.light.text} />
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/favorites");
              }}
              style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons name="heart" size={22} color={Colors.light.tint} />
              {favorites.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{favorites.length}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{allItems.length}</Text>
            <Text style={styles.statLabel}>Objets</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{categories.length}</Text>
            <Text style={styles.statLabel}>Cat.</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.light.tint }]}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favoris</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <Text style={styles.sectionTitle}>Catégories</Text>
        </Animated.View>

        <View style={styles.categoriesGrid}>
          {categories.map((cat, index) => {
            const count = allItems.filter((i) => i.category === cat.id).length;
            return (
              <Animated.View
                key={cat.id}
                entering={FadeInDown.delay(350 + index * 80).duration(500)}
              >
                <Pressable
                  onPress={() => handleCategoryPress(cat.id)}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    {
                      width: cardWidth,
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                  ]}
                >
                  <View style={[styles.categoryIconWrap, { backgroundColor: cat.color + "18" }]}>
                    <CategoryIcon icon={cat.icon} iconFamily={cat.iconFamily} color={cat.color} size={32} />
                  </View>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <Text style={styles.categoryCount}>{count} objets</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View entering={FadeInDown.delay(900).duration(500)} style={styles.creditCard}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.light.textSecondary} />
          <Text style={styles.creditText}>
            Données extraites de mrblinky.net
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 32,
    fontFamily: "Nunito_800ExtraBold",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: Colors.light.tint,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  categoryIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: {
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: Colors.light.text,
  },
  categoryCount: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    color: Colors.light.textSecondary,
  },
  creditCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
  },
  creditText: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    color: Colors.light.textSecondary,
    flex: 1,
  },
});

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
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { allItems, getCategoryById } from "@/data/tamagotchi-items";
import { useFavorites } from "@/context/FavoritesContext";
import Colors from "@/constants/colors";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const item = allItems.find((i) => i.id === id);
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!item) return null;

  const category = getCategoryById(item.category);
  const fav = isFavorite(item.id);
  const qrSize = Math.min(width - 80, 320);

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
          style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="close" size={24} color={Colors.light.text} />
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggleFavorite(item.id);
          }}
          style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons
            name={fav ? "heart" : "heart-outline"}
            size={24}
            color={fav ? Colors.light.tint : Colors.light.text}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 40) },
        ]}
      >
        <Animated.View entering={FadeIn.duration(500)} style={styles.spriteSection}>
          <View style={[styles.spriteBg, { backgroundColor: (category?.color || "#FF6B9D") + "15" }]}>
            <Image
              source={{ uri: item.spriteUrl }}
              style={styles.spriteImage}
              contentFit="contain"
              transition={300}
            />
          </View>
          <Text style={styles.itemName}>{item.name}</Text>
          {category && (
            <View style={[styles.categoryPill, { backgroundColor: category.color + "20" }]}>
              <Text style={[styles.categoryPillText, { color: category.color }]}>
                {category.name}
              </Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.qrSection}>
          <Text style={styles.qrTitle}>Tama Code</Text>
          <Text style={styles.qrSubtitle}>
            Scannez ce QR code avec votre Tamagotchi Pix
          </Text>
          <View style={styles.qrContainer}>
            <Image
              source={{ uri: item.qrCodeUrl }}
              style={[styles.qrImage, { width: qrSize, height: qrSize }]}
              contentFit="contain"
              transition={400}
              placeholder={undefined}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.infoSection}>
          <Text style={styles.infoTitle}>Comment utiliser</Text>
          <View style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Sur votre Tamagotchi Pix, ouvrez le menu cœur
            </Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Sélectionnez l'option « Download »
            </Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Scannez le QR code ci-dessus
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  spriteSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  spriteBg: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  spriteImage: {
    width: 64,
    height: 64,
  },
  itemName: {
    fontSize: 26,
    fontFamily: "Nunito_800ExtraBold",
    color: Colors.light.text,
    textAlign: "center",
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  categoryPillText: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
  },
  qrSection: {
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  qrTitle: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  qrSubtitle: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    color: Colors.light.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  qrContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  qrImage: {
    borderRadius: 8,
  },
  infoSection: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  stepNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.tint + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: Colors.light.tint,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: Colors.light.text,
    lineHeight: 20,
  },
});

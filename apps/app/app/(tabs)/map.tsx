import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";

interface QuestListItem {
  id: string;
  name: string;
  venueId: string;
  venueName: string;
  rewardDescription: string;
  completed: boolean;
  markerId: string | null;
}

/**
 * UI doc 7.3 — discovery. There's no venue geo-coordinate data in the backend yet
 * (no lat/lng on Venue), so this is the bottom-sheet venue list the spec calls for,
 * without literal map pins claiming a location accuracy we don't have — a stylized
 * backdrop stands in for the live map until that data exists.
 */
export default function MapScreen() {
  const theme = useTheme();
  const [quests, setQuests] = useState<QuestListItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.quests().then(setQuests).catch(() => setQuests([]));
    api.favorites().then((f) => setFavorites(new Set(f.map((v) => v.id)))).catch(() => {});
  }, []);

  // FR-6: optimistic favorite toggle for a quest's venue; reverts if the request fails.
  const toggleFavorite = async (venueId: string) => {
    const isFav = favorites.has(venueId);
    setFavorites((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(venueId) : next.add(venueId);
      return next;
    });
    try {
      await (isFav ? api.removeFavorite(venueId) : api.addFavorite(venueId));
    } catch {
      setFavorites((prev) => {
        const next = new Set(prev);
        isFav ? next.add(venueId) : next.delete(venueId);
        return next;
      });
    }
  };

  const c = theme.colors;
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: c.surface },
    backdrop: {
      height: "38%",
      backgroundColor: c.surfaceContainerLowest,
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 1,
      borderBottomColor: c.surfaceContainerHighest,
    },
    backdropIcon: { opacity: 0.25 },
    backdropLabel: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, marginTop: 8, opacity: 0.6 },
    sheet: {
      flex: 1,
      marginTop: -24,
      backgroundColor: c.surfaceContainerLow,
      borderTopLeftRadius: theme.radius.card,
      borderTopRightRadius: theme.radius.card,
      paddingTop: theme.spacing.stackMd,
      paddingHorizontal: theme.spacing.containerPadding,
    },
    sheetHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.stackMd },
    sheetTitle: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant },
    sheetCount: { ...theme.font(theme.type.bodyLg), color: c.primary },
    card: {
      backgroundColor: theme.mode === "dark" ? "rgba(30,41,59,0.7)" : c.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.05)" : c.borderSubtle,
      borderRadius: theme.radius.card,
      padding: theme.spacing.stackMd,
      marginBottom: theme.spacing.stackSm,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    dot: { width: 10, height: 10, borderRadius: 5 },
    favBtn: { padding: 4 },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface },
    cardSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 2 },
    empty: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginTop: 24 },
  });

  return (
    <View style={styles.container}>
      <View style={styles.backdrop}>
        <MaterialIcons name="map" size={72} color={c.primary} style={styles.backdropIcon} />
        <Text style={styles.backdropLabel}>LIVE MAP VIEW — COMING SOON</Text>
      </View>
      <View style={styles.sheet}>
        <View style={styles.sheetHeaderRow}>
          <Text style={styles.sheetTitle}>NEARBY QUESTS</Text>
          <Text style={styles.sheetCount}>{quests.length}</Text>
        </View>
        <FlatList
          data={quests}
          keyExtractor={(q) => q.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={<Text style={styles.empty}>No quests available right now.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/quest/[id]",
                  params: {
                    id: item.id,
                    name: item.name,
                    venueName: item.venueName,
                    rewardDescription: item.rewardDescription,
                    completed: String(item.completed),
                    markerId: item.markerId ?? "",
                  },
                })
              }
            >
              <View style={[styles.dot, { backgroundColor: item.completed ? c.secondaryContainer : c.primaryContainer }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.venueName}</Text>
                <Text style={styles.cardSub}>{item.name}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(item.venueId)} hitSlop={8} style={styles.favBtn}>
                <MaterialIcons
                  name={favorites.has(item.venueId) ? "favorite" : "favorite-border"}
                  size={20}
                  color={favorites.has(item.venueId) ? c.primary : c.onSurfaceVariant}
                />
              </TouchableOpacity>
              <MaterialIcons name="chevron-right" size={22} color={c.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import type { UserQuestListItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { NeumorphicView } from "@/components/NeumorphicView";

type FilterType = "all" | "active" | "completed";

/** Stitch Quests List (Neumorphic & Buttery Smooth) */
export default function QuestsScreen() {
  const theme = useTheme();
  const [quests, setQuests] = useState<UserQuestListItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuests = useCallback(async () => {
    try {
      const data = await api.quests();
      setQuests(data);
    } catch {
      // keep current state
    }
  }, []);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuests();
    setRefreshing(false);
  };

  const c = theme.colors;
  const isDark = theme.mode === "dark";

  const filteredQuests = quests.filter((q) => {
    if (filter === "active") return !q.completed;
    if (filter === "completed") return q.completed;
    return true;
  });

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? "#141314" : c.surface },
    content: { padding: theme.spacing.containerPadding, paddingTop: 16, paddingBottom: 130 },
    headerTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, fontSize: 26 },
    headerSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 4, marginBottom: 16 },
    
    // Filter Pills
    filterRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
    filterPill: { paddingHorizontal: 16, paddingVertical: 8 },
    filterPillText: { ...theme.font(theme.type.labelCaps), fontSize: 11, letterSpacing: 0.8 },

    // Feature Quest Card
    featureCard: { padding: 20, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: "rgba(207, 197, 186, 0.25)" },
    premiumBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 12 },
    premiumText: { ...theme.font(theme.type.labelCaps), color: "#cfc5ba", fontSize: 10 },
    featureTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 20 },
    featureDesc: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 4, marginBottom: 16 },
    featureFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    featureReward: { flexDirection: "row", alignItems: "center", gap: 6 },
    featureRewardText: { ...theme.font(theme.type.bodyMd), color: "#cfc5ba", fontWeight: "700" },
    initiateBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8 },
    initiateBtnText: { ...theme.font(theme.type.labelCaps), color: "#cfc5ba" },

    // Standard Quest Card
    card: { padding: 18, borderRadius: 24, marginBottom: 14 },
    cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    iconSquare: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4 },
    statusActive: { ...theme.font(theme.type.labelCaps), color: "#00f0ff", fontSize: 10 },
    statusCompleted: { ...theme.font(theme.type.labelCaps), color: "#10B981", fontSize: 10 },
    pulsingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#00f0ff" },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 18 },
    cardVenue: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 2 },
    cardBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
    xpTag: { flexDirection: "row", alignItems: "center", gap: 4 },
    xpText: { ...theme.font(theme.type.bodyMd), color: "#00eefc", fontWeight: "700" },
    scanBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8 },
    scanBtnText: { ...theme.font(theme.type.labelCaps), color: "#00f0ff", fontSize: 11 },
    startBtnText: { ...theme.font(theme.type.labelCaps), color: c.onSurface, fontSize: 11 },
    emptyText: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginTop: 32 },
  });

  return (
    <View style={styles.container}>
      <TopNav title="Quests" showLogo={false} subtitle={`${quests.filter(q => !q.completed).length} active missions`} />
      <FlatList
        data={filteredQuests}
        keyExtractor={(q) => q.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00f0ff"
            colors={["#00f0ff"]}
          />
        }
        ListHeaderComponent={
          <>
            <Text style={styles.headerTitle}>Available Quests</Text>
            <Text style={styles.headerSub}>Complete missions to earn XP and unlock new sectors.</Text>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
              <NeumorphicView
                variant={filter === "all" ? "inset" : "raised"}
                radius={16}
                style={styles.filterPill}
                onPress={() => setFilter("all")}
              >
                <Text style={[styles.filterPillText, { color: filter === "all" ? "#00f0ff" : c.onSurfaceVariant }]}>
                  ALL ({quests.length})
                </Text>
              </NeumorphicView>
              <NeumorphicView
                variant={filter === "active" ? "inset" : "raised"}
                radius={16}
                style={styles.filterPill}
                onPress={() => setFilter("active")}
              >
                <Text style={[styles.filterPillText, { color: filter === "active" ? "#00f0ff" : c.onSurfaceVariant }]}>
                  ACTIVE ({quests.filter((q) => !q.completed).length})
                </Text>
              </NeumorphicView>
              <NeumorphicView
                variant={filter === "completed" ? "inset" : "raised"}
                radius={16}
                style={styles.filterPill}
                onPress={() => setFilter("completed")}
              >
                <Text style={[styles.filterPillText, { color: filter === "completed" ? "#10B981" : c.onSurfaceVariant }]}>
                  COMPLETED ({quests.filter((q) => q.completed).length})
                </Text>
              </NeumorphicView>
            </View>

            {/* Feature Premium Quest (Only shown in 'all' or 'active') */}
            {filter !== "completed" && (
              <NeumorphicView variant="raised" glow="premium" radius={24} style={styles.featureCard}>
                <NeumorphicView variant="inset" radius={12} style={styles.premiumBadge}>
                  <MaterialIcons name="star" size={12} color="#cfc5ba" />
                  <Text style={styles.premiumText}>PREMIUM QUEST</Text>
                </NeumorphicView>
                <Text style={styles.featureTitle}>The Golden Node</Text>
                <Text style={styles.featureDesc}>Locate and interface with the legendary mainframe cluster. High risk, high reward.</Text>
                <View style={styles.featureFooter}>
                  <View style={styles.featureReward}>
                    <MaterialIcons name="stars" size={18} color="#cfc5ba" />
                    <Text style={styles.featureRewardText}>+2500 XP</Text>
                  </View>
                  <NeumorphicView
                    variant="raised"
                    radius={18}
                    style={styles.initiateBtn}
                    onPress={() => router.push("/(tabs)/map")}
                  >
                    <MaterialIcons name="rocket-launch" size={16} color="#cfc5ba" />
                    <Text style={styles.initiateBtnText}>INITIATE</Text>
                  </NeumorphicView>
                </View>
              </NeumorphicView>
            )}
          </>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {filter === "completed" ? "No completed quests yet." : "No quests found in this category."}
          </Text>
        }
        renderItem={({ item }) => (
          <NeumorphicView
            variant="raised"
            radius={24}
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
            <View style={styles.cardTopRow}>
              <NeumorphicView variant="inset" radius={16} style={styles.iconSquare}>
                <MaterialIcons name={item.completed ? "verified" : "explore"} size={26} color={item.completed ? "#10B981" : "#00f0ff"} />
              </NeumorphicView>
              <NeumorphicView variant="inset" radius={12} style={styles.statusBadge}>
                {!item.completed && <View style={styles.pulsingDot} />}
                <Text style={item.completed ? styles.statusCompleted : styles.statusActive}>
                  {item.completed ? "COMPLETED" : "ACTIVE"}
                </Text>
              </NeumorphicView>
            </View>

            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardVenue}>{item.venueName}</Text>

            <View style={styles.cardBottomRow}>
              <View style={styles.xpTag}>
                <MaterialIcons name="stars" size={18} color="#00eefc" />
                <Text style={styles.xpText}>+250 XP</Text>
              </View>

              {!item.completed && item.markerId ? (
                <NeumorphicView
                  variant="raised"
                  glow="cyan"
                  radius={16}
                  style={styles.scanBtn}
                  onPress={() => router.push(`/scan/${item.markerId}`)}
                >
                  <MaterialIcons name="qr-code-scanner" size={16} color="#00f0ff" />
                  <Text style={styles.scanBtnText}>SCAN (AR)</Text>
                </NeumorphicView>
              ) : (
                <NeumorphicView variant="flat" radius={16} style={styles.scanBtn}>
                  <Text style={styles.startBtnText}>{item.completed ? "VIEW" : "DETAILS"}</Text>
                </NeumorphicView>
              )}
            </View>
          </NeumorphicView>
        )}
      />
    </View>
  );
}

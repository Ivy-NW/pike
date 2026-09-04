import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import type { UserQuestListItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { NeumorphicView } from "@/components/NeumorphicView";

type FilterType = "all" | "active" | "completed";

/** Stitch Quests List (PIKE Gold & Sapphire Blue Neumorphic — Fully Responsive) */
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
    container: { flex: 1, backgroundColor: isDark ? "#0c0c0e" : c.surface },
    content: { padding: 16, paddingTop: 14, paddingBottom: 130 },
    headerTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, fontSize: 26, fontWeight: "700" },
    headerSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 4, marginBottom: 16 },

    // Responsive Filter Pills Row
    filterScroll: { marginBottom: 16 },
    filterRow: { flexDirection: "row", gap: 8, paddingRight: 16 },
    filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },
    filterPillActiveText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#f59e0b" : "#d97706", fontSize: 11, fontWeight: "700" },
    filterPillInactiveText: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 11, fontWeight: "600" },

    // Featured Vanguard Mission Card
    featureCard: { padding: 18, borderRadius: 24, marginBottom: 16, width: "100%" },
    premiumBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 10, borderRadius: 10 },
    premiumText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#f59e0b" : "#d97706", fontSize: 10, fontWeight: "700" },
    featureTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 19, fontWeight: "700" },
    featureDesc: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 4, marginBottom: 14, fontSize: 13, lineHeight: 18 },
    featureFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
    featureReward: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, flexShrink: 1 },
    featureRewardText: { ...theme.font(theme.type.bodyMd), color: isDark ? "#f59e0b" : "#d97706", fontWeight: "700", fontSize: 13 },
    initiateBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, flexShrink: 0 },
    initiateBtnText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#f59e0b" : "#d97706", fontWeight: "700", fontSize: 11 },

    // Standard Quest Card (Fully Responsive & Overflow-Proof)
    card: { padding: 16, borderRadius: 24, marginBottom: 14, width: "100%" },
    cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    iconSquare: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    statusActive: { ...theme.font(theme.type.labelCaps), color: isDark ? "#f59e0b" : "#d97706", fontSize: 10, fontWeight: "700" },
    statusCompleted: { ...theme.font(theme.type.labelCaps), color: "#10B981", fontSize: 10, fontWeight: "700" },
    pulsingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: isDark ? "#f59e0b" : "#d97706" },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 17, fontWeight: "700" },
    cardVenue: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 2, fontSize: 13 },
    cardBottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: isDark ? "rgba(212,175,55,0.1)" : "rgba(217,119,6,0.1)",
      gap: 10,
    },
    xpTag: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1, flexShrink: 1 },
    xpText: {
      ...theme.font(theme.type.bodyMd),
      color: isDark ? "#f59e0b" : "#d97706",
      fontWeight: "700",
      fontSize: 12,
      flex: 1,
    },
    scanBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 14,
      flexShrink: 0,
    },
    scanBtnText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#f59e0b" : "#d97706", fontSize: 11, fontWeight: "700" },
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
            tintColor={isDark ? "#f59e0b" : "#d97706"}
            colors={[isDark ? "#f59e0b" : "#d97706"]}
          />
        }
        ListHeaderComponent={
          <>
            {/* Horizontally Scrollable Responsive Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterRow}
            >
              <NeumorphicView
                variant={filter === "all" ? "inset" : "raised"}
                glow={filter === "all" ? "gold" : "none"}
                radius={14}
                style={styles.filterPill}
                onPress={() => setFilter("all")}
              >
                <Text style={filter === "all" ? styles.filterPillActiveText : styles.filterPillInactiveText}>ALL MISSIONS</Text>
              </NeumorphicView>

              <NeumorphicView
                variant={filter === "active" ? "inset" : "raised"}
                glow={filter === "active" ? "gold" : "none"}
                radius={14}
                style={styles.filterPill}
                onPress={() => setFilter("active")}
              >
                <Text style={filter === "active" ? styles.filterPillActiveText : styles.filterPillInactiveText}>ACTIVE (LIVE)</Text>
              </NeumorphicView>

              <NeumorphicView
                variant={filter === "completed" ? "inset" : "raised"}
                glow={filter === "completed" ? "gold" : "none"}
                radius={14}
                style={styles.filterPill}
                onPress={() => setFilter("completed")}
              >
                <Text style={filter === "completed" ? styles.filterPillActiveText : styles.filterPillInactiveText}>COMPLETED</Text>
              </NeumorphicView>
            </ScrollView>

            {/* Featured Vanguard Mission Card */}
            {filter !== "completed" && (
              <NeumorphicView variant="raised" glow="gold" radius={24} style={styles.featureCard}>
                <NeumorphicView variant="inset" radius={10} style={styles.premiumBadge}>
                  <MaterialIcons name="stars" size={14} color={isDark ? "#f59e0b" : "#d97706"} />
                  <Text style={styles.premiumText}>HIGH-YIELD SECTOR ANOMALY</Text>
                </NeumorphicView>
                <Text style={styles.featureTitle}>Decipher the KICC Anomaly</Text>
                <Text style={styles.featureDesc}>
                  Align 6-DOF optical camera telemetry at KICC Sky Deck Lounge to unlock the VIP Vanguard tier.
                </Text>
                <View style={styles.featureFooter}>
                  <View style={styles.featureReward}>
                    <MaterialIcons name="card-giftcard" size={18} color={isDark ? "#f59e0b" : "#d97706"} />
                    <Text style={styles.featureRewardText} numberOfLines={1}>20% off + 500 PTS</Text>
                  </View>
                  <NeumorphicView
                    variant="raised"
                    glow="gold"
                    radius={14}
                    style={styles.initiateBtn}
                    onPress={() => router.push("/quest/q-nbo-1")}
                  >
                    <Text style={styles.initiateBtnText}>DEPLOY</Text>
                    <MaterialIcons name="arrow-forward" size={16} color={isDark ? "#f59e0b" : "#d97706"} />
                  </NeumorphicView>
                </View>
              </NeumorphicView>
            )}
          </>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No missions found in this category.</Text>}
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
              <NeumorphicView variant="inset" radius={14} style={styles.iconSquare}>
                <MaterialIcons
                  name={item.completed ? "verified" : "memory"}
                  size={24}
                  color={item.completed ? "#10B981" : (isDark ? "#f59e0b" : "#d97706")}
                />
              </NeumorphicView>
              <NeumorphicView variant="inset" radius={10} style={styles.statusBadge}>
                {item.completed ? (
                  <>
                    <MaterialIcons name="check-circle" size={12} color="#10B981" />
                    <Text style={styles.statusCompleted}>RESOLVED</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.pulsingDot} />
                    <Text style={styles.statusActive}>OPTICAL READY</Text>
                  </>
                )}
              </NeumorphicView>
            </View>

            <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.cardVenue} numberOfLines={1}>{item.venueName}</Text>

            <View style={styles.cardBottomRow}>
              <View style={styles.xpTag}>
                <MaterialIcons name="military-tech" size={18} color={isDark ? "#f59e0b" : "#d97706"} />
                <Text style={styles.xpText} numberOfLines={1}>
                  +250 PTS • {item.rewardDescription}
                </Text>
              </View>

              {!item.completed && (
                <NeumorphicView
                  variant="raised"
                  glow="gold"
                  radius={14}
                  style={styles.scanBtn}
                  onPress={() => router.push(`/scan/${item.markerId || item.id}`)}
                >
                  <MaterialIcons name="qr-code-scanner" size={16} color={isDark ? "#f59e0b" : "#d97706"} />
                  <Text style={styles.scanBtnText}>SCAN</Text>
                </NeumorphicView>
              )}
            </View>
          </NeumorphicView>
        )}
      />
    </View>
  );
}

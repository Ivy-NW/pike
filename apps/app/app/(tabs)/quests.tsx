import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import type { UserQuestListItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme, useSemanticColors, RADIUS_CARD } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { NeumorphicView } from "@/components/NeumorphicView";
import { useRewardColor, RewardText } from "@/components/RewardAccent";

type FilterType = "all" | "active" | "completed";

/** PIKE quest list — Pike Blue chrome throughout, Pike Gold reserved for reward/XP callouts. */
export default function QuestsScreen() {
  const theme = useTheme();
  const semantic = useSemanticColors();
  const rewardColor = useRewardColor();
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
  const actionColor = semantic.action;

  const filteredQuests = quests.filter((q) => {
    if (filter === "active") return !q.completed;
    if (filter === "completed") return q.completed;
    return true;
  });

  // UserQuestListItem has no "featured" flag from the API today, so the
  // spotlight card highlights the first quest still in progress, falling
  // back to the first quest overall if everything is already completed —
  // never a fixed id that may not exist in the real list.
  const featuredQuest = quests.find((q) => !q.completed) ?? quests[0] ?? null;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? "#000000" : c.surface },
    content: { padding: 16, paddingTop: 14, paddingBottom: 130 },
    headerTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, fontSize: 26, fontWeight: "700" },
    headerSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 4, marginBottom: 16 },

    // Responsive Filter Pills Row
    filterScroll: { marginBottom: 16 },
    filterRow: { flexDirection: "row", gap: 8, paddingRight: 16 },
    filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS_CARD },
    filterPillActiveText: { ...theme.font(theme.type.labelCaps), color: actionColor, fontSize: 11, fontWeight: "700" },
    filterPillInactiveText: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 11, fontWeight: "600" },

    // Featured quest card
    featureCard: { padding: 18, borderRadius: RADIUS_CARD, marginBottom: 16, width: "100%" },
    premiumBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 10, borderRadius: 10 },
    premiumText: { ...theme.font(theme.type.labelCaps), color: actionColor, fontSize: 10, fontWeight: "700" },
    featureTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 19, fontWeight: "700" },
    featureDesc: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 4, marginBottom: 14, fontSize: 13, lineHeight: 18 },
    featureFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
    featureReward: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, flexShrink: 1 },
    featureRewardText: { ...theme.font(theme.type.bodyMd), fontWeight: "700", fontSize: 13 },
    initiateBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS_CARD, flexShrink: 0 },
    initiateBtnText: { ...theme.font(theme.type.labelCaps), color: actionColor, fontWeight: "700", fontSize: 11 },

    // Standard Quest Card (Fully Responsive & Overflow-Proof)
    card: { padding: 16, borderRadius: RADIUS_CARD, marginBottom: 14, width: "100%" },
    cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    iconSquare: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    statusActive: { ...theme.font(theme.type.labelCaps), color: actionColor, fontSize: 10, fontWeight: "700" },
    statusCompleted: { ...theme.font(theme.type.labelCaps), color: "#10B981", fontSize: 10, fontWeight: "700" },
    pulsingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: actionColor },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 17, fontWeight: "700" },
    cardVenue: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 2, fontSize: 13 },
    cardBottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
      gap: 10,
    },
    xpTag: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1, flexShrink: 1 },
    xpText: {
      ...theme.font(theme.type.bodyMd),
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
      borderRadius: RADIUS_CARD,
      flexShrink: 0,
    },
    scanBtnText: { ...theme.font(theme.type.labelCaps), color: actionColor, fontSize: 11, fontWeight: "700" },
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
            tintColor={actionColor}
            colors={[actionColor]}
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
                accent={filter === "all" ? "action" : "none"}
                radius={RADIUS_CARD}
                style={styles.filterPill}
                onPress={() => setFilter("all")}
              >
                <Text style={filter === "all" ? styles.filterPillActiveText : styles.filterPillInactiveText}>ALL MISSIONS</Text>
              </NeumorphicView>

              <NeumorphicView
                variant={filter === "active" ? "inset" : "raised"}
                accent={filter === "active" ? "action" : "none"}
                radius={RADIUS_CARD}
                style={styles.filterPill}
                onPress={() => setFilter("active")}
              >
                <Text style={filter === "active" ? styles.filterPillActiveText : styles.filterPillInactiveText}>ACTIVE (LIVE)</Text>
              </NeumorphicView>

              <NeumorphicView
                variant={filter === "completed" ? "inset" : "raised"}
                accent={filter === "completed" ? "action" : "none"}
                radius={RADIUS_CARD}
                style={styles.filterPill}
                onPress={() => setFilter("completed")}
              >
                <Text style={filter === "completed" ? styles.filterPillActiveText : styles.filterPillInactiveText}>COMPLETED</Text>
              </NeumorphicView>
            </ScrollView>

            {/* Featured quest card — derived from the real quest list, never a fixed id */}
            {filter !== "completed" && featuredQuest && (
              <NeumorphicView variant="raised" accent="action" radius={RADIUS_CARD} style={styles.featureCard}>
                <NeumorphicView variant="inset" radius={10} style={styles.premiumBadge}>
                  <MaterialIcons name="stars" size={14} color={actionColor} />
                  <Text style={styles.premiumText}>FEATURED QUEST</Text>
                </NeumorphicView>
                <Text style={styles.featureTitle}>{featuredQuest.name}</Text>
                <Text style={styles.featureDesc}>
                  Complete this quest at {featuredQuest.venueName} to claim your reward.
                </Text>
                <View style={styles.featureFooter}>
                  <View style={styles.featureReward}>
                    <MaterialIcons name="card-giftcard" size={18} color={rewardColor} />
                    <RewardText style={styles.featureRewardText} numberOfLines={1}>{featuredQuest.rewardDescription}</RewardText>
                  </View>
                  <NeumorphicView
                    variant="raised"
                    accent="action"
                    radius={RADIUS_CARD}
                    style={styles.initiateBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/quest/[id]",
                        params: {
                          id: featuredQuest.id,
                          name: featuredQuest.name,
                          venueName: featuredQuest.venueName,
                          rewardDescription: featuredQuest.rewardDescription,
                          completed: String(featuredQuest.completed),
                          markerId: featuredQuest.markerId ?? "",
                        },
                      })
                    }
                  >
                    <Text style={styles.initiateBtnText}>START</Text>
                    <MaterialIcons name="arrow-forward" size={16} color={actionColor} />
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
            radius={RADIUS_CARD}
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
                  color={item.completed ? "#10B981" : actionColor}
                />
              </NeumorphicView>
              <NeumorphicView variant="inset" radius={10} style={styles.statusBadge}>
                {item.completed ? (
                  <>
                    <MaterialIcons name="check-circle" size={12} color="#10B981" />
                    <Text style={styles.statusCompleted}>COMPLETED</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.pulsingDot} />
                    <Text style={styles.statusActive}>ACTIVE</Text>
                  </>
                )}
              </NeumorphicView>
            </View>

            <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.cardVenue} numberOfLines={1}>{item.venueName}</Text>

            <View style={styles.cardBottomRow}>
              <View style={styles.xpTag}>
                <MaterialIcons name="military-tech" size={18} color={rewardColor} />
                <RewardText style={styles.xpText} numberOfLines={1}>
                  +250 PTS • {item.rewardDescription}
                </RewardText>
              </View>

              {!item.completed && (
                <NeumorphicView
                  variant="raised"
                  accent="action"
                  radius={RADIUS_CARD}
                  style={styles.scanBtn}
                  onPress={() => router.push(`/scan/${item.markerId || item.id}`)}
                >
                  <MaterialIcons name="qr-code-scanner" size={16} color={actionColor} />
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

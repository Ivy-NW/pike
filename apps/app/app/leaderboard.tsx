import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Platform, StatusBar } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import type { LeaderboardEntry, LeaderboardResponse } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme, useSemanticColors, RADIUS_CARD } from "@/theme";
import { NeumorphicView } from "@/components/NeumorphicView";
import { useRewardColor } from "@/components/RewardAccent";

/** Stitch Neumorphic Reputational Leaderboard */
export default function LeaderboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.colors;
  const isDark = theme.mode === "dark";
  const semantic = useSemanticColors();
  const rewardColor = useRewardColor();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState(false);
  const [timeFilter, setTimeFilter] = useState<"all" | "month" | "week">("all");

  const topPadding = Math.max(
    insets.top,
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 16
  ) + 8;

  useEffect(() => {
    let alive = true;
    api
      .leaderboardGlobal()
      .then((res) => alive && setData(res))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? "#000000" : c.surface },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: topPadding,
      paddingBottom: 14,
      paddingHorizontal: 16,
      backgroundColor: isDark ? "#000000" : c.surface,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(156, 124, 74, 0.12)" : "rgba(15, 23, 42, 0.06)",
      zIndex: 100,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    headerTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, fontSize: 22, fontWeight: "700" },
    headerSub: { ...theme.font(theme.type.labelSm), color: semantic.action, marginTop: 1, fontWeight: "600" },

    content: { padding: 16, paddingBottom: 60 },

    // Filter Switcher
    filterRow: { flexDirection: "row", gap: 8, marginBottom: 18 },
    filterPill: { flex: 1, paddingVertical: 8, alignItems: "center", justifyContent: "center", borderRadius: RADIUS_CARD },
    filterPillActiveText: { ...theme.font(theme.type.labelCaps), color: semantic.action, fontSize: 11, fontWeight: "700" },
    filterPillInactiveText: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 11 },

    // Leaderboard Item Row
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      borderRadius: RADIUS_CARD,
      marginBottom: 10,
    },
    rankWell: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    rankText: { ...theme.font(theme.type.headlineSm), color: c.onSurfaceVariant, fontSize: 16, fontWeight: "700" },
    rankTop1: { color: rewardColor },
    rankTop2: { color: "#b79a5e" },
    rankTop3: { color: "#3b82f6" },
    rankMe: { color: semantic.action },

    avatarInitial: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { ...theme.font(theme.type.headlineSm), color: semantic.action, fontSize: 16, fontWeight: "700" },

    name: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 16, fontWeight: "700" },
    level: { ...theme.font(theme.type.labelSm), color: semantic.action, marginTop: 2, fontWeight: "600" },
    scoreWrap: { alignItems: "flex-end" },
    score: { ...theme.font(theme.type.headlineSm), color: semantic.action, fontSize: 17, fontWeight: "700" },
    scoreUnit: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 10 },

    myRankCard: {
      marginTop: 12,
      padding: 16,
      borderRadius: RADIUS_CARD,
    },
    myRankLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 1, marginBottom: 8, fontWeight: "700" },
    emptyText: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginTop: 32 },
  });

  const entries: LeaderboardEntry[] = data?.entries ?? [];
  const currentUserEntry = entries.find((e) => e.isMe);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <NeumorphicView variant="raised" radius={19} style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color={semantic.action} />
          </NeumorphicView>
          <View>
            <Text style={styles.headerTitle}>Leaderboard</Text>
            <Text style={styles.headerSub}>Nairobi Leaderboard</Text>
          </View>
        </View>
        <MaterialIcons name="leaderboard" size={22} color={semantic.action} />
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          data ? <Text style={styles.emptyText}>No leaderboard data yet — be the first to play!</Text> : null
        }
        ListHeaderComponent={
          entries.length === 0 ? null : (
          <>
            {/* Filter Pills */}
            <View style={styles.filterRow}>
              {(["all", "month", "week"] as const).map((filter) => {
                const active = timeFilter === filter;
                return (
                  <NeumorphicView
                    key={filter}
                    variant={active ? "inset" : "raised"}
                    accent={active ? "action" : "none"}
                    radius={RADIUS_CARD}
                    style={styles.filterPill}
                    onPress={() => setTimeFilter(filter)}
                  >
                    <Text style={active ? styles.filterPillActiveText : styles.filterPillInactiveText}>
                      {filter === "all" ? "ALL-TIME" : filter === "month" ? "THIS MONTH" : "THIS WEEK"}
                    </Text>
                  </NeumorphicView>
                );
              })}
            </View>

            {/* Current User Standings Card */}
            {currentUserEntry && (
              <NeumorphicView variant="raised" accent="action" radius={RADIUS_CARD} style={styles.myRankCard}>
                <Text style={styles.myRankLabel}>YOUR STANDING</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <NeumorphicView variant="inset" radius={12} style={styles.rankWell}>
                      <Text style={[styles.rankText, styles.rankMe]}>#{currentUserEntry.rank}</Text>
                    </NeumorphicView>
                    <View>
                      <Text style={styles.name}>@{currentUserEntry.username}</Text>
                      <Text style={styles.level}>Level {currentUserEntry.level} Player</Text>
                    </View>
                  </View>
                  <View style={styles.scoreWrap}>
                    <Text style={styles.score}>{currentUserEntry.score.toLocaleString()}</Text>
                    <Text style={styles.scoreUnit}>PTS</Text>
                  </View>
                </View>
              </NeumorphicView>
            )}

            <View style={{ height: 16 }} />
          </>
          )
        }
        renderItem={({ item }) => {
          const isTop1 = item.rank === 1;
          const isTop2 = item.rank === 2;
          const isTop3 = item.rank === 3;
          return (
            <NeumorphicView
              variant="raised"
              accent={isTop1 ? "reward" : item.isMe ? "action" : "none"}
              radius={RADIUS_CARD}
              style={styles.row}
            >
              <NeumorphicView variant="inset" radius={12} style={styles.rankWell}>
                <Text
                  style={[
                    styles.rankText,
                    isTop1 && styles.rankTop1,
                    isTop2 && styles.rankTop2,
                    isTop3 && styles.rankTop3,
                    item.isMe && styles.rankMe,
                  ]}
                >
                  {isTop1 ? "👑" : `#${item.rank}`}
                </Text>
              </NeumorphicView>

              <NeumorphicView variant="inset" radius={18} style={styles.avatarInitial}>
                <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
              </NeumorphicView>

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>@{item.username}</Text>
                <Text style={styles.level}>Level {item.level} Player</Text>
              </View>

              <View style={styles.scoreWrap}>
                <Text style={styles.score}>{item.score.toLocaleString()}</Text>
                <Text style={styles.scoreUnit}>PTS</Text>
              </View>
            </NeumorphicView>
          );
        }}
      />
    </View>
  );
}

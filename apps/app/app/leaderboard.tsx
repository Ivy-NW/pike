import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Platform } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import type { LeaderboardEntry, LeaderboardResponse } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { NeumorphicView } from "@/components/NeumorphicView";

/** Stitch Neumorphic Reputational Leaderboard */
export default function LeaderboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.colors;
  const isDark = theme.mode === "dark";
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState(false);
  const [timeFilter, setTimeFilter] = useState<"all" | "month" | "week">("all");

  const topPadding = Platform.OS === "web" ? 14 : Math.max(insets.top, 14) + 6;

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
    container: { flex: 1, backgroundColor: isDark ? "#141314" : c.surface },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: topPadding,
      paddingBottom: 14,
      paddingHorizontal: 16,
      backgroundColor: isDark ? "#141314" : c.surface,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.04)",
      zIndex: 100,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    headerTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.primary, fontSize: 22, fontWeight: "700" },
    headerSub: { ...theme.font(theme.type.labelSm), color: "#00dbe9", marginTop: 1 },

    content: { padding: 16, paddingBottom: 60 },

    // Filter Switcher
    filterRow: { flexDirection: "row", gap: 8, marginBottom: 18 },
    filterPill: { flex: 1, paddingVertical: 8, alignItems: "center", justifyContent: "center" },
    filterPillText: { ...theme.font(theme.type.labelCaps), fontSize: 11, letterSpacing: 0.8 },

    // Leaderboard Item Row
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      borderRadius: 20,
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
    rankTop1: { color: "#f59e0b" },
    rankTop2: { color: "#cfc5ba" },
    rankTop3: { color: "#e1d2ff" },
    rankMe: { color: "#00f0ff" },

    avatarInitial: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.08)",
    },
    avatarText: { ...theme.font(theme.type.headlineSm), color: c.primary, fontSize: 16 },

    name: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 16 },
    level: { ...theme.font(theme.type.labelSm), color: "#00dbe9", marginTop: 2 },
    scoreWrap: { alignItems: "flex-end" },
    score: { ...theme.font(theme.type.headlineSm), color: c.primary, fontSize: 17, fontWeight: "700" },
    scoreUnit: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 10 },

    myRankCard: {
      marginTop: 12,
      padding: 16,
      borderRadius: 22,
      borderTopWidth: 1,
      borderTopColor: "rgba(0, 240, 255, 0.2)",
    },
    myRankHeader: { ...theme.font(theme.type.labelCaps), color: "#00f0ff", letterSpacing: 1.5, marginBottom: 8 },

    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12 },
    muted: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center" },
  });

  const Row = ({ entry, isPinned = false }: { entry: LeaderboardEntry; isPinned?: boolean }) => {
    const isTop1 = entry.rank === 1;
    const isTop2 = entry.rank === 2;
    const isTop3 = entry.rank === 3;
    const isMe = entry.isMe;

    let glowVariant: "cyan" | "gold" | "none" = "none";
    if (isMe) glowVariant = "cyan";
    else if (isTop1) glowVariant = "gold";

    const initial = (entry.username ?? "E").charAt(0).toUpperCase();

    return (
      <NeumorphicView
        variant="raised"
        glow={glowVariant}
        radius={20}
        style={styles.row}
      >
        <NeumorphicView variant="inset" radius={12} style={styles.rankWell}>
          <Text
            style={[
              styles.rankText,
              isTop1 && styles.rankTop1,
              isTop2 && styles.rankTop2,
              isTop3 && styles.rankTop3,
              isMe && styles.rankMe,
            ]}
          >
            {isTop1 ? "👑" : `#${entry.rank}`}
          </Text>
        </NeumorphicView>

        <NeumorphicView variant="inset" radius={18} style={styles.avatarInitial}>
          <Text style={styles.avatarText}>{initial}</Text>
        </NeumorphicView>

        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {isMe ? "You (Vanguard)" : entry.username}
          </Text>
          <Text style={styles.level}>Level {entry.level} • Sector Explorer</Text>
        </View>

        <View style={styles.scoreWrap}>
          <Text style={styles.score}>{entry.score.toLocaleString()}</Text>
          <Text style={styles.scoreUnit}>TOTAL XP</Text>
        </View>
      </NeumorphicView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <NeumorphicView variant="raised" radius={19} style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color={c.primary} />
          </NeumorphicView>
          <View>
            <Text style={styles.headerTitle}>Leaderboard</Text>
            <Text style={styles.headerSub}>Top Explorers in Nairobi Sector</Text>
          </View>
        </View>
        <MaterialIcons name="military-tech" size={26} color="#00f0ff" />
      </View>

      {error ? (
        <View style={styles.center}>
          <MaterialIcons name="wifi-off" size={40} color={c.onSurfaceVariant} />
          <Text style={styles.muted}>Couldn't load sector standings. Pull to refresh.</Text>
        </View>
      ) : !data ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00f0ff" />
        </View>
      ) : (
        <FlatList
          data={data.entries}
          keyExtractor={(e) => e.userId}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.filterRow}>
              <NeumorphicView
                variant={timeFilter === "all" ? "inset" : "raised"}
                radius={14}
                style={styles.filterPill}
                onPress={() => setTimeFilter("all")}
              >
                <Text style={[styles.filterPillText, { color: timeFilter === "all" ? "#00f0ff" : c.onSurfaceVariant }]}>
                  ALL-TIME
                </Text>
              </NeumorphicView>
              <NeumorphicView
                variant={timeFilter === "month" ? "inset" : "raised"}
                radius={14}
                style={styles.filterPill}
                onPress={() => setTimeFilter("month")}
              >
                <Text style={[styles.filterPillText, { color: timeFilter === "month" ? "#00f0ff" : c.onSurfaceVariant }]}>
                  THIS MONTH
                </Text>
              </NeumorphicView>
              <NeumorphicView
                variant={timeFilter === "week" ? "inset" : "raised"}
                radius={14}
                style={styles.filterPill}
                onPress={() => setTimeFilter("week")}
              >
                <Text style={[styles.filterPillText, { color: timeFilter === "week" ? "#00f0ff" : c.onSurfaceVariant }]}>
                  WEEKLY
                </Text>
              </NeumorphicView>
            </View>
          }
          renderItem={({ item }) => <Row entry={item} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.muted}>No ranked explorers yet. Complete a quest in Nairobi to claim #1.</Text>
            </View>
          }
          ListFooterComponent={
            data.me && !data.entries.some((e) => e.isMe) ? (
              <View style={styles.myRankCard}>
                <Text style={styles.myRankHeader}>YOUR CURRENT SECTOR STANDING</Text>
                <Row entry={data.me} isPinned />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

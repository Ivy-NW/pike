import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import type { LeaderboardEntry, LeaderboardResponse } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";

/**
 * Phase 3 — FR-7: reputational leaderboard (UI §7.3/7.5). Global board ranked by XP.
 * Gold is reserved for rewards (UI §2), so the caller's own row is highlighted in Pike Blue,
 * never gold — this is standing, not a reward.
 */
export default function LeaderboardScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState(false);

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
    container: { flex: 1, backgroundColor: c.surface, paddingTop: 60 },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: theme.spacing.containerPadding, marginBottom: theme.spacing.sectionMargin },
    back: { padding: 4 },
    header: { ...theme.font(theme.type.headlineLgMobile), color: c.primary },
    subtitle: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, paddingHorizontal: theme.spacing.containerPadding, marginBottom: theme.spacing.sectionMargin },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginHorizontal: theme.spacing.containerPadding,
      marginBottom: theme.spacing.stackSm,
      padding: theme.spacing.stackMd,
      borderRadius: theme.radius.card,
      backgroundColor: c.slateGray,
      borderWidth: 1,
      borderColor: c.surfaceContainerHighest,
    },
    rowMe: { backgroundColor: c.primaryContainer, borderColor: c.primary },
    rank: { ...theme.font(theme.type.headlineSm), color: c.onSurfaceVariant, width: 32, textAlign: "center" },
    rankMe: { color: c.primary },
    name: { ...theme.font(theme.type.headlineSm), color: c.onSurface, flex: 1 },
    level: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant },
    score: { ...theme.font(theme.type.headlineSm), color: c.onSurface },
    scoreUnit: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant },
    scoreWrap: { alignItems: "flex-end" },
    footer: { borderTopWidth: 1, borderTopColor: c.borderSubtle, paddingTop: theme.spacing.stackMd },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12 },
    muted: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center" },
  });

  const Row = ({ entry }: { entry: LeaderboardEntry }) => (
    <View style={[styles.row, entry.isMe && styles.rowMe]}>
      <Text style={[styles.rank, entry.isMe && styles.rankMe]}>{entry.rank}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{entry.isMe ? "You" : entry.username}</Text>
        <Text style={styles.level}>Level {entry.level}</Text>
      </View>
      <View style={styles.scoreWrap}>
        <Text style={styles.score}>{entry.score.toLocaleString()}</Text>
        <Text style={styles.scoreUnit}>XP</Text>
      </View>
    </View>
  );

  const Header = () => (
    <>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={c.onSurface} />
        </TouchableOpacity>
        <Text style={styles.header}>Leaderboard</Text>
      </View>
      <Text style={styles.subtitle}>Top explorers by XP</Text>
    </>
  );

  if (error) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.center}>
          <MaterialIcons name="wifi-off" size={32} color={c.onSurfaceVariant} />
          <Text style={styles.muted}>Couldn't load the leaderboard. Pull back and try again.</Text>
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.center}>
          <ActivityIndicator color={c.primary} />
        </View>
      </View>
    );
  }

  // Pin the caller's standing at the bottom when they're outside the visible top-N.
  const meOutsideList = data.me && !data.entries.some((e) => e.isMe) ? data.me : null;

  return (
    <View style={styles.container}>
      <FlatList
        data={data.entries}
        keyExtractor={(e) => e.userId}
        ListHeaderComponent={Header}
        renderItem={({ item }) => <Row entry={item} />}
        ListEmptyComponent={<View style={styles.center}><Text style={styles.muted}>No ranked explorers yet. Complete a quest to get on the board.</Text></View>}
        ListFooterComponent={
          meOutsideList ? (
            <View style={styles.footer}>
              <Row entry={meOutsideList} />
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

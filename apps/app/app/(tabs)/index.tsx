import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import type { UserProfile } from "@pike/shared-types";
import { api } from "@/lib/api";
import { colors, radius } from "@/theme";

/** UI doc 7.1 — daily-open identity dashboard: streak (flame, gold) + XP bar (Pike Blue fill). */
export default function HomeScreen() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [walletCount, setWalletCount] = useState<number | null>(null);
  const [questCount, setQuestCount] = useState<number | null>(null);

  useEffect(() => {
    api.me().then(setMe).catch(() => {});
    api.wallet().then((w) => setWalletCount(w.length)).catch(() => setWalletCount(0));
    api.quests().then((q) => setQuestCount(q.filter((x) => !x.completed).length)).catch(() => setQuestCount(0));
  }, []);

  const xpProgress = me ? me.xpIntoLevel / me.xpForNextLevel : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>PIKE</Text>
        {me && me.currentStreak > 0 && (
          <View style={styles.streak}>
            <Text style={styles.streakFlame}>🔥</Text>
            <Text style={styles.streakCount}>{me.currentStreak}</Text>
          </View>
        )}
      </View>

      {me && (
        <View style={styles.card}>
          <View style={styles.xpHeaderRow}>
            <Text style={styles.cardTitle}>Level {me.level}</Text>
            <Text style={styles.xpLabel}>
              {me.xpIntoLevel} / {me.xpForNextLevel} XP
            </Text>
          </View>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${Math.round(xpProgress * 100)}%` }]} />
          </View>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome back</Text>
        <Text style={styles.cardBody}>{walletCount ?? "..."} rewards in your wallet</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quests available</Text>
        <Text style={styles.cardBody}>{questCount ?? "..."} quests you haven't completed yet</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/(tabs)/quests")}>
          <Text style={styles.primaryButtonText}>Browse quests</Text>
        </TouchableOpacity>
      </View>

      {/* TODO(phase-3): "Nearby venues" 2-up card row + macro-quest progress render here. */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray, padding: 20, paddingTop: 60 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  header: { fontSize: 28, fontWeight: "700", color: colors.deepSlate },
  streak: { flexDirection: "row", alignItems: "center", gap: 4 },
  streakFlame: { fontSize: 18 },
  streakCount: { fontSize: 18, fontWeight: "700", color: colors.pikeGold },
  card: { backgroundColor: "white", borderRadius: radius, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: colors.deepSlate, marginBottom: 4 },
  cardBody: { color: "#64748b", marginBottom: 12 },
  xpHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 },
  xpLabel: { fontSize: 12, color: "#64748b" },
  xpTrack: { height: 8, borderRadius: 4, backgroundColor: "#e2e8f0", overflow: "hidden" },
  xpFill: { height: "100%", backgroundColor: colors.pikeBlue, borderRadius: 4 },
  primaryButton: { backgroundColor: colors.pikeBlue, borderRadius: radius, padding: 14, alignItems: "center" },
  primaryButtonText: { color: "white", fontWeight: "600" },
});

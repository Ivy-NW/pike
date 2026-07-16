import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { router } from "expo-router";
import type { UserProfile } from "@pike/shared-types";
import { api } from "@/lib/api";
import { clearIdentityToken } from "@/lib/auth";
import { colors, radius } from "@/theme";

/** UI doc 7.5 — identity, history, and settings. */
export default function ProfileScreen() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [questsCompleted, setQuestsCompleted] = useState<number | null>(null);
  const [rewardsClaimed, setRewardsClaimed] = useState<number | null>(null);

  useEffect(() => {
    api.me().then(setMe).catch(() => {});
    api.quests().then((q) => setQuestsCompleted(q.filter((x) => x.completed).length)).catch(() => {});
    api.wallet().then((w) => setRewardsClaimed(w.length)).catch(() => {});
  }, []);

  const logOut = async () => {
    await clearIdentityToken();
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.name}>{me?.name ?? me?.username ?? "PIKE explorer"}</Text>
        {me && (
          <Text style={styles.levelLine}>
            Level {me.level} · {me.xp} XP total
            {me.longestStreak > 0 ? ` · longest streak ${me.longestStreak}d` : ""}
          </Text>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{questsCompleted ?? "-"}</Text>
          <Text style={styles.statLabel}>Quests completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{rewardsClaimed ?? "-"}</Text>
          <Text style={styles.statLabel}>Rewards claimed</Text>
        </View>
      </View>

      {me && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Badges</Text>
          <FlatList
            data={me.badges}
            numColumns={3}
            scrollEnabled={false}
            keyExtractor={(b) => b.key}
            renderItem={({ item }) => {
              const earned = !!item.earnedAt;
              return (
                <View style={styles.badgeSlot}>
                  <View style={[styles.badgeIcon, !earned && styles.badgeIconLocked]}>
                    <Text style={{ fontSize: 22, opacity: earned ? 1 : 0.35 }}>🏅</Text>
                  </View>
                  <Text style={[styles.badgeName, !earned && styles.badgeNameLocked]} numberOfLines={2}>
                    {item.name}
                  </Text>
                </View>
              );
            }}
          />
        </View>
      )}

      {/* TODO(phase-3): favorited venues list (drives push notification triggers) renders here. */}

      <TouchableOpacity style={styles.dangerButton} onPress={logOut}>
        <Text style={styles.dangerButtonText}>Log out</Text>
      </TouchableOpacity>

      {/*
        App Store guideline 5.1.1(v): account creation requires in-app account deletion,
        not just a support ticket. TODO: wire this to a real DELETE /users/me endpoint
        that removes XP/streak/reward-wallet data (PRD section 13).
      */}
      <TouchableOpacity style={styles.linkButton}>
        <Text style={styles.linkText}>Delete my account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray, padding: 20, paddingTop: 60 },
  header: { fontSize: 28, fontWeight: "700", color: colors.deepSlate, marginBottom: 20 },
  card: { backgroundColor: "white", borderRadius: radius, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: colors.deepSlate, marginBottom: 12 },
  name: { fontSize: 18, fontWeight: "600", color: colors.deepSlate },
  levelLine: { color: "#64748b", fontSize: 13, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: "white", borderRadius: radius, padding: 16, alignItems: "center" },
  statNumber: { fontSize: 24, fontWeight: "700", color: colors.pikeBlue },
  statLabel: { color: "#64748b", fontSize: 12, marginTop: 4, textAlign: "center" },
  badgeSlot: { flex: 1 / 3, alignItems: "center", marginBottom: 14 },
  badgeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  badgeIconLocked: { backgroundColor: "#f1f5f9" },
  badgeName: { fontSize: 11, color: colors.deepSlate, textAlign: "center" },
  badgeNameLocked: { color: "#94a3b8" },
  dangerButton: { backgroundColor: "white", borderRadius: radius, padding: 14, alignItems: "center", borderWidth: 1, borderColor: colors.danger, marginTop: 20 },
  dangerButtonText: { color: colors.danger, fontWeight: "600" },
  linkButton: { padding: 14, alignItems: "center" },
  linkText: { color: "#94a3b8", fontSize: 13 },
});

import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { api } from "@/lib/api";
import { clearIdentityToken } from "@/lib/auth";
import { colors, radius } from "@/theme";

/** UI doc 7.5 — identity, history, and settings. */
export default function ProfileScreen() {
  const [me, setMe] = useState<any>(null);
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
        <Text style={styles.name}>{me?.displayName ?? me?.phone ?? me?.email ?? "PIKE explorer"}</Text>
        {/* TODO(phase-2): level, total XP, streak history render here. */}
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

      {/* TODO(phase-2): badge grid (earned + locked states) renders here. */}
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
  name: { fontSize: 18, fontWeight: "600", color: colors.deepSlate },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: "white", borderRadius: radius, padding: 16, alignItems: "center" },
  statNumber: { fontSize: 24, fontWeight: "700", color: colors.pikeBlue },
  statLabel: { color: "#64748b", fontSize: 12, marginTop: 4, textAlign: "center" },
  dangerButton: { backgroundColor: "white", borderRadius: radius, padding: 14, alignItems: "center", borderWidth: 1, borderColor: colors.danger, marginTop: 20 },
  dangerButtonText: { color: colors.danger, fontWeight: "600" },
  linkButton: { padding: 14, alignItems: "center" },
  linkText: { color: "#94a3b8", fontSize: 13 },
});

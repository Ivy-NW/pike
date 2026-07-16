import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { api } from "@/lib/api";
import { colors, radius } from "@/theme";

/** UI doc 7.1 — daily-open identity dashboard. */
export default function HomeScreen() {
  const [walletCount, setWalletCount] = useState<number | null>(null);
  const [questCount, setQuestCount] = useState<number | null>(null);

  useEffect(() => {
    api.wallet().then((w) => setWalletCount(w.length)).catch(() => setWalletCount(0));
    api.quests().then((q) => setQuestCount(q.filter((x) => !x.completed).length)).catch(() => setQuestCount(0));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>PIKE</Text>

      {/* TODO(phase-2): XP bar (level, current/next-level XP) and streak flame icon render here. */}
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
  header: { fontSize: 28, fontWeight: "700", color: colors.deepSlate, marginBottom: 20 },
  card: { backgroundColor: "white", borderRadius: radius, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: colors.deepSlate, marginBottom: 4 },
  cardBody: { color: "#64748b", marginBottom: 12 },
  primaryButton: { backgroundColor: colors.pikeBlue, borderRadius: radius, padding: 14, alignItems: "center" },
  primaryButtonText: { color: "white", fontWeight: "600" },
});

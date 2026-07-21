import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import type { UserProfile } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { Logo } from "@/components/Logo";

/** UI doc 7.1 — daily-open identity dashboard: streak (flame, gold) + XP bar (Pike Blue fill). */
export default function HomeScreen() {
  const theme = useTheme();
  const [me, setMe] = useState<UserProfile | null>(null);
  const [walletCount, setWalletCount] = useState<number | null>(null);
  const [questCount, setQuestCount] = useState<number | null>(null);

  useEffect(() => {
    api.me().then(setMe).catch(() => {});
    api.wallet().then((w) => setWalletCount(w.length)).catch(() => setWalletCount(0));
    api.quests().then((q) => setQuestCount(q.filter((x) => !x.completed).length)).catch(() => setQuestCount(0));
  }, []);

  const xpProgress = me ? me.xpIntoLevel / me.xpForNextLevel : 0;
  const c = theme.colors;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: c.surface, padding: theme.spacing.containerPadding, paddingTop: 60 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.sectionMargin },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    header: { ...theme.font(theme.type.headlineLgMobile), color: c.primary },
    streak: { flexDirection: "row", alignItems: "center", gap: 4 },
    streakCount: { ...theme.font(theme.type.headlineSm), color: c.secondary },
    card: {
      backgroundColor: theme.mode === "dark" ? "rgba(30,41,59,0.7)" : c.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.05)" : c.borderSubtle,
      borderRadius: theme.radius.card,
      padding: theme.spacing.stackMd,
      marginBottom: theme.spacing.stackMd,
    },
    xpHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface },
    xpLabel: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant },
    xpTrack: { height: 8, borderRadius: 4, backgroundColor: c.surfaceContainerHighest, overflow: "hidden" },
    xpFill: { height: "100%", backgroundColor: c.primaryContainer, borderRadius: 4 },
    cardBody: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginBottom: 12 },
    primaryButton: { backgroundColor: c.primaryContainer, borderRadius: theme.radius.card, padding: 14, alignItems: "center" },
    primaryButtonText: { ...theme.font(theme.type.labelCaps), color: c.onPrimaryContainer },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Logo size={28} />
          <Text style={styles.header}>PIKE</Text>
        </View>
        {me && me.currentStreak > 0 && (
          <View style={styles.streak}>
            <MaterialIcons name="whatshot" size={18} color={c.secondary} />
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

      {/* TODO(phase-3): macro-quest progress renders here. */}
    </View>
  );
}

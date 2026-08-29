import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import type { MacroQuestProgress, UserProfile } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";
import { NeumorphicView } from "@/components/NeumorphicView";

/** UI doc 7.1 — daily-open identity dashboard with tactile neumorphic surfaces. */
export default function HomeScreen() {
  const theme = useTheme();
  const [me, setMe] = useState<UserProfile | null>(null);
  const [walletCount, setWalletCount] = useState<number | null>(null);
  const [questCount, setQuestCount] = useState<number | null>(null);
  const [macro, setMacro] = useState<MacroQuestProgress | null>(null);

  useEffect(() => {
    api.me().then(setMe).catch(() => {});
    api.wallet().then((w) => setWalletCount(w.length)).catch(() => setWalletCount(0));
    api.quests().then((q) => setQuestCount(q.filter((x) => !x.completed).length)).catch(() => setQuestCount(0));
    api.macroQuest().then(setMacro).catch(() => {});
  }, []);

  const xpProgress = me ? me.xpIntoLevel / me.xpForNextLevel : 0;
  const earnedBadgeCount = me ? me.badges.filter((badge) => badge.earnedAt).length : 0;
  const c = theme.colors;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: c.surface },
    content: { padding: theme.spacing.containerPadding, paddingTop: 16, paddingBottom: 110 },
    streakBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    streakCount: { ...theme.font(theme.type.headlineSm), color: c.secondary, fontSize: 14 },
    card: {
      padding: theme.spacing.stackMd + 2,
      marginBottom: theme.spacing.stackMd + 4,
    },
    xpHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface },
    xpLabel: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant },
    xpTrack: { height: 10, padding: 2, justifyContent: "center" },
    xpFill: { height: "100%", backgroundColor: c.primaryContainer, borderRadius: 4 },
    cardBody: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginBottom: 14 },
    progressGrid: { flexDirection: "row", gap: 10 },
    progressItem: {
      flex: 1,
      minHeight: 82,
      padding: 10,
      justifyContent: "space-between",
    },
    progressValue: { ...theme.font(theme.type.headlineSm), color: c.onSurface },
    progressLabel: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, fontSize: 10 },
    primaryButton: { padding: 14, alignItems: "center", marginTop: 4 },
    primaryButtonText: { ...theme.font(theme.type.labelCaps), color: "#ffffff", letterSpacing: 0.5 },
    macroDots: { flexDirection: "row", gap: 6, marginTop: 14, flexWrap: "wrap" },
    macroDot: { flexDirection: "row", alignItems: "center", gap: 4 },
    macroDotLabel: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant },
    macroHint: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, marginTop: 12 },
    rewardRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
    rewardText: { ...theme.font(theme.type.labelSm), color: c.secondary, flex: 1 },
  });

  const rightAction =
    me && me.currentStreak > 0 ? (
      <NeumorphicView variant="raised" glow="gold" radius={20} style={styles.streakBadge}>
        <MaterialIcons name="whatshot" size={16} color={c.secondary} />
        <Text style={styles.streakCount}>{me.currentStreak}d</Text>
      </NeumorphicView>
    ) : undefined;

  return (
    <View style={styles.container}>
      <TopNav title="PIKE" showLogo rightAction={rightAction} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PwaInstallBanner />

        {me && (
          <NeumorphicView variant="raised" style={styles.card}>
            <View style={styles.xpHeaderRow}>
              <Text style={styles.cardTitle}>Level {me.level}</Text>
              <Text style={styles.xpLabel}>
                {me.xpIntoLevel} / {me.xpForNextLevel} XP
              </Text>
            </View>
            <NeumorphicView variant="inset" radius={6} style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${Math.round(xpProgress * 100)}%` }]} />
            </NeumorphicView>
          </NeumorphicView>
        )}

        {me && (
          <NeumorphicView variant="raised" style={styles.card}>
            <Text style={styles.cardTitle}>Identity progress</Text>
            <Text style={styles.cardBody}>Streaks and badges update when you claim verified quests.</Text>
            <View style={styles.progressGrid}>
              <NeumorphicView variant="inset" radius={14} style={styles.progressItem}>
                <MaterialIcons name="whatshot" size={22} color={c.secondary} />
                <Text style={styles.progressValue}>{me.currentStreak}</Text>
                <Text style={styles.progressLabel}>Current streak</Text>
              </NeumorphicView>
              <NeumorphicView variant="inset" radius={14} style={styles.progressItem}>
                <MaterialIcons name="timeline" size={22} color={c.primary} />
                <Text style={styles.progressValue}>{me.longestStreak}</Text>
                <Text style={styles.progressLabel}>Best streak</Text>
              </NeumorphicView>
              <NeumorphicView variant="inset" radius={14} style={styles.progressItem}>
                <MaterialIcons name="stars" size={22} color={c.secondary} />
                <Text style={styles.progressValue}>{earnedBadgeCount}</Text>
                <Text style={styles.progressLabel}>Badges earned</Text>
              </NeumorphicView>
            </View>
          </NeumorphicView>
        )}

        <NeumorphicView variant="raised" style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardBody}>{walletCount ?? "..."} rewards in your wallet</Text>
        </NeumorphicView>

        <NeumorphicView variant="raised" style={styles.card}>
          <Text style={styles.cardTitle}>Quests available</Text>
          <Text style={styles.cardBody}>{questCount ?? "..."} quests you haven't completed yet</Text>
          <NeumorphicView
            variant="raised"
            glow="blue"
            radius={theme.radius.card}
            style={styles.primaryButton}
            onPress={() => router.push("/(tabs)/quests")}
          >
            <Text style={styles.primaryButtonText}>BROWSE QUESTS</Text>
          </NeumorphicView>
        </NeumorphicView>

        {/* Multi-venue macro-quest tracker */}
        {macro && (
          <NeumorphicView variant="raised" glow={macro.completed ? "gold" : "none"} style={styles.card}>
            <View style={styles.xpHeaderRow}>
              <Text style={styles.cardTitle}>{macro.name}</Text>
              <Text style={styles.xpLabel}>{macro.visitedCount} / {macro.requiredVenues} venues</Text>
            </View>
            <Text style={styles.cardBody}>{macro.description}</Text>
            <NeumorphicView variant="inset" radius={6} style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${Math.min(100, Math.round((macro.visitedCount / macro.requiredVenues) * 100))}%` }]} />
            </NeumorphicView>
            <View style={styles.macroDots}>
              {macro.venues.map((v) => (
                <View key={v.id} style={styles.macroDot}>
                  <MaterialIcons
                    name={v.visited ? "check-circle" : "radio-button-unchecked"}
                    size={15}
                    color={v.visited ? c.primary : c.outline}
                  />
                  <Text style={styles.macroDotLabel}>{v.name}</Text>
                </View>
              ))}
            </View>
            {macro.completed ? (
              <View style={styles.rewardRow}>
                <MaterialIcons name="emoji-events" size={18} color={c.secondary} />
                <Text style={styles.rewardText}>Reward unlocked — {macro.reward.description}</Text>
              </View>
            ) : (
              <Text style={styles.macroHint}>
                Visit {macro.requiredVenues - macro.visitedCount} more to unlock the top reward
              </Text>
            )}
          </NeumorphicView>
        )}
      </ScrollView>
    </View>
  );
}

import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import type { MacroQuestProgress, UserProfile, UserQuestListItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme, useSemanticColors } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";
import { NeumorphicView } from "@/components/NeumorphicView";
import { useRewardColor } from "@/components/RewardAccent";

/**
 * Neumorphic Dashboard / Home Feed
 * Unified PIKE Logo Imperial Gold & Sapphire Blue Palette
 */
export default function HomeScreen() {
  const theme = useTheme();
  const semantic = useSemanticColors();
  const rewardColor = useRewardColor();
  const [me, setMe] = useState<UserProfile | null>(null);
  const [quests, setQuests] = useState<UserQuestListItem[]>([]);
  const [macro, setMacro] = useState<MacroQuestProgress | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [u, q, m] = await Promise.all([
        api.me().catch(() => null),
        api.quests().catch(() => []),
        api.macroQuest().catch(() => null),
      ]);
      setMe(u);
      setQuests(q);
      setMacro(m);
    } catch {
      // offline fallback handled by api wrapper
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const xpProgress = me && me.xpForNextLevel > 0 ? me.xpIntoLevel / me.xpForNextLevel : 0.68;
  const c = theme.colors;
  const isDark = theme.mode === "dark";

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? "#000000" : c.surface },
    content: { padding: 16, paddingTop: 14, paddingBottom: 130 },

    // Welcome Banner
    welcomeSection: { marginBottom: 18 },
    welcomeTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, fontSize: 24, fontWeight: "700" },
    welcomeAccent: { color: semantic.action },

    // Streak Pill
    streakBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    streakCount: { ...theme.font(theme.type.labelCaps), color: rewardColor, fontSize: 11, fontWeight: "700" },

    // XP Progress Card
    xpCard: { padding: 18, marginBottom: 18 },
    tierRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    labelCaps: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 1.2, fontWeight: "700" },
    tierName: { ...theme.font(theme.type.headlineSm), color: semantic.action, fontSize: 18, fontWeight: "700", marginTop: 2 },
    xpValue: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 18, fontWeight: "700", marginTop: 2 },
    xpTrack: { width: "100%", height: 10, padding: 2, borderRadius: 5, overflow: "hidden" },
    xpFill: { height: "100%", borderRadius: 3, backgroundColor: semantic.action },

    // Quests Section Card
    questsCard: { padding: 18, marginBottom: 18 },
    questsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
    questsTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 18, fontWeight: "700" },
    questItemWell: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 16, marginBottom: 10 },
    questName: { ...theme.font(theme.type.bodyMd), color: c.onSurface, fontWeight: "700" },
    questVenue: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, marginTop: 2, fontSize: 11 },
    questXpTag: { ...theme.font(theme.type.labelCaps), color: rewardColor, fontWeight: "700" },
    questsEmpty: { alignItems: "center", justifyContent: "center", paddingVertical: 22, gap: 8 },
    questsEmptyText: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center" },
    viewAllButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 16, marginTop: 6 },
    viewAllText: { ...theme.font(theme.type.labelCaps), color: semantic.action, fontSize: 11, fontWeight: "700" },

    // Macro Quest Card
    macroDots: { flexDirection: "row", gap: 6, marginTop: 14, flexWrap: "wrap" },
    macroDot: { flexDirection: "row", alignItems: "center", gap: 4 },
    macroDotLabel: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant },
    macroHint: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, marginTop: 12 },
    rewardRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
    rewardText: { ...theme.font(theme.type.labelSm), color: rewardColor, flex: 1, fontWeight: "700" },
  });

  const rightAction =
    me && me.currentStreak > 0 ? (
      <NeumorphicView variant="raised" accent="reward" radius={16} style={styles.streakBadge}>
        <MaterialIcons name="local-fire-department" size={18} color={rewardColor} />
        <Text style={styles.streakCount}>{me.currentStreak}d</Text>
      </NeumorphicView>
    ) : undefined;

  const activeQuests = quests.filter((q) => !q.completed).slice(0, 3);

  return (
    <View style={styles.container}>
      <TopNav title="PIKE" showLogo rightAction={rightAction} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={semantic.action}
            colors={[semantic.action]}
          />
        }
      >
        <PwaInstallBanner />

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            {me?.name ? (
              <>
                Welcome back, <Text style={styles.welcomeAccent}>{me.name}</Text>
              </>
            ) : (
              "Welcome back"
            )}
          </Text>
        </View>

        {/* XP Progress Card */}
        <NeumorphicView variant="raised" accent="action" style={styles.xpCard}>
          <View style={styles.tierRow}>
            <View>
              <Text style={styles.labelCaps}>CURRENT TIER</Text>
              <Text style={styles.tierName}>Level {me?.level ?? 2}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.labelCaps}>XP TO NEXT</Text>
              <Text style={styles.xpValue}>{me ? me.xpForNextLevel - me.xpIntoLevel : 1240}</Text>
            </View>
          </View>
          <NeumorphicView variant="inset" radius={5} style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${Math.round(xpProgress * 100)}%` }]} />
          </NeumorphicView>
        </NeumorphicView>

        {/* Active Quests Card */}
        <NeumorphicView variant="raised" style={styles.questsCard}>
          <View style={styles.questsHeader}>
            <MaterialIcons name="radar" size={20} color={semantic.action} />
            <Text style={styles.questsTitle}>Active Quests</Text>
          </View>

          {activeQuests.length === 0 ? (
            <View style={styles.questsEmpty}>
              <MaterialIcons name="explore" size={26} color={c.onSurfaceVariant} />
              <Text style={styles.questsEmptyText}>No active quests yet — check the map to find one nearby.</Text>
            </View>
          ) : (
            activeQuests.map((q) => (
              <NeumorphicView
                key={q.id}
                variant="inset"
                radius={14}
                style={styles.questItemWell}
                onPress={() => router.push(`/quest/${q.id}`)}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.questName} numberOfLines={1}>{q.name}</Text>
                  <Text style={styles.questVenue}>{q.venueName.toUpperCase()}</Text>
                </View>
                <Text style={styles.questXpTag}>+250 XP</Text>
              </NeumorphicView>
            ))
          )}

          <NeumorphicView
            variant="raised"
            accent="action"
            radius={16}
            style={styles.viewAllButton}
            onPress={() => router.push("/(tabs)/quests")}
          >
            <Text style={styles.viewAllText}>VIEW ALL QUESTS</Text>
            <MaterialIcons name="arrow-forward" size={18} color={semantic.action} />
          </NeumorphicView>
        </NeumorphicView>

        {/* Macro-quest / Multi-venue deep dive */}
        {macro && (
          <NeumorphicView variant="raised" accent={macro.completed ? "reward" : "none"} style={styles.questsCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <Text style={styles.questsTitle}>{macro.name}</Text>
              <Text style={styles.labelCaps}>{macro.visitedCount} / {macro.requiredVenues} VENUES</Text>
            </View>
            <Text style={{ ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginBottom: 12 }}>{macro.description}</Text>
            <NeumorphicView variant="inset" radius={5} style={{ width: "100%", height: 8, padding: 2 }}>
              <View style={[styles.xpFill, { width: `${Math.min(100, Math.round((macro.visitedCount / macro.requiredVenues) * 100))}%` }]} />
            </NeumorphicView>
            <View style={styles.macroDots}>
              {macro.venues.map((v) => (
                <View key={v.id} style={styles.macroDot}>
                  <MaterialIcons
                    name={v.visited ? "check-circle" : "radio-button-unchecked"}
                    size={14}
                    color={v.visited ? "#10B981" : c.outline}
                  />
                  <Text style={styles.macroDotLabel}>{v.name}</Text>
                </View>
              ))}
            </View>
            <View style={styles.rewardRow}>
              <MaterialIcons name="card-giftcard" size={16} color={rewardColor} />
              <Text style={styles.rewardText}>Reward: {macro.reward.description}</Text>
            </View>
          </NeumorphicView>
        )}
      </ScrollView>
    </View>
  );
}

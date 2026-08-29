import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import type { MacroQuestProgress, UserProfile, UserQuestListItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";
import { NeumorphicView } from "@/components/NeumorphicView";

/** Stitch PIKE Home - Safe Neumorphism */
export default function HomeScreen() {
  const theme = useTheme();
  const [me, setMe] = useState<UserProfile | null>(null);
  const [walletCount, setWalletCount] = useState<number | null>(null);
  const [quests, setQuests] = useState<UserQuestListItem[]>([]);
  const [macro, setMacro] = useState<MacroQuestProgress | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [profileData, questsData, walletData, macroData] = await Promise.allSettled([
        api.me(),
        api.quests(),
        api.wallet(),
        api.macroQuest(),
      ]);
      if (profileData.status === "fulfilled") setMe(profileData.value);
      if (questsData.status === "fulfilled") setQuests(questsData.value);
      if (walletData.status === "fulfilled") setWalletCount(walletData.value.length);
      if (macroData.status === "fulfilled") setMacro(macroData.value);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMobilityPress = () => {
    Alert.alert(
      "Mobility Track: Adept",
      "Your exploration traversal rating is in the top 15% of active Vanguards in this sector.",
      [{ text: "Great", style: "default" }]
    );
  };

  const handleIntellectPress = () => {
    Alert.alert(
      "Intellect Track: Savant",
      "You have deciphered multiple complex AR markers and node alignments.",
      [{ text: "Nice", style: "default" }]
    );
  };

  const xpProgress = me ? me.xpIntoLevel / me.xpForNextLevel : 0.65;
  const c = theme.colors;
  const isDark = theme.mode === "dark";

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? "#141314" : c.surface },
    content: { padding: theme.spacing.containerPadding, paddingTop: 16, paddingBottom: 120 },
    welcomeSection: { marginBottom: 20 },
    welcomeTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface },
    welcomeCyan: { color: "#00f0ff" },
    welcomeSub: { ...theme.font(theme.type.bodyLg), color: c.onSurfaceVariant, marginTop: 4 },
    streakBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    streakCount: { ...theme.font(theme.type.headlineSm), color: "#00dbe9", fontSize: 13 },
    
    // XP Progress Card
    xpCard: { padding: 20, marginBottom: 16 },
    tierRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 },
    labelCaps: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 1 },
    tierName: { ...theme.font(theme.type.headlineSm), color: "#7df4ff", marginTop: 2 },
    xpValue: { ...theme.font(theme.type.headlineSm), color: c.primary, marginTop: 2 },
    xpTrack: { width: "100%", height: 12, borderRadius: 6, padding: 2 },
    xpFill: { height: "100%", backgroundColor: "#00f0ff", borderRadius: 4 },

    // Identity Modules Bento Grid
    moduleGrid: { flexDirection: "row", gap: 12, marginBottom: 16 },
    moduleCard: { flex: 1, padding: 18, alignItems: "center", justifyContent: "center", gap: 10 },
    moduleWell: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
    moduleTitle: { ...theme.font(theme.type.bodyLg), color: c.onSurface, fontWeight: "700" },
    moduleSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, fontSize: 12 },

    // Active Quests / Transmissions Card
    questsCard: { padding: 20, marginBottom: 16 },
    questsHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)", marginBottom: 14 },
    questsTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface },
    questItemWell: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderRadius: 12, marginBottom: 10 },
    questName: { ...theme.font(theme.type.bodyMd), color: c.onSurface, fontWeight: "700" },
    questVenue: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 10, marginTop: 2 },
    questXpTag: { ...theme.font(theme.type.labelCaps), color: "#00f0ff", fontSize: 11 },
    viewAllButton: { padding: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 6 },
    viewAllText: { ...theme.font(theme.type.labelCaps), color: "#00f0ff", letterSpacing: 1 },

    // Macro Quest Card
    macroDots: { flexDirection: "row", gap: 6, marginTop: 14, flexWrap: "wrap" },
    macroDot: { flexDirection: "row", alignItems: "center", gap: 4 },
    macroDotLabel: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant },
    macroHint: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, marginTop: 12 },
    rewardRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
    rewardText: { ...theme.font(theme.type.labelSm), color: "#f59e0b", flex: 1 },
  });

  const rightAction =
    me && me.currentStreak > 0 ? (
      <NeumorphicView variant="raised" glow="cyan" radius={20} style={styles.streakBadge}>
        <MaterialIcons name="local-fire-department" size={16} color="#00dbe9" />
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
            tintColor="#00f0ff"
            colors={["#00f0ff"]}
          />
        }
      >
        <PwaInstallBanner />

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back, <Text style={styles.welcomeCyan}>Vanguard</Text></Text>
          <Text style={styles.welcomeSub}>Your physical realm sync is 84% complete.</Text>
        </View>

        {/* XP Progress Card */}
        <NeumorphicView variant="raised" radius={20} style={styles.xpCard}>
          <View style={styles.tierRow}>
            <View>
              <Text style={styles.labelCaps}>CURRENT TIER</Text>
              <Text style={styles.tierName}>Cybernetics Lvl {me?.level ?? 4}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.labelCaps}>XP TO NEXT</Text>
              <Text style={styles.xpValue}>{me ? me.xpForNextLevel - me.xpIntoLevel : 1240}</Text>
            </View>
          </View>
          <NeumorphicView variant="inset" radius={6} style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${Math.round(xpProgress * 100)}%` }]} />
          </NeumorphicView>
        </NeumorphicView>

        {/* Identity Progress Modules (Bento Grid) */}
        <View style={styles.moduleGrid}>
          <NeumorphicView variant="raised" radius={20} style={styles.moduleCard} onPress={handleMobilityPress}>
            <NeumorphicView variant="inset" radius={28} style={styles.moduleWell}>
              <MaterialIcons name="directions-run" size={28} color="#7df4ff" />
            </NeumorphicView>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.moduleTitle}>Mobility</Text>
              <Text style={styles.moduleSub}>Adept</Text>
            </View>
          </NeumorphicView>

          <NeumorphicView variant="raised" radius={20} style={styles.moduleCard} onPress={handleIntellectPress}>
            <NeumorphicView variant="inset" radius={28} style={styles.moduleWell}>
              <MaterialIcons name="psychology" size={28} color="#00f0ff" />
            </NeumorphicView>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.moduleTitle}>Intellect</Text>
              <Text style={styles.moduleSub}>Savant</Text>
            </View>
          </NeumorphicView>
        </View>

        {/* Active Quests Card */}
        <NeumorphicView variant="raised" radius={20} style={styles.questsCard}>
          <View style={styles.questsHeader}>
            <MaterialIcons name="radar" size={20} color="#7df4ff" />
            <Text style={styles.questsTitle}>Active Quests</Text>
          </View>

          {activeQuests.length === 0 ? (
            <NeumorphicView variant="inset" radius={12} style={styles.questItemWell}>
              <View>
                <Text style={styles.questName}>Secure the Perimeter</Text>
                <Text style={styles.questVenue}>DAILY ROUTINE</Text>
              </View>
              <Text style={styles.questXpTag}>+150 XP</Text>
            </NeumorphicView>
          ) : (
            activeQuests.map((q) => (
              <NeumorphicView
                key={q.id}
                variant="inset"
                radius={12}
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
            glow="cyan"
            radius={14}
            style={styles.viewAllButton}
            onPress={() => router.push("/(tabs)/quests")}
          >
            <Text style={styles.viewAllText}>VIEW ALL TRANSMISSIONS</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#00f0ff" />
          </NeumorphicView>
        </NeumorphicView>

        {/* Macro-quest / Multi-venue deep dive */}
        {macro && (
          <NeumorphicView variant="raised" glow={macro.completed ? "gold" : "none"} radius={20} style={styles.questsCard}>
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
                    color={v.visited ? "#00f0ff" : c.outline}
                  />
                  <Text style={styles.macroDotLabel}>{v.name}</Text>
                </View>
              ))}
            </View>
            {macro.completed ? (
              <View style={styles.rewardRow}>
                <MaterialIcons name="emoji-events" size={18} color="#f59e0b" />
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

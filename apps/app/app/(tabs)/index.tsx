import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Modal } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import type { MacroQuestProgress, UserProfile, UserQuestListItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";
import { NeumorphicView } from "@/components/NeumorphicView";

/** Stitch PIKE Home - PIKE Logo Imperial Gold & Sapphire Dashboard */
export default function HomeScreen() {
  const theme = useTheme();
  const [me, setMe] = useState<UserProfile | null>(null);
  const [walletCount, setWalletCount] = useState<number | null>(null);
  const [quests, setQuests] = useState<UserQuestListItem[]>([]);
  const [macro, setMacro] = useState<MacroQuestProgress | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Bento Modals state
  const [mobilityModalVisible, setMobilityModalVisible] = useState(false);
  const [intellectModalVisible, setIntellectModalVisible] = useState(false);

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

  const xpProgress = me && me.xpForNextLevel > 0 ? me.xpIntoLevel / me.xpForNextLevel : 0.65;
  const c = theme.colors;
  const isDark = theme.mode === "dark";

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? "#0c0c0e" : c.surface },
    content: { padding: 18, paddingTop: 16, paddingBottom: 130 },
    welcomeSection: { marginBottom: 18 },
    welcomeTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, fontSize: 24, fontWeight: "700" },
    welcomeGold: { color: isDark ? "#f59e0b" : "#1d4ed8" },
    welcomeSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 4, fontSize: 14 },
    streakBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    streakCount: { ...theme.font(theme.type.headlineSm), color: isDark ? "#f59e0b" : "#b45309", fontSize: 13, fontWeight: "700" },
    
    // XP Progress Card
    xpCard: { padding: 20, marginBottom: 16, borderRadius: 24 },
    tierRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 },
    labelCaps: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 1, fontWeight: "700" },
    tierName: { ...theme.font(theme.type.headlineSm), color: isDark ? "#f59e0b" : c.primary, marginTop: 2, fontWeight: "700" },
    xpValue: { ...theme.font(theme.type.headlineSm), color: c.onSurface, marginTop: 2, fontWeight: "700" },
    xpTrack: { width: "100%", height: 10, borderRadius: 5, padding: 2 },
    xpFill: { height: "100%", backgroundColor: isDark ? "#f59e0b" : c.primary, borderRadius: 4 },

    // Identity Modules Bento Grid
    moduleGrid: { flexDirection: "row", gap: 12, marginBottom: 16 },
    moduleCard: { flex: 1, padding: 18, alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 22 },
    moduleWell: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
    moduleTitle: { ...theme.font(theme.type.bodyLg), color: c.onSurface, fontWeight: "700" },
    moduleSub: { ...theme.font(theme.type.bodyMd), color: isDark ? "#f59e0b" : c.primary, fontSize: 12, fontWeight: "600" },

    // Active Quests / Transmissions Card
    questsCard: { padding: 20, marginBottom: 16, borderRadius: 24 },
    questsHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: isDark ? "rgba(212,175,55,0.1)" : "rgba(15,23,42,0.06)", marginBottom: 14 },
    questsTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontWeight: "700" },
    questItemWell: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderRadius: 16, marginBottom: 10 },
    questName: { ...theme.font(theme.type.bodyMd), color: c.onSurface, fontWeight: "700" },
    questVenue: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 10, marginTop: 2, fontWeight: "600" },
    questXpTag: { ...theme.font(theme.type.labelCaps), color: isDark ? "#f59e0b" : c.primary, fontSize: 11, fontWeight: "700" },
    viewAllButton: { padding: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 6, borderRadius: 16 },
    viewAllText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#f59e0b" : c.primary, letterSpacing: 1, fontWeight: "700" },

    // Macro Quest Card
    macroDots: { flexDirection: "row", gap: 6, marginTop: 14, flexWrap: "wrap" },
    macroDot: { flexDirection: "row", alignItems: "center", gap: 4 },
    macroDotLabel: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant },
    macroHint: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, marginTop: 12 },
    rewardRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
    rewardText: { ...theme.font(theme.type.labelSm), color: isDark ? "#f59e0b" : "#b45309", flex: 1, fontWeight: "700" },

    // Modals
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.75)", justifyContent: "center", alignItems: "center", padding: 20 },
    modalCard: { width: "100%", maxWidth: 380, padding: 24, borderRadius: 28 },
    modalPedestal: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 16 },
    modalTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 6 },
    modalSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginBottom: 18 },
    statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: isDark ? "rgba(212,175,55,0.12)" : "rgba(15,23,42,0.06)" },
    statLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 11, fontWeight: "600" },
    statVal: { ...theme.font(theme.type.headlineSm), color: isDark ? "#f59e0b" : c.primary, fontSize: 14, fontWeight: "700" },
    modalBtn: { width: "100%", paddingVertical: 14, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: 20 },
    modalBtnText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#f59e0b" : c.primary, fontSize: 12, letterSpacing: 1, fontWeight: "700" },
  });

  const rightAction =
    me && me.currentStreak > 0 ? (
      <NeumorphicView variant="raised" glow="gold" radius={16} style={styles.streakBadge}>
        <MaterialIcons name="local-fire-department" size={18} color={isDark ? "#f59e0b" : "#b45309"} />
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
            tintColor={isDark ? "#f59e0b" : c.primary}
            colors={[isDark ? "#f59e0b" : c.primary]}
          />
        }
      >
        <PwaInstallBanner />

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back, <Text style={styles.welcomeGold}>Vanguard</Text></Text>
          <Text style={styles.welcomeSub}>Your physical realm sync is 84% complete.</Text>
        </View>

        {/* XP Progress Card */}
        <NeumorphicView variant="raised" glow={isDark ? "gold" : "none"} radius={24} style={styles.xpCard}>
          <View style={styles.tierRow}>
            <View>
              <Text style={styles.labelCaps}>CURRENT TIER</Text>
              <Text style={styles.tierName}>Cybernetics Lvl {me?.level ?? 2}</Text>
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

        {/* Identity Progress Modules (Bento Grid) */}
        <View style={styles.moduleGrid}>
          <NeumorphicView variant="raised" radius={22} style={styles.moduleCard} onPress={() => setMobilityModalVisible(true)}>
            <NeumorphicView variant="inset" radius={28} style={styles.moduleWell}>
              <MaterialIcons name="directions-run" size={28} color={isDark ? "#f59e0b" : c.primary} />
            </NeumorphicView>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.moduleTitle}>Mobility</Text>
              <Text style={styles.moduleSub}>Adept</Text>
            </View>
          </NeumorphicView>

          <NeumorphicView variant="raised" radius={22} style={styles.moduleCard} onPress={() => setIntellectModalVisible(true)}>
            <NeumorphicView variant="inset" radius={28} style={styles.moduleWell}>
              <MaterialIcons name="psychology" size={28} color={isDark ? "#3b82f6" : "#1d4ed8"} />
            </NeumorphicView>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.moduleTitle}>Intellect</Text>
              <Text style={styles.moduleSub}>Savant</Text>
            </View>
          </NeumorphicView>
        </View>

        {/* Active Quests Card */}
        <NeumorphicView variant="raised" radius={24} style={styles.questsCard}>
          <View style={styles.questsHeader}>
            <MaterialIcons name="radar" size={20} color={isDark ? "#f59e0b" : c.primary} />
            <Text style={styles.questsTitle}>Active Quests</Text>
          </View>

          {activeQuests.length === 0 ? (
            <NeumorphicView variant="inset" radius={14} style={styles.questItemWell}>
              <View>
                <Text style={styles.questName}>Decipher the KICC Anomaly</Text>
                <Text style={styles.questVenue}>KICC SKY DECK • NAIROBI CBD</Text>
              </View>
              <Text style={styles.questXpTag}>+250 XP</Text>
            </NeumorphicView>
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
            glow={isDark ? "gold" : "blue"}
            radius={16}
            style={styles.viewAllButton}
            onPress={() => router.push("/(tabs)/quests")}
          >
            <Text style={styles.viewAllText}>VIEW ALL TRANSMISSIONS</Text>
            <MaterialIcons name="arrow-forward" size={18} color={isDark ? "#f59e0b" : c.primary} />
          </NeumorphicView>
        </NeumorphicView>

        {/* Macro-quest / Multi-venue deep dive */}
        {macro && (
          <NeumorphicView variant="raised" glow={macro.completed ? "gold" : "none"} radius={24} style={styles.questsCard}>
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
                    color={v.visited ? (isDark ? "#f59e0b" : "#10B981") : c.outline}
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

      {/* 1. Neumorphic Mobility Track Modal */}
      <Modal visible={mobilityModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <NeumorphicView variant="raised" glow="gold" radius={28} style={styles.modalCard}>
            <NeumorphicView variant="inset" radius={42} style={styles.modalPedestal}>
              <MaterialIcons name="directions-run" size={42} color={isDark ? "#f59e0b" : c.primary} />
            </NeumorphicView>

            <Text style={styles.modalTitle}>Mobility Track: Adept</Text>
            <Text style={styles.modalSub}>Physical urban telemetry & field traversal metrics</Text>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>TRAVERSAL RATING</Text>
              <Text style={styles.statVal}>Top 15% in Sector</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>FIELD SYNC ACCURACY</Text>
              <Text style={styles.statVal}>98.4% GPS Precision</Text>
            </View>
            <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.statLabel}>TOTAL DISTANCE COVERED</Text>
              <Text style={styles.statVal}>42.8 KM</Text>
            </View>

            <NeumorphicView variant="raised" glow="gold" radius={18} style={styles.modalBtn} onPress={() => setMobilityModalVisible(false)}>
              <Text style={styles.modalBtnText}>ACKNOWLEDGE</Text>
            </NeumorphicView>
          </NeumorphicView>
        </View>
      </Modal>

      {/* 2. Neumorphic Intellect Track Modal */}
      <Modal visible={intellectModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <NeumorphicView variant="raised" glow="blue" radius={28} style={styles.modalCard}>
            <NeumorphicView variant="inset" radius={42} style={styles.modalPedestal}>
              <MaterialIcons name="psychology" size={42} color={isDark ? "#3b82f6" : "#1d4ed8"} />
            </NeumorphicView>

            <Text style={styles.modalTitle}>Intellect Track: Savant</Text>
            <Text style={styles.modalSub}>Cryptographic AR alignment & spatial matrix analysis</Text>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>AR MARKERS DECIPHERED</Text>
              <Text style={styles.statVal}>12 Waypoints</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>OPTICAL POSE ALIGNMENT</Text>
              <Text style={styles.statVal}>Sub-millimeter 6-DOF</Text>
            </View>
            <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.statLabel}>INTELLIGENCE QUOTIENT</Text>
              <Text style={styles.statVal}>Level 4 Savant Rank</Text>
            </View>

            <NeumorphicView variant="raised" glow="blue" radius={18} style={styles.modalBtn} onPress={() => setIntellectModalVisible(false)}>
              <Text style={styles.modalBtnText}>ACKNOWLEDGE</Text>
            </NeumorphicView>
          </NeumorphicView>
        </View>
      </Modal>
    </View>
  );
}

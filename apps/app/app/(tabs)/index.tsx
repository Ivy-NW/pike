import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Modal } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import type { MacroQuestProgress, UserProfile, UserQuestListItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";
import { NeumorphicView } from "@/components/NeumorphicView";

/**
 * Stitch Neumorphic Dashboard / Home Feed
 * Unified PIKE Logo Imperial Gold & Sapphire Blue Palette
 */
export default function HomeScreen() {
  const theme = useTheme();
  const [me, setMe] = useState<UserProfile | null>(null);
  const [quests, setQuests] = useState<UserQuestListItem[]>([]);
  const [macro, setMacro] = useState<MacroQuestProgress | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state for Mobility & Intellect modules
  const [mobilityModalVisible, setMobilityModalVisible] = useState(false);
  const [intellectModalVisible, setIntellectModalVisible] = useState(false);

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
    welcomeGold: { color: isDark ? "#9C7C4A" : "#7E6030" },
    welcomeSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 4 },

    // Streak Pill
    streakBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    streakCount: { ...theme.font(theme.type.labelCaps), color: isDark ? "#9C7C4A" : "#7E6030", fontSize: 11, fontWeight: "700" },

    // XP Progress Card
    xpCard: { padding: 18, borderRadius: 24, marginBottom: 18 },
    tierRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    labelCaps: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 1.2, fontWeight: "700" },
    tierName: { ...theme.font(theme.type.headlineSm), color: isDark ? "#9C7C4A" : "#7E6030", fontSize: 18, fontWeight: "700", marginTop: 2 },
    xpValue: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 18, fontWeight: "700", marginTop: 2 },
    xpTrack: { width: "100%", height: 10, padding: 2, borderRadius: 5, overflow: "hidden" },
    xpFill: { height: "100%", borderRadius: 3, backgroundColor: isDark ? "#9C7C4A" : "#7E6030" },

    // 2-Column Bento Modules
    moduleGrid: { flexDirection: "row", gap: 12, marginBottom: 18 },
    moduleCard: { flex: 1, padding: 16, borderRadius: 22, alignItems: "center", justifyContent: "center", gap: 10 },
    moduleWell: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
    moduleTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 16, fontWeight: "700" },
    moduleSub: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, marginTop: 2 },

    // Quests Section Card
    questsCard: { padding: 18, borderRadius: 24, marginBottom: 18 },
    questsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
    questsTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 18, fontWeight: "700" },
    questItemWell: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 16, marginBottom: 10 },
    questName: { ...theme.font(theme.type.bodyMd), color: c.onSurface, fontWeight: "700" },
    questVenue: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, marginTop: 2, fontSize: 11 },
    questXpTag: { ...theme.font(theme.type.labelCaps), color: isDark ? "#9C7C4A" : "#7E6030", fontWeight: "700" },
    viewAllButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 16, marginTop: 6 },
    viewAllText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#9C7C4A" : "#7E6030", fontSize: 11, fontWeight: "700" },

    // Macro Quest Card
    macroDots: { flexDirection: "row", gap: 6, marginTop: 14, flexWrap: "wrap" },
    macroDot: { flexDirection: "row", alignItems: "center", gap: 4 },
    macroDotLabel: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant },
    macroHint: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, marginTop: 12 },
    rewardRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
    rewardText: { ...theme.font(theme.type.labelSm), color: isDark ? "#9C7C4A" : "#7E6030", flex: 1, fontWeight: "700" },

    // Modals
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.75)", justifyContent: "center", alignItems: "center", padding: 20 },
    modalCard: { width: "100%", maxWidth: 380, padding: 24, borderRadius: 28 },
    modalPedestal: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 16 },
    modalTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 6 },
    modalSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginBottom: 18 },
    statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: isDark ? "rgba(156,124,74,0.12)" : "rgba(126,96,48,0.12)" },
    statLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 11, fontWeight: "600" },
    statVal: { ...theme.font(theme.type.headlineSm), color: isDark ? "#9C7C4A" : "#7E6030", fontSize: 14, fontWeight: "700" },
    modalBtn: { width: "100%", paddingVertical: 14, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: 20 },
    modalBtnText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#9C7C4A" : "#7E6030", fontSize: 12, letterSpacing: 1, fontWeight: "700" },
  });

  const rightAction =
    me && me.currentStreak > 0 ? (
      <NeumorphicView variant="raised" glow="gold" radius={16} style={styles.streakBadge}>
        <MaterialIcons name="local-fire-department" size={18} color={isDark ? "#9C7C4A" : "#7E6030"} />
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
            tintColor={isDark ? "#9C7C4A" : "#7E6030"}
            colors={[isDark ? "#9C7C4A" : "#7E6030"]}
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
        <NeumorphicView variant="raised" glow="gold" radius={24} style={styles.xpCard}>
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
          <NeumorphicView variant="raised" glow="gold" radius={22} style={styles.moduleCard} onPress={() => setMobilityModalVisible(true)}>
            <NeumorphicView variant="inset" radius={28} style={styles.moduleWell}>
              <MaterialIcons name="directions-run" size={28} color={isDark ? "#9C7C4A" : "#7E6030"} />
            </NeumorphicView>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.moduleTitle}>Mobility</Text>
              <Text style={styles.moduleSub}>Adept</Text>
            </View>
          </NeumorphicView>

          <NeumorphicView variant="raised" glow="blue" radius={22} style={styles.moduleCard} onPress={() => setIntellectModalVisible(true)}>
            <NeumorphicView variant="inset" radius={28} style={styles.moduleWell}>
              <MaterialIcons name="psychology" size={28} color={isDark ? "#3b82f6" : "#2563eb"} />
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
            <MaterialIcons name="radar" size={20} color={isDark ? "#9C7C4A" : "#7E6030"} />
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
            glow="gold"
            radius={16}
            style={styles.viewAllButton}
            onPress={() => router.push("/(tabs)/quests")}
          >
            <Text style={styles.viewAllText}>VIEW ALL TRANSMISSIONS</Text>
            <MaterialIcons name="arrow-forward" size={18} color={isDark ? "#9C7C4A" : "#7E6030"} />
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
                    color={v.visited ? (isDark ? "#9C7C4A" : "#10B981") : c.outline}
                  />
                  <Text style={styles.macroDotLabel}>{v.name}</Text>
                </View>
              ))}
            </View>
            <View style={styles.rewardRow}>
              <MaterialIcons name="card-giftcard" size={16} color={isDark ? "#9C7C4A" : "#7E6030"} />
              <Text style={styles.rewardText}>Reward: {macro.reward.description}</Text>
            </View>
          </NeumorphicView>
        )}
      </ScrollView>

      {/* 1. Neumorphic Mobility Skill Modal */}
      <Modal visible={mobilityModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <NeumorphicView variant="raised" glow="gold" radius={28} style={styles.modalCard}>
            <NeumorphicView variant="inset" radius={42} style={styles.modalPedestal}>
              <MaterialIcons name="directions-run" size={44} color={isDark ? "#9C7C4A" : "#7E6030"} />
            </NeumorphicView>

            <Text style={styles.modalTitle}>Mobility Module</Text>
            <Text style={styles.modalSub}>
              Measures your physical traversal, speed of displacement across Nairobi sector nodes, and step endurance.
            </Text>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>STATUS TIER</Text>
              <Text style={styles.statVal}>Adept Vanguard (Tier 3)</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>EXPEDITION STEPS</Text>
              <Text style={styles.statVal}>12,480 Steps Today</Text>
            </View>
            <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.statLabel}>TRAVERSAL MULTIPLIER</Text>
              <Text style={styles.statVal}>1.35x XP Velocity</Text>
            </View>

            <NeumorphicView
              variant="raised"
              glow="gold"
              radius={18}
              style={styles.modalBtn}
              onPress={() => setMobilityModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>CONFIRM & DISMISS</Text>
            </NeumorphicView>
          </NeumorphicView>
        </View>
      </Modal>

      {/* 2. Neumorphic Intellect Skill Modal */}
      <Modal visible={intellectModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <NeumorphicView variant="raised" glow="blue" radius={28} style={styles.modalCard}>
            <NeumorphicView variant="inset" radius={42} style={styles.modalPedestal}>
              <MaterialIcons name="psychology" size={44} color={isDark ? "#3b82f6" : "#2563eb"} />
            </NeumorphicView>

            <Text style={styles.modalTitle}>Intellect Module</Text>
            <Text style={styles.modalSub}>
              Cryptographic alignment speed and optical cipher recognition efficiency during AR marker decoding.
            </Text>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>STATUS TIER</Text>
              <Text style={[styles.statVal, { color: isDark ? "#3b82f6" : "#2563eb" }]}>Savant Operative</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>CIPHERS DECRYPTED</Text>
              <Text style={[styles.statVal, { color: isDark ? "#3b82f6" : "#2563eb" }]}>18 Sector Matrix Keys</Text>
            </View>
            <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.statLabel}>REPUTATION BONUS</Text>
              <Text style={[styles.statVal, { color: isDark ? "#3b82f6" : "#2563eb" }]}>+25% Rare Anomaly Drop</Text>
            </View>

            <NeumorphicView
              variant="raised"
              glow="blue"
              radius={18}
              style={styles.modalBtn}
              onPress={() => setIntellectModalVisible(false)}
            >
              <Text style={[styles.modalBtnText, { color: isDark ? "#3b82f6" : "#2563eb" }]}>CONFIRM & DISMISS</Text>
            </NeumorphicView>
          </NeumorphicView>
        </View>
      </Modal>
    </View>
  );
}

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { NeumorphicView } from "@/components/NeumorphicView";

/** Stitch Neumorphic Quest Details & Mission Brief */
export default function QuestDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    venueName: string;
    rewardDescription: string;
    completed: string;
    markerId: string;
  }>();
  const completed = params.completed === "true";
  const c = theme.colors;
  const isDark = theme.mode === "dark";

  const topPadding = Platform.OS === "web" ? 14 : Math.max(insets.top, 14) + 6;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? "#0c0c0e" : c.surface },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: topPadding,
      paddingBottom: 14,
      paddingHorizontal: 16,
      backgroundColor: isDark ? "#0c0c0e" : c.surface,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(212, 175, 55, 0.12)" : "rgba(15, 23, 42, 0.06)",
      zIndex: 100,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    headerTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, fontSize: 22, fontWeight: "700" },
    content: { padding: 18, paddingBottom: 60 },

    // Hero Mission Card
    heroCard: {
      height: 180,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
      position: "relative",
      overflow: "hidden",
    },
    hologramWell: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    heroSub: { ...theme.font(theme.type.labelCaps), color: isDark ? "#f59e0b" : c.primary, letterSpacing: 1.5, fontWeight: "700" },

    // Chips Row
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
    chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },
    chipText: { ...theme.font(theme.type.labelCaps), color: c.onSurface, fontSize: 11, fontWeight: "600" },
    chipGoldText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#f59e0b" : "#b45309", fontSize: 11, fontWeight: "700" },

    // Brief Section
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 18, fontWeight: "700" },
    activeBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    activeBadgeText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#f59e0b" : c.primary, fontSize: 10, fontWeight: "700" },
    completedBadgeText: { ...theme.font(theme.type.labelCaps), color: "#10B981", fontSize: 10, fontWeight: "700" },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: isDark ? "#f59e0b" : c.primary },
    dotCompleted: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },

    briefCard: { padding: 18, borderRadius: 22 },
    questHeading: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 19, marginBottom: 8, fontWeight: "700" },
    briefBody: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, lineHeight: 22 },

    // Rewards Breakdown Card
    rewardCard: { padding: 18, borderRadius: 22, marginBottom: 24 },
    rewardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    rewardLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontWeight: "600" },
    rewardValue: { ...theme.font(theme.type.headlineSm), color: isDark ? "#f59e0b" : "#b45309", fontSize: 16, fontWeight: "700" },
    xpValue: { ...theme.font(theme.type.headlineSm), color: isDark ? "#f59e0b" : c.primary, fontSize: 16, fontWeight: "700" },

    // Action CTA
    ctaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 18,
      borderRadius: 24,
    },
    ctaBtnText: { ...theme.font(theme.type.headlineSm), color: isDark ? "#f59e0b" : "#ffffff", fontSize: 15, letterSpacing: 1.5, fontWeight: "700" },
  });

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <NeumorphicView variant="raised" radius={19} style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color={isDark ? "#f59e0b" : c.primary} />
          </NeumorphicView>
          <Text style={styles.headerTitle}>Mission Intel</Text>
        </View>
        <MaterialIcons name="share" size={20} color={c.onSurfaceVariant} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Holographic AR Quest Hero Card */}
        <NeumorphicView variant="raised" glow="gold" radius={28} style={styles.heroCard}>
          <NeumorphicView variant="inset" radius={40} style={styles.hologramWell}>
            <MaterialIcons
              name={completed ? "check-circle" : "view-in-ar"}
              size={42}
              color={completed ? "#10B981" : (isDark ? "#f59e0b" : c.primary)}
            />
          </NeumorphicView>
          <Text style={styles.heroSub}>
            {completed ? "MISSION ACCOMPLISHED" : "SECTOR ANOMALY DETECTED"}
          </Text>
        </NeumorphicView>

        {/* Metadata Chips */}
        <View style={styles.chipRow}>
          <NeumorphicView variant="inset" radius={14} style={styles.chip}>
            <MaterialIcons name="place" size={16} color={isDark ? "#f59e0b" : c.primary} />
            <Text style={styles.chipText}>{params.venueName || "Nairobi Anchor Node"}</Text>
          </NeumorphicView>

          <NeumorphicView variant="inset" radius={14} style={styles.chip}>
            <MaterialIcons name="military-tech" size={16} color={isDark ? "#f59e0b" : "#b45309"} />
            <Text style={styles.chipGoldText}>Tier 1 Anomaly</Text>
          </NeumorphicView>
        </View>

        {/* Tactical Briefing */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TACTICAL BRIEF</Text>
            <NeumorphicView variant="inset" radius={10} style={styles.activeBadge}>
              <View style={completed ? styles.dotCompleted : styles.dot} />
              <Text style={completed ? styles.completedBadgeText : styles.activeBadgeText}>
                {completed ? "COMPLETED" : "OPTICAL READY"}
              </Text>
            </NeumorphicView>
          </View>

          <NeumorphicView variant="raised" radius={22} style={styles.briefCard}>
            <Text style={styles.questHeading}>{params.name || "Decipher the Sector Anomaly"}</Text>
            <Text style={styles.briefBody}>
              Deploy to {params.venueName || "the anchor node"} in Nairobi. Align your optical scanner lens with the
              physical holographic target on site to synchronize telemetry and decrypt the sector vault cipher.
            </Text>
          </NeumorphicView>
        </View>

        {/* Reward Payload */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>REWARD PAYLOAD</Text>
          <NeumorphicView variant="raised" radius={22} style={styles.rewardCard}>
            <View style={styles.rewardRow}>
              <Text style={styles.rewardLabel}>PERK VOUCHER</Text>
              <Text style={styles.rewardValue}>{params.rewardDescription || "20% off at Venue"}</Text>
            </View>
            <View style={styles.rewardRow}>
              <Text style={styles.rewardLabel}>EXPEDITION XP</Text>
              <Text style={styles.xpValue}>+250 XP</Text>
            </View>
            <View style={[styles.rewardRow, { marginBottom: 0 }]}>
              <Text style={styles.rewardLabel}>SECTOR BADGE</Text>
              <Text style={styles.rewardValue}>Progress +1</Text>
            </View>
          </NeumorphicView>
        </View>

        {/* Deploy & Scan CTA */}
        {!completed ? (
          <NeumorphicView
            variant="raised"
            glow="gold"
            radius={24}
            style={styles.ctaBtn}
            onPress={() => router.push(`/scan/${params.markerId || params.id}`)}
          >
            <MaterialIcons name="qr-code-scanner" size={22} color={isDark ? "#f59e0b" : "#ffffff"} />
            <Text style={styles.ctaBtnText}>ENGAGE OPTICAL SCANNER</Text>
          </NeumorphicView>
        ) : (
          <NeumorphicView
            variant="flat"
            radius={24}
            style={styles.ctaBtn}
            onPress={() => router.push("/(tabs)/rewards")}
          >
            <MaterialIcons name="card-giftcard" size={22} color="#10B981" />
            <Text style={[styles.ctaBtnText, { color: "#10B981" }]}>VIEW IN VAULT</Text>
          </NeumorphicView>
        )}
      </ScrollView>
    </View>
  );
}

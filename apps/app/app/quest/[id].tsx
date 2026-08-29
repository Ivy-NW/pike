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
    container: { flex: 1, backgroundColor: isDark ? "#141314" : c.surface },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: topPadding,
      paddingBottom: 14,
      paddingHorizontal: 16,
      backgroundColor: isDark ? "#141314" : c.surface,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.04)",
      zIndex: 100,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    headerTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.primary, fontSize: 22, fontWeight: "700" },
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
    heroSub: { ...theme.font(theme.type.labelCaps), color: "#00f0ff", letterSpacing: 1.5 },

    // Chips Row
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
    chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
    chipText: { ...theme.font(theme.type.labelCaps), color: c.onSurface, fontSize: 11 },
    chipGoldText: { ...theme.font(theme.type.labelCaps), color: "#f59e0b", fontSize: 11 },

    // Brief Section
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { ...theme.font(theme.type.headlineSm), color: c.primary, fontSize: 18 },
    activeBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4 },
    activeBadgeText: { ...theme.font(theme.type.labelCaps), color: "#00f0ff", fontSize: 10 },
    completedBadgeText: { ...theme.font(theme.type.labelCaps), color: "#10B981", fontSize: 10 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#00f0ff" },
    dotCompleted: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },

    briefCard: { padding: 18, borderRadius: 22 },
    questHeading: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 19, marginBottom: 8 },
    briefBody: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, lineHeight: 22 },

    // Rewards Breakdown Card
    rewardCard: { padding: 18, borderRadius: 22, marginBottom: 24 },
    rewardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    rewardLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant },
    rewardValue: { ...theme.font(theme.type.headlineSm), color: "#f59e0b", fontSize: 16 },
    xpValue: { ...theme.font(theme.type.headlineSm), color: "#00f0ff", fontSize: 16 },

    // Action CTA
    ctaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 18,
      borderRadius: 24,
    },
    ctaText: { ...theme.font(theme.type.headlineSm), fontSize: 16, letterSpacing: 1 },
  });

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <NeumorphicView variant="raised" radius={19} style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color={c.primary} />
          </NeumorphicView>
          <Text style={styles.headerTitle}>Mission Intel</Text>
        </View>
        <MaterialIcons name="radar" size={24} color="#00f0ff" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hologram Hero */}
        <NeumorphicView variant="raised" glow={completed ? "success" : "cyan"} radius={28} style={styles.heroCard}>
          <NeumorphicView variant="inset" radius={40} style={styles.hologramWell}>
            <MaterialIcons
              name={completed ? "verified" : "qr-code-scanner"}
              size={42}
              color={completed ? "#10B981" : "#00f0ff"}
            />
          </NeumorphicView>
          <Text style={styles.heroSub}>{completed ? "SECTOR PROTOCOL COMPLETED" : "AR SPATIAL NODE READY"}</Text>
        </NeumorphicView>

        {/* Chips Row */}
        <View style={styles.chipRow}>
          <NeumorphicView variant="raised" radius={20} style={styles.chip}>
            <MaterialIcons name="place" size={16} color="#00f0ff" />
            <Text style={styles.chipText} numberOfLines={1}>{params.venueName || "Nairobi Sector"}</Text>
          </NeumorphicView>

          <NeumorphicView variant="raised" glow="gold" radius={20} style={styles.chip}>
            <MaterialIcons name="emoji-events" size={16} color="#f59e0b" />
            <Text style={styles.chipGoldText}>{params.rewardDescription || "Special Voucher"}</Text>
          </NeumorphicView>
        </View>

        {/* Mission Briefing */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tactical Objectives</Text>
            <NeumorphicView variant="inset" radius={12} style={styles.activeBadge}>
              <View style={completed ? styles.dotCompleted : styles.dot} />
              <Text style={completed ? styles.completedBadgeText : styles.activeBadgeText}>
                {completed ? "COMPLETED" : "IN PROGRESS"}
              </Text>
            </NeumorphicView>
          </View>

          <NeumorphicView variant="inset" radius={22} style={styles.briefCard}>
            <Text style={styles.questHeading}>{params.name}</Text>
            <Text style={styles.briefBody}>
              Traverse to {params.venueName || "the anchor venue"} in Nairobi. Align your optical scanner with the designated AR physical marker to decipher the cipher and unlock the associated rewards into your PIKE wallet.
            </Text>
          </NeumorphicView>
        </View>

        {/* Reward Yield Breakdown */}
        <NeumorphicView variant="raised" radius={22} style={styles.rewardCard}>
          <Text style={[styles.sectionTitle, { marginBottom: 14 }]}>Mission Yield</Text>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardLabel}>SECTOR XP</Text>
            <Text style={styles.xpValue}>+250 XP</Text>
          </View>
          <View style={[styles.rewardRow, { marginBottom: 0 }]}>
            <Text style={styles.rewardLabel}>REWARD VOUCHER</Text>
            <Text style={styles.rewardValue}>{params.rewardDescription}</Text>
          </View>
        </NeumorphicView>

        {/* Action Button */}
        <NeumorphicView
          variant="raised"
          glow={completed ? "none" : "cyan"}
          radius={24}
          style={styles.ctaBtn}
          onPress={() => {
            if (!completed && params.markerId) {
              router.push(`/scan/${params.markerId}`);
            } else {
              router.push("/(tabs)/rewards");
            }
          }}
        >
          <MaterialIcons
            name={completed ? "card-giftcard" : "photo-camera"}
            size={22}
            color={completed ? "#10B981" : "#00f0ff"}
          />
          <Text
            style={[
              styles.ctaText,
              { color: completed ? "#10B981" : "#00f0ff" },
            ]}
          >
            {completed ? "VIEW IN REWARDS WALLET" : "SCAN MARKER (AR)"}
          </Text>
        </NeumorphicView>
      </ScrollView>
    </View>
  );
}

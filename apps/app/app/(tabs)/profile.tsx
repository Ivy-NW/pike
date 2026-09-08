import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import type { UserProfile, UserWalletItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { clearIdentityToken } from "@/lib/auth";
import { useTheme, useSemanticColors, RADIUS_CARD } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { NeumorphicView } from "@/components/NeumorphicView";
import { useRewardColor } from "@/components/RewardAccent";

interface BadgeInfo {
  id: string;
  name: string;
  category: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  xpBoost: string;
  description: string;
}

// Presentation metadata for the badge grid. `earned` is derived per-user from
// the real UserProfile.badges array below, not hardcoded here.
const BADGES: BadgeInfo[] = [
  {
    id: "alpine",
    name: "Alpine Explorer",
    category: "Exploration",
    icon: "terrain",
    xpBoost: "+500 XP",
    description: "Visited a high-ground venue across Nairobi.",
  },
  {
    id: "pathfinder",
    name: "Pathfinder",
    category: "Navigation",
    icon: "explore",
    xpBoost: "+350 XP",
    description: "Discovered and scanned 5+ markers across different venues.",
  },
  {
    id: "100k",
    name: "100K Steps",
    category: "Endurance",
    icon: "directions-walk",
    xpBoost: "+1,000 XP",
    description: "Logged over 100,000 steps while exploring.",
  },
  {
    id: "cipher",
    name: "Puzzle Master",
    category: "Intellect",
    icon: "psychology",
    xpBoost: "+750 XP",
    description: "Completed several AR marker quests in a single visit.",
  },
  {
    id: "nightstalker",
    name: "Night Owl",
    category: "Special",
    icon: "bedtime",
    xpBoost: "+500 XP",
    description: "Scanned a marker after dark.",
  },
  {
    id: "guardian",
    name: "Consistency Champion",
    category: "Defense",
    icon: "shield",
    xpBoost: "+600 XP",
    description: "Kept a daily streak going for 7 consecutive days.",
  },
  {
    id: "kinetic",
    name: "Quick Adept",
    category: "Agility",
    icon: "bolt",
    xpBoost: "+400 XP",
    description: "Completed 3 quests within a single 4-hour visit.",
  },
  {
    id: "crown",
    name: "Crown Pioneer",
    category: "Prestige",
    icon: "military-tech",
    xpBoost: "+2,500 XP",
    description: "Reached elite status across every Nairobi venue.",
  },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const semantic = useSemanticColors();
  const rewardColor = useRewardColor();
  const [me, setMe] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<UserWalletItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [selectedBadge, setSelectedBadge] = useState<BadgeInfo | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");

  const c = theme.colors;
  const isDark = theme.mode === "dark";

  const fetchProfile = async () => {
    try {
      const [u, w] = await Promise.all([api.me().catch(() => null), api.wallet().catch(() => [])]);
      if (u) {
        setMe(u);
        setEditName(u.name ?? "");
        setEditUsername(u.username ?? "");
      }
      setWallet(w);
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleSaveProfile = () => {
    if (me) {
      setMe({ ...me, name: editName, username: editUsername });
    }
    setEditModalVisible(false);
  };

  const handleConfirmDelete = async () => {
    setDeleteModalVisible(false);
    try {
      await api.deleteAccount();
      await clearIdentityToken();
      router.replace("/login");
    } catch {
      await clearIdentityToken();
      router.replace("/login");
    }
  };

  const initial = (me?.name ?? me?.username ?? "?").charAt(0).toUpperCase();

  const isBadgeEarned = (badgeId: string) => !!me?.badges?.some((b) => b.key === badgeId && b.earnedAt);
  const earnedCount = me ? BADGES.filter((b) => isBadgeEarned(b.id)).length : 0;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? "#000000" : c.surface },
    content: { padding: 18, paddingBottom: 140 },

    // Avatar Section
    avatarSection: { alignItems: "center", marginBottom: 20 },
    outerRing: {
      width: 116,
      height: 116,
      borderRadius: 58,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
      position: "relative",
    },
    innerWell: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      ...theme.font(theme.type.displayXl),
      color: semantic.action,
      fontSize: 42,
      fontWeight: "700",
    },
    streakBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    nameText: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, fontSize: 24, fontWeight: "700" },
    handleText: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, marginTop: 2, letterSpacing: 1, fontWeight: "700" },

    // Actions Row
    actionsRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14 },
    editBtn: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: RADIUS_CARD },
    editBtnText: { ...theme.font(theme.type.labelCaps), color: semantic.action, fontSize: 11, letterSpacing: 1, fontWeight: "700" },
    gearBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },

    // Bento Stats
    bentoCard: { padding: 18, borderRadius: RADIUS_CARD, marginBottom: 14 },
    xpHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    xpLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 1.2, fontWeight: "700" },
    starWell: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
    xpValueRow: { flexDirection: "row", alignItems: "baseline", marginVertical: 6 },
    xpBig: { ...theme.font(theme.type.displayXl), color: c.onSurface, fontSize: 34, fontWeight: "700" },
    trackWell: { height: 8, width: "100%", borderRadius: 4, marginVertical: 8, overflow: "hidden" },
    trackFill: { height: "100%", width: "74%", backgroundColor: semantic.action, borderRadius: 4 },
    tierRow: { flexDirection: "row", justifyContent: "space-between" },
    tierText: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, fontSize: 11, fontWeight: "600" },

    // 2-Column Bento Grid
    bentoGrid: { flexDirection: "row", gap: 12, marginBottom: 18 },
    bentoCol: { flex: 1, padding: 16, borderRadius: RADIUS_CARD },
    colHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    colLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 10, fontWeight: "700" },
    colValueWell: { paddingVertical: 10, borderRadius: RADIUS_CARD, alignItems: "center", justifyContent: "center" },
    colValue: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 20, fontWeight: "700" },

    // Badges Shelf
    shelfCard: { padding: 18, borderRadius: RADIUS_CARD, marginBottom: 20 },
    shelfHeadingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
    shelfHeading: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 1.5, fontWeight: "700" },
    shelfCountTag: { ...theme.font(theme.type.labelCaps), color: semantic.action, fontSize: 10, fontWeight: "700" },
    badgeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
    badgeSlot: { width: "22%", alignItems: "center", gap: 4, marginBottom: 8 },
    badgeMoldCount: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" },
    badgeName: { ...theme.font(theme.type.labelCaps), color: c.onSurface, fontSize: 9, textAlign: "center", fontWeight: "600" },
    badgeNameLocked: { color: c.onSurfaceVariant },

    // Danger Zone
    dangerBtn: { padding: 16, borderRadius: RADIUS_CARD, alignItems: "center", justifyContent: "center", marginTop: 4 },
    dangerText: { ...theme.font(theme.type.labelCaps), color: c.error, letterSpacing: 1, fontWeight: "700" },

    // Modal Styles
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContainer: { width: "100%", maxWidth: 380, padding: 24, borderRadius: RADIUS_CARD },
    modalTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 6 },
    modalSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginBottom: 20 },
    inputWell: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: RADIUS_CARD, marginBottom: 14 },
    textInput: { ...theme.font(theme.type.bodyMd), color: c.onSurface, fontSize: 15 },
    modalBtnRow: { flexDirection: "row", gap: 12, marginTop: 10 },
    modalBtn: { flex: 1, paddingVertical: 14, borderRadius: RADIUS_CARD, alignItems: "center", justifyContent: "center" },
    modalBtnText: { ...theme.font(theme.type.labelCaps), fontSize: 12, letterSpacing: 1, fontWeight: "700" },

    // Badge Modal Special
    badgeModalPedestal: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 16 },
    statusChip: { alignSelf: "center", paddingHorizontal: 14, paddingVertical: 5, borderRadius: RADIUS_CARD, marginBottom: 12 },
    statusChipText: { ...theme.font(theme.type.labelCaps), fontSize: 10, letterSpacing: 1, fontWeight: "700" },
    xpBoostCard: { padding: 12, borderRadius: RADIUS_CARD, marginBottom: 16 },
    xpBoostText: { ...theme.font(theme.type.headlineSm), color: rewardColor, fontSize: 13, textAlign: "center", fontWeight: "700" },
  });

  const selectedEarned = selectedBadge ? isBadgeEarned(selectedBadge.id) : false;

  return (
    <View style={styles.container}>
      <TopNav title="PIKE" showLogo={false} subtitle="Explorer Profile" />

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
        {/* Double-Ring Avatar */}
        <View style={styles.avatarSection}>
          <NeumorphicView variant="raised" accent="action" radius={58} style={styles.outerRing}>
            <NeumorphicView variant="inset" radius={50} style={styles.innerWell}>
              <Text style={styles.avatarText}>{initial}</Text>
            </NeumorphicView>
            {/* Streak flame stays gold per docs/pike_ui_design.md §7.1: "streak count (flame icon, gold)". */}
            <NeumorphicView variant="raised" accent="reward" radius={17} style={styles.streakBadge}>
              <MaterialIcons name="local-fire-department" size={20} color={rewardColor} />
            </NeumorphicView>
          </NeumorphicView>

          <Text style={styles.nameText}>{me?.name ?? "—"}</Text>
          <Text style={styles.handleText}>@{me?.username?.toUpperCase() ?? "—"}</Text>

          <View style={styles.actionsRow}>
            <NeumorphicView
              variant="raised"
              accent="action"
              radius={RADIUS_CARD}
              style={styles.editBtn}
              onPress={() => setEditModalVisible(true)}
            >
              <Text style={styles.editBtnText}>EDIT PROFILE</Text>
            </NeumorphicView>

            <NeumorphicView
              variant="raised"
              radius={21}
              style={styles.gearBtn}
              onPress={() => router.push("/settings")}
            >
              <MaterialIcons name="settings" size={20} color={c.onSurfaceVariant} />
            </NeumorphicView>
          </View>
        </View>

        {/* Total XP — Pike Blue per docs/pike_ui_design.md §7.1 ("XP bar... Pike Blue fill"). */}
        <NeumorphicView variant="raised" accent="action" radius={RADIUS_CARD} style={styles.bentoCard}>
          <View style={styles.xpHeaderRow}>
            <Text style={styles.xpLabel}>TOTAL XP</Text>
            <NeumorphicView variant="inset" radius={17} style={styles.starWell}>
              <MaterialIcons name="star" size={18} color={semantic.action} />
            </NeumorphicView>
          </View>

          <View style={styles.xpValueRow}>
            <Text style={styles.xpBig}>{me?.xp ?? 0} XP</Text>
          </View>

          <NeumorphicView variant="inset" radius={4} style={styles.trackWell}>
            <View style={styles.trackFill} />
          </NeumorphicView>

          <View style={styles.tierRow}>
            <Text style={styles.tierText}>Nairobi Explorer</Text>
            <Text style={styles.tierText}>Lvl {me?.level ?? 1} → {(me?.level ?? 1) + 1}</Text>
          </View>
        </NeumorphicView>

        {/* 2-Column Bento Grid */}
        <View style={styles.bentoGrid}>
          {/* Quests Completed */}
          <NeumorphicView variant="raised" radius={RADIUS_CARD} style={styles.bentoCol}>
            <View style={styles.colHeaderRow}>
              <Text style={styles.colLabel}>QUESTS</Text>
              <MaterialIcons name="flag" size={16} color={c.onSurfaceVariant} />
            </View>
            <NeumorphicView variant="inset" radius={RADIUS_CARD} style={styles.colValueWell}>
              <Text style={styles.colValue}>{wallet.length}</Text>
            </NeumorphicView>
          </NeumorphicView>

          {/* Streak Days */}
          <NeumorphicView variant="raised" radius={RADIUS_CARD} style={styles.bentoCol}>
            <View style={styles.colHeaderRow}>
              <Text style={styles.colLabel}>STREAK</Text>
              <MaterialIcons name="local-fire-department" size={16} color={rewardColor} />
            </View>
            <NeumorphicView variant="inset" radius={RADIUS_CARD} style={styles.colValueWell}>
              <Text style={styles.colValue}>{me?.currentStreak ?? 0} days</Text>
            </NeumorphicView>
          </NeumorphicView>
        </View>

        {/* Badges Shelf */}
        <NeumorphicView variant="raised" radius={RADIUS_CARD} style={styles.shelfCard}>
          <View style={styles.shelfHeadingRow}>
            <Text style={styles.shelfHeading}>BADGES</Text>
            <Text style={styles.shelfCountTag}>{earnedCount} / {BADGES.length} UNLOCKED</Text>
          </View>

          <View style={styles.badgeGrid}>
            {BADGES.map((b) => {
              const earned = isBadgeEarned(b.id);
              const isTopTier = b.id === "crown" || b.id === "100k";
              return (
                <TouchableOpacity
                  key={b.id}
                  style={styles.badgeSlot}
                  activeOpacity={0.75}
                  onPress={() => setSelectedBadge(b)}
                >
                  <NeumorphicView
                    variant={earned ? "raised" : "inset"}
                    accent={earned ? (isTopTier ? "reward" : "action") : "none"}
                    radius={27}
                    style={[styles.badgeMoldCount, !earned && { opacity: 0.45 }]}
                  >
                    <MaterialIcons
                      name={b.icon}
                      size={24}
                      color={earned ? (isTopTier ? rewardColor : semantic.action) : c.onSurfaceVariant}
                    />
                  </NeumorphicView>
                  <Text style={[styles.badgeName, !earned && styles.badgeNameLocked]} numberOfLines={1}>
                    {b.name.split(" ")[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </NeumorphicView>

        {/* Delete Account Button */}
        <NeumorphicView
          variant="flat"
          radius={RADIUS_CARD}
          style={styles.dangerBtn}
          onPress={() => setDeleteModalVisible(true)}
        >
          <Text style={styles.dangerText}>DELETE ACCOUNT</Text>
        </NeumorphicView>
      </ScrollView>

      {/* 1. Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <NeumorphicView variant="raised" accent="action" radius={RADIUS_CARD} style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit profile</Text>
            <Text style={styles.modalSub}>Update your PIKE account details.</Text>

            <NeumorphicView variant="inset" radius={RADIUS_CARD} style={styles.inputWell}>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Full name"
                placeholderTextColor={c.onSurfaceVariant}
                style={styles.textInput}
              />
            </NeumorphicView>

            <NeumorphicView variant="inset" radius={RADIUS_CARD} style={styles.inputWell}>
              <TextInput
                value={editUsername}
                onChangeText={setEditUsername}
                placeholder="Username"
                placeholderTextColor={c.onSurfaceVariant}
                style={styles.textInput}
                autoCapitalize="none"
              />
            </NeumorphicView>

            <View style={styles.modalBtnRow}>
              <NeumorphicView
                variant="flat"
                radius={RADIUS_CARD}
                style={styles.modalBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: c.onSurfaceVariant }]}>CANCEL</Text>
              </NeumorphicView>

              <NeumorphicView
                variant="raised"
                accent="action"
                radius={RADIUS_CARD}
                style={styles.modalBtn}
                onPress={handleSaveProfile}
              >
                <Text style={[styles.modalBtnText, { color: semantic.action }]}>SAVE</Text>
              </NeumorphicView>
            </View>
          </NeumorphicView>
        </View>
      </Modal>

      {/* 2. Badge Inspection Modal */}
      <Modal visible={!!selectedBadge} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          {selectedBadge && (
            <NeumorphicView
              variant="raised"
              accent={selectedEarned ? (selectedBadge.id === "crown" ? "reward" : "action") : "none"}
              radius={RADIUS_CARD}
              style={styles.modalContainer}
            >
              <NeumorphicView variant="inset" radius={45} style={styles.badgeModalPedestal}>
                <MaterialIcons
                  name={selectedBadge.icon}
                  size={46}
                  color={selectedEarned ? (selectedBadge.id === "crown" ? rewardColor : semantic.action) : c.onSurfaceVariant}
                />
              </NeumorphicView>

              <Text style={styles.modalTitle}>{selectedBadge.name}</Text>
              <NeumorphicView
                variant="inset"
                radius={RADIUS_CARD}
                style={[
                  styles.statusChip,
                  { backgroundColor: selectedEarned ? "rgba(16, 185, 129, 0.15)" : "rgba(140, 140, 140, 0.15)" },
                ]}
              >
                <Text style={[styles.statusChipText, { color: selectedEarned ? c.success : c.onSurfaceVariant }]}>
                  {selectedEarned ? "UNLOCKED" : "LOCKED"}
                </Text>
              </NeumorphicView>

              <NeumorphicView variant="inset" radius={RADIUS_CARD} style={styles.xpBoostCard}>
                <Text style={styles.xpBoostText}>{selectedBadge.xpBoost}</Text>
              </NeumorphicView>

              <Text style={styles.modalSub}>{selectedBadge.description}</Text>

              <NeumorphicView
                variant="raised"
                accent="action"
                radius={RADIUS_CARD}
                style={[styles.modalBtn, { alignSelf: "center", width: "100%" }]}
                onPress={() => setSelectedBadge(null)}
              >
                <Text style={[styles.modalBtnText, { color: semantic.action }]}>CLOSE</Text>
              </NeumorphicView>
            </NeumorphicView>
          )}
        </View>
      </Modal>

      {/* 3. Delete Account Danger Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <NeumorphicView variant="raised" accent="none" radius={RADIUS_CARD} style={[styles.modalContainer, { borderColor: "rgba(239, 68, 68, 0.5)" }]}>
            <Text style={[styles.modalTitle, { color: c.error }]}>Delete account?</Text>
            <Text style={styles.modalSub}>
              This permanently deletes your PIKE account, XP ({me?.xp ?? 0}), streak history, and badges. This can't be undone.
            </Text>

            <View style={styles.modalBtnRow}>
              <NeumorphicView
                variant="flat"
                radius={RADIUS_CARD}
                style={styles.modalBtn}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: c.onSurfaceVariant }]}>CANCEL</Text>
              </NeumorphicView>

              <NeumorphicView
                variant="raised"
                radius={RADIUS_CARD}
                style={[styles.modalBtn, { backgroundColor: "rgba(239, 68, 68, 0.2)", borderColor: "rgba(239, 68, 68, 0.6)" }]}
                onPress={handleConfirmDelete}
              >
                <Text style={[styles.modalBtnText, { color: c.error }]}>DELETE</Text>
              </NeumorphicView>
            </View>
          </NeumorphicView>
        </View>
      </Modal>
    </View>
  );
}

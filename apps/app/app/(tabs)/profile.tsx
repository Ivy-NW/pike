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
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { NeumorphicView } from "@/components/NeumorphicView";

interface BadgeInfo {
  id: string;
  name: string;
  category: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  earned: boolean;
  xpBoost: string;
  description: string;
}

// Complete 8-Badge Vanguard Array (No blanks)
const BADGES: BadgeInfo[] = [
  {
    id: "alpine",
    name: "Alpine Vanguard",
    category: "Exploration",
    icon: "terrain",
    earned: true,
    xpBoost: "+500 XP / 1.2x Multiplier",
    description: "Traversed elevated terrain sector coordinates across Nairobi high ground.",
  },
  {
    id: "pathfinder",
    name: "Pathfinder",
    category: "Navigation",
    icon: "explore",
    earned: true,
    xpBoost: "+350 XP Telemetry Bonus",
    description: "Discovered and mapped 5+ anomaly waypoint markers in active field zones.",
  },
  {
    id: "100k",
    name: "100K Steps",
    category: "Endurance",
    icon: "directions-walk",
    earned: true,
    xpBoost: "+1,000 XP / VIP Tier",
    description: "Logged over 100,000 physical exploration steps in urban field telemetry.",
  },
  {
    id: "cipher",
    name: "Cipher Master",
    category: "Intellect",
    icon: "psychology",
    earned: true,
    xpBoost: "+750 XP Cryptographic Bonus",
    description: "Deciphered multiple optical AR marker matrix ciphers in live questing.",
  },
  {
    id: "nightstalker",
    name: "Night Relay",
    category: "Special",
    icon: "bedtime",
    earned: true,
    xpBoost: "+500 XP Nocturnal Bonus",
    description: "Successfully scanned and aligned an anomaly node during night hours.",
  },
  {
    id: "guardian",
    name: "Sector Guardian",
    category: "Defense",
    icon: "shield",
    earned: true,
    xpBoost: "+600 XP Protocol Shield",
    description: "Maintained steady waypoint synchronization for 7 consecutive days.",
  },
  {
    id: "kinetic",
    name: "Kinetic Adept",
    category: "Agility",
    icon: "bolt",
    earned: true,
    xpBoost: "+400 XP Agility Multiplier",
    description: "Completed 3 distinct sector quests within a single 4-hour cycle.",
  },
  {
    id: "crown",
    name: "Crown Pioneer",
    category: "Prestige",
    icon: "military-tech",
    earned: true,
    xpBoost: "+2,500 XP Vanguard Legend",
    description: "Achieved elite status across all Nairobi anchor telemetry zones.",
  },
];

export default function ProfileScreen() {
  const theme = useTheme();
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
        setEditName(u.name ?? "Alex Vance");
        setEditUsername(u.username ?? "demoexplorer");
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

  const initial = (me?.name ?? me?.username ?? "A").charAt(0).toUpperCase();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? "#0c0c0e" : c.surface },
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
      color: isDark ? "#f59e0b" : c.primary,
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
    handleText: { ...theme.font(theme.type.labelSm), color: isDark ? "#f59e0b" : c.primary, marginTop: 2, letterSpacing: 1, fontWeight: "700" },

    // Actions Row
    actionsRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14 },
    editBtn: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 18 },
    editBtnText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#f59e0b" : c.primary, fontSize: 11, letterSpacing: 1, fontWeight: "700" },
    gearBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },

    // Bento Stats
    bentoCard: { padding: 18, borderRadius: 24, marginBottom: 14 },
    xpHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    xpLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 1.2, fontWeight: "700" },
    starWell: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
    xpValueRow: { flexDirection: "row", alignItems: "baseline", marginVertical: 6 },
    xpBig: { ...theme.font(theme.type.displayXl), color: c.onSurface, fontSize: 34, fontWeight: "700" },
    trackWell: { height: 8, width: "100%", borderRadius: 4, marginVertical: 8, overflow: "hidden" },
    trackFill: { height: "100%", width: "74%", backgroundColor: isDark ? "#f59e0b" : c.primary, borderRadius: 4 },
    tierRow: { flexDirection: "row", justifyContent: "space-between" },
    tierText: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, fontSize: 11, fontWeight: "600" },

    // 2-Column Bento Grid
    bentoGrid: { flexDirection: "row", gap: 12, marginBottom: 18 },
    bentoCol: { flex: 1, padding: 16, borderRadius: 22 },
    colHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    colLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 10, fontWeight: "700" },
    colValueWell: { paddingVertical: 10, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    colValue: { ...theme.font(theme.type.headlineSm), color: isDark ? "#f59e0b" : c.primary, fontSize: 20, fontWeight: "700" },

    // Badges Shelf (Full 8 Badges Grid — No Blanks)
    shelfCard: { padding: 18, borderRadius: 24, marginBottom: 20 },
    shelfHeadingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
    shelfHeading: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 1.5, fontWeight: "700" },
    shelfCountTag: { ...theme.font(theme.type.labelCaps), color: isDark ? "#f59e0b" : c.primary, fontSize: 10, fontWeight: "700" },
    badgeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
    badgeSlot: { width: "22%", alignItems: "center", gap: 4, marginBottom: 8 },
    badgeMoldCount: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" },
    badgeName: { ...theme.font(theme.type.labelCaps), color: c.onSurface, fontSize: 9, textAlign: "center", fontWeight: "600" },

    // Danger Zone
    dangerBtn: { padding: 16, borderRadius: 20, alignItems: "center", justifyContent: "center", marginTop: 4 },
    dangerText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#ffb4ab" : c.error, letterSpacing: 1, fontWeight: "700" },

    // Modal Styles
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContainer: { width: "100%", maxWidth: 380, padding: 24, borderRadius: 28 },
    modalTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 6 },
    modalSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginBottom: 20 },
    inputWell: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, marginBottom: 14 },
    textInput: { ...theme.font(theme.type.bodyMd), color: c.onSurface, fontSize: 15 },
    modalBtnRow: { flexDirection: "row", gap: 12, marginTop: 10 },
    modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    modalBtnText: { ...theme.font(theme.type.labelCaps), fontSize: 12, letterSpacing: 1, fontWeight: "700" },

    // Badge Modal Special
    badgeModalPedestal: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 16 },
    statusChip: { alignSelf: "center", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12, marginBottom: 12 },
    statusChipText: { ...theme.font(theme.type.labelCaps), fontSize: 10, letterSpacing: 1, fontWeight: "700" },
    xpBoostCard: { padding: 12, borderRadius: 16, marginBottom: 16 },
    xpBoostText: { ...theme.font(theme.type.headlineSm), color: isDark ? "#f59e0b" : c.primary, fontSize: 13, textAlign: "center", fontWeight: "700" },
  });

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
            tintColor={isDark ? "#f59e0b" : c.primary}
            colors={[isDark ? "#f59e0b" : c.primary]}
          />
        }
      >
        {/* Double-Ring Avatar */}
        <View style={styles.avatarSection}>
          <NeumorphicView variant="raised" glow="gold" radius={58} style={styles.outerRing}>
            <NeumorphicView variant="inset" radius={50} style={styles.innerWell}>
              <Text style={styles.avatarText}>{initial}</Text>
            </NeumorphicView>
            <NeumorphicView variant="raised" glow="gold" radius={17} style={styles.streakBadge}>
              <MaterialIcons name="local-fire-department" size={20} color={isDark ? "#f59e0b" : "#b45309"} />
            </NeumorphicView>
          </NeumorphicView>

          <Text style={styles.nameText}>{me?.name ?? "Alex Vance"}</Text>
          <Text style={styles.handleText}>@{me?.username?.toUpperCase() ?? "DEMOEXPLORER"}</Text>

          <View style={styles.actionsRow}>
            <NeumorphicView
              variant="raised"
              glow="gold"
              radius={18}
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
              <MaterialIcons name="settings" size={20} color={isDark ? "#f59e0b" : c.primary} />
            </NeumorphicView>
          </View>
        </View>

        {/* Total XP Bento Card */}
        <NeumorphicView variant="raised" glow={isDark ? "gold" : "none"} radius={24} style={styles.bentoCard}>
          <View style={styles.xpHeaderRow}>
            <Text style={styles.xpLabel}>TOTAL XP</Text>
            <NeumorphicView variant="inset" radius={17} style={styles.starWell}>
              <MaterialIcons name="star" size={18} color={isDark ? "#f59e0b" : "#b45309"} />
            </NeumorphicView>
          </View>

          <View style={styles.xpValueRow}>
            <Text style={styles.xpBig}>{me?.xp ? `${me.xp}K` : "100K"}</Text>
          </View>

          <NeumorphicView variant="inset" radius={4} style={styles.trackWell}>
            <View style={styles.trackFill} />
          </NeumorphicView>

          <View style={styles.tierRow}>
            <Text style={styles.tierText}>Nairobi Vanguard Tier</Text>
            <Text style={styles.tierText}>Lvl {me?.level ?? 2} → {((me?.level ?? 2) + 1)}</Text>
          </View>
        </NeumorphicView>

        {/* 2-Column Bento Grid */}
        <View style={styles.bentoGrid}>
          {/* Quests Completed */}
          <NeumorphicView variant="raised" radius={22} style={styles.bentoCol}>
            <View style={styles.colHeaderRow}>
              <Text style={styles.colLabel}>QUESTS</Text>
              <MaterialIcons name="flag" size={16} color={c.onSurfaceVariant} />
            </View>
            <NeumorphicView variant="inset" radius={14} style={styles.colValueWell}>
              <Text style={styles.colValue}>{wallet.length > 0 ? wallet.length : "2"}</Text>
            </NeumorphicView>
          </NeumorphicView>

          {/* Streak Days */}
          <NeumorphicView variant="raised" radius={22} style={styles.bentoCol}>
            <View style={styles.colHeaderRow}>
              <Text style={styles.colLabel}>STREAK</Text>
              <MaterialIcons name="local-fire-department" size={16} color={isDark ? "#f59e0b" : "#b45309"} />
            </View>
            <NeumorphicView variant="inset" radius={14} style={styles.colValueWell}>
              <Text style={styles.colValue}>{me?.currentStreak ?? 1} days</Text>
            </NeumorphicView>
          </NeumorphicView>
        </View>

        {/* Earned Badges Shelf (Full 8 Badges Grid — No Blanks) */}
        <NeumorphicView variant="raised" radius={24} style={styles.shelfCard}>
          <View style={styles.shelfHeadingRow}>
            <Text style={styles.shelfHeading}>EARNED SECTOR BADGES</Text>
            <Text style={styles.shelfCountTag}>8 / 8 UNLOCKED</Text>
          </View>

          <View style={styles.badgeGrid}>
            {BADGES.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={styles.badgeSlot}
                activeOpacity={0.75}
                onPress={() => setSelectedBadge(b)}
              >
                <NeumorphicView
                  variant="raised"
                  glow={b.id === "crown" || b.id === "100k" ? "gold" : "blue"}
                  radius={27}
                  style={styles.badgeMoldCount}
                >
                  <MaterialIcons
                    name={b.icon}
                    size={24}
                    color={b.id === "crown" || b.id === "100k" ? "#f59e0b" : (isDark ? "#3b82f6" : "#1d4ed8")}
                  />
                </NeumorphicView>
                <Text style={styles.badgeName} numberOfLines={1}>
                  {b.name.split(" ")[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </NeumorphicView>

        {/* Delete Account Button */}
        <NeumorphicView
          variant="flat"
          radius={20}
          style={styles.dangerBtn}
          onPress={() => setDeleteModalVisible(true)}
        >
          <Text style={styles.dangerText}>PURGE ACCOUNT DATA</Text>
        </NeumorphicView>
      </ScrollView>

      {/* 1. Neumorphic Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <NeumorphicView variant="raised" glow="gold" radius={28} style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Callsign</Text>
            <Text style={styles.modalSub}>Update your Vanguard operative credentials</Text>

            <NeumorphicView variant="inset" radius={16} style={styles.inputWell}>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Callsign (e.g. Alex Vance)"
                placeholderTextColor={c.onSurfaceVariant}
                style={styles.textInput}
              />
            </NeumorphicView>

            <NeumorphicView variant="inset" radius={16} style={styles.inputWell}>
              <TextInput
                value={editUsername}
                onChangeText={setEditUsername}
                placeholder="Username (e.g. demoexplorer)"
                placeholderTextColor={c.onSurfaceVariant}
                style={styles.textInput}
                autoCapitalize="none"
              />
            </NeumorphicView>

            <View style={styles.modalBtnRow}>
              <NeumorphicView
                variant="flat"
                radius={18}
                style={styles.modalBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: c.onSurfaceVariant }]}>CANCEL</Text>
              </NeumorphicView>

              <NeumorphicView
                variant="raised"
                glow="gold"
                radius={18}
                style={styles.modalBtn}
                onPress={handleSaveProfile}
              >
                <Text style={[styles.modalBtnText, { color: isDark ? "#f59e0b" : c.primary }]}>SAVE</Text>
              </NeumorphicView>
            </View>
          </NeumorphicView>
        </View>
      </Modal>

      {/* 2. Neumorphic Badge Inspection Modal */}
      <Modal visible={!!selectedBadge} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          {selectedBadge && (
            <NeumorphicView variant="raised" glow={selectedBadge.id === "crown" ? "gold" : "blue"} radius={28} style={styles.modalContainer}>
              <NeumorphicView variant="inset" radius={45} style={styles.badgeModalPedestal}>
                <MaterialIcons
                  name={selectedBadge.icon}
                  size={46}
                  color={selectedBadge.id === "crown" ? "#f59e0b" : (isDark ? "#3b82f6" : "#1d4ed8")}
                />
              </NeumorphicView>

              <Text style={styles.modalTitle}>{selectedBadge.name}</Text>
              <NeumorphicView
                variant="inset"
                radius={12}
                style={[
                  styles.statusChip,
                  { backgroundColor: "rgba(16, 185, 129, 0.15)" },
                ]}
              >
                <Text style={[styles.statusChipText, { color: "#10B981" }]}>
                  UNLOCKED & ACTIVE
                </Text>
              </NeumorphicView>

              <NeumorphicView variant="inset" radius={16} style={styles.xpBoostCard}>
                <Text style={styles.xpBoostText}>{selectedBadge.xpBoost}</Text>
              </NeumorphicView>

              <Text style={styles.modalSub}>{selectedBadge.description}</Text>

              <NeumorphicView
                variant="raised"
                glow="gold"
                radius={18}
                style={[styles.modalBtn, { alignSelf: "center", width: "100%" }]}
                onPress={() => setSelectedBadge(null)}
              >
                <Text style={[styles.modalBtnText, { color: isDark ? "#f59e0b" : c.primary }]}>ACKNOWLEDGE</Text>
              </NeumorphicView>
            </NeumorphicView>
          )}
        </View>
      </Modal>

      {/* 3. Neumorphic Delete Account Danger Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <NeumorphicView variant="raised" glow="none" radius={28} style={[styles.modalContainer, { borderColor: "rgba(239, 68, 68, 0.5)" }]}>
            <Text style={[styles.modalTitle, { color: isDark ? "#ffb4ab" : c.error }]}>Purge Operative Data?</Text>
            <Text style={styles.modalSub}>
              This permanently wipes your PIKE identity, earned XP ({me?.xp ?? 100}K), streak records, and badge accolades. This action cannot be reversed.
            </Text>

            <View style={styles.modalBtnRow}>
              <NeumorphicView
                variant="flat"
                radius={18}
                style={styles.modalBtn}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: c.onSurfaceVariant }]}>CANCEL</Text>
              </NeumorphicView>

              <NeumorphicView
                variant="raised"
                radius={18}
                style={[styles.modalBtn, { backgroundColor: "rgba(239, 68, 68, 0.2)", borderColor: "rgba(239, 68, 68, 0.6)" }]}
                onPress={handleConfirmDelete}
              >
                <Text style={[styles.modalBtnText, { color: isDark ? "#ffb4ab" : c.error }]}>PURGE</Text>
              </NeumorphicView>
            </View>
          </NeumorphicView>
        </View>
      </Modal>
    </View>
  );
}

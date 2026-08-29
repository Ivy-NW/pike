import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import type { FavoriteVenueItem, UserProfile } from "@pike/shared-types";
import { api } from "@/lib/api";
import { clearIdentityToken } from "@/lib/auth";
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { NeumorphicView } from "@/components/NeumorphicView";

/** Stitch Neumorphic Explorer Profile */
export default function ProfileScreen() {
  const theme = useTheme();
  const [me, setMe] = useState<UserProfile | null>(null);
  const [questsCompleted, setQuestsCompleted] = useState<number | null>(null);
  const [rewardsClaimed, setRewardsClaimed] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<FavoriteVenueItem[]>([]);

  useEffect(() => {
    api.me().then(setMe).catch(() => {});
    api.quests().then((q) => setQuestsCompleted(q.filter((x) => x.completed).length)).catch(() => {});
    api.wallet().then((w) => setRewardsClaimed(w.length)).catch(() => {});
    api.favorites().then(setFavorites).catch(() => {});
  }, []);

  const unfavorite = async (venueId: string) => {
    const prev = favorites;
    setFavorites((list) => list.filter((v) => v.id !== venueId));
    try {
      await api.removeFavorite(venueId);
    } catch {
      setFavorites(prev);
    }
  };

  const logOut = async () => {
    await clearIdentityToken();
    router.replace("/login");
  };

  const handleEditProfile = () => {
    Alert.alert(
      "Edit Explorer Profile",
      `Callsign: ${me?.name ?? "Alex Vance"}\nHandle: @${me?.username ?? "AV_EXPLORER"}\nLevel: ${me?.level ?? 42}`,
      [{ text: "OK", style: "default" }]
    );
  };

  const handleSettings = () => {
    Alert.alert(
      "Settings",
      "• Dark Mode: Always Active\n• AR Tracking: 8th Wall Enabled\n• Haptic Feedback: Tactile\n• Build: v2.0-neu",
      [{ text: "Close", style: "cancel" }]
    );
  };

  const handleBadgePress = (name: string, description: string) => {
    Alert.alert(`Badge: ${name}`, description, [{ text: "Awesome", style: "default" }]);
  };

  const deleteAccount = () => {
    Alert.alert(
      "Delete account?",
      "This permanently deletes your PIKE account, including your XP, streak, and badges. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteAccount();
              await clearIdentityToken();
              router.replace("/login");
            } catch {
              Alert.alert("Couldn't delete account", "Something went wrong. Please try again.");
            }
          },
        },
      ],
    );
  };

  const c = theme.colors;
  const isDark = theme.mode === "dark";
  const xpProgress = me ? me.xpIntoLevel / me.xpForNextLevel : 0.65;
  const initial = (me?.name ?? me?.username ?? "Explorer").charAt(0).toUpperCase();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? "#141314" : c.surface },
    content: { padding: theme.spacing.containerPadding, paddingTop: 16, paddingBottom: 120 },
    headerSection: { alignItems: "center", marginBottom: 28, marginTop: 4 },
    avatarOuterRing: {
      width: 128,
      height: 128,
      borderRadius: 64,
      padding: 6,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    avatarInnerRing: {
      width: "100%",
      height: "100%",
      borderRadius: 60,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "rgba(0, 240, 255, 0.4)",
    },
    avatarInitial: { ...theme.font(theme.type.displayXl), color: "#00f0ff", fontSize: 44 },
    fireBadge: {
      position: "absolute",
      bottom: -2,
      right: -2,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    fireInner: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "#00eefc",
      alignItems: "center",
      justifyContent: "center",
    },
    name: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, marginTop: 14 },
    handle: { ...theme.font(theme.type.bodyMd), color: "#00dbe9", marginTop: 2, letterSpacing: 1 },
    actionRow: { flexDirection: "row", gap: 12, marginTop: 14 },
    pillButton: { paddingHorizontal: 20, paddingVertical: 10, alignItems: "center", justifyContent: "center" },
    pillButtonText: { ...theme.font(theme.type.labelCaps), color: c.primary, letterSpacing: 1 },
    iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
    
    // Bento Stats Grid
    bentoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
    xpCard: { width: "100%", padding: 18 },
    xpTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    cardLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 1.5 },
    starIconWell: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
    xpNumber: { ...theme.font(theme.type.displayXl), color: c.primary, fontSize: 38 },
    xpProgressTrack: { width: "100%", height: 10, borderRadius: 5, padding: 2, marginTop: 12 },
    xpProgressFill: { height: "100%", backgroundColor: "#00eefc", borderRadius: 4 },
    lvlIndicator: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, textAlign: "right", marginTop: 6 },
    
    halfTile: { width: "48%", padding: 16, justifyContent: "space-between" },
    tileHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    tileWell: { padding: 10, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 8 },
    tileValue: { ...theme.font(theme.type.headlineSm), color: c.primary, fontSize: 22 },

    // Earned Badges Molded Slots
    sectionTitle: { ...theme.font(theme.type.headlineSm), color: c.primary, marginBottom: 14, flexDirection: "row", alignItems: "center", gap: 8 },
    moldedContainer: { padding: 18, borderRadius: 28, marginBottom: 24 },
    badgesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14, justifyContent: "space-between" },
    badgeSlot: { width: "30%", alignItems: "center", marginBottom: 10 },
    badgeOuterRing: { width: 68, height: 68, borderRadius: 34, padding: 4, alignItems: "center", justifyContent: "center" },
    badgeInnerWell: { width: "100%", height: "100%", borderRadius: 30, alignItems: "center", justifyContent: "center" },
    badgeLabel: { ...theme.font(theme.type.labelSm), color: c.primary, fontSize: 10, marginTop: 6, textAlign: "center" },

    // Additional Actions
    navRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, marginBottom: 14 },
    navRowText: { ...theme.font(theme.type.headlineSm), color: c.onSurface, flex: 1 },
    favCard: { padding: 16, marginBottom: 14 },
    favRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
    favName: { ...theme.font(theme.type.bodyMd), color: c.onSurface, flex: 1 },
    favEmpty: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant },
    dangerButton: { padding: 14, alignItems: "center", marginTop: 8 },
    dangerButtonText: { ...theme.font(theme.type.labelCaps), color: c.error, letterSpacing: 1 },
    linkButton: { padding: 14, alignItems: "center" },
    linkText: { ...theme.font(theme.type.labelSm), color: c.outline },
  });

  return (
    <View style={styles.container}>
      <TopNav title="PIKE" showLogo={false} subtitle="Explorer Profile" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.headerSection}>
          <NeumorphicView variant="raised" radius={64} style={styles.avatarOuterRing}>
            <NeumorphicView variant="inset" radius={60} style={styles.avatarInnerRing}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </NeumorphicView>
            <NeumorphicView variant="raised" radius={18} style={styles.fireBadge}>
              <View style={styles.fireInner}>
                <MaterialIcons name="local-fire-department" size={18} color="#00363a" />
              </View>
            </NeumorphicView>
          </NeumorphicView>

          <Text style={styles.name}>{me?.name ?? me?.username ?? "Alex Vance"}</Text>
          <Text style={styles.handle}>@{me?.username ? me.username.toUpperCase() : "AV_EXPLORER"}</Text>

          <View style={styles.actionRow}>
            <NeumorphicView variant="raised" radius={24} style={styles.pillButton} onPress={handleEditProfile}>
              <Text style={styles.pillButtonText}>EDIT PROFILE</Text>
            </NeumorphicView>
            <NeumorphicView variant="raised" radius={21} style={styles.iconButton} onPress={handleSettings}>
              <MaterialIcons name="settings" size={20} color={c.primary} />
            </NeumorphicView>
          </View>
        </View>

        {/* Bento Stats Grid */}
        <View style={styles.bentoGrid}>
          {/* XP Tile */}
          <NeumorphicView variant="raised" radius={24} style={styles.xpCard}>
            <View style={styles.xpTopRow}>
              <Text style={styles.cardLabel}>TOTAL XP</Text>
              <NeumorphicView variant="inset" radius={17} style={styles.starIconWell}>
                <MaterialIcons name="star" size={18} color="#00f0ff" />
              </NeumorphicView>
            </View>
            <Text style={styles.xpNumber}>{me?.xp ?? "42.8"}<Text style={{ fontSize: 24, color: c.onSurfaceVariant }}>K</Text></Text>
            <NeumorphicView variant="inset" radius={5} style={styles.xpProgressTrack}>
              <View style={[styles.xpProgressFill, { width: `${Math.round(xpProgress * 100)}%` }]} />
            </NeumorphicView>
            <Text style={styles.lvlIndicator}>Lvl {me?.level ?? 42} → {(me?.level ?? 42) + 1}</Text>
          </NeumorphicView>

          {/* Quests Tile */}
          <NeumorphicView variant="raised" radius={24} style={styles.halfTile}>
            <View style={styles.tileHeader}>
              <Text style={styles.cardLabel}>QUESTS</Text>
              <MaterialIcons name="flag" size={20} color={c.onSurfaceVariant} />
            </View>
            <NeumorphicView variant="inset" radius={14} style={styles.tileWell}>
              <Text style={styles.tileValue}>{questsCompleted ?? 156}</Text>
            </NeumorphicView>
          </NeumorphicView>

          {/* Streak Tile */}
          <NeumorphicView variant="raised" radius={24} style={styles.halfTile}>
            <View style={styles.tileHeader}>
              <Text style={styles.cardLabel}>STREAK</Text>
              <MaterialIcons name="local-fire-department" size={20} color="#00dbe9" />
            </View>
            <NeumorphicView variant="inset" radius={14} style={styles.tileWell}>
              <Text style={styles.tileValue}>{me?.currentStreak ?? 14} <Text style={{ fontSize: 13, color: "#00dbe9" }}>days</Text></Text>
            </NeumorphicView>
          </NeumorphicView>
        </View>

        {/* Earned Badges Molded Slots */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <MaterialIcons name="military-tech" size={24} color={c.onSurfaceVariant} />
          <Text style={{ ...theme.font(theme.type.headlineSm), color: c.primary }}>EARNED BADGES</Text>
        </View>
        <NeumorphicView variant="inset" radius={28} style={styles.moldedContainer}>
          <View style={styles.badgesGrid}>
            {/* Slot 1: Alpine Master */}
            <View style={styles.badgeSlot}>
              <NeumorphicView
                variant="raised"
                radius={34}
                style={styles.badgeOuterRing}
                onPress={() => handleBadgePress("Alpine Master", "Earned for exploring high-elevation physical waypoints.")}
              >
                <NeumorphicView variant="inset" radius={30} style={styles.badgeInnerWell}>
                  <MaterialIcons name="terrain" size={24} color="#e1d2ff" />
                </NeumorphicView>
              </NeumorphicView>
              <Text style={styles.badgeLabel}>ALPINE</Text>
            </View>

            {/* Slot 2: Pathfinder */}
            <View style={styles.badgeSlot}>
              <NeumorphicView
                variant="raised"
                radius={34}
                style={styles.badgeOuterRing}
                onPress={() => handleBadgePress("Pathfinder", "Awarded for discovering 5 novel anchor nodes.")}
              >
                <NeumorphicView variant="inset" radius={30} style={styles.badgeInnerWell}>
                  <MaterialIcons name="explore" size={24} color="#00eefc" />
                </NeumorphicView>
              </NeumorphicView>
              <Text style={styles.badgeLabel}>PATHFINDER</Text>
            </View>

            {/* Slot 3: 100K Steps */}
            <View style={styles.badgeSlot}>
              <NeumorphicView
                variant="raised"
                radius={34}
                style={styles.badgeOuterRing}
                onPress={() => handleBadgePress("100K Steps", "Awarded for traveling over 100,000 steps during quest exploration.")}
              >
                <NeumorphicView variant="inset" radius={30} style={styles.badgeInnerWell}>
                  <MaterialIcons name="directions-walk" size={24} color="#cfc5ba" />
                </NeumorphicView>
              </NeumorphicView>
              <Text style={styles.badgeLabel}>100K STEPS</Text>
            </View>

            {/* Slot 4: Locked Mold */}
            <View style={styles.badgeSlot}>
              <NeumorphicView
                variant="raised"
                radius={34}
                style={styles.badgeOuterRing}
                onPress={() => handleBadgePress("Locked Badge", "Complete 10 more cybernetic quests to unlock this slot.")}
              >
                <NeumorphicView variant="inset" radius={30} style={styles.badgeInnerWell}>
                  <MaterialIcons name="lock" size={22} color="#353435" />
                </NeumorphicView>
              </NeumorphicView>
              <Text style={[styles.badgeLabel, { color: "#353435" }]}>LOCKED</Text>
            </View>

            {/* Slot 5: Locked Mold */}
            <View style={styles.badgeSlot}>
              <NeumorphicView
                variant="raised"
                radius={34}
                style={styles.badgeOuterRing}
                onPress={() => handleBadgePress("Locked Badge", "Complete the multi-venue Deep Dive Challenge to unlock.")}
              >
                <NeumorphicView variant="inset" radius={30} style={styles.badgeInnerWell}>
                  <MaterialIcons name="lock" size={22} color="#353435" />
                </NeumorphicView>
              </NeumorphicView>
              <Text style={[styles.badgeLabel, { color: "#353435" }]}>LOCKED</Text>
            </View>
          </View>
        </NeumorphicView>

        {/* Leaderboard link */}
        <NeumorphicView variant="raised" radius={20} style={styles.navRow} onPress={() => router.push("/leaderboard")}>
          <MaterialIcons name="leaderboard" size={22} color="#00f0ff" />
          <Text style={styles.navRowText}>Reputational Leaderboard</Text>
          <MaterialIcons name="chevron-right" size={22} color={c.onSurfaceVariant} />
        </NeumorphicView>

        {/* Favorite venues */}
        <NeumorphicView variant="raised" radius={20} style={styles.favCard}>
          <Text style={{ ...theme.font(theme.type.headlineSm), color: c.onSurface, marginBottom: 10 }}>Favorite Venues</Text>
          {favorites.length === 0 ? (
            <Text style={styles.favEmpty}>Tap the heart on a venue in Explore to save it here.</Text>
          ) : (
            favorites.map((v) => (
              <View key={v.id} style={styles.favRow}>
                <MaterialIcons name="place" size={18} color="#00f0ff" />
                <Text style={styles.favName} numberOfLines={1}>{v.name}</Text>
                <TouchableOpacity onPress={() => unfavorite(v.id)} hitSlop={8}>
                  <MaterialIcons name="favorite" size={18} color="#00f0ff" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </NeumorphicView>

        <NeumorphicView variant="flat" radius={theme.radius.card} style={styles.dangerButton} onPress={logOut}>
          <Text style={styles.dangerButtonText}>LOG OUT</Text>
        </NeumorphicView>

        <TouchableOpacity style={styles.linkButton} onPress={deleteAccount}>
          <Text style={styles.linkText}>Delete my account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

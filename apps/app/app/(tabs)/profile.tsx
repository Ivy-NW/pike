import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import type { FavoriteVenueItem, UserProfile } from "@pike/shared-types";
import { api } from "@/lib/api";
import { clearIdentityToken } from "@/lib/auth";
import { useTheme } from "@/theme";

/** UI doc 7.5 — identity, history, and settings. */
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

  // FR-6: remove a favorite from the Profile list (optimistic, reverts on failure).
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

  // App Store guideline 5.1.1(v): real in-app account deletion, gated behind an explicit
  // destructive confirmation. On success the account (XP/streak/badges) is gone server-side,
  // so we clear the local token and send the user back to login.
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
  const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: c.surface, padding: theme.spacing.containerPadding, paddingTop: 60, paddingBottom: 36 },
    eyebrow: { ...theme.font(theme.type.labelCaps), color: c.primary, marginBottom: 8 },
    header: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, marginBottom: theme.spacing.sectionMargin },
    avatarWrap: { alignItems: "center", marginBottom: theme.spacing.sectionMargin },
    avatarRing: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: c.primaryContainer,
    },
    avatarInitial: { ...theme.font(theme.type.displayXl), color: c.onSurface },
    name: { ...theme.font(theme.type.headlineLg), color: c.onSurface, marginTop: 12 },
    tierPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.mode === "dark" ? "rgba(180,197,255,0.1)" : "rgba(0,74,198,0.08)",
      borderWidth: 1,
      borderColor: c.primaryContainer,
      borderRadius: theme.radius.full,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginTop: 8,
    },
    tierText: { ...theme.font(theme.type.labelCaps), color: c.primary },
    statsRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.elementGap, marginBottom: theme.spacing.sectionMargin },
    statCard: {
      width: "47%",
      backgroundColor: c.slateGray,
      borderRadius: theme.radius.card,
      padding: theme.spacing.stackMd,
      borderWidth: 1,
      borderColor: c.surfaceContainerHighest,
    },
    statLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, marginBottom: 8 },
    statNumber: { ...theme.font(theme.type.displayXl), color: c.onSurface },
    statNumberGold: { ...theme.font(theme.type.displayXl), color: c.secondary },
    card: { backgroundColor: theme.mode === "dark" ? "rgba(30,41,59,0.7)" : c.surfaceContainerLowest, borderRadius: theme.radius.card, padding: theme.spacing.stackMd, marginBottom: theme.spacing.stackMd, borderWidth: 1, borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.05)" : c.borderSubtle },
    cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface },
    viewAll: { ...theme.font(theme.type.labelCaps), color: c.primary },
    badgeGrid: { flexDirection: "row", flexWrap: "wrap" },
    badgeSlot: { width: "33.333%", alignItems: "center", marginBottom: 14 },
    badgeIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
      borderWidth: 1,
      borderColor: "rgba(180,83,9,0.3)",
    },
    badgeIconLocked: { borderColor: c.outline + "33" },
    badgeName: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, textAlign: "center" },
    dangerButton: { backgroundColor: "transparent", borderRadius: theme.radius.card, padding: 14, alignItems: "center", borderWidth: 1, borderColor: c.error, marginTop: 8 },
    dangerButtonText: { ...theme.font(theme.type.labelCaps), color: c.error },
    linkButton: { padding: 14, alignItems: "center" },
    linkText: { ...theme.font(theme.type.labelSm), color: c.outline },
    navRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: theme.mode === "dark" ? "rgba(30,41,59,0.7)" : c.surfaceContainerLowest,
      borderRadius: theme.radius.card,
      padding: theme.spacing.stackMd,
      marginBottom: theme.spacing.stackMd,
      borderWidth: 1,
      borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.05)" : c.borderSubtle,
    },
    navRowText: { ...theme.font(theme.type.headlineSm), color: c.onSurface, flex: 1 },
    favRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.mode === "dark" ? "rgba(255,255,255,0.05)" : c.borderSubtle },
    favName: { ...theme.font(theme.type.bodyMd), color: c.onSurface, flex: 1 },
    favEmpty: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant },
  });

  const initial = (me?.name ?? me?.username ?? "?").charAt(0).toUpperCase();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.surface }} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>EXPLORER IDENTITY</Text>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.avatarWrap}>
        <View style={styles.avatarRing}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <Text style={styles.name}>{me?.name ?? me?.username ?? "PIKE explorer"}</Text>
        {me && (
          <View style={styles.tierPill}>
            <Text style={styles.tierText}>LEVEL {me.level}</Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>QUESTS</Text>
          <Text style={styles.statNumber}>{questsCompleted ?? "-"}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>REWARDS</Text>
          <Text style={styles.statNumber}>{rewardsClaimed ?? "-"}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>STREAK</Text>
          <Text style={styles.statNumberGold}>{me?.currentStreak ?? "-"}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>TOTAL XP</Text>
          <Text style={styles.statNumber}>{me?.xp ?? "-"}</Text>
        </View>
      </View>

      {me && (
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Earned badges</Text>
            <Text style={styles.viewAll}>VIEW ALL</Text>
          </View>
          <View style={styles.badgeGrid}>
            {me.badges.map((item) => {
              const earned = !!item.earnedAt;
              return (
                <View key={item.key} style={styles.badgeSlot}>
                  <View style={[styles.badgeIcon, !earned && styles.badgeIconLocked]}>
                    <MaterialIcons
                      name="stars"
                      size={24}
                      color={earned ? c.secondary : c.outline}
                      style={{ opacity: earned ? 1 : 0.35 }}
                    />
                  </View>
                  <Text style={styles.badgeName} numberOfLines={2}>
                    {item.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Phase 3 — FR-7: reputational leaderboard access (UI §7.5). */}
      <TouchableOpacity style={styles.navRow} onPress={() => router.push("/leaderboard")}>
        <MaterialIcons name="leaderboard" size={20} color={c.primary} />
        <Text style={styles.navRowText}>Leaderboard</Text>
        <MaterialIcons name="chevron-right" size={22} color={c.onSurfaceVariant} />
      </TouchableOpacity>

      {/* FR-6: favorited venues (will drive "new quest at a favorited venue" push triggers). */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Favorite venues</Text>
        {favorites.length === 0 ? (
          <Text style={[styles.favEmpty, { marginTop: 8 }]}>Tap the heart on a venue in the Map tab to save it here.</Text>
        ) : (
          favorites.map((v) => (
            <View key={v.id} style={styles.favRow}>
              <MaterialIcons name="place" size={18} color={c.primary} />
              <Text style={styles.favName} numberOfLines={1}>{v.name}</Text>
              <TouchableOpacity onPress={() => unfavorite(v.id)} hitSlop={8}>
                <MaterialIcons name="favorite" size={18} color={c.primary} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.dangerButton} onPress={logOut}>
        <Text style={styles.dangerButtonText}>Log out</Text>
      </TouchableOpacity>

      {/* App Store guideline 5.1.1(v): real in-app account deletion (PRD section 13). */}
      <TouchableOpacity style={styles.linkButton} onPress={deleteAccount}>
        <Text style={styles.linkText}>Delete my account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

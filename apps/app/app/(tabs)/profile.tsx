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
    container: { flex: 1, backgroundColor: c.surface },
    content: { padding: theme.spacing.containerPadding, paddingTop: 16, paddingBottom: 110 },
    avatarWrap: { alignItems: "center", marginBottom: theme.spacing.sectionMargin, marginTop: 8 },
    avatarRing: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitial: { ...theme.font(theme.type.displayXl), color: c.primary, fontSize: 36 },
    name: { ...theme.font(theme.type.headlineLg), color: c.onSurface, marginTop: 14 },
    tierPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 6,
      marginTop: 10,
    },
    tierText: { ...theme.font(theme.type.labelCaps), color: c.primary, letterSpacing: 0.8 },
    statsRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.elementGap, marginBottom: theme.spacing.sectionMargin },
    statCard: {
      width: "47%",
      padding: theme.spacing.stackMd + 2,
    },
    statLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, marginBottom: 8, letterSpacing: 0.8 },
    statNumber: { ...theme.font(theme.type.displayXl), color: c.onSurface },
    statNumberGold: { ...theme.font(theme.type.displayXl), color: c.secondary },
    card: {
      padding: theme.spacing.stackMd + 2,
      marginBottom: theme.spacing.stackMd + 4,
    },
    cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface },
    viewAll: { ...theme.font(theme.type.labelCaps), color: c.primary, fontSize: 11 },
    badgeSlot: { flex: 1 / 3, alignItems: "center", marginBottom: 14 },
    badgeIcon: {
      width: 58,
      height: 58,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    badgeName: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, textAlign: "center" },
    dangerButton: {
      padding: 14,
      alignItems: "center",
      marginTop: 8,
    },
    dangerButtonText: { ...theme.font(theme.type.labelCaps), color: c.error, letterSpacing: 0.8 },
    linkButton: { padding: 14, alignItems: "center" },
    linkText: { ...theme.font(theme.type.labelSm), color: c.outline },
    navRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: theme.spacing.stackMd + 2,
      marginBottom: theme.spacing.stackMd + 4,
    },
    navRowText: { ...theme.font(theme.type.headlineSm), color: c.onSurface, flex: 1 },
    favRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: c.neumorphBorder },
    favName: { ...theme.font(theme.type.bodyMd), color: c.onSurface, flex: 1 },
    favEmpty: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant },
  });

  const initial = (me?.name ?? me?.username ?? "?").charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <TopNav title="Profile" showLogo={false} subtitle={me?.username ? `@${me.username}` : undefined} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarWrap}>
          <NeumorphicView variant="raised" glow="blue" radius={44} style={styles.avatarRing}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </NeumorphicView>
          <Text style={styles.name}>{me?.name ?? me?.username ?? "PIKE explorer"}</Text>
          {me && (
            <NeumorphicView variant="inset" radius={theme.radius.full} style={styles.tierPill}>
              <Text style={styles.tierText}>LEVEL {me.level}</Text>
            </NeumorphicView>
          )}
        </View>

        <View style={styles.statsRow}>
          <NeumorphicView variant="raised" radius={20} style={styles.statCard}>
            <Text style={styles.statLabel}>QUESTS</Text>
            <Text style={styles.statNumber}>{questsCompleted ?? "-"}</Text>
          </NeumorphicView>
          <NeumorphicView variant="raised" radius={20} style={styles.statCard}>
            <Text style={styles.statLabel}>REWARDS</Text>
            <Text style={styles.statNumber}>{rewardsClaimed ?? "-"}</Text>
          </NeumorphicView>
          <NeumorphicView variant="raised" radius={20} style={styles.statCard}>
            <Text style={styles.statLabel}>STREAK</Text>
            <Text style={styles.statNumberGold}>{me?.currentStreak ?? "-"}</Text>
          </NeumorphicView>
          <NeumorphicView variant="raised" radius={20} style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL XP</Text>
            <Text style={styles.statNumber}>{me?.xp ?? "-"}</Text>
          </NeumorphicView>
        </View>

        {me && (
          <NeumorphicView variant="raised" radius={20} style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Earned badges</Text>
              <Text style={styles.viewAll}>VIEW ALL</Text>
            </View>
            <FlatList
              data={me.badges}
              numColumns={3}
              scrollEnabled={false}
              keyExtractor={(b) => b.key}
              renderItem={({ item }) => {
                const earned = !!item.earnedAt;
                return (
                  <View style={styles.badgeSlot}>
                    <NeumorphicView
                      variant={earned ? "raised" : "inset"}
                      glow={earned ? "gold" : "none"}
                      radius={18}
                      style={styles.badgeIcon}
                    >
                      <MaterialIcons
                        name="stars"
                        size={26}
                        color={earned ? c.secondary : c.outline}
                        style={{ opacity: earned ? 1 : 0.35 }}
                      />
                    </NeumorphicView>
                    <Text style={styles.badgeName} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </View>
                );
              }}
            />
          </NeumorphicView>
        )}

        {/* Phase 3 — FR-7: reputational leaderboard access */}
        <NeumorphicView variant="raised" radius={20} style={styles.navRow} onPress={() => router.push("/leaderboard")}>
          <MaterialIcons name="leaderboard" size={22} color={c.primary} />
          <Text style={styles.navRowText}>Leaderboard</Text>
          <MaterialIcons name="chevron-right" size={22} color={c.onSurfaceVariant} />
        </NeumorphicView>

        {/* FR-6: favorited venues */}
        <NeumorphicView variant="raised" radius={20} style={styles.card}>
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
        </NeumorphicView>

        <NeumorphicView variant="flat" radius={theme.radius.card} style={styles.dangerButton} onPress={logOut}>
          <Text style={styles.dangerButtonText}>LOG OUT</Text>
        </NeumorphicView>

        {/* App Store guideline 5.1.1(v): in-app account deletion */}
        <TouchableOpacity style={styles.linkButton} onPress={deleteAccount}>
          <Text style={styles.linkText}>Delete my account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

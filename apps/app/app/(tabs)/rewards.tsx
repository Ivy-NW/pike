import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { UserWalletItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { NeumorphicView } from "@/components/NeumorphicView";

const titleOf = (w: UserWalletItem) => (w.kind === "quest" ? w.quest.rewardDescription : w.rewardDescription);
const subtitleOf = (w: UserWalletItem) => (w.kind === "quest" ? w.venue.name : w.name);
const keyOf = (w: UserWalletItem) => (w.kind === "quest" ? w.redemptionId : `macro-${w.macroQuestId}`);

/** Stitch Reward Wallet (Neumorphic) */
export default function RewardsScreen() {
  const theme = useTheme();
  const [wallet, setWallet] = useState<UserWalletItem[]>([]);

  useEffect(() => {
    api.wallet().then(setWallet).catch(() => setWallet([]));
  }, []);

  const unredeemed = wallet.filter((w) => !w.isExpired);
  const expired = wallet.filter((w) => w.isExpired);
  const c = theme.colors;
  const isDark = theme.mode === "dark";

  const handleRedeem = (item: UserWalletItem) => {
    Alert.alert(
      "Redeem Reward",
      `Present this voucher at ${subtitleOf(item)}:\n\n${titleOf(item)}`,
      [{ text: "Done", style: "default" }]
    );
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? "#141314" : c.surface },
    content: { padding: theme.spacing.containerPadding, paddingTop: 16, paddingBottom: 120 },
    
    // Total Balance Card
    balanceCard: { padding: 24, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 24, position: "relative" },
    balanceLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 2, marginBottom: 6 },
    balanceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
    balanceValue: { ...theme.font(theme.type.displayXl), color: c.primary, fontSize: 44, fontWeight: "700" },
    balanceUnit: { ...theme.font(theme.type.headlineSm), color: "#00dbe9" },
    balanceBtnRow: { flexDirection: "row", gap: 12, marginTop: 16 },
    balanceBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 10 },
    balanceBtnText: { ...theme.font(theme.type.labelCaps), color: c.primary, letterSpacing: 1 },

    // Rewards Section
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    sectionTitle: { ...theme.font(theme.type.headlineSm), color: c.primary },
    newTag: { paddingHorizontal: 12, paddingVertical: 4 },
    newTagText: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 10 },

    // Reward Cards
    card: { padding: 18, borderRadius: 24, marginBottom: 14 },
    cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    iconWell: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    premiumTag: { paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(0,238,252,0.3)" },
    premiumTagText: { ...theme.font(theme.type.labelCaps), color: "#00dbe9", fontSize: 10 },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.primary, fontSize: 18 },
    cardVenue: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 2, marginBottom: 16 },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
    pointsText: { ...theme.font(theme.type.bodyMd), color: c.onSurface, fontWeight: "700" },
    redeemBtn: { paddingHorizontal: 20, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(0,240,255,0.25)" },
    redeemBtnText: { ...theme.font(theme.type.labelCaps), color: "#00f0ff", fontSize: 11 },
    emptyText: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginBottom: 16 },
  });

  return (
    <View style={styles.container}>
      <TopNav title="Rewards" showLogo={false} subtitle={`${unredeemed.length} vouchers`} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Total Balance Card */}
        <NeumorphicView variant="raised" glow="cyan" radius={28} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceValue}>12,450</Text>
            <Text style={styles.balanceUnit}>PTS</Text>
          </View>
          <View style={styles.balanceBtnRow}>
            <NeumorphicView variant="raised" radius={20} style={styles.balanceBtn}>
              <MaterialIcons name="add" size={16} color={c.primary} />
              <Text style={styles.balanceBtnText}>ADD FUNDS</Text>
            </NeumorphicView>
            <NeumorphicView variant="raised" radius={20} style={styles.balanceBtn}>
              <MaterialIcons name="history" size={16} color={c.primary} />
              <Text style={styles.balanceBtnText}>HISTORY</Text>
            </NeumorphicView>
          </View>
        </NeumorphicView>

        {/* Available Rewards Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Rewards</Text>
          <NeumorphicView variant="inset" radius={12} style={styles.newTag}>
            <Text style={styles.newTagText}>{unredeemed.length} ACTIVE</Text>
          </NeumorphicView>
        </View>

        {unredeemed.length === 0 ? (
          <Text style={styles.emptyText}>No active reward vouchers yet. Complete quests to unlock rewards!</Text>
        ) : (
          unredeemed.map((item) => (
            <NeumorphicView key={keyOf(item)} variant="raised" radius={24} style={styles.card}>
              <View style={styles.cardTopRow}>
                <NeumorphicView variant="inset" radius={16} style={styles.iconWell}>
                  <MaterialIcons name={item.kind === "macro-quest" ? "emoji-events" : "local-cafe"} size={24} color="#00f0ff" />
                </NeumorphicView>
                <NeumorphicView variant="inset" radius={12} style={styles.premiumTag}>
                  <Text style={styles.premiumTagText}>{item.kind === "macro-quest" ? "VIP PASS" : "PREMIUM"}</Text>
                </NeumorphicView>
              </View>

              <Text style={styles.cardTitle}>{titleOf(item)}</Text>
              <Text style={styles.cardVenue}>{subtitleOf(item)}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.pointsText}>
                  {item.expiresAt ? `Expires ${new Date(item.expiresAt).toLocaleDateString()}` : "1,500 PTS"}
                </Text>
                <NeumorphicView
                  variant="inset"
                  radius={16}
                  style={styles.redeemBtn}
                  onPress={() => handleRedeem(item)}
                >
                  <Text style={styles.redeemBtnText}>REDEEM</Text>
                </NeumorphicView>
              </View>
            </NeumorphicView>
          ))
        )}

        {expired.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 16 }]}>
              <Text style={styles.sectionTitle}>History (Expired)</Text>
            </View>
            {expired.map((item) => (
              <NeumorphicView key={keyOf(item)} variant="flat" radius={24} style={[styles.card, { opacity: 0.5 }]}>
                <Text style={styles.cardTitle}>{titleOf(item)}</Text>
                <Text style={styles.cardVenue}>{subtitleOf(item)}</Text>
              </NeumorphicView>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

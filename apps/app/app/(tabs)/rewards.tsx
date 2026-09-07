import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { UserWalletItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme, useSemanticColors, RADIUS_CARD } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { NeumorphicView } from "@/components/NeumorphicView";
import { useRewardColor } from "@/components/RewardAccent";

const titleOf = (w: UserWalletItem) => (w.kind === "quest" ? w.quest.rewardDescription : w.rewardDescription);
const subtitleOf = (w: UserWalletItem) => (w.kind === "quest" ? w.venue.name : w.name);
const codeOf = (w: UserWalletItem) => (w.kind === "quest" ? w.redemptionId : w.macroQuestId);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export default function RewardsScreen() {
  const theme = useTheme();
  const semantic = useSemanticColors();
  const rewardColor = useRewardColor();
  const [wallet, setWallet] = useState<UserWalletItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [historyVisible, setHistoryVisible] = useState(false);
  const [redeemItem, setRedeemItem] = useState<UserWalletItem | null>(null);

  const c = theme.colors;
  const isDark = theme.mode === "dark";

  const fetchWallet = async () => {
    try {
      const data = await api.wallet();
      setWallet(data);
    } catch {
      setWallet([]);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWallet();
    setRefreshing(false);
  };

  const unredeemed = wallet.filter((w) => !w.isExpired);
  const history = [...wallet].sort((a, b) => (a.claimedAt < b.claimedAt ? 1 : -1));

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? "#000000" : c.surface },
    content: { padding: 18, paddingTop: 16, paddingBottom: 130 },

    // Rewards Summary Card — this screen is the reward wallet itself, so a
    // gold accent here is legitimate per docs/pike_ui_design.md §2 (reward
    // content), not the navigation-chrome misuse this pass is fixing elsewhere.
    balanceCard: { padding: 24, borderRadius: RADIUS_CARD, alignItems: "center", justifyContent: "center", marginBottom: 24, position: "relative" },
    balanceLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 2, marginBottom: 6, fontWeight: "700" },
    balanceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
    balanceValue: { ...theme.font(theme.type.displayXl), color: rewardColor, fontSize: 44, fontWeight: "700" },
    balanceUnit: { ...theme.font(theme.type.headlineSm), color: rewardColor, fontWeight: "700" },
    balanceBtnRow: { flexDirection: "row", gap: 12, marginTop: 18 },
    balanceBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: RADIUS_CARD },
    balanceBtnText: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 1, fontWeight: "700" },

    // Rewards Section
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    sectionTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontWeight: "700" },
    newTag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS_CARD },
    newTagText: { ...theme.font(theme.type.labelCaps), color: rewardColor, fontSize: 10, fontWeight: "700" },

    // Reward Cards
    card: { padding: 18, borderRadius: RADIUS_CARD, marginBottom: 14 },
    cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    iconWell: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    premiumTag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS_CARD },
    premiumTagText: { ...theme.font(theme.type.labelCaps), color: rewardColor, fontSize: 10, fontWeight: "700" },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 18, fontWeight: "700" },
    cardVenue: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 2, marginBottom: 16, fontSize: 13 },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: isDark ? "rgba(156,124,74,0.1)" : "rgba(15,23,42,0.06)" },
    pointsText: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, fontWeight: "600", fontSize: 12 },
    redeemBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: RADIUS_CARD },
    redeemBtnText: { ...theme.font(theme.type.labelCaps), color: rewardColor, fontSize: 11, fontWeight: "700" },

    // Empty state
    emptyState: { alignItems: "center", padding: 32 },
    emptyText: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginTop: 12 },

    // Modal Styles
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.75)", justifyContent: "center", alignItems: "center", padding: 20 },
    modalCard: { width: "100%", maxWidth: 380, padding: 24, borderRadius: RADIUS_CARD },
    modalTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 6 },
    modalSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginBottom: 20 },
    modalBtnRow: { flexDirection: "row", gap: 12 },
    modalBtn: { flex: 1, paddingVertical: 14, borderRadius: RADIUS_CARD, alignItems: "center", justifyContent: "center" },
    modalBtnText: { ...theme.font(theme.type.labelCaps), fontSize: 12, letterSpacing: 1, fontWeight: "700" },

    // History Ledger List
    ledgerItem: { padding: 14, borderRadius: RADIUS_CARD, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12 },
    ledgerIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    ledgerTitle: { ...theme.font(theme.type.bodyMd), color: c.onSurface, fontWeight: "700" },
    ledgerSub: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, marginTop: 1 },
    ledgerStatus: { ...theme.font(theme.type.headlineSm), fontSize: 12, fontWeight: "700" },

    // Redeem Code
    barcodeWell: { padding: 20, borderRadius: RADIUS_CARD, alignItems: "center", justifyContent: "center", marginVertical: 18 },
    barcodeText: { ...theme.font(theme.type.headlineSm), color: rewardColor, letterSpacing: 2, fontSize: 16, fontWeight: "700", marginTop: 10 },
    barcodeSub: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 10, marginTop: 4, letterSpacing: 1 },
  });

  return (
    <View style={styles.container}>
      <TopNav title="Rewards" showLogo={false} subtitle="Your claimed rewards" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={rewardColor}
            colors={[rewardColor]}
          />
        }
      >
        {/* Rewards Summary Card */}
        <NeumorphicView variant="raised" accent="reward" radius={RADIUS_CARD} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>REWARDS READY TO CLAIM</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceValue}>{unredeemed.length}</Text>
          </View>

          <View style={styles.balanceBtnRow}>
            <NeumorphicView
              variant="raised"
              radius={RADIUS_CARD}
              style={styles.balanceBtn}
              onPress={() => setHistoryVisible(true)}
            >
              <MaterialIcons name="receipt-long" size={18} color={c.onSurfaceVariant} />
              <Text style={styles.balanceBtnText}>HISTORY</Text>
            </NeumorphicView>
          </View>
        </NeumorphicView>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>YOUR REWARDS</Text>
          {unredeemed.length > 0 && (
            <NeumorphicView variant="inset" radius={RADIUS_CARD} style={styles.newTag}>
              <Text style={styles.newTagText}>{unredeemed.length} READY</Text>
            </NeumorphicView>
          )}
        </View>

        {/* Wallet Items List */}
        {unredeemed.length > 0 ? (
          unredeemed.map((item, i) => (
            <NeumorphicView key={i} variant="raised" radius={RADIUS_CARD} style={styles.card}>
              <View style={styles.cardTopRow}>
                <NeumorphicView variant="inset" radius={16} style={styles.iconWell}>
                  <MaterialIcons name="card-giftcard" size={24} color={rewardColor} />
                </NeumorphicView>
                <NeumorphicView variant="raised" accent="reward" radius={RADIUS_CARD} style={styles.premiumTag}>
                  <Text style={styles.premiumTagText}>CLAIMABLE</Text>
                </NeumorphicView>
              </View>
              <Text style={styles.cardTitle}>{titleOf(item)}</Text>
              <Text style={styles.cardVenue}>{subtitleOf(item)}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.pointsText}>
                  {item.expiresAt ? `Expires ${formatDate(item.expiresAt)}` : "No expiry"}
                </Text>
                <NeumorphicView
                  variant="raised"
                  accent="reward"
                  radius={RADIUS_CARD}
                  style={styles.redeemBtn}
                  onPress={() => setRedeemItem(item)}
                >
                  <Text style={styles.redeemBtnText}>REDEEM</Text>
                </NeumorphicView>
              </View>
            </NeumorphicView>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="card-giftcard" size={40} color={c.onSurfaceVariant} />
            <Text style={styles.emptyText}>
              No rewards yet — scan a marker at a venue to claim your first one.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* History Modal */}
      <Modal visible={historyVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <NeumorphicView variant="raised" accent="action" radius={RADIUS_CARD} style={[styles.modalCard, { maxHeight: "80%" }]}>
            <Text style={styles.modalTitle}>Claim history</Text>
            <Text style={styles.modalSub}>Your claimed rewards, most recent first</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {history.length === 0 ? (
                <Text style={styles.emptyText}>No claims yet.</Text>
              ) : (
                history.map((item, i) => (
                  <NeumorphicView key={i} variant="inset" radius={RADIUS_CARD} style={styles.ledgerItem}>
                    <View style={[styles.ledgerIcon, { backgroundColor: item.isExpired ? "rgba(140, 140, 140, 0.15)" : "rgba(16, 185, 129, 0.15)" }]}>
                      <MaterialIcons
                        name="card-giftcard"
                        size={20}
                        color={item.isExpired ? c.onSurfaceVariant : c.success}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ledgerTitle}>{titleOf(item)}</Text>
                      <Text style={styles.ledgerSub}>{subtitleOf(item)} • {formatDate(item.claimedAt)}</Text>
                    </View>
                    <Text style={[styles.ledgerStatus, { color: item.isExpired ? c.onSurfaceVariant : c.success }]}>
                      {item.isExpired ? "Expired" : "Active"}
                    </Text>
                  </NeumorphicView>
                ))
              )}
            </ScrollView>

            <NeumorphicView variant="raised" radius={RADIUS_CARD} style={[styles.modalBtn, { width: "100%" }]} onPress={() => setHistoryVisible(false)}>
              <Text style={[styles.modalBtnText, { color: c.onSurfaceVariant }]}>CLOSE</Text>
            </NeumorphicView>
          </NeumorphicView>
        </View>
      </Modal>

      {/* Redeem / Reveal Modal */}
      <Modal visible={!!redeemItem} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          {redeemItem && (
            <NeumorphicView variant="raised" accent="reward" radius={RADIUS_CARD} style={styles.modalCard}>
              <Text style={styles.modalTitle}>Redeem reward</Text>
              <Text style={styles.modalSub}>Show this code to venue staff at checkout</Text>

              <Text style={{ ...theme.font(theme.type.headlineSm), color: c.onSurface, textAlign: "center", fontSize: 18, fontWeight: "700" }}>
                {titleOf(redeemItem)}
              </Text>
              <Text style={{ ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginTop: 2 }}>
                {subtitleOf(redeemItem)}
              </Text>

              <NeumorphicView variant="inset" radius={RADIUS_CARD} style={styles.barcodeWell}>
                <MaterialIcons name="qr-code-2" size={90} color={rewardColor} />
                <Text style={styles.barcodeText}>{codeOf(redeemItem).slice(0, 12).toUpperCase()}</Text>
                <Text style={styles.barcodeSub}>REDEMPTION CODE</Text>
              </NeumorphicView>

              <View style={styles.modalBtnRow}>
                <NeumorphicView variant="flat" radius={RADIUS_CARD} style={styles.modalBtn} onPress={() => setRedeemItem(null)}>
                  <Text style={[styles.modalBtnText, { color: c.onSurfaceVariant }]}>CLOSE</Text>
                </NeumorphicView>
              </View>
            </NeumorphicView>
          )}
        </View>
      </Modal>
    </View>
  );
}

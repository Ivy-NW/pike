import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Modal, TextInput, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { UserWalletItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { NeumorphicView } from "@/components/NeumorphicView";

const titleOf = (w: UserWalletItem) => (w.kind === "quest" ? w.quest.rewardDescription : w.rewardDescription);
const subtitleOf = (w: UserWalletItem) => (w.kind === "quest" ? w.venue.name : w.name);

interface LedgerItem {
  id: string;
  title: string;
  subtitle: string;
  points: string;
  type: "earned" | "redeemed" | "bonus";
  date: string;
}

const SAMPLE_HISTORY: LedgerItem[] = [
  { id: "1", title: "KICC Sky Deck Anomaly", subtitle: "Deciphered AR Marker", points: "+250 PTS", type: "earned", date: "Today, 14:20" },
  { id: "2", title: "Free Arcade Token Voucher", subtitle: "Test Cafe Downtown", points: "-1,500 PTS", type: "redeemed", date: "Yesterday, 19:45" },
  { id: "3", title: "Vanguard Onboarding Grant", subtitle: "Welcome Bonus", points: "+10,000 PTS", type: "bonus", date: "Aug 28, 2026" },
  { id: "4", title: "Nairobi Cyber-Circuit Step Bonus", subtitle: "10K Steps Sync", points: "+500 PTS", type: "earned", date: "Aug 27, 2026" },
];

/** Stitch Reward Wallet (PIKE Gold & Sapphire Blue) */
export default function RewardsScreen() {
  const theme = useTheme();
  const [wallet, setWallet] = useState<UserWalletItem[]>([]);
  const [balance, setBalance] = useState(12450);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [addFundsVisible, setAddFundsVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [redeemItem, setRedeemItem] = useState<UserWalletItem | null>(null);

  // Add Points State
  const [selectedPack, setSelectedPack] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState("");

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

  const handleConfirmAddFunds = () => {
    const addAmt = customAmount ? parseInt(customAmount, 10) || 0 : selectedPack;
    if (addAmt > 0) {
      setBalance((prev) => prev + addAmt);
    }
    setAddFundsVisible(false);
    setCustomAmount("");
  };

  const unredeemed = wallet.filter((w) => !w.isExpired);
  const expired = wallet.filter((w) => w.isExpired);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? "#000000" : c.surface },
    content: { padding: 18, paddingTop: 16, paddingBottom: 130 },

    // Total Balance Card
    balanceCard: { padding: 24, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 24, position: "relative" },
    balanceLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 2, marginBottom: 6, fontWeight: "700" },
    balanceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
    balanceValue: { ...theme.font(theme.type.displayXl), color: isDark ? "#9C7C4A" : c.primary, fontSize: 44, fontWeight: "700" },
    balanceUnit: { ...theme.font(theme.type.headlineSm), color: isDark ? "#9C7C4A" : c.primary, fontWeight: "700" },
    balanceBtnRow: { flexDirection: "row", gap: 12, marginTop: 18 },
    balanceBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18 },
    balanceBtnText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#9C7C4A" : c.primary, letterSpacing: 1, fontWeight: "700" },

    // Rewards Section
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    sectionTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontWeight: "700" },
    newTag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    newTagText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#9C7C4A" : c.primary, fontSize: 10, fontWeight: "700" },

    // Reward Cards
    card: { padding: 18, borderRadius: 24, marginBottom: 14 },
    cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    iconWell: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    premiumTag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
    premiumTagText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#9C7C4A" : "#8C6B34", fontSize: 10, fontWeight: "700" },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 18, fontWeight: "700" },
    cardVenue: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 2, marginBottom: 16, fontSize: 13 },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: isDark ? "rgba(156,124,74,0.1)" : "rgba(15,23,42,0.06)" },
    pointsText: { ...theme.font(theme.type.bodyMd), color: isDark ? "#9C7C4A" : c.primary, fontWeight: "700" },
    redeemBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 14 },
    redeemBtnText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#9C7C4A" : c.primary, fontSize: 11, fontWeight: "700" },

    // Modal Styles
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.75)", justifyContent: "center", alignItems: "center", padding: 20 },
    modalCard: { width: "100%", maxWidth: 380, padding: 24, borderRadius: 28 },
    modalTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 6 },
    modalSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginBottom: 20 },
    packsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
    packPill: { flexBasis: "47%", paddingVertical: 12, alignItems: "center", justifyContent: "center", borderRadius: 16 },
    packPillText: { ...theme.font(theme.type.labelCaps), fontSize: 12, letterSpacing: 1, fontWeight: "700" },
    inputWell: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, marginBottom: 18 },
    textInput: { ...theme.font(theme.type.bodyMd), color: c.onSurface, fontSize: 15 },
    modalBtnRow: { flexDirection: "row", gap: 12 },
    modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    modalBtnText: { ...theme.font(theme.type.labelCaps), fontSize: 12, letterSpacing: 1, fontWeight: "700" },

    // History Ledger List
    ledgerItem: { padding: 14, borderRadius: 18, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12 },
    ledgerIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    ledgerTitle: { ...theme.font(theme.type.bodyMd), color: c.onSurface, fontWeight: "700" },
    ledgerSub: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, marginTop: 1 },
    ledgerPoints: { ...theme.font(theme.type.headlineSm), fontSize: 14, fontWeight: "700" },

    // Redeem Barcode
    barcodeWell: { padding: 20, borderRadius: 20, alignItems: "center", justifyContent: "center", marginVertical: 18 },
    barcodeText: { ...theme.font(theme.type.headlineSm), color: isDark ? "#9C7C4A" : c.primary, letterSpacing: 4, fontSize: 20, fontWeight: "700" },
    barcodeSub: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 10, marginTop: 4, letterSpacing: 1 },
  });

  return (
    <View style={styles.container}>
      <TopNav title="Vault" showLogo={false} subtitle="Explorer Rewards & Points" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#9C7C4A" : c.primary}
            colors={[isDark ? "#9C7C4A" : c.primary]}
          />
        }
      >
        {/* Total Balance Card */}
        <NeumorphicView variant="raised" glow="gold" radius={28} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>VAULT EXPLORER POINTS</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceValue}>{balance.toLocaleString()}</Text>
            <Text style={styles.balanceUnit}> PTS</Text>
          </View>

          <View style={styles.balanceBtnRow}>
            <NeumorphicView
              variant="raised"
              glow="gold"
              radius={18}
              style={styles.balanceBtn}
              onPress={() => setAddFundsVisible(true)}
            >
              <MaterialIcons name="add-circle-outline" size={18} color={isDark ? "#9C7C4A" : c.primary} />
              <Text style={styles.balanceBtnText}>ADD POINTS</Text>
            </NeumorphicView>

            <NeumorphicView
              variant="raised"
              radius={18}
              style={styles.balanceBtn}
              onPress={() => setHistoryVisible(true)}
            >
              <MaterialIcons name="receipt-long" size={18} color={c.onSurfaceVariant} />
              <Text style={[styles.balanceBtnText, { color: c.onSurfaceVariant }]}>HISTORY</Text>
            </NeumorphicView>
          </View>
        </NeumorphicView>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>UNLOCKED PERKS & REWARDS</Text>
          <NeumorphicView variant="inset" radius={12} style={styles.newTag}>
            <Text style={styles.newTagText}>SECTOR READY</Text>
          </NeumorphicView>
        </View>

        {/* Wallet Items List */}
        {unredeemed.length > 0 ? (
          unredeemed.map((item, i) => (
            <NeumorphicView key={i} variant="raised" radius={24} style={styles.card}>
              <View style={styles.cardTopRow}>
                <NeumorphicView variant="inset" radius={16} style={styles.iconWell}>
                  <MaterialIcons name="card-giftcard" size={24} color={isDark ? "#9C7C4A" : c.primary} />
                </NeumorphicView>
                <NeumorphicView variant="raised" glow="gold" radius={10} style={styles.premiumTag}>
                  <Text style={styles.premiumTagText}>CLAIMABLE</Text>
                </NeumorphicView>
              </View>
              <Text style={styles.cardTitle}>{titleOf(item)}</Text>
              <Text style={styles.cardVenue}>{subtitleOf(item)}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.pointsText}>READY IN NAIROBI</Text>
                <NeumorphicView
                  variant="raised"
                  glow="gold"
                  radius={14}
                  style={styles.redeemBtn}
                  onPress={() => setRedeemItem(item)}
                >
                  <Text style={styles.redeemBtnText}>REDEEM</Text>
                </NeumorphicView>
              </View>
            </NeumorphicView>
          ))
        ) : (
          <>
            {/* Sample Claimable Perks */}
            <NeumorphicView variant="raised" radius={24} style={styles.card}>
              <View style={styles.cardTopRow}>
                <NeumorphicView variant="inset" radius={16} style={styles.iconWell}>
                  <MaterialIcons name="local-cafe" size={24} color={isDark ? "#9C7C4A" : c.primary} />
                </NeumorphicView>
                <NeumorphicView variant="raised" glow="gold" radius={10} style={styles.premiumTag}>
                  <Text style={styles.premiumTagText}>FEATURED</Text>
                </NeumorphicView>
              </View>
              <Text style={styles.cardTitle}>20% off at KICC Sky Lounge</Text>
              <Text style={styles.cardVenue}>KICC Sky Deck Lounge • CBD</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.pointsText}>500 PTS</Text>
                <NeumorphicView
                  variant="raised"
                  glow="gold"
                  radius={14}
                  style={styles.redeemBtn}
                  onPress={() =>
                    setRedeemItem({
                      kind: "quest",
                      redemptionId: "sample-1",
                      claimedAt: new Date().toISOString(),
                      expiresAt: null,
                      isExpired: false,
                      venue: { id: "v1", name: "KICC Sky Deck Lounge" },
                      quest: { id: "q1", name: "Decipher the KICC Anomaly", rewardDescription: "20% off at KICC Sky Lounge", rewardType: "discount" },
                    })
                  }
                >
                  <Text style={styles.redeemBtnText}>REDEEM</Text>
                </NeumorphicView>
              </View>
            </NeumorphicView>

            <NeumorphicView variant="raised" radius={24} style={styles.card}>
              <View style={styles.cardTopRow}>
                <NeumorphicView variant="inset" radius={16} style={styles.iconWell}>
                  <MaterialIcons name="sports-esports" size={24} color={isDark ? "#3b82f6" : "#1d4ed8"} />
                </NeumorphicView>
                <NeumorphicView variant="raised" glow="blue" radius={10} style={styles.premiumTag}>
                  <Text style={[styles.premiumTagText, { color: isDark ? "#3b82f6" : "#1d4ed8" }]}>PREMIUM</Text>
                </NeumorphicView>
              </View>
              <Text style={styles.cardTitle}>Free VR Simulator Pass</Text>
              <Text style={styles.cardVenue}>Sarit Tech Hub & Cafe • Westlands</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.pointsText}>2,500 PTS</Text>
                <NeumorphicView
                  variant="raised"
                  glow="blue"
                  radius={14}
                  style={styles.redeemBtn}
                  onPress={() =>
                    setRedeemItem({
                      kind: "quest",
                      redemptionId: "sample-2",
                      claimedAt: new Date().toISOString(),
                      expiresAt: null,
                      isExpired: false,
                      venue: { id: "v2", name: "Sarit Tech Hub & Cafe" },
                      quest: { id: "q2", name: "Sarit Tech Expo Protocol", rewardDescription: "Free VR Simulator Pass", rewardType: "free_item" },
                    })
                  }
                >
                  <Text style={[styles.redeemBtnText, { color: isDark ? "#3b82f6" : "#1d4ed8" }]}>REDEEM</Text>
                </NeumorphicView>
              </View>
            </NeumorphicView>
          </>
        )}
      </ScrollView>

      {/* 1. Neumorphic Add Points Modal */}
      <Modal visible={addFundsVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <NeumorphicView variant="raised" glow="gold" radius={28} style={styles.modalCard}>
            <Text style={styles.modalTitle}>Acquire Explorer Points</Text>
            <Text style={styles.modalSub}>Select a preset or enter custom point amount</Text>

            <View style={styles.packsGrid}>
              {[500, 1000, 2500, 5000].map((amt) => {
                const active = selectedPack === amt && !customAmount;
                return (
                  <NeumorphicView
                    key={amt}
                    variant={active ? "inset" : "raised"}
                    glow={active ? "gold" : "none"}
                    radius={16}
                    style={styles.packPill}
                    onPress={() => {
                      setSelectedPack(amt);
                      setCustomAmount("");
                    }}
                  >
                    <Text style={[styles.packPillText, { color: active ? (isDark ? "#9C7C4A" : c.primary) : c.onSurface }]}>
                      +{amt.toLocaleString()} PTS
                    </Text>
                  </NeumorphicView>
                );
              })}
            </View>

            <NeumorphicView variant="inset" radius={16} style={styles.inputWell}>
              <TextInput
                value={customAmount}
                onChangeText={setCustomAmount}
                placeholder="Or custom amount (e.g. 7500)"
                placeholderTextColor={c.onSurfaceVariant}
                keyboardType="numeric"
                style={styles.textInput}
              />
            </NeumorphicView>

            <View style={styles.modalBtnRow}>
              <NeumorphicView variant="flat" radius={18} style={styles.modalBtn} onPress={() => setAddFundsVisible(false)}>
                <Text style={[styles.modalBtnText, { color: c.onSurfaceVariant }]}>CANCEL</Text>
              </NeumorphicView>
              <NeumorphicView variant="raised" glow="gold" radius={18} style={styles.modalBtn} onPress={handleConfirmAddFunds}>
                <Text style={[styles.modalBtnText, { color: isDark ? "#9C7C4A" : c.primary }]}>ACQUIRE POINTS</Text>
              </NeumorphicView>
            </View>
          </NeumorphicView>
        </View>
      </Modal>

      {/* 2. Neumorphic History Ledger Modal */}
      <Modal visible={historyVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <NeumorphicView variant="raised" glow="gold" radius={28} style={[styles.modalCard, { maxHeight: "80%" }]}>
            <Text style={styles.modalTitle}>Transaction Ledger</Text>
            <Text style={styles.modalSub}>Recent points awards, claims, and telemetry sync</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {SAMPLE_HISTORY.map((item) => (
                <NeumorphicView key={item.id} variant="inset" radius={18} style={styles.ledgerItem}>
                  <View style={[styles.ledgerIcon, { backgroundColor: item.type === "earned" ? "rgba(16, 185, 129, 0.15)" : item.type === "redeemed" ? "rgba(239, 68, 68, 0.15)" : "rgba(156, 124, 74, 0.15)" }]}>
                    <MaterialIcons
                      name={item.type === "earned" ? "arrow-downward" : item.type === "redeemed" ? "arrow-upward" : "stars"}
                      size={20}
                      color={item.type === "earned" ? "#10B981" : item.type === "redeemed" ? "#ef4444" : "#9C7C4A"}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ledgerTitle}>{item.title}</Text>
                    <Text style={styles.ledgerSub}>{item.subtitle} • {item.date}</Text>
                  </View>
                  <Text style={[styles.ledgerPoints, { color: item.points.startsWith("+") ? "#10B981" : "#ef4444" }]}>
                    {item.points}
                  </Text>
                </NeumorphicView>
              ))}
            </ScrollView>

            <NeumorphicView variant="raised" radius={18} style={[styles.modalBtn, { width: "100%" }]} onPress={() => setHistoryVisible(false)}>
              <Text style={[styles.modalBtnText, { color: c.onSurfaceVariant }]}>CLOSE LEDGER</Text>
            </NeumorphicView>
          </NeumorphicView>
        </View>
      </Modal>

      {/* 3. Neumorphic Redeem / Reveal Modal */}
      <Modal visible={!!redeemItem} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          {redeemItem && (
            <NeumorphicView variant="raised" glow="gold" radius={28} style={styles.modalCard}>
              <Text style={styles.modalTitle}>Redeem Vanguard Perk</Text>
              <Text style={styles.modalSub}>Present this optical cipher to venue staff at checkout</Text>

              <Text style={{ ...theme.font(theme.type.headlineSm), color: c.onSurface, textAlign: "center", fontSize: 18, fontWeight: "700" }}>
                {titleOf(redeemItem)}
              </Text>
              <Text style={{ ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginTop: 2 }}>
                {subtitleOf(redeemItem)}
              </Text>

              <NeumorphicView variant="inset" radius={20} style={styles.barcodeWell}>
                <MaterialIcons name="qr-code-2" size={90} color={isDark ? "#9C7C4A" : c.primary} />
                <Text style={styles.barcodeText}>PIKE-9842-KE</Text>
                <Text style={styles.barcodeSub}>VALID IN NAIROBI SECTOR</Text>
              </NeumorphicView>

              <View style={styles.modalBtnRow}>
                <NeumorphicView variant="flat" radius={18} style={styles.modalBtn} onPress={() => setRedeemItem(null)}>
                  <Text style={[styles.modalBtnText, { color: c.onSurfaceVariant }]}>CLOSE</Text>
                </NeumorphicView>
                <NeumorphicView variant="raised" glow="gold" radius={18} style={styles.modalBtn} onPress={() => setRedeemItem(null)}>
                  <Text style={[styles.modalBtnText, { color: isDark ? "#9C7C4A" : c.primary }]}>MARK REDEEMED</Text>
                </NeumorphicView>
              </View>
            </NeumorphicView>
          )}
        </View>
      </Modal>
    </View>
  );
}

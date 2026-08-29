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

/** Stitch Reward Wallet (Neumorphic) */
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
    container: { flex: 1, backgroundColor: isDark ? "#141314" : c.surface },
    content: { padding: 18, paddingTop: 16, paddingBottom: 130 },

    // Total Balance Card
    balanceCard: { padding: 24, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 24, position: "relative" },
    balanceLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 2, marginBottom: 6 },
    balanceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
    balanceValue: { ...theme.font(theme.type.displayXl), color: c.primary, fontSize: 44, fontWeight: "700" },
    balanceUnit: { ...theme.font(theme.type.headlineSm), color: isDark ? "#00f0ff" : c.primary },
    balanceBtnRow: { flexDirection: "row", gap: 12, marginTop: 18 },
    balanceBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18 },
    balanceBtnText: { ...theme.font(theme.type.labelCaps), color: c.primary, letterSpacing: 1 },

    // Rewards Section
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    sectionTitle: { ...theme.font(theme.type.headlineSm), color: c.primary },
    newTag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    newTagText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#00f0ff" : c.primary, fontSize: 10 },

    // Reward Cards
    card: { padding: 18, borderRadius: 24, marginBottom: 14 },
    cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    iconWell: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    premiumTag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: "rgba(0,240,255,0.3)" },
    premiumTagText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#00dbe9" : c.primary, fontSize: 10 },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.primary, fontSize: 18 },
    cardVenue: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 2, marginBottom: 16 },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
    pointsText: { ...theme.font(theme.type.bodyMd), color: c.onSurface, fontWeight: "700" },
    redeemBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: "rgba(0,240,255,0.25)" },
    redeemBtnText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#00f0ff" : c.primary, fontSize: 11 },

    // Modal Styles
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.75)", justifyContent: "center", alignItems: "center", padding: 20 },
    modalCard: { width: "100%", maxWidth: 380, padding: 24, borderRadius: 28 },
    modalTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.primary, fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 6 },
    modalSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginBottom: 20 },
    packsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
    packPill: { flexBasis: "47%", paddingVertical: 12, alignItems: "center", justifyContent: "center", borderRadius: 16 },
    packPillText: { ...theme.font(theme.type.labelCaps), fontSize: 12, letterSpacing: 1 },
    inputWell: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, marginBottom: 18 },
    textInput: { ...theme.font(theme.type.bodyMd), color: c.onSurface, fontSize: 15 },
    modalBtnRow: { flexDirection: "row", gap: 12, marginTop: 8 },
    modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    modalBtnText: { ...theme.font(theme.type.labelCaps), fontSize: 12, letterSpacing: 1 },

    // History Item
    historyRow: { padding: 14, borderRadius: 18, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    historyLeft: { flex: 1 },
    historyTitle: { ...theme.font(theme.type.bodyMd), color: c.onSurface, fontWeight: "600" },
    historyDate: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, marginTop: 2, fontSize: 11 },
    historyPoints: { ...theme.font(theme.type.headlineSm), fontSize: 15, fontWeight: "700" },

    // Voucher Reveal Modal
    voucherWell: { padding: 20, borderRadius: 20, alignItems: "center", justifyContent: "center", marginVertical: 16, borderStyle: "dashed", borderWidth: 1, borderColor: "rgba(0,240,255,0.4)" },
    voucherCode: { ...theme.font(theme.type.displayXl), color: isDark ? "#00f0ff" : c.primary, letterSpacing: 4, fontSize: 24, fontWeight: "700" },
    barcodeLines: { height: 36, width: 220, backgroundColor: isDark ? "#00f0ff" : c.primary, opacity: 0.8, marginVertical: 12, borderRadius: 4 },
  });

  return (
    <View style={styles.container}>
      <TopNav title="Rewards" showLogo={false} subtitle={`${wallet.length > 0 ? wallet.length : 2} vouchers available`} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#00f0ff" : c.primary}
            colors={[isDark ? "#00f0ff" : c.primary]}
          />
        }
      >
        {/* Total Balance Card */}
        <NeumorphicView variant="raised" glow="cyan" radius={28} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceValue}>{balance.toLocaleString()}</Text>
            <Text style={styles.balanceUnit}>PTS</Text>
          </View>
          <View style={styles.balanceBtnRow}>
            <NeumorphicView variant="raised" radius={18} style={styles.balanceBtn} onPress={() => setAddFundsVisible(true)}>
              <MaterialIcons name="add" size={16} color={c.primary} />
              <Text style={styles.balanceBtnText}>ADD FUNDS</Text>
            </NeumorphicView>
            <NeumorphicView variant="raised" radius={18} style={styles.balanceBtn} onPress={() => setHistoryVisible(true)}>
              <MaterialIcons name="history" size={16} color={c.primary} />
              <Text style={styles.balanceBtnText}>HISTORY</Text>
            </NeumorphicView>
          </View>
        </NeumorphicView>

        {/* Available Rewards Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Rewards</Text>
          <NeumorphicView variant="inset" radius={12} style={styles.newTag}>
            <Text style={styles.newTagText}>{unredeemed.length > 0 ? unredeemed.length : 2} ACTIVE</Text>
          </NeumorphicView>
        </View>

        {/* Reward Cards */}
        {wallet.length === 0 ? (
          <>
            <NeumorphicView variant="raised" radius={24} style={styles.card}>
              <View style={styles.cardTopRow}>
                <NeumorphicView variant="inset" radius={16} style={styles.iconWell}>
                  <MaterialIcons name="local-cafe" size={24} color={isDark ? "#00f0ff" : c.primary} />
                </NeumorphicView>
                <NeumorphicView variant="raised" glow="cyan" radius={10} style={styles.premiumTag}>
                  <Text style={styles.premiumTagText}>PREMIUM</Text>
                </NeumorphicView>
              </View>
              <Text style={styles.cardTitle}>20% off at KICC Sky Lounge</Text>
              <Text style={styles.cardVenue}>KICC Sky Deck Lounge • Nairobi CBD</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.pointsText}>1,500 PTS</Text>
                <NeumorphicView
                  variant="raised"
                  glow="cyan"
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
                  <MaterialIcons name="sports-esports" size={24} color={isDark ? "#00f0ff" : c.primary} />
                </NeumorphicView>
                <NeumorphicView variant="raised" glow="cyan" radius={10} style={styles.premiumTag}>
                  <Text style={styles.premiumTagText}>PREMIUM</Text>
                </NeumorphicView>
              </View>
              <Text style={styles.cardTitle}>Free VR Simulator Pass</Text>
              <Text style={styles.cardVenue}>Sarit Tech Hub & Cafe • Westlands</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.pointsText}>2,500 PTS</Text>
                <NeumorphicView
                  variant="raised"
                  glow="cyan"
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
                  <Text style={styles.redeemBtnText}>REDEEM</Text>
                </NeumorphicView>
              </View>
            </NeumorphicView>
          </>
        ) : (
          wallet.map((item) => (
            <NeumorphicView key={item.kind === "quest" ? item.redemptionId : item.macroQuestId} variant="raised" radius={24} style={styles.card}>
              <View style={styles.cardTopRow}>
                <NeumorphicView variant="inset" radius={16} style={styles.iconWell}>
                  <MaterialIcons name="redeem" size={24} color={isDark ? "#00f0ff" : c.primary} />
                </NeumorphicView>
                <NeumorphicView variant="raised" glow="cyan" radius={10} style={styles.premiumTag}>
                  <Text style={styles.premiumTagText}>VOUCHER</Text>
                </NeumorphicView>
              </View>
              <Text style={styles.cardTitle}>{titleOf(item)}</Text>
              <Text style={styles.cardVenue}>{subtitleOf(item)}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.pointsText}>{item.isExpired ? "EXPIRED" : "READY"}</Text>
                <NeumorphicView
                  variant="raised"
                  glow={item.isExpired ? "none" : "cyan"}
                  radius={14}
                  style={styles.redeemBtn}
                  onPress={() => !item.isExpired && setRedeemItem(item)}
                >
                  <Text style={styles.redeemBtnText}>{item.isExpired ? "USED" : "REDEEM"}</Text>
                </NeumorphicView>
              </View>
            </NeumorphicView>
          ))
        )}
      </ScrollView>

      {/* 1. Neumorphic Add Points Modal */}
      <Modal visible={addFundsVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <NeumorphicView variant="raised" glow="cyan" radius={28} style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Explorer Points</Text>
            <Text style={styles.modalSub}>Select an XP telemetry pack to top up your balance</Text>

            <View style={styles.packsGrid}>
              {[500, 1000, 2500, 5000].map((p) => (
                <NeumorphicView
                  key={p}
                  variant={selectedPack === p && !customAmount ? "inset" : "raised"}
                  glow={selectedPack === p && !customAmount ? "cyan" : "none"}
                  radius={16}
                  style={styles.packPill}
                  onPress={() => { setSelectedPack(p); setCustomAmount(""); }}
                >
                  <Text style={[styles.packPillText, { color: selectedPack === p && !customAmount ? (isDark ? "#00f0ff" : c.primary) : c.onSurfaceVariant }]}>
                    +{p.toLocaleString()} PTS
                  </Text>
                </NeumorphicView>
              ))}
            </View>

            <NeumorphicView variant="inset" radius={16} style={styles.inputWell}>
              <TextInput
                value={customAmount}
                onChangeText={(val) => { setCustomAmount(val); setSelectedPack(0); }}
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

              <NeumorphicView variant="raised" glow="cyan" radius={18} style={styles.modalBtn} onPress={handleConfirmAddFunds}>
                <Text style={[styles.modalBtnText, { color: isDark ? "#00f0ff" : c.primary }]}>ACQUIRE POINTS</Text>
              </NeumorphicView>
            </View>
          </NeumorphicView>
        </View>
      </Modal>

      {/* 2. Neumorphic Transaction History Modal */}
      <Modal visible={historyVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <NeumorphicView variant="raised" radius={28} style={styles.modalCard}>
            <Text style={styles.modalTitle}>Ledger & History</Text>
            <Text style={styles.modalSub}>Recent telemetry claims and point redemptions</Text>

            <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
              {SAMPLE_HISTORY.map((h) => (
                <NeumorphicView key={h.id} variant="inset" radius={18} style={styles.historyRow}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyTitle}>{h.title}</Text>
                    <Text style={styles.historyDate}>{h.subtitle} • {h.date}</Text>
                  </View>
                  <Text style={[styles.historyPoints, { color: h.points.startsWith("+") ? "#10B981" : "#f59e0b" }]}>
                    {h.points}
                  </Text>
                </NeumorphicView>
              ))}
            </ScrollView>

            <NeumorphicView variant="raised" radius={18} style={[styles.modalBtn, { marginTop: 16 }]} onPress={() => setHistoryVisible(false)}>
              <Text style={[styles.modalBtnText, { color: c.primary }]}>CLOSE</Text>
            </NeumorphicView>
          </NeumorphicView>
        </View>
      </Modal>

      {/* 3. Neumorphic Voucher Reveal & Redeem Modal */}
      <Modal visible={!!redeemItem} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          {redeemItem && (
            <NeumorphicView variant="raised" glow="gold" radius={28} style={styles.modalCard}>
              <Text style={styles.modalTitle}>Redeem Voucher</Text>
              <Text style={styles.modalSub}>{subtitleOf(redeemItem)}</Text>

              <NeumorphicView variant="inset" radius={20} style={styles.voucherWell}>
                <Text style={{ ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, fontSize: 10 }}>SCAN AT COUNTER</Text>
                <View style={styles.barcodeLines} />
                <Text style={styles.voucherCode}>PIKE-9842-KE</Text>
              </NeumorphicView>

              <Text style={[styles.cardTitle, { textAlign: "center", marginBottom: 16 }]}>{titleOf(redeemItem)}</Text>

              <View style={styles.modalBtnRow}>
                <NeumorphicView variant="flat" radius={18} style={styles.modalBtn} onPress={() => setRedeemItem(null)}>
                  <Text style={[styles.modalBtnText, { color: c.onSurfaceVariant }]}>CLOSE</Text>
                </NeumorphicView>

                <NeumorphicView
                  variant="raised"
                  glow="gold"
                  radius={18}
                  style={styles.modalBtn}
                  onPress={() => {
                    setRedeemItem(null);
                  }}
                >
                  <Text style={[styles.modalBtnText, { color: "#f59e0b" }]}>MARK REDEEMED</Text>
                </NeumorphicView>
              </View>
            </NeumorphicView>
          )}
        </View>
      </Modal>
    </View>
  );
}

import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { api } from "@/lib/api";
import { colors, radius } from "@/theme";

interface WalletItem {
  redemptionId: string;
  venue: { name: string };
  quest: { name: string; rewardDescription: string };
  expiresAt: string | null;
  isExpired: boolean;
  claimedAt: string;
}

/** FR-3: every reward claimed across every WebAR quest, unredeemed vs. expired-history split. */
export default function RewardsScreen() {
  const [wallet, setWallet] = useState<WalletItem[]>([]);

  useEffect(() => {
    api.wallet().then(setWallet).catch(() => setWallet([]));
  }, []);

  const unredeemed = wallet.filter((w) => !w.isExpired);
  const expired = wallet.filter((w) => w.isExpired);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reward wallet</Text>

      <Text style={styles.sectionLabel}>Unredeemed</Text>
      <FlatList
        data={unredeemed}
        keyExtractor={(w) => w.redemptionId}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={{ color: "#64748b", marginBottom: 16 }}>No unredeemed rewards yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.rewardName}>{item.quest.rewardDescription}</Text>
            <Text style={styles.venue}>{item.venue.name}</Text>
            <Text style={styles.expiry}>{item.expiresAt ? `Expires ${new Date(item.expiresAt).toLocaleDateString()}` : "No expiry"}</Text>
          </View>
        )}
      />

      {expired.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>History (expired)</Text>
          <FlatList
            data={expired}
            keyExtractor={(w) => w.redemptionId}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={[styles.card, { opacity: 0.6 }]}>
                <Text style={styles.rewardName}>{item.quest.rewardDescription}</Text>
                <Text style={styles.venue}>{item.venue.name}</Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray, padding: 20, paddingTop: 60 },
  header: { fontSize: 28, fontWeight: "700", color: colors.deepSlate, marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: "#64748b", marginBottom: 8, marginTop: 8 },
  card: { backgroundColor: colors.deepSlate, borderRadius: radius, padding: 16, marginBottom: 12 },
  rewardName: { color: colors.pikeGold, fontSize: 16, fontWeight: "600" },
  venue: { color: "white", marginTop: 4 },
  expiry: { color: "#94a3b8", marginTop: 8, fontSize: 12 },
});

import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";

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
  const theme = useTheme();
  const [wallet, setWallet] = useState<WalletItem[]>([]);

  useEffect(() => {
    api.wallet().then(setWallet).catch(() => setWallet([]));
  }, []);

  const unredeemed = wallet.filter((w) => !w.isExpired);
  const expired = wallet.filter((w) => w.isExpired);
  const c = theme.colors;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: c.surface, padding: theme.spacing.containerPadding, paddingTop: 60 },
    header: { ...theme.font(theme.type.headlineLgMobile), color: c.primary, marginBottom: theme.spacing.stackMd },
    sectionLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, marginBottom: theme.spacing.stackSm, marginTop: theme.spacing.stackSm },
    empty: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginBottom: 16 },
    card: { backgroundColor: c.slateGray, borderRadius: theme.radius.card, padding: theme.spacing.stackMd, marginBottom: theme.spacing.stackSm, borderWidth: 1, borderColor: c.surfaceContainerHighest },
    rewardName: { ...theme.font(theme.type.headlineSm), color: c.secondary },
    venue: { ...theme.font(theme.type.bodyMd), color: "#fff", marginTop: 4 },
    expiry: { ...theme.font(theme.type.labelSm), color: c.textMuted, marginTop: 8 },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reward wallet</Text>

      <Text style={styles.sectionLabel}>Unredeemed</Text>
      <FlatList
        data={unredeemed}
        keyExtractor={(w) => w.redemptionId}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>No unredeemed rewards yet.</Text>}
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

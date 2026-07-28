import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import type { UserWalletItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";

const titleOf = (w: UserWalletItem) => (w.kind === "quest" ? w.quest.rewardDescription : w.rewardDescription);
const subtitleOf = (w: UserWalletItem) => (w.kind === "quest" ? w.venue.name : w.name);
const keyOf = (w: UserWalletItem) => (w.kind === "quest" ? w.redemptionId : `macro-${w.macroQuestId}`);

/** FR-3: every reward — single-quest (WebAR) and macro-quest (FR-5) — unredeemed vs. expired-history split. */
export default function RewardsScreen() {
  const theme = useTheme();
  const [wallet, setWallet] = useState<UserWalletItem[]>([]);

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
    tag: { alignSelf: "flex-start", marginTop: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radius.full, borderWidth: 1, borderColor: c.primary },
    tagText: { ...theme.font(theme.type.labelSm), color: c.primary },
  });

  const Card = ({ item, faded }: { item: UserWalletItem; faded?: boolean }) => (
    <View style={[styles.card, faded && { opacity: 0.6 }]}>
      <Text style={styles.rewardName}>{titleOf(item)}</Text>
      <Text style={styles.venue}>{subtitleOf(item)}</Text>
      {item.kind === "macro-quest" && (
        <View style={styles.tag}>
          <Text style={styles.tagText}>MACRO-QUEST</Text>
        </View>
      )}
      {item.kind === "quest" && (
        <Text style={styles.expiry}>{item.expiresAt ? `Expires ${new Date(item.expiresAt).toLocaleDateString()}` : "No expiry"}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reward wallet</Text>

      <Text style={styles.sectionLabel}>Unredeemed</Text>
      <FlatList
        data={unredeemed}
        keyExtractor={keyOf}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>No unredeemed rewards yet.</Text>}
        renderItem={({ item }) => <Card item={item} />}
      />

      {expired.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>History (expired)</Text>
          <FlatList
            data={expired}
            keyExtractor={keyOf}
            scrollEnabled={false}
            renderItem={({ item }) => <Card item={item} faded />}
          />
        </>
      )}
    </View>
  );
}

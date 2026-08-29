import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import type { UserWalletItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";

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
    container: { flex: 1, backgroundColor: c.surface },
    content: { padding: theme.spacing.containerPadding, paddingTop: 16, paddingBottom: 110 },
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
    <View key={keyOf(item)} style={[styles.card, faded && { opacity: 0.6 }]}>
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
      <TopNav title="Rewards" showLogo={false} subtitle={`${unredeemed.length} available`} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      <Text style={styles.sectionLabel}>Unredeemed</Text>
      {unredeemed.length === 0 ? (
        <Text style={styles.empty}>No unredeemed rewards yet.</Text>
      ) : (
        unredeemed.map((item) => <Card key={keyOf(item)} item={item} />)
      )}

      {expired.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>History (expired)</Text>
          {expired.map((item) => (
            <Card key={keyOf(item)} item={item} faded />
          ))}
        </>
      )}
      </ScrollView>
    </View>
  );
}

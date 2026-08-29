import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import type { UserWalletItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { NeumorphicView } from "@/components/NeumorphicView";

const titleOf = (w: UserWalletItem) => (w.kind === "quest" ? w.quest.rewardDescription : w.rewardDescription);
const subtitleOf = (w: UserWalletItem) => (w.kind === "quest" ? w.venue.name : w.name);
const keyOf = (w: UserWalletItem) => (w.kind === "quest" ? w.redemptionId : `macro-${w.macroQuestId}`);

/** FR-3: rewards with tactile neumorphic voucher cards. */
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
    sectionLabel: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, marginBottom: theme.spacing.stackSm + 2, marginTop: theme.spacing.stackSm, letterSpacing: 1 },
    empty: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginBottom: 16 },
    card: {
      padding: theme.spacing.stackMd + 2,
      marginBottom: theme.spacing.stackSm + 6,
    },
    rewardName: { ...theme.font(theme.type.headlineSm), color: c.secondary },
    venue: { ...theme.font(theme.type.bodyMd), color: c.onSurface, marginTop: 4 },
    expiry: { ...theme.font(theme.type.labelSm), color: c.textMuted, marginTop: 8 },
    tag: { alignSelf: "flex-start", marginTop: 10, paddingHorizontal: 10, paddingVertical: 4 },
    tagText: { ...theme.font(theme.type.labelCaps), color: c.primary, fontSize: 10 },
  });

  const Card = ({ item, faded }: { item: UserWalletItem; faded?: boolean }) => (
    <NeumorphicView
      key={keyOf(item)}
      variant={faded ? "flat" : "raised"}
      glow={faded ? "none" : "gold"}
      radius={20}
      style={[styles.card, faded && { opacity: 0.55 }]}
    >
      <Text style={styles.rewardName}>{titleOf(item)}</Text>
      <Text style={styles.venue}>{subtitleOf(item)}</Text>
      {item.kind === "macro-quest" && (
        <NeumorphicView variant="inset" radius={theme.radius.full} style={styles.tag}>
          <Text style={styles.tagText}>MACRO-QUEST</Text>
        </NeumorphicView>
      )}
      {item.kind === "quest" && (
        <Text style={styles.expiry}>{item.expiresAt ? `Expires ${new Date(item.expiresAt).toLocaleDateString()}` : "No expiry"}</Text>
      )}
    </NeumorphicView>
  );

  return (
    <View style={styles.container}>
      <TopNav title="Rewards" showLogo={false} subtitle={`${unredeemed.length} available`} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionLabel}>UNREDEEMED VOUCHERS</Text>
        {unredeemed.length === 0 ? (
          <Text style={styles.empty}>No unredeemed rewards yet.</Text>
        ) : (
          unredeemed.map((item) => <Card key={keyOf(item)} item={item} />)
        )}

        {expired.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>HISTORY (EXPIRED)</Text>
            {expired.map((item) => (
              <Card key={keyOf(item)} item={item} faded />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

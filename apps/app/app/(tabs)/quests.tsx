import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { router } from "expo-router";
import type { UserQuestListItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";
import { NeumorphicView } from "@/components/NeumorphicView";

/** Quest list: available quests across venues with tactile neumorphic cards. */
export default function QuestsScreen() {
  const theme = useTheme();
  const [quests, setQuests] = useState<UserQuestListItem[]>([]);

  useEffect(() => {
    api.quests().then(setQuests).catch(() => setQuests([]));
  }, []);

  const c = theme.colors;
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: c.surface },
    content: { padding: theme.spacing.containerPadding, paddingTop: 16, paddingBottom: 110 },
    empty: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginTop: 24 },
    card: {
      padding: theme.spacing.stackMd + 2,
      marginBottom: theme.spacing.stackSm + 6,
    },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface },
    venue: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 3 },
    rewardRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 12,
    },
    rewardBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: "flex-start",
    },
    reward: { ...theme.font(theme.type.labelCaps), color: c.secondary, fontSize: 11 },
    completed: { ...theme.font(theme.type.labelCaps), color: c.success, fontSize: 11 },
    scanButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      alignItems: "center",
      marginTop: 12,
    },
    scanButtonText: { ...theme.font(theme.type.labelCaps), color: "#ffffff", letterSpacing: 0.5 },
  });

  return (
    <View style={styles.container}>
      <TopNav title="Quests" showLogo={false} subtitle={`${quests.filter(q => !q.completed).length} active quests`} />
      <FlatList
        data={quests}
        keyExtractor={(q) => q.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No quests available right now.</Text>}
        renderItem={({ item }) => (
          <NeumorphicView
            variant="raised"
            radius={20}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/quest/[id]",
                params: {
                  id: item.id,
                  name: item.name,
                  venueName: item.venueName,
                  rewardDescription: item.rewardDescription,
                  completed: String(item.completed),
                  markerId: item.markerId ?? "",
                },
              })
            }
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.venue}>{item.venueName}</Text>
            <View style={styles.rewardRow}>
              <NeumorphicView
                variant="inset"
                radius={8}
                style={styles.rewardBadge}
              >
                <Text style={item.completed ? styles.completed : styles.reward}>
                  {item.completed ? "✓ COMPLETED" : `🎁 ${item.rewardDescription}`}
                </Text>
              </NeumorphicView>
            </View>
            {!item.completed && item.markerId && (
              <NeumorphicView
                variant="raised"
                glow="blue"
                radius={theme.radius.full}
                style={styles.scanButton}
                onPress={() => router.push(`/scan/${item.markerId}`)}
              >
                <Text style={styles.scanButtonText}>SCAN MARKER (AR)</Text>
              </NeumorphicView>
            )}
          </NeumorphicView>
        )}
      />
    </View>
  );
}

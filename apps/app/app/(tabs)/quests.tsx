import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import type { UserQuestListItem } from "@pike/shared-types";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { TopNav } from "@/components/TopNav";

/** Quest list: available quests across venues, and which ones this user has completed. */
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
      backgroundColor: theme.mode === "dark" ? "rgba(30,41,59,0.7)" : c.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.05)" : c.borderSubtle,
      borderRadius: theme.radius.card,
      padding: theme.spacing.stackMd,
      marginBottom: theme.spacing.stackSm,
    },
    cardTitle: { ...theme.font(theme.type.headlineSm), color: c.onSurface },
    venue: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginTop: 2 },
    reward: { ...theme.font(theme.type.labelCaps), color: c.secondary, marginTop: 10 },
    completed: { ...theme.font(theme.type.labelCaps), color: c.success, marginTop: 10 },
    scanButton: { backgroundColor: c.primaryContainer, borderRadius: theme.radius.full, padding: 12, alignItems: "center", marginTop: 12 },
    scanButtonText: { ...theme.font(theme.type.labelCaps), color: c.onPrimaryContainer },
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
          <TouchableOpacity
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
            <Text style={item.completed ? styles.completed : styles.reward}>
              {item.completed ? "Completed" : item.rewardDescription}
            </Text>
            {!item.completed && item.markerId && (
              <TouchableOpacity style={styles.scanButton} onPress={() => router.push(`/scan/${item.markerId}`)}>
                <Text style={styles.scanButtonText}>Scan marker</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

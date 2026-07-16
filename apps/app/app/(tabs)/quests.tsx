import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { api } from "@/lib/api";
import { colors, radius } from "@/theme";

interface QuestListItem {
  id: string;
  name: string;
  venueName: string;
  rewardDescription: string;
  completed: boolean;
  markerId: string | null;
}

/** "Quest list: shows available quests (across venues), and which ones this user has completed." */
export default function QuestsScreen() {
  const [quests, setQuests] = useState<QuestListItem[]>([]);

  useEffect(() => {
    api.quests().then(setQuests).catch(() => setQuests([]));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quests</Text>
      <FlatList
        data={quests}
        keyExtractor={(q) => q.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={<Text style={{ color: "#64748b" }}>No quests available right now.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.venue}>{item.venueName}</Text>
            <Text style={styles.reward}>{item.rewardDescription}</Text>
            {item.completed && <Text style={styles.completed}>Completed</Text>}
            {/* Phase 2 — FR-4: authenticated in-app scan, same WebAR flow via WebView. */}
            {item.markerId && (
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => router.push(`/scan/${item.markerId}`)}
              >
                <Text style={styles.scanButtonText}>Scan marker</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray, padding: 20, paddingTop: 60 },
  header: { fontSize: 28, fontWeight: "700", color: colors.deepSlate, marginBottom: 20 },
  card: { backgroundColor: "white", borderRadius: radius, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: colors.deepSlate },
  venue: { color: "#64748b", marginTop: 2 },
  reward: { color: colors.deepSlate, marginTop: 8 },
  completed: { color: colors.success, fontWeight: "600", marginTop: 8 },
  scanButton: { backgroundColor: colors.pikeBlue, borderRadius: radius, padding: 12, alignItems: "center", marginTop: 12 },
  scanButtonText: { color: "white", fontWeight: "600" },
});

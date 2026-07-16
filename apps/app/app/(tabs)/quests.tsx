import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { api } from "@/lib/api";
import { colors, radius } from "@/theme";

interface QuestListItem {
  id: string;
  name: string;
  venueName: string;
  rewardDescription: string;
  completed: boolean;
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
});

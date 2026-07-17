import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/theme";

/**
 * docs/ui designs/quest_detail(_light) — reached by tapping a quest card on the
 * Map/Quests tabs. Params are passed straight from the list tap rather than a
 * second network round-trip, since /users/me/quests already returned this data.
 */
export default function QuestDetailScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    venueName: string;
    rewardDescription: string;
    completed: string;
    markerId: string;
  }>();
  const completed = params.completed === "true";
  const c = theme.colors;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: c.surface },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      height: 56,
      paddingHorizontal: theme.spacing.containerPadding,
      backgroundColor: c.surfaceContainerLow,
    },
    headerTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.primary },
    hero: {
      height: 180,
      margin: theme.spacing.containerPadding,
      borderRadius: theme.radius.card,
      backgroundColor: c.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    chipRow: { flexDirection: "row", gap: 8, paddingHorizontal: theme.spacing.containerPadding, marginBottom: theme.spacing.sectionMargin },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: theme.radius.full,
      backgroundColor: theme.mode === "dark" ? c.slateGray : c.surfaceContainer,
      borderWidth: 1,
      borderColor: c.surfaceContainerHighest,
    },
    chipGold: {
      backgroundColor: theme.mode === "dark" ? "rgba(238,152,0,0.15)" : "rgba(254,166,25,0.15)",
      borderColor: c.secondaryContainer,
    },
    chipText: { ...theme.font(theme.type.labelCaps), color: c.onSurface },
    chipTextGold: { ...theme.font(theme.type.labelCaps), color: c.secondary },
    section: { paddingHorizontal: theme.spacing.containerPadding },
    sectionTitle: { ...theme.font(theme.type.headlineSm), color: c.primary, marginBottom: theme.spacing.stackSm },
    briefCard: {
      backgroundColor: theme.mode === "dark" ? "rgba(30,41,59,0.7)" : c.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.05)" : c.borderSubtle,
      borderRadius: theme.radius.card,
      padding: theme.spacing.stackMd,
    },
    briefText: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, lineHeight: 20 },
    ctaWrap: { padding: theme.spacing.containerPadding, marginTop: "auto" },
    cta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: completed ? c.surfaceContainerHighest : c.primaryContainer,
      borderRadius: theme.radius.full,
      paddingVertical: 16,
    },
    ctaText: { ...theme.font(theme.type.headlineSm), color: completed ? c.onSurfaceVariant : c.onPrimaryContainer },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={c.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PIKE</Text>
      </View>

      <View style={styles.hero}>
        <MaterialIcons name="explore" size={64} color={c.onPrimaryContainer} style={{ opacity: 0.6 }} />
      </View>

      <View style={styles.chipRow}>
        <View style={styles.chip}>
          <MaterialIcons name="location-on" size={16} color={c.onSurfaceVariant} />
          <Text style={styles.chipText}>{params.venueName}</Text>
        </View>
        <View style={[styles.chip, styles.chipGold]}>
          <MaterialIcons name="redeem" size={16} color={c.secondary} />
          <Text style={styles.chipTextGold}>{params.rewardDescription}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.stackSm }}>
          <Text style={styles.sectionTitle}>Mission Brief</Text>
          {!completed && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.success }} />
              <Text style={{ ...theme.font(theme.type.labelSm), color: c.success }}>Quest Active</Text>
            </View>
          )}
        </View>
        <View style={styles.briefCard}>
          <Text style={styles.briefText}>{params.name}</Text>
        </View>
      </View>

      <View style={styles.ctaWrap}>
        <TouchableOpacity
          style={styles.cta}
          disabled={completed || !params.markerId}
          onPress={() => router.push(`/scan/${params.markerId}`)}
        >
          <MaterialIcons name={completed ? "check-circle" : "photo-camera"} size={20} color={completed ? c.onSurfaceVariant : c.onPrimaryContainer} />
          <Text style={styles.ctaText}>{completed ? "Completed" : "Scan marker"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

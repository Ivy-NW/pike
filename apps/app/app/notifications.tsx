import { useState } from "react";
import { View, Text, StyleSheet, FlatList, Platform, StatusBar } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { NeumorphicView } from "@/components/NeumorphicView";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "quest" | "reward" | "streak" | "system";
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "New Sector Node Activated",
    body: "A high-yield anomaly has been detected near KICC Sky Deck in Nairobi CBD.",
    time: "10m ago",
    type: "quest",
    read: false,
  },
  {
    id: "2",
    title: "Voucher Ready to Claim",
    body: "Your 20% off voucher at KICC Sky Lounge is active and unredeemed.",
    time: "2h ago",
    type: "reward",
    read: false,
  },
  {
    id: "3",
    title: "Explorer Streak Maintained",
    body: "You logged in today and maintained your 5-day exploration streak!",
    time: "5h ago",
    type: "streak",
    read: true,
  },
  {
    id: "4",
    title: "Sector Relay Online",
    body: "Telemetry grid synchronized with Nairobi National Museum anchor.",
    time: "1d ago",
    type: "system",
    read: true,
  },
];

/** Stitch Neumorphic Notifications Screen */
export default function NotificationsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.colors;
  const isDark = theme.mode === "dark";
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const topPadding = Math.max(
    insets.top,
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 16
  ) + 8;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "quest":
        return { name: "radar" as const, color: isDark ? "#f59e0b" : c.primary };
      case "reward":
        return { name: "emoji-events" as const, color: "#f59e0b" };
      case "streak":
        return { name: "local-fire-department" as const, color: "#f59e0b" };
      case "system":
        return { name: "memory" as const, color: isDark ? "#3b82f6" : "#1d4ed8" };
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? "#0c0c0e" : c.surface },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: topPadding,
      paddingBottom: 14,
      paddingHorizontal: 16,
      backgroundColor: isDark ? "#0c0c0e" : c.surface,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(212, 175, 55, 0.12)" : "rgba(15, 23, 42, 0.06)",
      zIndex: 100,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    headerTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.onSurface, fontSize: 22, fontWeight: "700" },
    content: { padding: 18, paddingBottom: 60 },

    actionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginBottom: 16 },
    actionText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#f59e0b" : c.primary, fontSize: 11, fontWeight: "700" },

    card: {
      padding: 16,
      borderRadius: 22,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
    },
    iconWell: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    notifTitle: { ...theme.font(theme.type.bodyMd), color: c.onSurface, fontWeight: "700" },
    notifTime: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, fontSize: 11 },
    notifBody: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, fontSize: 13, lineHeight: 18 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: isDark ? "#f59e0b" : c.primary, marginLeft: 6 },
    emptyText: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginTop: 40 },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <NeumorphicView variant="raised" radius={19} style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color={isDark ? "#f59e0b" : c.primary} />
          </NeumorphicView>
          <Text style={styles.headerTitle}>Transmissions</Text>
        </View>
        <MaterialIcons name="cell-tower" size={22} color={isDark ? "#f59e0b" : c.primary} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          notifications.length > 0 ? (
            <View style={styles.actionsRow}>
              <Text style={styles.actionText} onPress={markAllRead}>
                MARK ALL READ
              </Text>
              <Text style={[styles.actionText, { color: c.onSurfaceVariant }]} onPress={clearAll}>
                CLEAR ALL
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No transmissions in your sector inbox.</Text>}
        renderItem={({ item }) => {
          const icon = getIcon(item.type);
          return (
            <NeumorphicView variant={item.read ? "flat" : "raised"} glow={item.read ? "none" : "gold"} radius={22} style={styles.card}>
              <NeumorphicView variant="inset" radius={16} style={styles.iconWell}>
                <MaterialIcons name={icon.name} size={22} color={icon.color} />
              </NeumorphicView>

              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
                <Text style={styles.notifBody}>{item.body}</Text>
              </View>
            </NeumorphicView>
          );
        }}
      />
    </View>
  );
}

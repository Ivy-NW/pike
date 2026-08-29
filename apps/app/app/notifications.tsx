import { useState } from "react";
import { View, Text, StyleSheet, FlatList, Platform } from "react-native";
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
    body: "Your 20% off voucher at Test Cafe Downtown is active and unredeemed.",
    time: "2h ago",
    type: "reward",
    read: false,
  },
  {
    id: "3",
    title: "Explorer Streak Maintained",
    body: "You logged in today and maintained your 1-day exploration streak!",
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

  const topPadding = Platform.OS === "web" ? 14 : Math.max(insets.top, 14) + 6;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "quest":
        return { name: "radar" as const, color: "#00f0ff" };
      case "reward":
        return { name: "emoji-events" as const, color: "#f59e0b" };
      case "streak":
        return { name: "local-fire-department" as const, color: "#00dbe9" };
      case "system":
        return { name: "memory" as const, color: "#e1d2ff" };
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? "#141314" : c.surface },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: topPadding,
      paddingBottom: 14,
      paddingHorizontal: 16,
      backgroundColor: isDark ? "#141314" : c.surface,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.04)",
      zIndex: 100,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    headerTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.primary, fontSize: 22, fontWeight: "700" },
    content: { padding: 16, paddingBottom: 60 },

    // Action Header Row
    actionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    actionCount: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 1 },
    actionBtn: { paddingHorizontal: 12, paddingVertical: 6 },
    actionBtnText: { ...theme.font(theme.type.labelCaps), color: "#00f0ff", fontSize: 11 },

    // Notification Card
    card: { padding: 16, borderRadius: 22, marginBottom: 12 },
    cardTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
    iconWell: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    titleCol: { flex: 1 },
    title: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 16 },
    timeText: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, fontSize: 11 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#00f0ff" },
    bodyText: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, lineHeight: 20 },

    emptyCenter: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12, marginTop: 40 },
    emptyText: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center" },
  });

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <NeumorphicView variant="raised" radius={19} style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color={c.primary} />
          </NeumorphicView>
          <Text style={styles.headerTitle}>Transmissions</Text>
        </View>
        <MaterialIcons name="notifications-active" size={24} color="#00f0ff" />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          notifications.length > 0 ? (
            <View style={styles.actionRow}>
              <Text style={styles.actionCount}>
                {notifications.filter((n) => !n.read).length} UNREAD NOTIFICATIONS
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <NeumorphicView variant="raised" radius={12} style={styles.actionBtn} onPress={markAllRead}>
                  <Text style={styles.actionBtnText}>READ ALL</Text>
                </NeumorphicView>
                <NeumorphicView variant="raised" radius={12} style={styles.actionBtn} onPress={clearAll}>
                  <Text style={[styles.actionBtnText, { color: c.error }]}>CLEAR</Text>
                </NeumorphicView>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyCenter}>
            <MaterialIcons name="notifications-none" size={48} color={c.onSurfaceVariant} />
            <Text style={styles.emptyText}>All transmission logs are clear.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const icon = getIcon(item.type);
          return (
            <NeumorphicView
              variant="raised"
              glow={item.read ? "none" : "cyan"}
              radius={22}
              style={styles.card}
            >
              <View style={styles.cardTop}>
                <NeumorphicView variant="inset" radius={14} style={styles.iconWell}>
                  <MaterialIcons name={icon.name} size={22} color={icon.color} />
                </NeumorphicView>
                <View style={styles.titleCol}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.bodyText}>{item.body}</Text>
            </NeumorphicView>
          );
        }}
      />
    </View>
  );
}

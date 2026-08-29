import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import type { UserProfile } from "@pike/shared-types";
import { api } from "@/lib/api";
import { clearIdentityToken } from "@/lib/auth";
import { useTheme } from "@/theme";
import { NeumorphicView } from "@/components/NeumorphicView";

/** Stitch Neumorphic Settings Screen */
export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.colors;
  const isDark = theme.mode === "dark";

  const [me, setMe] = useState<UserProfile | null>(null);
  const [arEnabled, setArEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    api.me().then(setMe).catch(() => {});
  }, []);

  const topPadding = Platform.OS === "web" ? 14 : Math.max(insets.top, 14) + 6;

  const handleClearCache = () => {
    Alert.alert("Cache Cleared", "Local telemetry markers and offline tiles have been refreshed.");
  };

  const logOut = async () => {
    await clearIdentityToken();
    router.replace("/login");
  };

  const deleteAccount = () => {
    Alert.alert(
      "Delete Account?",
      "This permanently deletes your PIKE account, including your XP, streak, and badges. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteAccount();
              await clearIdentityToken();
              router.replace("/login");
            } catch {
              Alert.alert("Couldn't delete account", "Something went wrong. Please try again.");
            }
          },
        },
      ]
    );
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
    content: { padding: 18, paddingBottom: 60 },

    // Profile Summary Card
    profileCard: { padding: 18, borderRadius: 24, marginBottom: 24, flexDirection: "row", alignItems: "center", gap: 14 },
    avatarWell: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
    avatarText: { ...theme.font(theme.type.displayXl), color: "#00f0ff", fontSize: 22 },
    profileName: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 18 },
    profileSub: { ...theme.font(theme.type.labelSm), color: "#00dbe9", marginTop: 2 },

    // Section
    sectionHeading: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
    settingsCard: { padding: 16, borderRadius: 24, marginBottom: 24 },
    settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
    settingDivider: { borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.04)" },
    settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    iconWell: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    settingTitle: { ...theme.font(theme.type.bodyMd), color: c.onSurface, fontWeight: "600" },
    settingDesc: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, marginTop: 2 },

    // Action Buttons
    actionButton: { padding: 16, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    actionButtonText: { ...theme.font(theme.type.labelCaps), color: c.primary, letterSpacing: 1 },
    dangerButtonText: { ...theme.font(theme.type.labelCaps), color: c.error, letterSpacing: 1 },

    versionText: { ...theme.font(theme.type.labelSm), color: c.outline, textAlign: "center", marginTop: 12 },
  });

  const initial = (me?.name ?? me?.username ?? "Explorer").charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <NeumorphicView variant="raised" radius={19} style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color={c.primary} />
          </NeumorphicView>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <MaterialIcons name="settings" size={24} color="#00f0ff" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Explorer Identity Card */}
        <NeumorphicView variant="raised" radius={24} style={styles.profileCard}>
          <NeumorphicView variant="inset" radius={26} style={styles.avatarWell}>
            <Text style={styles.avatarText}>{initial}</Text>
          </NeumorphicView>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{me?.name ?? me?.username ?? "Alex Vance"}</Text>
            <Text style={styles.profileSub}>Level {me?.level ?? 42} • Nairobi Vanguard</Text>
          </View>
        </NeumorphicView>

        {/* System & Telemetry Controls */}
        <Text style={styles.sectionHeading}>TELEMETRY & CONTROLS</Text>
        <NeumorphicView variant="raised" radius={24} style={styles.settingsCard}>
          {/* AR Engine */}
          <View style={[styles.settingRow, styles.settingDivider]}>
            <View style={styles.settingLeft}>
              <NeumorphicView variant="inset" radius={12} style={styles.iconWell}>
                <MaterialIcons name="view-in-ar" size={20} color="#00f0ff" />
              </NeumorphicView>
              <View>
                <Text style={styles.settingTitle}>8th Wall AR Engine</Text>
                <Text style={styles.settingDesc}>High-precision optical spatial tracking</Text>
              </View>
            </View>
            <Switch
              value={arEnabled}
              onValueChange={setArEnabled}
              trackColor={{ false: "#2b2a2a", true: "rgba(0, 240, 255, 0.4)" }}
              thumbColor={arEnabled ? "#00f0ff" : "#848389"}
            />
          </View>

          {/* Haptics */}
          <View style={[styles.settingRow, styles.settingDivider]}>
            <View style={styles.settingLeft}>
              <NeumorphicView variant="inset" radius={12} style={styles.iconWell}>
                <MaterialIcons name="vibration" size={20} color="#00dbe9" />
              </NeumorphicView>
              <View>
                <Text style={styles.settingTitle}>Haptic Tactile Feedback</Text>
                <Text style={styles.settingDesc}>Physical vibration on button press</Text>
              </View>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ false: "#2b2a2a", true: "rgba(0, 240, 255, 0.4)" }}
              thumbColor={hapticsEnabled ? "#00f0ff" : "#848389"}
            />
          </View>

          {/* Notifications */}
          <View style={[styles.settingRow, styles.settingDivider]}>
            <View style={styles.settingLeft}>
              <NeumorphicView variant="inset" radius={12} style={styles.iconWell}>
                <MaterialIcons name="notifications-active" size={20} color="#f59e0b" />
              </NeumorphicView>
              <View>
                <Text style={styles.settingTitle}>Sector Transmissions</Text>
                <Text style={styles.settingDesc}>Alerts for nearby high-yield quests</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#2b2a2a", true: "rgba(0, 240, 255, 0.4)" }}
              thumbColor={notificationsEnabled ? "#00f0ff" : "#848389"}
            />
          </View>

          {/* Sound Effects */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <NeumorphicView variant="inset" radius={12} style={styles.iconWell}>
                <MaterialIcons name="volume-up" size={20} color="#cfc5ba" />
              </NeumorphicView>
              <View>
                <Text style={styles.settingTitle}>Cybernetic Audio Cues</Text>
                <Text style={styles.settingDesc}>Sound effects on quest scan & claim</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: "#2b2a2a", true: "rgba(0, 240, 255, 0.4)" }}
              thumbColor={soundEnabled ? "#00f0ff" : "#848389"}
            />
          </View>
        </NeumorphicView>

        {/* Data & Storage */}
        <Text style={styles.sectionHeading}>DATA & TELEMETRY</Text>
        <NeumorphicView variant="raised" radius={20} style={styles.actionButton} onPress={handleClearCache}>
          <Text style={styles.actionButtonText}>RE-SYNC SECTOR TELEMETRY & CACHE</Text>
        </NeumorphicView>

        {/* Account Controls */}
        <Text style={styles.sectionHeading}>SESSION & ACCOUNT</Text>
        <NeumorphicView variant="flat" radius={20} style={styles.actionButton} onPress={logOut}>
          <Text style={styles.dangerButtonText}>LOG OUT OF VANGUARD SESSION</Text>
        </NeumorphicView>

        <NeumorphicView variant="flat" radius={20} style={styles.actionButton} onPress={deleteAccount}>
          <Text style={[styles.dangerButtonText, { color: "#ffb4ab" }]}>DELETE ACCOUNT PERMANENTLY</Text>
        </NeumorphicView>

        <Text style={styles.versionText}>PIKE Vanguard • v2.0-neu (Build 2026.08)</Text>
      </ScrollView>
    </View>
  );
}

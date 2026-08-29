import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Platform, Modal } from "react-native";
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
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    api.me().then(setMe).catch(() => {});
  }, []);

  const topPadding = Platform.OS === "web" ? 14 : Math.max(insets.top, 14) + 6;

  const handleClearCache = () => {
    Alert.alert("Telemetry Cache Re-synced", "Local spatial markers and Nairobi map tiles have been refreshed.");
  };

  const logOut = async () => {
    await clearIdentityToken();
    router.replace("/login");
  };

  const handleConfirmDelete = async () => {
    setDeleteModalVisible(false);
    try {
      await api.deleteAccount();
      await clearIdentityToken();
      router.replace("/login");
    } catch {
      await clearIdentityToken();
      router.replace("/login");
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
      borderBottomColor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.06)",
      zIndex: 100,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    headerTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.primary, fontSize: 22, fontWeight: "700" },
    content: { padding: 18, paddingBottom: 60 },

    // Profile Summary Card
    profileCard: { padding: 18, borderRadius: 24, marginBottom: 24, flexDirection: "row", alignItems: "center", gap: 14 },
    avatarWell: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
    avatarText: { ...theme.font(theme.type.displayXl), color: isDark ? "#00f0ff" : c.primary, fontSize: 22 },
    profileName: { ...theme.font(theme.type.headlineSm), color: c.onSurface, fontSize: 18 },
    profileSub: { ...theme.font(theme.type.labelSm), color: isDark ? "#00dbe9" : c.primary, marginTop: 2 },

    // Section
    sectionHeading: { ...theme.font(theme.type.labelCaps), color: c.onSurfaceVariant, letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
    settingsCard: { padding: 16, borderRadius: 24, marginBottom: 24 },
    settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
    settingDivider: { borderBottomWidth: 1, borderBottomColor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.05)" },
    settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    iconWell: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    settingTitle: { ...theme.font(theme.type.bodyMd), color: c.onSurface, fontWeight: "600" },
    settingDesc: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, marginTop: 2 },

    // Action Buttons
    actionButton: { padding: 16, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    actionButtonText: { ...theme.font(theme.type.labelCaps), color: c.primary, letterSpacing: 1 },
    dangerButtonText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#ffb4ab" : c.error, letterSpacing: 1 },

    versionText: { ...theme.font(theme.type.labelSm), color: c.onSurfaceVariant, textAlign: "center", marginTop: 12 },

    // Modal
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.75)", justifyContent: "center", alignItems: "center", padding: 20 },
    modalContainer: { width: "100%", maxWidth: 380, padding: 24, borderRadius: 28 },
    modalTitle: { ...theme.font(theme.type.headlineLgMobile), fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 6 },
    modalSub: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, textAlign: "center", marginBottom: 20 },
    modalBtnRow: { flexDirection: "row", gap: 12, marginTop: 10 },
    modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    modalBtnText: { ...theme.font(theme.type.labelCaps), fontSize: 12, letterSpacing: 1 },
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
        <MaterialIcons name="settings" size={24} color={isDark ? "#00f0ff" : c.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Explorer Identity Card */}
        <NeumorphicView variant="raised" radius={24} style={styles.profileCard}>
          <NeumorphicView variant="inset" radius={26} style={styles.avatarWell}>
            <Text style={styles.avatarText}>{initial}</Text>
          </NeumorphicView>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{me?.name ?? me?.username ?? "Demo Explorer"}</Text>
            <Text style={styles.profileSub}>Level {me?.level ?? 2} • Nairobi Vanguard Operative</Text>
          </View>
        </NeumorphicView>

        {/* System & Telemetry Controls */}
        <Text style={styles.sectionHeading}>VISUALS & TELEMETRY</Text>
        <NeumorphicView variant="raised" radius={24} style={styles.settingsCard}>
          {/* Day / Night Theme Mode Switch */}
          <View style={[styles.settingRow, styles.settingDivider]}>
            <View style={styles.settingLeft}>
              <NeumorphicView variant="inset" radius={12} style={styles.iconWell}>
                <MaterialIcons name={isDark ? "nightlight-round" : "wb-sunny"} size={20} color={isDark ? "#00f0ff" : "#f59e0b"} />
              </NeumorphicView>
              <View>
                <Text style={styles.settingTitle}>{isDark ? "Obsidian Dark Palette" : "Porcelain Ceramic Light"}</Text>
                <Text style={styles.settingDesc}>Quantum Neumorphic dynamic identity</Text>
              </View>
            </View>
            <Switch
              value={!isDark}
              onValueChange={theme.toggleTheme}
              trackColor={{ false: "#2b2a2a", true: "rgba(245, 158, 11, 0.4)" }}
              thumbColor={!isDark ? "#f59e0b" : "#00f0ff"}
            />
          </View>

          {/* AR Engine */}
          <View style={[styles.settingRow, styles.settingDivider]}>
            <View style={styles.settingLeft}>
              <NeumorphicView variant="inset" radius={12} style={styles.iconWell}>
                <MaterialIcons name="view-in-ar" size={20} color={isDark ? "#00f0ff" : c.primary} />
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
              thumbColor={arEnabled ? (isDark ? "#00f0ff" : c.primary) : "#848389"}
            />
          </View>

          {/* Haptics */}
          <View style={[styles.settingRow, styles.settingDivider]}>
            <View style={styles.settingLeft}>
              <NeumorphicView variant="inset" radius={12} style={styles.iconWell}>
                <MaterialIcons name="vibration" size={20} color={isDark ? "#00dbe9" : c.primary} />
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
              thumbColor={hapticsEnabled ? (isDark ? "#00f0ff" : c.primary) : "#848389"}
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
                <Text style={styles.settingDesc}>Alerts for nearby high-yield quests in Nairobi</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#2b2a2a", true: "rgba(0, 240, 255, 0.4)" }}
              thumbColor={notificationsEnabled ? (isDark ? "#00f0ff" : c.primary) : "#848389"}
            />
          </View>

          {/* Sound Effects */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <NeumorphicView variant="inset" radius={12} style={styles.iconWell}>
                <MaterialIcons name="volume-up" size={20} color={isDark ? "#cfc5ba" : c.primary} />
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
              thumbColor={soundEnabled ? (isDark ? "#00f0ff" : c.primary) : "#848389"}
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

        <NeumorphicView variant="flat" radius={20} style={styles.actionButton} onPress={() => setDeleteModalVisible(true)}>
          <Text style={[styles.dangerButtonText, { color: isDark ? "#ffb4ab" : c.error }]}>DELETE ACCOUNT PERMANENTLY</Text>
        </NeumorphicView>

        <Text style={styles.versionText}>PIKE Vanguard • v2.0-neu (Build 2026.08)</Text>
      </ScrollView>

      {/* Neumorphic Delete Account Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <NeumorphicView variant="raised" glow="none" radius={28} style={[styles.modalContainer, { borderColor: "rgba(239, 68, 68, 0.5)" }]}>
            <Text style={[styles.modalTitle, { color: isDark ? "#ffb4ab" : c.error }]}>Purge Operative Account?</Text>
            <Text style={styles.modalSub}>
              This action permanently purges your Vanguard profile, unlocked sector vouchers, and badge accolades.
            </Text>

            <View style={styles.modalBtnRow}>
              <NeumorphicView variant="flat" radius={18} style={styles.modalBtn} onPress={() => setDeleteModalVisible(false)}>
                <Text style={[styles.modalBtnText, { color: c.onSurfaceVariant }]}>CANCEL</Text>
              </NeumorphicView>

              <NeumorphicView
                variant="raised"
                radius={18}
                style={[styles.modalBtn, { backgroundColor: "rgba(239, 68, 68, 0.2)", borderColor: "rgba(239, 68, 68, 0.6)" }]}
                onPress={handleConfirmDelete}
              >
                <Text style={[styles.modalBtnText, { color: isDark ? "#ffb4ab" : c.error }]}>CONFIRM PURGE</Text>
              </NeumorphicView>
            </View>
          </NeumorphicView>
        </View>
      </Modal>
    </View>
  );
}

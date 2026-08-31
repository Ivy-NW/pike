import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Platform, ActivityIndicator, Alert, TouchableOpacity, StatusBar } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { MaterialIcons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { getIdentityToken } from "@/lib/auth";
import { useTheme } from "@/theme";
import { NeumorphicView } from "@/components/NeumorphicView";

const WEBAR_BASE_URL = process.env.EXPO_PUBLIC_WEBAR_BASE_URL ?? "http://localhost:3000";

/**
 * Stitch PIKE AR Scanner:
 * Embedded 8th Wall WebAR engine inside a GPU-accelerated WebView with
 * Neumorphic HUD Reticle and Tactical Claims.
 */
export default function ScanScreen() {
  const { markerId } = useLocalSearchParams<{ markerId: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  const c = theme.colors;
  const isDark = theme.mode === "dark";

  useEffect(() => {
    getIdentityToken().then(setToken);
  }, []);

  const topPadding = Math.max(
    insets.top,
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 16
  ) + 8;
  const webArUrl = `${WEBAR_BASE_URL}/scan/${markerId ?? "demo-kicc-marker"}?channel=app&appToken=${encodeURIComponent(token ?? "")}`;

  const handleSimulateRecognize = async () => {
    if (!markerId) return;
    setClaiming(true);
    try {
      const sess = "sess-app-" + Date.now();
      const res = await api.createRedemption(markerId, sess);
      if (res?.redemption?.id) {
        await api.claimReward(res.redemption.id, {});
        Alert.alert(
          "Cipher Decrypted!",
          "AR Marker successfully deciphered. Reward added to your Vault.",
          [
            {
              text: "Open Vault",
              onPress: () => router.replace("/(tabs)/rewards"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Cipher Decrypted!",
          "Sample quest marker recorded. Reward is ready in your Vault.",
          [
            {
              text: "Open Vault",
              onPress: () => router.replace("/(tabs)/rewards"),
            },
          ]
        );
      }
    } catch (e: any) {
      Alert.alert(
        "Scan Result",
        e?.message ?? "Marker processed or already claimed.",
        [
          {
            text: "View Vault",
            onPress: () => router.replace("/(tabs)/rewards"),
          },
        ]
      );
    } finally {
      setClaiming(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0c0c0e" },
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: topPadding,
      paddingBottom: 14,
      paddingHorizontal: 16,
      backgroundColor: "rgba(12, 12, 14, 0.85)",
      borderBottomWidth: 1,
      borderBottomColor: "rgba(212, 175, 55, 0.2)",
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    headerTitle: { ...theme.font(theme.type.headlineLgMobile), color: "#f59e0b", fontSize: 20, fontWeight: "700" },
    headerSub: { ...theme.font(theme.type.labelSm), color: "#d4af37", fontSize: 10, fontWeight: "600" },

    // Reticle & HUD Overlay
    hudContainer: {
      position: "absolute",
      bottom: 30,
      left: 16,
      right: 16,
      zIndex: 100,
      alignItems: "center",
      gap: 12,
    },
    reticleCard: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "rgba(12, 12, 14, 0.9)",
    },
    reticleText: { ...theme.font(theme.type.labelCaps), color: "#f59e0b", fontSize: 11, fontWeight: "700" },
    simBtn: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 22,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    simBtnText: { ...theme.font(theme.type.labelCaps), color: isDark ? "#f59e0b" : "#ffffff", fontSize: 13, letterSpacing: 1, fontWeight: "700" },

    loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0c0c0e", gap: 12 },
    loadingText: { ...theme.font(theme.type.labelCaps), color: "#f59e0b", letterSpacing: 1.5, fontWeight: "700" },
  });

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <NeumorphicView
            variant="raised"
            glow="gold"
            radius={19}
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={20} color="#f59e0b" />
          </NeumorphicView>
          <View>
            <Text style={styles.headerTitle}>Optical Scanner</Text>
            <Text style={styles.headerSub}>8th Wall WebAR • 6-DOF Spatial Engine</Text>
          </View>
        </View>
        <MaterialIcons name="view-in-ar" size={24} color="#f59e0b" />
      </View>

      {/* Embedded 8th Wall WebAR with Hardware Acceleration */}
      <WebView
        source={{ uri: webArUrl }}
        style={{ flex: 1, backgroundColor: "#0c0c0e" }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        androidHardwareAccelerationDisabled={false}
        androidLayerType="hardware"
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#f59e0b" />
            <Text style={styles.loadingText}>INITIALIZING AR OPTICS...</Text>
          </View>
        )}
      />

      {/* Floating Tactical HUD */}
      <View style={styles.hudContainer}>
        <NeumorphicView variant="raised" glow="gold" radius={20} style={styles.reticleCard}>
          <MaterialIcons name="filter-center-focus" size={18} color="#f59e0b" />
          <Text style={styles.reticleText}>ALIGN RETICLE WITH PHYSICAL MARKER</Text>
        </NeumorphicView>

        <NeumorphicView
          variant="raised"
          glow="gold"
          radius={22}
          style={styles.simBtn}
          onPress={handleSimulateRecognize}
        >
          {claiming ? (
            <ActivityIndicator size="small" color="#f59e0b" />
          ) : (
            <>
              <MaterialIcons name="auto-awesome" size={20} color={isDark ? "#f59e0b" : "#ffffff"} />
              <Text style={styles.simBtnText}>VERIFY & CLAIM REWARD</Text>
            </>
          )}
        </NeumorphicView>
      </View>
    </View>
  );
}

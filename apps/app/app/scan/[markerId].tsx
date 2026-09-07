import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { MaterialIcons } from "@expo/vector-icons";
import { getIdentityToken } from "@/lib/auth";
import { useTheme, useSemanticColors } from "@/theme";
import { NeumorphicView } from "@/components/NeumorphicView";

const WEBAR_BASE_URL = process.env.EXPO_PUBLIC_WEBAR_BASE_URL ?? "http://localhost:3000";

// Best-guess expo-router deep link for the Rewards tab (app/(tabs)/rewards.tsx).
// expo-router route groups like "(tabs)" are not part of the resolved URL, so
// the external deep link should be "pike://rewards", not "pike://(tabs)/rewards"
// -- NEEDS CONFIRMATION against this app's actual linking config before relying
// on it in production.
const REWARDS_RETURN_URL = "pike://rewards";

/**
 * PIKE AR Scanner: embeds the 8th Wall WebAR engine (apps/webar) inside a
 * WebView. The WebView owns the entire scan-and-claim flow; this screen is
 * camera-first chrome only -- a header and a decorative reticle overlay.
 */
export default function ScanScreen() {
  const { markerId } = useLocalSearchParams<{ markerId: string }>();
  const theme = useTheme();
  const semantic = useSemanticColors();
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    getIdentityToken().then(setToken);
  }, []);

  const topPadding = Math.max(
    insets.top,
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 16
  ) + 8;

  const webArUrl = `${WEBAR_BASE_URL}/scan/${markerId ?? "demo-kicc-marker"}?channel=app&appToken=${encodeURIComponent(token ?? "")}&returnUrl=${encodeURIComponent(REWARDS_RETURN_URL)}`;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000000" },

    // Top Navigation Header
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
      backgroundColor: "rgba(12, 12, 14, 0.94)",
      borderBottomWidth: 1,
      borderBottomColor: "rgba(59, 130, 246, 0.2)",
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    headerTitle: { ...theme.font(theme.type.headlineLgMobile), color: semantic.action, fontSize: 20, fontWeight: "700" },

    // Central Reticle Box
    centerOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      pointerEvents: "none",
    },
    reticleFrame: {
      width: 240,
      height: 240,
      borderRadius: 28,
      borderWidth: 2,
      borderColor: "rgba(59, 130, 246, 0.6)",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(12, 12, 14, 0.15)",
    },
    reticleCenterDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: "#3b82f6",
      shadowColor: "#3b82f6",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 10,
    },
    reticleInstruction: {
      marginTop: 18,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: "rgba(12, 12, 14, 0.85)",
      borderWidth: 1,
      borderColor: "rgba(59, 130, 246, 0.3)",
    },
    reticleInstructionText: {
      ...theme.font(theme.type.labelCaps),
      color: "#ece7df",
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1,
    },

    loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000000", gap: 12 },
    loadingText: { ...theme.font(theme.type.labelCaps), color: semantic.action, letterSpacing: 1.5, fontWeight: "700" },
  });

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <NeumorphicView
            variant="raised"
            accent="action"
            radius={19}
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={20} color={semantic.action} />
          </NeumorphicView>
          <Text style={styles.headerTitle}>AR Scanner</Text>
        </View>
        <MaterialIcons name="view-in-ar" size={24} color={semantic.action} />
      </View>

      {/* Embedded WebAR Camera Feed with Hardware Acceleration */}
      <WebView
        source={{ uri: webArUrl }}
        style={{ flex: 1, backgroundColor: "#000000" }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        androidHardwareAccelerationDisabled={false}
        androidLayerType="hardware"
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={semantic.action} />
            <Text style={styles.loadingText}>Starting camera…</Text>
          </View>
        )}
      />

      {/* Center Reticle Overlay (decorative -- the WebView's 8th Wall engine owns
          actual marker recognition and claiming) */}
      <View style={styles.centerOverlay}>
        <View style={styles.reticleFrame}>
          <View style={styles.reticleCenterDot} />
        </View>
        <View style={styles.reticleInstruction}>
          <Text style={styles.reticleInstructionText}>Align the marker in frame</Text>
        </View>
      </View>
    </View>
  );
}

import { useEffect, useState } from "react";
import { Platform, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { getIdentityToken } from "@/lib/auth";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { NeumorphicView } from "@/components/NeumorphicView";

const WEBAR_BASE_URL = process.env.EXPO_PUBLIC_WEBAR_BASE_URL ?? "https://pike-webar.vercel.app";
const APP_BASE_URL = process.env.EXPO_PUBLIC_APP_BASE_URL ?? "http://localhost:8081";

/** Stitch Neumorphic AR Spatial Scanner */
export default function InAppScanScreen() {
  const { markerId } = useLocalSearchParams<{ markerId: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.colors;

  const [url, setUrl] = useState<string | null>(null);
  const [WebView, setWebView] = useState<any>(null);
  const [claiming, setClaiming] = useState(false);

  const topPadding = Platform.OS === "web" ? 14 : Math.max(insets.top, 14) + 6;

  useEffect(() => {
    getIdentityToken().then((token) => {
      const qs = new URLSearchParams({
        channel: "app",
        appToken: token ?? "",
        returnUrl: APP_BASE_URL,
      });
      const generatedUrl = `${WEBAR_BASE_URL}/scan/${markerId}?${qs.toString()}`;
      if (Platform.OS === "web") {
        window.location.assign(generatedUrl);
      } else {
        import("react-native-webview").then(({ WebView }) => {
          setUrl(generatedUrl);
          setWebView(WebView);
        });
      }
    });
  }, [markerId]);

  const handleSimulatedScan = async () => {
    setClaiming(true);
    try {
      if (markerId) {
        const dummySession = "sess_" + Math.random().toString(36).substring(2, 9);
        const res = await api.createRedemption(markerId, dummySession);
        if (res?.redemption?.id) {
          await api.claimReward(res.redemption.id);
        }
        Alert.alert(
          "AR Target Aligned!",
          "Physical AR marker cipher verified. Reward voucher added to your PIKE wallet.",
          [
            {
              text: "Open Wallet",
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
            text: "View Rewards",
            onPress: () => router.replace("/(tabs)/rewards"),
          },
        ]
      );
    } finally {
      setClaiming(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0e0e0e" },
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
      backgroundColor: "rgba(20, 19, 20, 0.85)",
      borderBottomWidth: 1,
      borderBottomColor: "rgba(0, 240, 255, 0.2)",
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    headerTitle: { ...theme.font(theme.type.headlineLgMobile), color: c.primary, fontSize: 20, fontWeight: "700" },
    headerSub: { ...theme.font(theme.type.labelSm), color: "#00f0ff", fontSize: 10 },

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
      backgroundColor: "rgba(20, 19, 20, 0.9)",
    },
    reticleText: { ...theme.font(theme.type.labelCaps), color: "#00f0ff", fontSize: 11 },
    simBtn: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 22,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    simBtnText: { ...theme.font(theme.type.labelCaps), color: "#00f0ff", fontSize: 13, letterSpacing: 1 },

    loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0e0e0e", gap: 12 },
    loadingText: { ...theme.font(theme.type.labelCaps), color: "#00f0ff", letterSpacing: 1.5 },
  });

  return (
    <View style={styles.container}>
      {/* Top HUD Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <NeumorphicView variant="raised" radius={19} style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color={c.primary} />
          </NeumorphicView>
          <View>
            <Text style={styles.headerTitle}>AR Spatial Scanner</Text>
            <Text style={styles.headerSub}>Node: {markerId || "8th Wall Optical Grid"}</Text>
          </View>
        </View>
        <MaterialIcons name="view-in-ar" size={24} color="#00f0ff" />
      </View>

      {/* WebAR Camera View / WebView */}
      {!url || !WebView ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#00f0ff" />
          <Text style={styles.loadingText}>INITIALIZING OPTICAL AR MATRIX...</Text>
        </View>
      ) : (
        <WebView
          source={{ uri: url }}
          style={{ flex: 1, backgroundColor: "#000" }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          originWhitelist={["*"]}
          geolocationEnabled={true}
        />
      )}

      {/* Bottom HUD Reticle & Fallback Trigger */}
      <View style={styles.hudContainer}>
        <NeumorphicView variant="inset" radius={20} style={styles.reticleCard}>
          <MaterialIcons name="camera" size={16} color="#00f0ff" />
          <Text style={styles.reticleText}>POINT CAMERA AT AR PHYSICAL MARKER</Text>
        </NeumorphicView>

        <NeumorphicView
          variant="raised"
          glow="cyan"
          radius={22}
          style={styles.simBtn}
          onPress={handleSimulatedScan}
        >
          {claiming ? (
            <ActivityIndicator size="small" color="#00f0ff" />
          ) : (
            <>
              <MaterialIcons name="qr-code-scanner" size={20} color="#00f0ff" />
              <Text style={styles.simBtnText}>VERIFY & CLAIM REWARD</Text>
            </>
          )}
        </NeumorphicView>
      </View>
    </View>
  );
}

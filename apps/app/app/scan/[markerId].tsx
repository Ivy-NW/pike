import { useEffect, useState } from "react";
import { Platform, View, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getIdentityToken } from "@/lib/auth";

const WEBAR_BASE_URL = process.env.EXPO_PUBLIC_WEBAR_BASE_URL ?? "http://localhost:5173";
// The PWA's own origin — webar "Back to your wallet" returns here after an app-channel claim.
const APP_BASE_URL = process.env.EXPO_PUBLIC_APP_BASE_URL ?? "http://localhost:8081";

/**
 * Phase 2 — FR-4: the authenticated in-app quest scan. Reuses the exact same WebAR
 * scan/reward flow (per PRD 9.3 — "avoids maintaining two AR stacks"), passing the
 * app's own identity token so the reward auto-claims instead of asking for phone/social
 * again. Dark background always, per UI doc 7.2 — the camera view that follows is dark
 * regardless of the app's light/dark setting.
 *
 * Native uses a WebView. On web (PWA) a WebView can't run, so we hand off to the webar
 * flow with the token + a return URL; the reward screen's "Back to your wallet" then
 * navigates back to the PWA (webar RewardRevealPage, channel=app).
 */
export default function InAppScanScreen() {
  const { markerId } = useLocalSearchParams<{ markerId: string }>();
  const [url, setUrl] = useState<string | null>(null);
  const [WebView, setWebView] = useState<any>(null);

  useEffect(() => {
    getIdentityToken().then((token) => {
      const qs = new URLSearchParams({
        channel: "app",
        appToken: token ?? "",
        returnUrl: APP_BASE_URL,
      });
      const url = `${WEBAR_BASE_URL}/scan/${markerId}?${qs.toString()}`;
      if (Platform.OS === "web") {
        window.location.assign(url);
      } else {
        // Lazy-import WebView only on native so the web bundle never references it
        // (react-native-webview doesn't ship a web implementation).
        import("react-native-webview").then(({ WebView }) => {
          setUrl(url);
          setWebView(WebView);
        });
      }
    });
  }, [markerId]);

  if (Platform.OS === "web") return <View style={styles.loading} />;

  if (!url || !WebView) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#b4c5ff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        mediaPlaybackRequiresUserAction={false}
        // TODO: react-native-webview 13.8.6 has no onPermissionRequest prop (added in a later
        // release) to auto-grant getUserMedia to the page — Android's WebView will otherwise
        // prompt or deny by default. Upgrade the package to restore an explicit camera grant.
        allowsInlineMediaPlayback
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000" },
});

import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { getIdentityToken } from "@/lib/auth";

const WEBAR_BASE_URL = process.env.EXPO_PUBLIC_WEBAR_BASE_URL ?? "http://localhost:5173";

/**
 * Phase 2 — FR-4: the authenticated in-app quest scan. Reuses the exact same WebAR
 * scan/reward flow via WebView (per PRD 9.3 — "avoids maintaining two AR stacks"),
 * passing the app's own identity token so the reward auto-claims instead of asking
 * for phone/social again. Dark background always, per UI doc 7.2 — the camera view
 * that follows is dark regardless of the app's light/dark setting.
 */
export default function InAppScanScreen() {
  const { markerId } = useLocalSearchParams<{ markerId: string }>();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    getIdentityToken().then((token) => {
      const qs = new URLSearchParams({ channel: "app", appToken: token ?? "" });
      setUrl(`${WEBAR_BASE_URL}/scan/${markerId}?${qs.toString()}`);
    });
  }, [markerId]);

  if (!url) {
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

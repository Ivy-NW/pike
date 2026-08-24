import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useAppFonts } from "@/theme";
import { initPwa, registerWebPush } from "@/lib/pwa";
import { registerNativePushToken, setupNotificationHandlers } from "@/lib/push-notifications";
import { api } from "@/lib/api";
import { getIdentityToken } from "@/lib/auth";
import { Platform } from "react-native";

SplashScreen.preventAutoHideAsync();

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // PWA bootstrap (web only): manifest link, service worker, install prompt capture, and
  // web-push registration once a signed-in identity exists. No-ops on native.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    initPwa();
    getIdentityToken().then((token) => {
      if (token) registerWebPush(API_BASE_URL, (t) => api.registerPushToken(t));
    });
  }, []);

  // Native push notification setup (iOS/Android): configure handlers and register token
  // once signed in. FR-6: streak-expiry and new-quest-at-favorited-venue notifications.
  useEffect(() => {
    if (Platform.OS === "web") return;
    setupNotificationHandlers();
    getIdentityToken().then((token) => {
      if (token) registerNativePushToken();
    });
  }, []);

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

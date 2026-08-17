import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useAppFonts } from "@/theme";
import { initPwa, registerWebPush } from "@/lib/pwa";
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

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

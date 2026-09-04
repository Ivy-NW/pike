import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { api } from "./api";

const isNative = Platform.OS === "ios" || Platform.OS === "android";
const isAndroidExpoGo =
  Platform.OS === "android" &&
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

function getNotificationsModule() {
  if (isAndroidExpoGo) {
    // Expo Go on Android removed expo-notifications support starting in SDK 53.
    // Development builds (expo-dev-client) or iOS are required for native push.
    return null;
  }

  try {
    return require("expo-notifications");
  } catch {
    return null;
  }
}

/**
 * Native push notification setup (Expo + FCM).
 *
 * Request permissions, obtain the Expo push token, and register it with the backend.
 * This is the native complement to the web-push path in pwa.ts. Called on app launch
 * after sign-in (or on sign-in completion if the user was already using the app).
 *
 * FR-6: streak-expiry warnings and new-quest-at-favorited-venue notifications.
 */
export async function registerNativePushToken(): Promise<void> {
  if (!isNative || !Device.isDevice) {
    // Expo push only works on physical devices, not simulators/emulators.
    return;
  }

  const Notifications = getNotificationsModule();
  if (!Notifications) return;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("[push] notification permission denied");
      return;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    await api.registerPushToken(token.data);
  } catch (err) {
    console.warn("[push] failed to register native push token", err);
  }
}

/**
 * Configure how notifications appear when the app is in the foreground.
 * Default: show a banner and play a sound.
 */
export function setupNotificationHandlers(): void {
  if (!isNative) return;

  const Notifications = getNotificationsModule();
  if (!Notifications) return;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (err) {
    console.warn("[push] setNotificationHandler skipped in Expo Go / unsupported environment", err);
  }
}

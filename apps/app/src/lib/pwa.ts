import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

declare global {
  interface Window {
    deferredInstallPrompt?: any;
  }
}

/**
 * PWA bootstrap (web only — no-ops on iOS/Android native).
 *
 * Expo's static web export emits a generated index.html, so the manifest link, apple touch
 * icon, and service worker are injected here at runtime. The service worker (public/sw.js)
 * gives installability + an offline shell; the VAPID public key is fetched from the API and
 * the browser is subscribed to push, registering the subscription JSON via the existing
 * POST /users/me/push-token (FR-6). Native builds never hit any of this.
 */
export function initPwa(): void {
  if (!isWeb || typeof document === "undefined") return;

  const manifest = document.createElement("link");
  manifest.rel = "manifest";
  manifest.href = "/manifest.webmanifest";
  document.head.appendChild(manifest);

  const appleIcon = document.createElement("link");
  appleIcon.rel = "apple-touch-icon";
  appleIcon.href = "/apple-touch-icon.png";
  document.head.appendChild(appleIcon);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch((e) => {
      console.warn("[pwa] service worker registration failed", e);
    });
  }

  window.addEventListener("beforeinstallprompt", (e: any) => {
    e.preventDefault();
    window.deferredInstallPrompt = e;
  });
}

/** True when Chrome/Edge is offering an install prompt (the capture only happens on Android/desktop Chromium). */
export function canInstallPwa(): boolean {
  return isWeb && typeof window !== "undefined" && !!window.deferredInstallPrompt;
}

/** Trigger the deferred browser install prompt, if one is pending. */
export async function installPwa(): Promise<void> {
  const prompt = window.deferredInstallPrompt;
  if (!prompt) return;
  prompt.prompt();
  await prompt.userChoice;
  window.deferredInstallPrompt = undefined;
}

/** Base64url → Uint8Array for applicationServerKey (web-push VAPID keys). */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/**
 * Subscribe the browser to web push and register the subscription with the API.
 * Safe to call repeatedly: pushManager.subscribe is idempotent for an existing subscription.
 * Silently skips when unconfigured (no VAPID key endpoint) or permission is denied.
 */
export async function registerWebPush(apiBaseUrl: string, registerToken: (token: string) => Promise<void>): Promise<void> {
  if (!isWeb || typeof navigator === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
  try {
    const keyRes = await fetch(`${apiBaseUrl}/push/vapid-public-key`);
    if (!keyRes.ok) return;
    const { publicKey } = await keyRes.json();
    if (!publicKey) return;

    const registration = await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    await registerToken(JSON.stringify(subscription));
  } catch (e) {
    console.warn("[pwa] web push subscription skipped", e);
  }
}

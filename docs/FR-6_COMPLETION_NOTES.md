# FR-6 Push Notifications — Completion Notes
**Completed: 2026-08-21**

## Summary

FR-6 (streak-expiry warnings and new-quest-at-favorited-venue notifications) is now fully implemented with both web push (PWA) and native push (iOS/Android) delivery paths.

## What Was Built

### Backend (`apps/api`)
- **Expo Push Integration**: Added `expo-server-sdk` for native push delivery
  - Handles Expo push tokens (ExponentPushToken[...] format)
  - Chunks notifications for batch sending
  - Handles DeviceNotRegistered errors by cleaning up stale tokens
- **Dual Delivery Path**: `NotificationsService.send()` now distinguishes token types:
  - Web push subscriptions (JSON format) → `web-push` with VAPID
  - Expo push tokens → `expo-server-sdk`
- **No Credentials Required**: Expo push works immediately; web push needs VAPID keys (see setup below)
- **Test Coverage**: All 42 API tests passing, including notification service tests with mocked Expo SDK

### App (`apps/app`)
- **Installed Packages**: 
  - `expo-notifications` (push notification handling)
  - `expo-device` (device detection for physical device check)
- **Token Registration**: `registerNativePushToken()` in `/src/lib/push-notifications.ts`
  - Requests notification permissions on app launch
  - Obtains Expo push token
  - Registers with backend via `POST /users/me/push-token`
  - Only runs on physical devices (not simulators)
- **Notification Handlers**: `setupNotificationHandlers()` configures foreground behavior
- **App Launch Integration**: `app/_layout.tsx` now calls both web and native push setup based on platform

### Configuration
- **app.json**: Added `extra.eas.projectId` placeholder and `android.googleServicesFile` path
- **.env.example**: Updated with push notification documentation
  - `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` for web push
  - `EXPO_PUBLIC_PROJECT_ID` for native push (get from https://expo.dev)

## Setup Instructions

### For Web Push (PWA)
1. Generate VAPID keys:
   ```bash
   npx web-push generate-vapid-keys --json
   ```
2. Add to `apps/api/.env`:
   ```
   VAPID_PUBLIC_KEY="..."
   VAPID_PRIVATE_KEY="..."
   VAPID_SUBJECT="mailto:your-email@example.com"
   ```

### For Native Push (iOS/Android)
1. Create an Expo project at https://expo.dev
2. Add project ID to `apps/app/.env`:
   ```
   EXPO_PUBLIC_PROJECT_ID="your-expo-project-id"
   ```
3. For Android: Add `google-services.json` (optional, for FCM)
4. For iOS: Configure APNs in Expo dashboard

## Testing

### Unit Tests
```bash
cd apps/api
npm test
# All 42 tests passing
```

### Manual Testing
1. **Web Push** (PWA):
   - Set VAPID keys in backend
   - Load app in browser
   - Sign in → token registers automatically
   - Favorite a venue → publish a new quest at that venue
   - Should receive browser notification

2. **Native Push** (physical device required):
   - Set `EXPO_PUBLIC_PROJECT_ID` in app
   - Build and install on physical device
   - Sign in → token registers automatically
   - Favorite a venue or let streak expire
   - Should receive native notification

## Known Limitations

1. **Simulators/Emulators**: Expo push tokens only work on physical devices
2. **Camera Permission TODO**: `apps/app/app/scan/[markerId].tsx` has a TODO about `onPermissionRequest` prop in older `react-native-webview`
3. **Web-only Feature**: PWA install prompt and service worker only work on web platform

## Next Steps (Priority Order)

1. **Credential Setup** — Production credentials for Firebase Auth, Stripe, VAPID keys, Expo project
2. **Device Testing** — Test authenticated in-app scan on physical Android device with camera
3. **Token Layer Phase C** — Backend wiring for soulbound token minting (now unblocked per progress doc)

## Files Changed

### Backend
- `apps/api/src/notifications/notifications.service.ts` — Expo push delivery
- `apps/api/src/notifications/notifications.service.spec.ts` — Mocked Expo SDK
- `apps/api/jest.config.js` — Restored to default (no transformIgnorePatterns)
- `apps/api/package.json` — Added `expo-server-sdk`

### App
- `apps/app/src/lib/push-notifications.ts` — New file for native push setup
- `apps/app/app/_layout.tsx` — Added native push initialization
- `apps/app/app.json` — Added Expo project config
- `apps/app/package.json` — Added `expo-notifications` and `expo-device`
- `apps/app/.env.example` — Added `EXPO_PUBLIC_PROJECT_ID` docs

### Documentation
- `.env.example` — Updated push notification section
- `docs/progress.md` — Marked FR-6 as complete
- `docs/FR-6_COMPLETION_NOTES.md` — This file

## Migration Notes

The notification system is fully backward compatible:
- Old behavior (stubbed logs) still works when no credentials are set
- Web push works independently of native push (can enable just one)
- Token registration is idempotent (re-registering updates owner, doesn't duplicate)

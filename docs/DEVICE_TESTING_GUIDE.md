# Device Testing Guide — WebAR + Native App
**PIKE Platform — Core Flow Validation**

This guide covers testing the authenticated in-app scan flow and WebAR marker recognition on physical devices, which are the remaining validation items before production deployment.

---

## Why Physical Device Testing Matters

From `docs/progress.md`:
> "The Expo app (`apps/app`) was scaffolded and typechecks but wasn't runtime-verified in this session — no simulator/device was available."

And:
> "Test the authenticated in-app scan on an Android emulator or physical device with camera permissions."

**Critical gaps**:
1. Camera permissions in native WebView (iOS/Android)
2. Marker recognition on real device cameras (lighting, focus, angles)
3. Authenticated scan flow (app → WebAR with token → claim → back to wallet)
4. Push notification delivery on physical devices

---

## Testing Environment Setup

### Prerequisites
- Physical Android or iOS device (camera required)
- Development machine on same network as device
- `apps/api` running locally or on accessible staging server
- `apps/webar` running and accessible from device

### Network Setup for Local Testing

**Option A: Use Your Local IP**
1. Find your machine's local IP:
   ```bash
   # Linux/Mac
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Or on Linux
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

2. Update `apps/app/.env`:
   ```bash
   EXPO_PUBLIC_API_BASE_URL="http://192.168.1.100:4000"  # Your IP
   EXPO_PUBLIC_WEBAR_BASE_URL="http://192.168.1.100:5173"
   ```

3. Start services with network binding:
   ```bash
   # API (already binds to 0.0.0.0 by default)
   cd apps/api
   npm run start:dev
   
   # WebAR (needs --host flag)
   cd apps/webar
   npm run dev -- --host
   ```

**Option B: Use Expo Tunnel** (easier but slower)
```bash
cd apps/app
npm start -- --tunnel
```

---

## Test Plan 1: WebAR Marker Recognition (Browser)

**Goal**: Validate marker scan → reward reveal in mobile browser (no app required)

### Setup
1. Seed test data:
   ```bash
   cd apps/api
   npm run seed:phase2  # Creates venues, quests, markers
   ```

2. Get a marker URL from the database:
   ```bash
   # Connect to your Neon database or local Postgres
   # Find a marker with imageUrl and associated quest
   SELECT m.id, m.imageUrl, q.name as questName, v.name as venueName
   FROM "Marker" m
   JOIN "Quest" q ON m."questId" = q.id
   JOIN "Venue" v ON q."venueId" = v.id
   LIMIT 1;
   ```

3. Open marker image on another device/screen to point camera at

### Test Steps
1. **Load WebAR page** on mobile device browser:
   - Android Chrome: `http://192.168.1.100:5173/scan?marker=<markerId>`
   - iOS Safari: Same URL

2. **Grant camera permission** when prompted

3. **Point camera at marker image**:
   - Should see camera preview
   - AR recognition boundary should appear
   - Marker should be "recognized" (currently manual dev button per docs)

4. **Complete quest**:
   - Click "Mark as Recognized" (dev mode)
   - Should see reward reveal screen
   - Enter phone number or social login
   - Should see claim success

5. **Verify database**:
   ```sql
   SELECT * FROM "Redemption" 
   WHERE "userId" = '<user-id-from-claim>'
   ORDER BY "createdAt" DESC 
   LIMIT 1;
   ```

### Expected Behavior
- ✅ Camera opens without errors
- ✅ Preview shows clear feed
- ✅ Recognition completes (manual button for now)
- ✅ Claim creates redemption row
- ✅ No console errors in browser DevTools

### Known Issues to Check
- Camera permission prompt shows clear reason
- HTTPS may be required on iOS Safari for camera access (use ngrok/tunnel)
- Marker recognition is simulated until 8th Wall credentials added

---

## Test Plan 2: Authenticated In-App Scan (Native)

**Goal**: Validate the full app → WebAR → wallet round trip with authentication

### Setup
1. Build and install app on device:
   
   **Via Expo Go** (fastest for testing):
   ```bash
   cd apps/app
   npm start
   # Scan QR code with Expo Go app
   ```
   
   **Via Development Build** (more realistic):
   ```bash
   # Android
   npm run android
   
   # iOS (requires Mac + Xcode)
   npm run ios
   ```

2. Sign in to app:
   - Use phone number or social login
   - Should land on Home screen

### Test Steps

1. **Navigate to scan**:
   - Tap a quest from Home or Map
   - Tap "Scan Marker" button
   - App should open WebView with WebAR page

2. **Check authentication passthrough**:
   - WebView URL should include `?channel=app&appToken=<jwt>`
   - Open Chrome DevTools (via USB debugging on Android) to verify

3. **Scan marker**:
   - Point camera at marker image
   - Grant camera permission if WebView prompts
   - Complete recognition

4. **Auto-claim via app channel**:
   - Should NOT prompt for phone/social login
   - Should auto-claim using app token
   - Should show "Back to your wallet" button

5. **Return to wallet**:
   - Tap "Back to your wallet"
   - Should navigate back to app
   - Wallet screen should show new reward

6. **Verify XP/streak updated**:
   - Profile should show increased XP
   - Streak should increment if first claim today

### Expected Behavior
- ✅ WebView opens with camera access
- ✅ Token passes from app to WebAR
- ✅ Auto-claim succeeds without re-login
- ✅ Navigation back to app works
- ✅ Wallet updates immediately
- ✅ XP and streak update (Phase 2 features)

### Known Issues to Check
- **Camera permission in WebView** (`apps/app/app/scan/[markerId].tsx` has TODO):
  ```tsx
  // TODO: react-native-webview 13.8.6 has no onPermissionRequest prop (added in a later
  ```
  - May need to upgrade `react-native-webview` package
  - Or handle permissions at app level before opening WebView

- **iOS WebView camera restrictions**:
  - `NSCameraUsageDescription` in app.json (✅ already set)
  - May need additional Info.plist keys

---

## Test Plan 3: Push Notifications (Physical Device Only)

**Goal**: Validate native push delivery works end-to-end

### Setup
1. Ensure `EXPO_PUBLIC_PROJECT_ID` is set in `apps/app/.env`
2. Build and install app on physical device (simulator push won't work)
3. Sign in to create user account

### Test Steps

1. **Verify token registration**:
   ```bash
   # Check database for registered token
   SELECT * FROM "PushToken" WHERE "userId" = '<your-user-id>';
   ```
   - Should see an Expo push token (format: `ExponentPushToken[...]`)

2. **Test streak-expiry notification** (manual trigger):
   ```bash
   # In apps/api, create a test service method or curl the internal endpoint
   # Or trigger via Prisma studio:
   # 1. Set user's lastQuestCompletedAt to yesterday
   # 2. Set currentStreak > 0
   # 3. Wait for daily cron (6PM) or manually call sweepStreakExpiryWarnings()
   ```

3. **Test new-quest notification**:
   - Favorite a venue in the app
   - Create and publish a new quest at that venue (via Business Dashboard)
   - Should receive notification within seconds

4. **Verify notification appearance**:
   - Should show banner while app is in foreground
   - Should show notification while app is in background
   - Tapping should open app

### Expected Behavior
- ✅ Token registers on app launch
- ✅ Notifications deliver within seconds
- ✅ Title and body text correct
- ✅ Tapping opens app to relevant screen
- ✅ No crashes or console errors

### Debug Tools
- Expo Push Notification Tool: https://expo.dev/notifications
  - Paste token, send test notification
  - Validates token format and FCM delivery

---

## Test Plan 4: Marker Recognition Quality (Real-World)

**Goal**: Validate marker recognition works in venue conditions

### Setup
1. Print a marker image from seed data (from database `imageUrl`)
2. Place in typical venue lighting (not perfect studio conditions)

### Test Scenarios
- **Lighting**: Dim bar, bright sunlight, overhead fluorescent
- **Angles**: Straight-on, 30° tilt, 45° tilt, from side
- **Distance**: 30cm, 1m, 2m
- **Movement**: Steady hand vs. natural wobble
- **Occlusion**: Partially covered, hand shadow

### Expected Behavior (with 8th Wall)
- Should recognize in 2-3 seconds in reasonable conditions
- Should handle minor tilt/angle
- Should provide feedback when marker not detected

### Current Limitation
Without 8th Wall credentials, recognition is simulated (manual button). This test is deferred until credentials are added.

---

## Common Issues & Debugging

### Camera Not Opening
- **Check permissions**: App Settings → PIKE → Camera (on device)
- **Check Info.plist**: `NSCameraUsageDescription` present
- **Check WebView version**: May need to update `react-native-webview`
- **iOS simulator**: Camera won't work, use physical device

### WebView Shows Blank Screen
- **Check network**: API/WebAR accessible from device?
- **Check CORS**: API allows app origin?
- **Check console**: USB debugging (Android) or Safari inspector (iOS)

### Token Not Passing to WebAR
- **Check URL**: Should have `?channel=app&appToken=<jwt>`
- **Check token validity**: Decode JWT, check expiry
- **Check auth guard**: WebAR endpoint accepts app token?

### Push Not Delivering
- **Check token format**: Must be `ExponentPushToken[...]`
- **Check project ID**: Must match Expo project
- **Check physical device**: Simulators don't receive push
- **Check Expo dashboard**: Any delivery errors logged?

---

## Testing Checklist

Copy this to your test session notes:

### WebAR (Browser)
- [ ] Camera opens in Chrome (Android)
- [ ] Camera opens in Safari (iOS)
- [ ] Marker image displays on preview
- [ ] Recognition completes (manual for now)
- [ ] Claim flow creates redemption
- [ ] No console errors

### Native App
- [ ] App builds and installs without errors
- [ ] Sign-in flow works (phone/social)
- [ ] Home screen loads with quests
- [ ] Scan button opens WebView
- [ ] Camera works in WebView
- [ ] Token passes to WebAR (`?appToken=...`)
- [ ] Auto-claim succeeds
- [ ] Return to wallet works
- [ ] XP/streak updates in Profile

### Push Notifications
- [ ] Token registers on app launch
- [ ] Token visible in database
- [ ] Favorite venue → publish quest → notification received
- [ ] Notification shows correct title/body
- [ ] Tapping notification opens app
- [ ] Foreground notification shows banner
- [ ] Background notification shows in tray

### Edge Cases
- [ ] App handles no internet connection
- [ ] App handles expired JWT
- [ ] WebView handles camera permission denial
- [ ] Push handles invalid token gracefully

---

## Next Steps After Testing

1. **Document findings** in this file or `docs/progress.md`
2. **Fix critical blockers** (camera permissions, WebView issues)
3. **Update README** with tested device compatibility
4. **Consider device matrix**:
   - Android: Test on 1-2 popular devices (Samsung, Google Pixel)
   - iOS: Test on 1-2 iOS versions (16+, 17+)
5. **Add to CI**: Automated build smoke tests for both platforms

---

## Resources

- **React Native WebView Docs**: https://github.com/react-native-webview/react-native-webview
- **Expo Camera Permissions**: https://docs.expo.dev/versions/latest/sdk/camera/
- **Expo Notifications**: https://docs.expo.dev/push-notifications/overview/
- **USB Debugging (Android)**: chrome://inspect
- **Safari Web Inspector (iOS)**: Settings → Safari → Advanced → Web Inspector

For implementation details, see:
- `apps/app/app/scan/[markerId].tsx` — Scan screen + WebView
- `apps/app/src/lib/push-notifications.ts` — Native push setup
- `apps/webar/src/components/ArScanView.tsx` — Camera + recognition

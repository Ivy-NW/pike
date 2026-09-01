# Production Credentials Setup Guide
**For PIKE Platform Deployment**

This guide walks through setting up all external service credentials needed to run PIKE in production. Each credential is marked as required or optional, with setup instructions.

---

## Quick Checklist

Copy this to your deployment checklist:

- [ ] Database: Neon PostgreSQL connection string
- [ ] Cache: Redis connection URL
- [ ] Auth: Firebase project credentials
- [ ] Payments: Stripe secret key and webhook secret
- [ ] Push (Web): VAPID keys generated
- [ ] Push (Native): Expo project ID created
- [ ] Blockchain: Avalanche wallet private key
- [ ] Admin: Secure admin credentials set

---

## 1. Database — Neon PostgreSQL (REQUIRED)

**What**: Primary database for all platform data

**Setup**:
1. Create account at https://neon.tech
2. Create a new project (choose closest region to your API deployment)
3. Copy the connection string from the dashboard
4. Add to `apps/api/.env`:
   ```
   DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```

**Apply Migrations**:
```bash
cd apps/api
npx prisma migrate deploy
npm run seed:admin  # Creates first admin account
```

**Status**: ✅ Already configured in current workspace

---

## 2. Cache — Redis (REQUIRED)

**What**: Redemption-cap counters, attestation queue, token mint queue

**Setup Options**:

### Option A: Managed Redis (Recommended for Production)
- **Upstash** (https://upstash.com) — serverless Redis, generous free tier
- **Redis Cloud** (https://redis.com/cloud) — managed by Redis Labs
- Get connection URL, add to `apps/api/.env`:
  ```
  REDIS_URL="redis://default:password@region.upstash.io:6379"
  ```

### Option B: Local Redis (Development Only)
```bash
# Install Redis
# Ubuntu/Debian: sudo apt install redis-server
# macOS: brew install redis

# Start Redis
redis-server

# Use in .env
REDIS_URL="redis://localhost:6379"
```

**Status**: ❌ Needs configuration

---

## 3. Authentication — Firebase (REQUIRED)

**What**: Consumer phone/social login, business email/password login

**Setup**:
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication → Phone, Google, email/password providers
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key" → downloads JSON file
5. Extract these values to `apps/api/.env`:
   ```
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
   
   **Important**: Keep the `\n` newlines in the private key literal, or escape it in your .env file.

**Fallback Behavior**: When credentials are missing, the backend accepts dev tokens (base64-encoded JSON `{uid: "...", phone_number: "..."}`) that both webar and app produce client-side. This works for local development but is not secure for production.

**Status**: ❌ Needs configuration (currently using dev fallback)

---

## 4. Payments — Stripe (REQUIRED for quest publishing)

**What**: Payment method verification gate before businesses can publish quests

**Setup**:
1. Create Stripe account at https://stripe.com
2. Go to Developers → API Keys
3. Copy the "Secret key" (starts with `sk_live_` or `sk_test_`)
4. Add to `apps/api/.env`:
   ```
   STRIPE_SECRET_KEY="sk_test_xxxxx"
   ```

**Webhook Setup** (for payment status updates):
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-api-domain.com/payments/webhook`
3. Select events: `payment_method.attached`, `payment_method.detached`
4. Copy the signing secret, add to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
   ```

**Fallback Behavior**: Payment-method attach is a no-op when `STRIPE_SECRET_KEY` is missing. The payment status gate (`payment_status: "pending"`) still blocks quest publishing, but businesses can't complete payment.

**Status**: ❌ Needs configuration (currently stubbed)

---

## 5. Push Notifications — Web Push / VAPID (OPTIONAL)

**What**: Browser push notifications for PWA users (streak warnings, new quests)

**Setup**:
```bash
# Generate VAPID key pair
npx web-push generate-vapid-keys --json
```

Add output to `apps/api/.env`:
```
VAPID_PUBLIC_KEY="BExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
VAPID_PRIVATE_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
VAPID_SUBJECT="mailto:admin@your-domain.com"
```

The public key is exposed at `GET /push/vapid-public-key` so the PWA can subscribe.

**Fallback Behavior**: Web push logs notifications instead of sending them. Native push works independently.

**Status**: ❌ Needs configuration (generate keys when ready to test PWA push)

---

## 6. Push Notifications — Expo (OPTIONAL)

**What**: Native push notifications for iOS/Android app users

**Setup**:
1. Create account at https://expo.dev
2. Create a new project
3. Copy the project ID (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
4. Add to `apps/app/.env`:
   ```
   EXPO_PUBLIC_PROJECT_ID="your-expo-project-id"
   ```

**iOS APNs Setup** (for production iOS push):
- Go to Expo project → Credentials
- Upload APNs key from Apple Developer account

**Android FCM Setup** (optional, Expo push works without it):
- Add `google-services.json` to `apps/app/`
- Expo will use its own FCM credentials if you don't provide yours

**Fallback Behavior**: Native push is silently skipped when `EXPO_PUBLIC_PROJECT_ID` is missing. Web push works independently.

**Status**: ❌ Needs configuration (required for native app push testing)

---

## 7. Blockchain — Avalanche Wallet (REQUIRED for on-chain features)

**What**: Service wallet for attestation writes and token minting (Phases A/B/C)

**Current Deployment**:
- **Network**: Avalanche Fuji Testnet
- **Chain ID**: 43113
- **RPC**: `https://api.avax-test.network/ext/bc/C/rpc`
- **Deployed Contracts**:
  - `AttestationRegistry`: `0x86124ef07500b269449c953967516a1f75fd0323`
  - `PikeAchievements`: `0x2292bcf86cdefa46d87af78ef6310bcedeb880e5`
  - `PikeRewardVouchers`: `0x089b5e065d5912b77ea58bfce045d346500a9d3b`

**Setup**:
1. Generate a new wallet for the backend service:
   ```bash
   # Using Node.js with ethers or viem
   node -e "const { randomBytes } = require('crypto'); const { privateKeyToAccount } = require('viem/accounts'); const pk = '0x' + randomBytes(32).toString('hex'); console.log('Private Key:', pk); console.log('Address:', privateKeyToAccount(pk).address);"
   ```

2. Fund the wallet with AVAX testnet tokens:
   - Get address from step 1
   - Visit https://faucet.avax.network
   - Request test AVAX (needed for gas)

3. Add to `apps/api/.env`:
   ```
   AVALANCHE_RPC_URL="https://api.avax-test.network/ext/bc/C/rpc"
   AVALANCHE_CHAIN_ID="43113"
   ATTESTATION_CONTRACT_ADDRESS="0x86124ef07500b269449c953967516a1f75fd0323"
   ATTESTATION_WALLET_PRIVATE_KEY="0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

**Mainnet Migration** (Phase E, after external audit):
- Network: Avalanche C-Chain
- Chain ID: 43114
- RPC: `https://api.avax.network/ext/bc/C/rpc`
- Redeploy contracts to mainnet
- Fund wallet with real AVAX

**Security Note**: This private key should be managed with the same care as database credentials. Consider using a secrets manager (AWS Secrets Manager, HashiCorp Vault) in production.

**Status**: ⚠️ Needs production wallet setup (testnet wallet exists but key not in .env.example)

---

## 8. Admin Account (REQUIRED)

**What**: First admin login for platform oversight

**Setup** (already seeded):
The `seed:admin` script creates the first admin from env vars:

```
ADMIN_SEED_EMAIL="ivynjoroge30@gmail.com"
ADMIN_SEED_PASSWORD="1234"
```

**⚠️ CHANGE BEFORE PRODUCTION**:
1. Choose a secure password (20+ random characters)
2. Update `.env` with production admin credentials
3. Run `npm run seed:admin` to update
4. Immediately sign in and change password through admin UI

**JWT Secrets** (change all three):
```
ADMIN_JWT_SECRET="change-me-in-production"
CONSUMER_JWT_SECRET="change-me-in-production"
BUSINESS_JWT_SECRET="change-me-in-production"
```

Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Status**: ⚠️ Using development credentials (must change before production)

---

## 9. API Configuration

**Required**:
```
API_PORT=4000
API_PUBLIC_URL="https://api.your-domain.com"
WEBAR_BASE_URL="https://webar.your-domain.com"
```

- `API_PUBLIC_URL`: Backend base URL (for CORS, redirects)
- `WEBAR_BASE_URL`: WebAR origin (for marker resolution, QR codes)

**Status**: ❌ Using localhost (update for production deployment)

---

## Production Deployment Checklist

Before going live:

### Security
- [ ] All JWT secrets changed from defaults
- [ ] Admin password changed from seed default
- [ ] Avalanche wallet private key in secrets manager (not plain .env)
- [ ] Firebase private key secured
- [ ] Stripe webhook signature verified in code

### Services
- [ ] Neon database connection tested
- [ ] Redis connection tested and persistent
- [ ] Firebase Auth providers enabled (phone, Google)
- [ ] Stripe webhook endpoint receiving events
- [ ] VAPID keys generated and public key endpoint working
- [ ] Expo project created and app config updated

### Blockchain
- [ ] Service wallet funded with AVAX (testnet for staging, mainnet after audit)
- [ ] Contract addresses match deployed contracts
- [ ] Attestation batch job running and writing roots
- [ ] Token contracts NOT wiring until Phase C ready

### Testing
- [ ] Run `npm test` in apps/api (all tests passing)
- [ ] Test user signup flow (phone/social login)
- [ ] Test business signup and quest publish (with real Stripe)
- [ ] Test marker scan → claim → wallet
- [ ] Test push notifications (web and native)
- [ ] Test admin login and oversight features

### Monitoring
- [ ] Set up error tracking (Sentry, Rollbar, or similar)
- [ ] Set up uptime monitoring (Uptime Robot, Pingdom)
- [ ] Alert on attestation coverage drops
- [ ] Alert on Redis connection loss
- [ ] Alert on database connection pool exhaustion

---

## Environment Variables Summary

Copy this template to your production `.env`:

```bash
# Database
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."

# Firebase Auth
FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""

# Admin
ADMIN_SEED_EMAIL=""
ADMIN_SEED_PASSWORD=""
ADMIN_JWT_SECRET=""
CONSUMER_JWT_SECRET=""
BUSINESS_JWT_SECRET=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Push Notifications
VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_SUBJECT=""
EXPO_PUBLIC_PROJECT_ID=""

# API
API_PORT=4000
API_PUBLIC_URL=""
WEBAR_BASE_URL=""

# Avalanche
AVALANCHE_RPC_URL="https://api.avax-test.network/ext/bc/C/rpc"
AVALANCHE_CHAIN_ID="43113"
ATTESTATION_CONTRACT_ADDRESS="0x86124ef07500b269449c953967516a1f75fd0323"
ATTESTATION_WALLET_PRIVATE_KEY=""
```

---

## Getting Help

- **Firebase**: https://firebase.google.com/support
- **Stripe**: https://support.stripe.com
- **Neon**: https://neon.tech/docs
- **Expo**: https://docs.expo.dev
- **Avalanche**: https://docs.avax.network

For PIKE-specific issues, see `docs/progress.md` for current implementation status.

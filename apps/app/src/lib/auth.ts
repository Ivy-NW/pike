import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "pike_identity_token";

/**
 * Stores the PIKE consumer JWT (from /auth/consumer/signup or /signin) used as the bearer
 * identity across every authenticated call (FR-1: same account as the WebAR claim — see
 * api.ts for how it's sent).
 */
export async function getIdentityToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setIdentityToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearIdentityToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

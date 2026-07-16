const TOKEN_KEY = "pike_consumer_token";

/** Consumer JWT from /auth/consumer/signup|signin — persisted so a returning guest isn't asked to sign in again. */
export function getConsumerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setConsumerToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearConsumerToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

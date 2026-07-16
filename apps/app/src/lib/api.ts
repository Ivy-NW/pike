import type { UserProfile } from "@pike/shared-types";
import { getIdentityToken } from "./auth";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getIdentityToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Request failed");
  }
  return res.json();
}

export const api = {
  me: () => request<UserProfile>("/users/me"),
  wallet: () => request<any[]>("/users/me/wallet"),
  quests: () => request<any[]>("/users/me/quests"),
  signupConsumer: (body: { phone: string; username: string; name: string; email: string; password: string }) =>
    request<{ user: UserProfile; token: string }>("/auth/consumer/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  signinConsumer: (body: { identifier: string; password: string }) =>
    request<{ user: UserProfile; token: string }>("/auth/consumer/signin", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

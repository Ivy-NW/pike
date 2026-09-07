const TOKEN_KEY = "pike_admin_token";
const EMAIL_KEY = "pike_admin_email";
const ROLE_KEY = "pike_admin_role";

export type AdminRole = "super_admin" | "admin";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAdminEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function getAdminRole(): AdminRole | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_KEY) as AdminRole | null;
}

export function setAdmin(admin: { email: string; role: AdminRole }): void {
  localStorage.setItem(EMAIL_KEY, admin.email);
  localStorage.setItem(ROLE_KEY, admin.role);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(ROLE_KEY);
}

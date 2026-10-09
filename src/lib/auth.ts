import type { LoginResponse, Role, User } from "@/types/auth";

const TOKEN_KEY = "pm_access_token";
const USER_KEY = "pm_user";

export function hasRole(user: User | null | undefined, role: Role): boolean {
  return Boolean(user?.roles.includes(role));
}

export function isAdmin(user: User | null | undefined = getStoredUser()): boolean {
  return hasRole(user, "ADMIN");
}

/** Utilisateur PRESSING sans rôle ADMIN : accès limité aux commandes. */
export function isPressingOnly(
  user: User | null | undefined = getStoredUser(),
): boolean {
  return hasRole(user, "PRESSING") && !hasRole(user, "ADMIN");
}

export function homePathForUser(
  user: User | null | undefined = getStoredUser(),
): string {
  return isPressingOnly(user) ? "/commandes" : "/tableau-de-bord";
}

export function saveSession(login: LoginResponse): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(TOKEN_KEY, login.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(login.user));
}

export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

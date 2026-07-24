// Mock per-role session stored in localStorage. Client-only.
import { ROLES, type RoleKey } from "./channel-data";

const KEY = "cp_session_role";

export function getRole(): RoleKey | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(KEY);
  return v && (ROLES as any)[v] ? (v as RoleKey) : null;
}

export function signIn(role: RoleKey) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, role);
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function firstScreenOf(role: RoleKey): string {
  return ROLES[role].nav[0][1][0][0];
}

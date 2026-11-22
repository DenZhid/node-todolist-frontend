import { api, clearToken, getToken, setToken } from "../api";

export async function login(loginValue: string): Promise<string> {
  const value = await api<string>(
    `/login/?login=${encodeURIComponent(loginValue.trim())}`,
  );
  const token = String(value).trim();
  setToken(token);
  return token;
}

export function logout(): void {
  clearToken();
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

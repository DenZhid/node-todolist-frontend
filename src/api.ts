const TOKEN_KEY = "todo_token";

export function getApiBase(): string {
  const base = import.meta.env.VITE_API_BASE_URL;
  // Empty string is valid: same-origin (e.g. nginx reverse proxy)
  if (typeof base !== "string") {
    throw new Error("VITE_API_BASE_URL is not configured");
  }
  return base.replace(/\/$/, "");
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
}

type ApiErrorBody = {
  error?: string;
};

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return null as T;
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data: unknown = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof (data as ApiErrorBody).error === "string"
        ? (data as ApiErrorBody).error!
        : typeof data === "string" && data
          ? data
          : `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

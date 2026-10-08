import { getAccessToken, clearSession } from "@/lib/auth";
import type { LoginResponse, User } from "@/types/auth";
import type { Client, ClientPayload, PageResponse } from "@/types/client";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export type HealthResponse = {
  status: string;
  application: string;
  apiVersion: string;
  currency: string;
  locale: string;
  timestamp: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? `Erreur API (${response.status})`;
  } catch {
    return `Erreur API (${response.status})`;
  }
}

async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  authenticated = false,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (response.status === 401 && authenticated) {
    clearSession();
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health");
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function fetchMe(): Promise<User> {
  return apiFetch<User>("/auth/me", {}, true);
}

export async function searchClients(
  q = "",
  page = 0,
  size = 20,
): Promise<PageResponse<Client>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (q.trim()) {
    params.set("q", q.trim());
  }
  return apiFetch<PageResponse<Client>>(`/clients?${params}`, {}, true);
}

export async function getClient(id: number): Promise<Client> {
  return apiFetch<Client>(`/clients/${id}`, {}, true);
}

export async function createClient(payload: ClientPayload): Promise<Client> {
  return apiFetch<Client>(
    "/clients",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true,
  );
}

export async function updateClient(
  id: number,
  payload: ClientPayload,
): Promise<Client> {
  return apiFetch<Client>(
    `/clients/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    true,
  );
}

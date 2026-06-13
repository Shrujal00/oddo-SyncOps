const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.message ?? `Request failed: ${res.status}`);
  }

  return json.data as T;
}

export const api = {
  get:    <T>(path: string, token?: string | null) => request<T>(path, { token }),
  post:   <T>(path: string, body: unknown, token?: string | null) => request<T>(path, { method: "POST", body, token }),
  patch:  <T>(path: string, body: unknown, token?: string | null) => request<T>(path, { method: "PATCH", body, token }),
  delete: <T>(path: string, token?: string | null) => request<T>(path, { method: "DELETE", token }),
};

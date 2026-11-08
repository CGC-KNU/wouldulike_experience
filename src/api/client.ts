import { tokens, type Tokens } from '../auth/tokens';

export const API_BASE = (import.meta.env.VITE_API_BASE as string) || '';

export class ApiError extends Error {
  status: number;
  code?: string;
  data: any;
  constructor(status: number, data: any) {
    super(data?.detail || data?.message || `요청에 실패했어요 (${status})`);
    this.status = status;
    this.code = data?.code;
    this.data = data;
  }
}

async function raw(path: string, init: RequestInit = {}, auth = false): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (auth) {
    const t = tokens.get();
    if (t) headers.set('Authorization', `Bearer ${t.access}`);
  }
  return fetch(API_BASE + path, { ...init, headers });
}

async function parse(res: Response) {
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { detail: text }; }
  if (!res.ok) throw new ApiError(res.status, data);
  return { status: res.status, data };
}

let refreshing: Promise<boolean> | null = null;
async function refreshTokens(): Promise<boolean> {
  const t = tokens.get();
  if (!t?.refresh) return false;
  refreshing ??= (async () => {
    try {
      const res = await raw('/api/auth/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh: t.refresh }),
      });
      if (!res.ok) return false;
      const d = await res.json();
      const next: Tokens = { ...t, ...d, access: d.access ?? d.token?.access, refresh: d.refresh ?? d.token?.refresh ?? t.refresh };
      tokens.set(next);
      return true;
    } catch { return false; } finally { setTimeout(() => (refreshing = null), 0); }
  })();
  return refreshing;
}

export const onUnauthorized = { handler: () => {} };

export async function request<T = any>(path: string, init: RequestInit = {}, auth = false): Promise<{ status: number; data: T }> {
  let res = await raw(path, init, auth);
  if (res.status === 401 && auth) {
    if (await refreshTokens()) {
      res = await raw(path, init, auth);
    } else {
      tokens.clear();
      onUnauthorized.handler();
    }
  }
  return parse(res);
}

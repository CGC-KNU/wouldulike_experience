import { store } from '../lib/storage';

const K = 'wu_tokens';
export interface Tokens {
  access: string;
  refresh: string;
  access_expires_at?: string;
  refresh_expires_at?: string;
}

export const tokens = {
  get(): Tokens | null {
    const raw = store.get(K);
    if (!raw) return null;
    try { return JSON.parse(raw) as Tokens; } catch { return null; }
  },
  set(t: Tokens) { store.set(K, JSON.stringify(t)); },
  clear() { store.remove(K); },
};

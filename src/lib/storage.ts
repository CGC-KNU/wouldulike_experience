// localStorage를 try/catch로 감싸고, 실패 시 메모리 폴백
const mem = new Map<string, string>();

export const store = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key) ?? mem.get(key) ?? null;
    } catch {
      return mem.get(key) ?? null;
    }
  },
  set(key: string, value: string) {
    mem.set(key, value);
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
  },
  remove(key: string) {
    mem.delete(key);
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  },
};

export const session = {
  get(key: string): string | null {
    try { return sessionStorage.getItem(key) ?? mem.get('s:' + key) ?? null; }
    catch { return mem.get('s:' + key) ?? null; }
  },
  set(key: string, value: string) {
    mem.set('s:' + key, value);
    try { sessionStorage.setItem(key, value); } catch { /* ignore */ }
  },
  remove(key: string) {
    mem.delete('s:' + key);
    try { sessionStorage.removeItem(key); } catch { /* ignore */ }
  },
};

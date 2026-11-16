import { session } from './storage';

// 로그인 전에 입력한 PIN·개수. 로그인 후 돌아오면 이 값으로 적립한다. 탭이 닫히면 사라진다.
export interface Pending { id: string; pin: string; count: number; key: string }
const K = 'wu_pending';

export const pending = {
  get(): Pending | null {
    const raw = session.get(K);
    if (!raw) return null;
    try { return JSON.parse(raw) as Pending; } catch { return null; }
  },
  set(p: Pending) { session.set(K, JSON.stringify(p)); },
  clear() { session.remove(K); },
};

// 쿠폰 받기: 스탬프 없는 매장에서 로그인 직전에 표시해 두고, 로그인 후 돌아오면 자동으로 받는다.
const CK = 'wu_claim';
export const claim = {
  get(): string | null { return session.get(CK); },
  set(id: string) { session.set(CK, id); },
  clear() { session.remove(CK); },
};

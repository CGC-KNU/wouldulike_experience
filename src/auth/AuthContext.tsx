import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { tokens, type Tokens } from './tokens';
import { onUnauthorized } from '../api/client';
import { session } from '../lib/storage';

interface Ctx {
  loggedIn: boolean;
  login: (t: Tokens) => void;
  logout: () => void;
}
const AuthCtx = createContext<Ctx>(null!);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(() => !!tokens.get());
  const login = useCallback((t: Tokens) => { tokens.set(t); setLoggedIn(true); }, []);
  const logout = useCallback(() => { tokens.clear(); setLoggedIn(false); }, []);
  useEffect(() => { onUnauthorized.handler = () => setLoggedIn(false); }, []);
  const v = useMemo(() => ({ loggedIn, login, logout }), [loggedIn, login, logout]);
  return <AuthCtx.Provider value={v}>{children}</AuthCtx.Provider>;
}

export const kakaoAuthUrl = (returnTo: string) => {
  const id = import.meta.env.VITE_KAKAO_REST_API_KEY as string;
  const redirect = import.meta.env.VITE_KAKAO_REDIRECT_URI as string;
  session.set('returnTo', returnTo);
  const q = new URLSearchParams({ client_id: id, redirect_uri: redirect, response_type: 'code', state: returnTo });
  return `https://kauth.kakao.com/oauth/authorize?${q}`;
};

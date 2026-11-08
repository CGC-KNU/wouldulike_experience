import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginKakao } from '../api/endpoints';
import { useAuth } from '../auth/AuthContext';
import { Loading, Notice } from '../components/Layout';
import { session, store } from '../lib/storage';
import { track } from '../lib/analytics';

export default function KakaoCallback() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const { login } = useAuth();
  const [failed, setFailed] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const code = sp.get('code');
    const fallback = () => {
      const last = store.get('lastRestaurantId');
      return last ? `/s/${last}` : '/';
    };
    const returnTo = session.get('returnTo') || sp.get('state') || fallback();
    if (!code) { setFailed(true); return; }
    loginKakao(code, import.meta.env.VITE_KAKAO_REDIRECT_URI as string)
      .then(r => {
        login(r.token);
        track('web_login', { provider: 'kakao', is_new: r.is_new });
        session.remove('returnTo');
        nav(returnTo.startsWith('/') ? returnTo : fallback(), { replace: true });
      })
      .catch(() => setFailed(true));
  }, []);

  return failed
    ? <Notice title="로그인에 실패했어요" desc="처음 화면으로 돌아가 다시 시도해 주세요." />
    : <Loading />;
}

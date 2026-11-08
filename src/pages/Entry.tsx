import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { getRestaurant, type RestaurantEntry } from '../api/endpoints';
import { useAuth, kakaoAuthUrl } from '../auth/AuthContext';
import { CtaBar, Loading, Notice, Page } from '../components/Layout';
import { StampBoard } from '../components/StampBoard';
import { appLink, isMobile } from '../lib/platform';
import { session, store } from '../lib/storage';
import { track } from '../lib/analytics';

export default function Entry() {
  const { id = '' } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const { loggedIn } = useAuth();
  const [info, setInfo] = useState<RestaurantEntry | null>(null);
  const [error, setError] = useState<number | null>(null);

  useEffect(() => {
    const src = sp.get('src');
    if (src) session.set('src', src);
    store.set('lastRestaurantId', id);
    getRestaurant(id)
      .then(d => { setInfo(d); track('web_stamp_view', { restaurant_id: id }); })
      .catch(e => setError(e instanceof ApiError ? e.status : 0));
  }, [id, sp]);

  if (!isMobile() && !import.meta.env.DEV)
    return <Notice title="휴대폰으로 QR을 다시 찍어 주세요" desc="이 페이지는 모바일에서 이용할 수 있어요." />;
  if (error === 404) return <Notice title="제휴 매장이 아니에요" desc="우주라이크 스탬프를 지원하지 않는 매장이에요." />;
  if (error !== null) return <Notice title="불러오지 못했어요" desc="잠시 후 다시 시도해 주세요." />;
  if (!info) return <Loading />;

  const target = info.stamp.cycle_target ?? 10;
  const enabled = info.stamp.enabled;
  const start = () => {
    const to = `/s/${id}/earn`;
    if (loggedIn) nav(to);
    else location.href = kakaoAuthUrl(to);
  };

  return (
    <Page>
      {info.image_url && <img className="hero" src={info.image_url} alt="" />}
      <h1>{info.name}</h1>
      <p className="sub">{enabled ? '방문 스탬프를 적립하고 혜택을 받아보세요.' : '이 매장은 현재 스탬프 적립을 하지 않아요.'}</p>
      {enabled && (
        <div className="card">
          <StampBoard target={target} filled={0} rewards={info.stamp.rewards} />
          {info.stamp.notes && <p className="note">{info.stamp.notes}</p>}
        </div>
      )}
      <p className="note">
        로그인 정보가 지워져도 카카오로 다시 로그인하면 같은 계정으로 스탬프가 복구돼요.<br />
        <a className="link" href={appLink(id)}>앱에서 열기</a>
      </p>
      {enabled && (
        <CtaBar>
          {loggedIn
            ? <button className="btn" onClick={start}>스탬프 적립하기</button>
            : <button className="btn kakao" onClick={start}>카카오로 시작하기</button>}
          {!loggedIn && <button className="btn ghost" disabled title="준비 중">Apple로 시작하기 (준비 중)</button>}
        </CtaBar>
      )}
    </Page>
  );
}

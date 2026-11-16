import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { addStamp, getMyStamps, getRestaurant, qrVisit, type IssuedCoupon, type RestaurantEntry } from '../api/endpoints';
import { useAuth, kakaoAuthUrl } from '../auth/AuthContext';
import { CtaBar, Loading, Notice, Page } from '../components/Layout';
import { InstallSheet } from '../components/InstallSheet';
import { PinSheet } from '../components/PinSheet';
import { RewardList, StampCard } from '../components/StampCard';
import { CouponCard } from '../components/CouponCard';
import { usePolicy } from '../hooks/usePolicy';
import { track } from '../lib/analytics';
import { isMobile, openApp, storeUrl } from '../lib/platform';
import { session, store } from '../lib/storage';
import { claim, pending as pendingStore, type Pending } from '../lib/pending';
import { boardLength, rewardText } from '../lib/stamp';

function currentOf(d: any): number {
  const v = d?.current ?? d?.results?.[0]?.current;
  return typeof v === 'number' ? v : 0;
}

export default function Entry() {
  const { id = '' } = useParams();
  const [sp] = useSearchParams();
  const { loggedIn } = useAuth();
  const policy = usePolicy();

  const [info, setInfo] = useState<RestaurantEntry | null>(null);
  const [error, setError] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [pend, setPend] = useState<Pending | null>(() => { const p = pendingStore.get(); return p && p.id === id ? p : null; });
  const [sheet, setSheet] = useState<'pin' | 'install' | null>(null);
  const [busy, setBusy] = useState(false);
  const [pinErr, setPinErr] = useState('');
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState<{ count: number; reward: string | null } | null>(null);
  const [openTried, setOpenTried] = useState(false);
  const autoRan = useRef(false);
  const claimRan = useRef(false);
  // 스탬프 없는 매장: 로그인하면 바로 받는 쿠폰
  const [claimed, setClaimed] = useState<{ issued: boolean; coupons: IssuedCoupon[] } | null>(null);
  const [claimErr, setClaimErr] = useState('');

  useEffect(() => {
    const src = sp.get('src');
    if (src) session.set('src', src);
    store.set('lastRestaurantId', id);
    getRestaurant(id)
      .then(d => { setInfo(d); track('web_stamp_view', { restaurant_id: id }); })
      .catch(e => setError(e instanceof ApiError ? e.status : 0));
  }, [id, sp]);

  useEffect(() => {
    if (loggedIn) getMyStamps(id).then(d => setCurrent(currentOf(d))).catch(() => {});
  }, [id, loggedIn]);

  const submit = useCallback(async (p: { pin: string; count: number; key: string }) => {
    if (!info) return;
    setBusy(true); setPinErr('');
    try {
      const { status, data } = await addStamp({ restaurant_id: info.restaurant_id, pin: p.pin, count: p.count }, p.key);
      pendingStore.clear(); setPend(null);
      track('web_stamp_add', { restaurant_id: id, count: p.count, reward: status === 201 });
      const my = await getMyStamps(id).then(currentOf).catch(() => current + p.count);
      setCurrent(my);
      const rd = data?.reward_details?.[0];
      const reward = status === 201 ? (rd?.title ? String(rd.title) : '보상 쿠폰') : null;
      setDone({ count: p.count, reward });
      setSheet(null);
      setTimeout(() => setSheet('install'), 1400);
    } catch (e) {
      const ae = e as ApiError;
      pendingStore.clear(); setPend(null);
      setPinErr(ae.message || '적립에 실패했어요.');
      if (ae.code === 'invalid_pin' || ae.code === 'pin_locked') { setShake(true); setTimeout(() => setShake(false), 450); }
      setSheet('pin');
    } finally { setBusy(false); }
  }, [info, id, current]);

  // 로그인하고 돌아왔으면 저장해 둔 PIN으로 이어서 적립
  useEffect(() => {
    if (!loggedIn || !info || !pend || autoRan.current) return;
    autoRan.current = true;
    submit(pend);
  }, [loggedIn, info, pend, submit]);

  const claimCoupon = useCallback(async () => {
    if (!info) return;
    setBusy(true); setClaimErr('');
    try {
      const key = session.get(`qr_key_${id}`) ?? crypto.randomUUID();
      session.set(`qr_key_${id}`, key);
      const r = await qrVisit(info.restaurant_id, key);
      claim.clear(); session.remove(`qr_key_${id}`);
      track('web_stamp_add', { restaurant_id: id, kind: 'qr_coupon', issued: r.coupon_issued });
      setClaimed({ issued: !!r.coupon_issued, coupons: r.coupons ?? [] });
      setTimeout(() => setSheet('install'), 1400);
    } catch (e) {
      claim.clear();
      setClaimErr((e as ApiError).message || '쿠폰을 받지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally { setBusy(false); }
  }, [info, id]);

  // 로그인하고 돌아왔으면 이어서 쿠폰 받기
  useEffect(() => {
    if (!loggedIn || !info || info.stamp.enabled || claimRan.current || claim.get() !== id) return;
    claimRan.current = true;
    claimCoupon();
  }, [loggedIn, info, id, claimCoupon]);

  if (!isMobile() && !import.meta.env.DEV)
    return <Notice title="휴대폰으로 QR을 다시 찍어 주세요" desc="이 페이지는 모바일에서 이용할 수 있어요." />;
  if (error === 404) return <Notice title="제휴 매장이 아니에요" desc="우주라이크 스탬프를 지원하지 않는 매장이에요." />;
  if (error !== null) return <Notice title="불러오지 못했어요" desc="잠시 후 다시 시도해 주세요." />;
  if (!info) return <Loading />;

  const enabled = info.stamp.enabled;
  const rewards = info.stamp.rewards ?? [];
  const total = boardLength(info.stamp.cycle_target ?? 10, rewards);
  const pendingCount = !loggedIn && pend ? pend.count : 0;
  const shownCount = current + pendingCount;

  const onPin = (pin: string, count: number) => {
    if (loggedIn) { submit({ pin, count, key: crypto.randomUUID() }); return; }
    const p: Pending = { id, pin, count, key: crypto.randomUUID() };
    pendingStore.set(p); setPend(p); setSheet(null); setPinErr('');
  };
  const goKakao = () => { track('web_login', { stage: 'start' }); location.href = kakaoAuthUrl(`/s/${id}`); };
  const cancelPending = () => { pendingStore.clear(); setPend(null); };
  const couponItems = info.install_bonus_items ?? [];
  const goKakaoForCoupon = () => { claim.set(id); goKakao(); };
  const receivedItems = (claimed?.coupons ?? []).map(c => ({
    title: c.benefit?.title || c.coupon_type_title || '쿠폰', subtitle: c.benefit?.subtitle || '',
  }));

  return (
    <Page>
      <div className="detail">
        {info.image_url ? <img className="d-hero" src={info.image_url} alt="" /> : <div className="d-hero empty">등록된 사진이 없어요.</div>}
        <div className="d-body">
          {enabled && <span className="pill">스탬프 {Math.min(shownCount, total)}/{total}</span>}
          <h1 className="d-name">{info.name}</h1>
          {info.address && <p className="d-meta">{info.address}</p>}
          {enabled ? (
            <>
              {done && (
                <div className="done-banner">
                  {done.reward ? `🎉 보상 쿠폰이 도착했어요 · ${done.reward}` : `스탬프 ${done.count}개 적립 완료!`}
                </div>
              )}
              <StampCard name={info.name} total={total} current={current} pending={pendingCount} rewards={rewards}
                notes={info.stamp.notes} busy={busy}
                onAdd={() => { setPinErr(''); setSheet('pin'); }} />
              <RewardList rewards={rewards} current={shownCount} />
            </>
          ) : (
            <>
              {claimed?.issued && <div className="done-banner">🎉 쿠폰이 도착했어요! 오늘 23:59까지 앱에서 쓸 수 있어요</div>}
              {claimed && !claimed.issued && (
                <div className="done-banner">이번에는 쿠폰이 새로 발급되지 않았어요. 이번 달에 이미 받으셨다면 앱 쿠폰함에서 확인해 주세요 (매달 첫 방문에 1장)</div>
              )}
              {claimErr && <p className="err" role="alert">{claimErr}</p>}
              {couponItems.length > 0 ? (
                <CouponCard items={claimed?.issued && receivedItems.length ? receivedItems : couponItems}
                  heading={claimed?.issued ? '받은 쿠폰' : '첫 방문 쿠폰'}
                  hint={claimed ? undefined : '카카오로 로그인하면 바로 받을 수 있어요. 쿠폰은 앱에서 사용해요.'} />
              ) : <p className="sub">이 매장은 현재 받을 수 있는 쿠폰이 없어요.</p>}
            </>
          )}
          <p className="note">로그인 정보가 지워져도 카카오로 다시 로그인하면 같은 계정으로 {enabled ? '스탬프가' : '쿠폰이'} 복구돼요.</p>
          <button className="open-app" onClick={() => {
            track('web_install_click', { restaurant_id: id, from: 'open_app' });
            if (!openApp(id)) alert('휴대폰에서 열어 주세요.');
            else setTimeout(() => setOpenTried(true), 1500);
          }}>앱에서 열기</button>
          {openTried && storeUrl() && (
            <p className="note">앱이 열리지 않나요? <a className="link" href={storeUrl()!}>앱 설치하기</a><br />설치 후 같은 QR을 다시 찍어 주세요.</p>
          )}
        </div>
      </div>

      {!loggedIn && pend && (
        <CtaBar>
          <p className="cta-msg">카카오로 로그인하면 스탬프 {pend.count}개 적립이 완료돼요</p>
          <button className="btn kakao" onClick={goKakao}>카카오 로그인</button>
          <button className="btn ghost" style={{ minHeight: 40 }} onClick={cancelPending}>취소</button>
        </CtaBar>
      )}
      {!enabled && couponItems.length > 0 && !claimed && (
        <CtaBar>
          {loggedIn
            ? <button className="btn" disabled={busy} onClick={claimCoupon}>{busy ? '받는 중…' : '쿠폰 받기'}</button>
            : <button className="btn kakao" onClick={goKakaoForCoupon}>카카오 로그인하고 쿠폰 받기</button>}
        </CtaBar>
      )}
      {!enabled && claimed && sheet !== 'install' && (
        <CtaBar><button className="btn" onClick={() => setSheet('install')}>앱에서 쿠폰 쓰기</button></CtaBar>
      )}
      {done && sheet !== 'install' && (
        <CtaBar><button className="btn" onClick={() => setSheet('install')}>앱에서 이어서 보기</button></CtaBar>
      )}

      {sheet === 'pin' && (
        <PinSheet pinLen={policy.pinLen} maxCount={policy.maxPerScan} error={pinErr} shake={shake} busy={busy}
          onSubmit={onPin} onClose={() => setSheet(null)} />
      )}
      {sheet === 'install' && <InstallSheet info={info} stampCount={current} received={claimed?.issued ? receivedItems : undefined} onClose={() => setSheet(null)} />}
    </Page>
  );
}

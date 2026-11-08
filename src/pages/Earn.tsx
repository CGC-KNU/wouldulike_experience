import { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { addStamp, getMyStamps, getRestaurant, type RestaurantEntry } from '../api/endpoints';
import { useAuth } from '../auth/AuthContext';
import { CtaBar, Loading, Notice, Page } from '../components/Layout';
import { StampBoard } from '../components/StampBoard';
import { InstallSheet } from '../components/InstallSheet';
import { usePolicy } from '../hooks/usePolicy';
import { track } from '../lib/analytics';

// 응답 형태가 확정되지 않아 방어적으로 현재 스탬프 수를 추출
function extractCount(d: any): number {
  if (!d) return 0;
  const cands = [d.current_stamps, d.stamp_count, d.stamps, d.count, d.current_count, d.total];
  for (const c of cands) if (typeof c === 'number') return c;
  if (Array.isArray(d.results) && d.results[0]) return extractCount(d.results[0]);
  return 0;
}

export default function Earn() {
  const { id = '' } = useParams();
  const { loggedIn } = useAuth();
  const policy = usePolicy();
  const [info, setInfo] = useState<RestaurantEntry | null>(null);
  const [pin, setPin] = useState('');
  const [count, setCount] = useState(1);
  const [err, setErr] = useState('');
  const [shake, setShake] = useState(false);
  const [busy, setBusy] = useState(false);
  const [filled, setFilled] = useState(0);
  const [added, setAdded] = useState(0);
  const [done, setDone] = useState(false);
  const [reward, setReward] = useState(false);
  const [sheet, setSheet] = useState(false);
  const idem = useRef(crypto.randomUUID());

  useEffect(() => {
    getRestaurant(id).then(setInfo).catch(() => {});
    if (loggedIn) getMyStamps(id).then(d => setFilled(extractCount(d))).catch(() => {});
  }, [id, loggedIn]);

  if (!loggedIn) return <Navigate to={`/s/${id}`} replace />;
  if (!info) return <Loading />;
  if (!info.stamp.enabled) return <Notice title="적립할 수 없는 매장이에요" />;

  const target = info.stamp.cycle_target ?? 10;
  const press = (k: string) => {
    if (busy) return;
    setErr('');
    if (k === '⌫') setPin(p => p.slice(0, -1));
    else setPin(p => (p.length < policy.pinLen ? p + k : p));
  };

  const submit = async () => {
    if (busy || pin.length !== policy.pinLen) return;
    setBusy(true); setErr('');
    try {
      const { status } = await addStamp({ restaurant_id: info.restaurant_id, pin, count }, idem.current);
      track('web_stamp_add', { restaurant_id: id, count, reward: status === 201 });
      const prev = filled;
      const my = await getMyStamps(id).then(extractCount).catch(() => prev + count);
      setFilled(my); setAdded(count); setReward(status === 201); setDone(true);
      setTimeout(() => setSheet(true), 1200);
    } catch (e) {
      const ae = e as ApiError;
      setErr(ae.message || '적립에 실패했어요.');
      if (ae.code === 'invalid_pin' || ae.code === 'pin_locked') { setShake(true); setTimeout(() => setShake(false), 450); }
      setPin('');
      idem.current = crypto.randomUUID(); // 실패 후에는 새 키
    } finally { setBusy(false); }
  };

  if (done) return (
    <Page>
      <div style={{ textAlign: 'center' }}>
        {reward && <div className="confetti">🎉</div>}
        <h1>{reward ? '보상 쿠폰이 도착했어요!' : `스탬프 ${added}개 적립 완료`}</h1>
        <p className="sub">{info.name}</p>
      </div>
      <div className="card"><StampBoard target={target} filled={filled % target || (filled ? target : 0)} rewards={info.stamp.rewards} justAdded={added} /></div>
      <CtaBar><button className="btn" onClick={() => setSheet(true)}>앱에서 이어서 보기</button></CtaBar>
      {sheet && <InstallSheet info={info} onClose={() => setSheet(false)} />}
    </Page>
  );

  return (
    <Page>
      <h1>매장 PIN을 입력해 주세요</h1>
      <p className="sub">계산대에서 확인한 {policy.pinLen}자리 번호예요. 하루 매장당 최대 {policy.daily}개까지 적립돼요.</p>
      <div className={`pin${shake ? ' shake' : ''}`} aria-live="polite">
        {Array.from({ length: policy.pinLen }, (_, i) => <i key={i} className={pin[i] ? 'f' : ''}>{pin[i] ? '●' : ''}</i>)}
      </div>
      <p className="err" role="alert">{err}</p>
      <div className="card stepper">
        <span>적립 개수</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button aria-label="줄이기" disabled={count <= 1} onClick={() => setCount(c => c - 1)}>−</button>
          <b>{count}</b>
          <button aria-label="늘리기" disabled={count >= policy.maxPerScan} onClick={() => setCount(c => c + 1)}>＋</button>
        </div>
      </div>
      <div className="pad">
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) =>
          k ? <button key={i} onClick={() => press(k)} aria-label={k === '⌫' ? '지우기' : k}>{k}</button> : <span key={i} />)}
      </div>
      <CtaBar>
        <button className="btn" disabled={busy || pin.length !== policy.pinLen} onClick={submit}>
          {busy ? '적립 중…' : `스탬프 ${count}개 적립하기`}
        </button>
      </CtaBar>
    </Page>
  );
}

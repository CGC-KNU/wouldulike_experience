import type { Reward } from '../api/endpoints';
import { nextReward, remainingToNext, rewardText } from '../lib/stamp';

export function StampGrid({ total, current, pending = 0, rewardSteps }: {
  total: number; current: number; pending?: number; rewardSteps: Set<number>;
}) {
  const filled = Math.min(current, total);
  const pendingTo = Math.min(filled + pending, total);
  return (
    <div className="sgrid" role="img" aria-label={`스탬프 ${filled}개 / ${total}개`}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const isFilled = n <= filled;
        const isPending = !isFilled && n <= pendingTo;
        const src = isFilled || isPending ? 'stamp_filled' : rewardSteps.has(n) ? 'stamp_reward' : 'stamp_empty';
        return <img key={n} src={`/stamp/${src}.png`} alt="" className={isPending ? 'pend' : undefined} />;
      })}
    </div>
  );
}

export function StampCard({ name, total, current, pending, rewards, notes, dailyLabel, onAdd, busy }: {
  name: string; total: number; current: number; pending: number; rewards: Reward[]; notes?: string;
  dailyLabel: string; onAdd: () => void; busy: boolean;
}) {
  const shown = current + pending;
  const remaining = remainingToNext(total, rewards, shown);
  const ready = remaining === 0;
  const next = nextReward(rewards, shown);
  const nextName = next ? rewardText(next) : null;
  const subtitle = pending > 0
    ? `${pending}개 적립 대기 · 로그인하면 완료돼요`
    : ready
      ? nextName ? `리워드를 받을 수 있어요 · ${nextName}` : '리워드 쿠폰을 받을 수 있어요'
      : nextName ? `다음 보상까지 ${remaining}개 · ${nextName}` : `다음 보상까지 ${remaining}개`;

  return (
    <section className="stamp-card">
      <div className="sc-top">
        <div className="sc-title"><img src="/stamp/stamp_tag.png" width={34} height={34} alt="" /><span>{name} 스탬프</span></div>
        <div className="sc-row">
          <div style={{ minWidth: 0 }}>
            <div className="sc-count"><b>{Math.min(shown, total)}</b><span> / {total}</span></div>
            <p className="sc-sub">{subtitle}</p>
          </div>
          <button className="sc-btn" onClick={onAdd} disabled={busy || pending > 0}>
            {busy ? '적립 중…' : '적립하기'}<span aria-hidden>›</span>
          </button>
        </div>
      </div>
      <div className="dashed" />
      <div className="sc-grid"><StampGrid total={total} current={current} pending={pending}
        rewardSteps={new Set(next ? [next.stamps ?? 0] : [])} /></div>
      <div className="sc-note">
        <img src="/stamp/stamp_info.png" width={20} height={20} alt="" />
        <span>{notes?.trim() ? notes : `${dailyLabel} 적립 · 마지막 칸이 리워드예요`}</span>
      </div>
    </section>
  );
}

// 스탬프 개수별 혜택 (앱 도장판의 리워드 칸과 같은 정보를 목록으로)
export function RewardList({ rewards, current }: { rewards: Reward[]; current: number }) {
  const list = [...rewards].filter(r => (r.stamps ?? 0) > 0).sort((a, b) => (a.stamps ?? 0) - (b.stamps ?? 0));
  if (!list.length) return null;
  return (
    <section className="reward-list">
      <h2>스탬프 혜택</h2>
      {list.map(r => {
        const done = current >= (r.stamps ?? 0);
        return (
          <div className={`rw${done ? ' done' : ''}`} key={`${r.stamps}-${r.coupon_type_code ?? ''}`}>
            <span className="rw-n">{r.stamps}개</span>
            <span className="rw-t">{rewardText(r)}{r.subtitle && r.subtitle.trim() !== rewardText(r) ? <small>{r.subtitle}</small> : null}</span>
            {done && <span className="rw-ok">달성</span>}
          </div>
        );
      })}
    </section>
  );
}

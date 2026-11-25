import { Lines } from './Layout';

// 쿠폰 혜택 티켓 카드 (이번 주 프로모션 쿠폰 · 스탬프 없는 매장의 첫 방문 쿠폰)
// 티켓 아래쪽 칸에 사용 기간(부제)을 적고, 위아래 사이에 점선과 홈(펀칭)을 둔다.
export function CouponCard({ items, heading = '첫 방문 쿠폰', hint }: {
  items: { title: string; subtitle?: string }[]; heading?: string; hint?: string | string[];
}) {
  return (
    <section className="cp-card">
      <div className="cp-head"><span className="cp-gift" aria-hidden="true">🎁</span><b>{heading}</b></div>
      {items.map((c, i) => (
        <div className="cp-ticket" key={i}>
          <div className="cp-main"><b>{c.title}</b></div>
          {c.subtitle && (
            <div className="cp-foot">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" />
              </svg>
              <span>{c.subtitle}</span>
            </div>
          )}
        </div>
      ))}
      {hint && <p className="cp-hint"><Lines lines={hint} /></p>}
    </section>
  );
}

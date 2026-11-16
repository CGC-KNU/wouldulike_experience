// 쿠폰 혜택 티켓 카드 (스탬프 없는 매장: 로그인하면 받는 첫 방문 쿠폰)
export function CouponCard({ items, heading = '첫 방문 쿠폰', hint }: {
  items: { title: string; subtitle?: string }[]; heading?: string; hint?: string;
}) {
  return (
    <section className="cp-card">
      <div className="cp-head"><span>🎁</span><b>{heading}</b></div>
      {items.map((c, i) => (
        <div className="cp-ticket" key={i}>
          <b>{c.title}</b>
          {c.subtitle && <span>{c.subtitle}</span>}
        </div>
      ))}
      {hint && <p className="cp-hint">{hint}</p>}
    </section>
  );
}

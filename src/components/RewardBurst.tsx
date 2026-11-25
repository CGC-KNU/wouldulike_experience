import { useEffect } from 'react';
import { Lines } from './Layout';

// 쿠폰 수령 연출 — 앱(new1 coupon_issued_dialog.dart 의 _RewardBurst)과 같은 순서·타이밍(총 1.9초)
//   0~0.5s 선물 상자가 흔들리고 → 0.48s 뚜껑이 날아가며 색종이가 터지고 → 1.03s 쿠폰이 솟아오른 뒤 → 1.38s 버튼이 나타난다.
// 반드시 수령 API 가 성공해서 쿠폰이 실제로 발급된 뒤에만 띄운다.

const COLORS = ['#E1B53E', '#6366F1', '#F472B6', '#34D399', '#FBBF24', '#A78BFA', '#60A5FA', '#FB7185'];
const COUNT = 26;
const CONFETTI_MS = 1150; // 0.48s → 1.63s

// 앱의 _ConfettiPainter 와 같은 규칙: 부채꼴(-160°~160°)로 퍼지고, 파티클마다 조금씩 늦게 출발한다.
const PARTICLES = Array.from({ length: COUNT }, (_, i) => {
  const delay = (i / COUNT) * 0.18;
  const angle = ((-160 + (320 / (COUNT - 1)) * i) * Math.PI) / 180;
  const dist = 110 + Math.abs(Math.sin(i * 2.3)) * 90;
  return {
    dx: Math.round(Math.cos(angle) * dist),
    dy: Math.round(Math.sin(angle) * dist - 70),
    rot: ((i * 67) % 360) + 180,
    del: Math.round(480 + delay * CONFETTI_MS),
    dur: Math.round(CONFETTI_MS * (1 - delay)),
    color: COLORS[i % COLORS.length],
    round: i % 3 === 0,
  };
});

export function RewardBurst({ storeName, tag, title, subtitle, until, onInstall, onClose }: {
  storeName: string;
  tag: string;
  title: string;
  /** 사용 기간 등 (예: 11/26(목)~12/2(수) 사용 가능) */
  subtitle?: string;
  /** 만료 문구 (예: 12/2 23:59까지) */
  until?: string;
  onInstall: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    // 뚜껑이 날아가는 순간 살짝 진동(Android) — 앱의 햅틱과 같은 타이밍
    const t = window.setTimeout(() => { try { navigator.vibrate?.(30); } catch { /* ignore */ } }, 480);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { window.clearTimeout(t); window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return (
    <div className="rb-dim" onClick={onClose} role="dialog" aria-modal="true" aria-label="쿠폰이 도착했어요">
      <div className="rb" onClick={e => e.stopPropagation()}>
        <div className="rb-stage" aria-hidden="true">
          <div className="rb-confetti">
            {PARTICLES.map((p, i) => (
              <i key={i} className={`rb-p${p.round ? ' round' : ''}`}
                style={{ background: p.color, ['--dx' as string]: `${p.dx}px`, ['--dy' as string]: `${p.dy}px`,
                  ['--rot' as string]: `${p.rot}deg`, ['--del' as string]: `${p.del}ms`, ['--dur' as string]: `${p.dur}ms` }} />
            ))}
          </div>
          <div className="rb-box">
            <div className="rb-body" />
            <div className="rb-lid" />
          </div>
        </div>

        <div className="rb-rise">
          <div className="rb-fade">
            <span className="rb-tag">{tag}</span>
            <div className="rb-ticket">
              <p className="rb-store">{storeName}</p>
              <p className="rb-title">{title}</p>
              {subtitle && <p className="rb-period"><i aria-hidden="true">📅</i>{subtitle}</p>}
              {until && <p className="rb-until"><Lines lines={[`${until}`, '앱 쿠폰함에서 사용할 수 있어요']} /></p>}
            </div>
          </div>
        </div>

        <div className="rb-actions">
          <button className="rb-primary" onClick={onInstall}>앱 설치하고 쿠폰 쓰기</button>
          <button className="rb-close" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

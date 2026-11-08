import type { RestaurantEntry } from '../api/endpoints';
import { storeUrl } from '../lib/platform';
import { track } from '../lib/analytics';

export function InstallSheet({ info, onClose }: { info: RestaurantEntry; onClose: () => void }) {
  const bonus = info.install_bonus_coupon === true;
  const url = storeUrl();
  const go = () => {
    track('web_install_click', { restaurant_id: info.restaurant_id, coupon_shown: bonus });
    if (url) location.href = url;
    else alert('휴대폰에서 앱스토어/플레이스토어에서 "우주라이크"를 검색해 주세요.');
  };
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label="앱 설치 안내">
        <h1 style={{ fontSize: 22 }}>
          {bonus ? '앱 설치까지 하면 쿠폰도 드려요!' : '앱에서 스탬프와 혜택을 한곳에서 확인해요'}
        </h1>
        {bonus && (info.install_bonus_items ?? []).map((c, i) => (
          <div className="coupon" key={i}><b>{c.title}</b>{c.subtitle && <span>{c.subtitle}</span>}</div>
        ))}
        <p className="sub" style={{ marginTop: 12 }}>
          앱에서 <b>같은 카카오(애플) 계정으로 로그인</b>하면 지금 쌓은 스탬프가 그대로 이어져요.
        </p>
        <button className="btn" onClick={go}>앱 설치하고 이어서 보기</button>
        <button className="btn ghost" onClick={onClose}>나중에</button>
      </div>
    </>
  );
}

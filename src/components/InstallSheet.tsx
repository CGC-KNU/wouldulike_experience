import type { RestaurantEntry } from '../api/endpoints';
import { storeUrl } from '../lib/platform';
import { track } from '../lib/analytics';

export function InstallSheet({ info, stampCount, onClose }: { info: RestaurantEntry; stampCount?: number; onClose: () => void }) {
  const bonus = info.install_bonus_coupon === true;
  const coupons = bonus ? (info.install_bonus_items ?? []) : [];
  const url = storeUrl();
  const go = () => {
    track('web_install_click', { restaurant_id: info.restaurant_id, coupon_shown: bonus });
    if (url) location.href = url;
    else alert('휴대폰에서 앱스토어/플레이스토어에서 "우주라이크"를 검색해 주세요.');
  };
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet ins" role="dialog" aria-modal="true" aria-label="앱 설치 안내">
        <div className="ins-head">
          <div className="ins-grab" />
          <img className="ins-icon" src="/logo-app.png" alt="우주라이크" width={76} height={76} />
          <p className="ins-brand">우주라이크</p>
          <h1 className="ins-title">
            {bonus ? <>앱 설치까지 하면<br />쿠폰도 드려요!</> : <>앱에서 스탬프와 혜택을<br />한곳에서 확인해요</>}
          </h1>
        </div>

        <div className="ins-body">
          {typeof stampCount === 'number' && stampCount > 0 && (
            <div className="ins-stamp">
              <img src="/stamp/stamp_filled.png" width={40} height={40} alt="" />
              <div><b>{info.name}</b><span>스탬프 {stampCount}개가 쌓였어요</span></div>
            </div>
          )}

          {coupons.length > 0 && (
            <div className="ins-coupons">
              <p className="ins-label">🎁 설치 선물</p>
              {coupons.map((c, i) => (
                <div className="ins-coupon" key={i}>
                  <b>{c.title}</b>
                  {c.subtitle && <span>{c.subtitle}</span>}
                </div>
              ))}
            </div>
          )}

          <ol className="ins-steps">
            <li><i>1</i><span>앱을 설치해요</span></li>
            <li><i>2</i><span><b>같은 카카오 계정</b>으로 로그인해요</span></li>
            <li><i>3</i><span>지금 쌓은 스탬프가 <b>그대로 이어져요</b></span></li>
          </ol>

          <button className="btn ins-cta" onClick={go}>앱 설치하고 이어서 보기</button>
          <button className="btn ghost" onClick={onClose}>나중에</button>
        </div>
      </div>
    </>
  );
}

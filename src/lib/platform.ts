export const ua = () => navigator.userAgent;
export const isIOS = () => /iPhone|iPad|iPod/i.test(ua());
export const isAndroid = () => /Android/i.test(ua());
export const isMobile = () => isIOS() || isAndroid() || /Mobi/i.test(ua());

const ANDROID_PACKAGE = 'com.coggiri.new1';
export const IOS_STORE = (import.meta.env.VITE_IOS_STORE_URL as string) || 'https://apps.apple.com/app/id6740640251';
export const ANDROID_STORE = (import.meta.env.VITE_ANDROID_STORE_URL as string) || `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

export function storeUrl(): string | null {
  if (isIOS()) return IOS_STORE;
  if (isAndroid()) return ANDROID_STORE;
  return null;
}

const srcOf = () => {
  const s = new URLSearchParams(location.search).get('src') ?? sessionStorage.getItem('src') ?? '';
  return /^[a-z0-9_-]{1,20}$/.test(s) ? s : '';
};

/** 앱 식당 화면 딥링크. 앱(deep_link_service)이 wouldulike://restaurant/{id}?src= 를 받는다. */
export const appLink = (id: string | number) => {
  const src = srcOf();
  return `wouldulike://restaurant/${id}${src ? `?src=${src}` : ''}`;
};

/** Android: intent:// 가 "앱 열기, 없으면 Play 스토어"를 한 번에 처리한다. */
export const androidIntent = (id: string | number) => {
  const src = srcOf();
  return `intent://restaurant/${id}${src ? `?src=${src}` : ''}#Intent;scheme=wouldulike;package=${ANDROID_PACKAGE};` +
    `S.browser_fallback_url=${encodeURIComponent(ANDROID_STORE)};end`;
};

/**
 * 앱 열기. 버튼 탭(사용자 동작) 안에서 호출해야 브라우저가 막지 않는다.
 *  - Android: intent:// (앱 없으면 Play 스토어)
 *  - iOS: 커스텀 스킴으로 연다. 앱이 없으면 iOS가 오류 알림만 띄우므로 호출한 쪽이 설치 링크를 보여 준다
 *  - 그 외(PC 등): 아무것도 하지 않고 false
 */
export function openApp(id: string | number): boolean {
  if (isAndroid()) { location.href = androidIntent(id); return true; }
  if (isIOS()) { location.href = appLink(id); return true; }
  return false;
}

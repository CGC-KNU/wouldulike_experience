// GA4 훅. VITE_GA_ID 가 있으면 gtag 로드, 없으면 콘솔(dev)만.
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void } }

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;

export function initAnalytics() {
  if (!GA_ID || window.gtag) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer!.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
}

export type WebEvent = 'web_stamp_view' | 'web_login' | 'web_stamp_add' | 'web_install_click';

export function track(event: WebEvent, params: Record<string, unknown> = {}) {
  const src = new URLSearchParams(location.search).get('src') ?? sessionStorage.getItem('src') ?? undefined;
  const payload = { ...params, src };
  if (window.gtag) window.gtag('event', event, payload);
  else if (import.meta.env.DEV) console.debug('[track]', event, payload);
}

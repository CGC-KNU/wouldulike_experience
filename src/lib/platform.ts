export const ua = () => navigator.userAgent;
export const isIOS = () => /iPhone|iPad|iPod/i.test(ua());
export const isAndroid = () => /Android/i.test(ua());
export const isMobile = () => isIOS() || isAndroid() || /Mobi/i.test(ua());

export const IOS_STORE = (import.meta.env.VITE_IOS_STORE_URL as string) || '';
export const ANDROID_STORE = (import.meta.env.VITE_ANDROID_STORE_URL as string) || '';

export function storeUrl(): string | null {
  if (isIOS()) return IOS_STORE || null;
  if (isAndroid()) return ANDROID_STORE || null;
  return null;
}

export const appLink = (id: string | number) => `wouldulike://restaurant/${id}`;

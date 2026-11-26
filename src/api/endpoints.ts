import { request } from './client';
import type { Tokens } from '../auth/tokens';

export interface Reward { stamps: number; title?: string; [k: string]: any }
export interface RestaurantEntry {
  restaurant_id: number;
  name: string;
  address?: string;
  image_url?: string;
  stamp: { enabled: boolean; cycle_target?: number; rewards?: Reward[]; notes?: string };
  install_bonus_coupon: boolean;
  install_bonus_items?: { title: string; subtitle?: string }[];
  // 계명대 프로모션(11/26~12/9): 대상 매장이면 이번 주 쿠폰. 스탬프 매장에서도 쿠폰 받기를 보여 준다.
  promo?: { active: boolean; mode?: 'app_open'; week?: string; items: { title: string; subtitle?: string }[]; ends_at?: string } | null;
}
export interface LoginResponse { token: Tokens; user: { id: number; nickname?: string }; is_new?: boolean }
export interface Policy {
  stamp?: { daily_limit_per_restaurant?: number; max_per_scan?: number };
  pin?: { length?: number };
}
export interface AddStampResponse {
  reward_coupon_code?: string;
  reward_coupons?: any[];
  reward_details?: any[];
  [k: string]: any;
}

export const getRestaurant = (id: string) =>
  request<RestaurantEntry>(`/api/web/stamp/restaurants/${id}/`).then(r => r.data);

export const loginKakao = (code: string, redirect_uri: string) =>
  request<LoginResponse>('/api/auth/kakao', { method: 'POST', body: JSON.stringify({ code, redirect_uri }) }).then(r => r.data);

export const getPolicy = () => request<Policy>('/api/config/policy/').then(r => r.data);

export const addStamp = (body: { restaurant_id: number; pin: string; count: number }, idemKey: string) =>
  request<AddStampResponse>(
    '/api/coupons/stamps/add/',
    { method: 'POST', body: JSON.stringify(body), headers: { 'Idempotency-Key': idemKey } },
    true,
  );

export const getMyStamps = (restaurantId: number | string) =>
  request<any>(`/api/coupons/stamps/my/?restaurant_id=${restaurantId}`, {}, true).then(r => r.data);

export interface IssuedCoupon {
  code: string;
  expires_at?: string;
  benefit?: { title?: string; subtitle?: string; [k: string]: any };
  coupon_type_title?: string;
}
export interface QrVisitResponse {
  ok: boolean;
  credited?: boolean;
  coupon_issued: boolean;
  coupons: IssuedCoupon[];
  entry?: { branch?: string; coupon_code?: string | null } | null;
}

// QR 방문(앱의 QR 딥링크와 같은 API): 그 달 첫 방문이면 이 매장 쿠폰 1장(프로모션 매장은 이번 주 쿠폰 1장) 발급 + 방문 마일리지
export const qrVisit = (restaurantId: number, idemKey: string) =>
  request<QrVisitResponse>(
    '/api/mileage/qr-visit/',
    { method: 'POST', body: JSON.stringify({ restaurant_id: restaurantId, source: 'qr' }), headers: { 'Idempotency-Key': idemKey } },
    true,
  ).then(r => r.data);

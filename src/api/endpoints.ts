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

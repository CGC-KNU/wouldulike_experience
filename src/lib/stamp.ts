import type { Reward } from '../api/endpoints';

// 앱(coupon_service.dart)의 cleanStampRewardName / stampRewardBenefitText 와 같은 규칙
export function cleanRewardName(raw?: string): string {
  const text = (raw ?? '').trim();
  if (!text) return '';
  const lower = text.toLowerCase();
  if (lower.startsWith('stamp reward') || lower.startsWith('stamp_reward') || text.includes('N개 모으면')) return '';
  const stripped = text.replace(/(\s*제공)+$/, '').trim();
  return stripped || text;
}

function usable(raw?: string): string {
  const c = cleanRewardName(raw);
  if (!c) return '';
  if (c.includes('개 모으면')) return '';
  if (/^\d+$/.test(c)) return '';
  if (!/[0-9A-Za-z가-힣%]/.test(c)) return '';
  return c;
}

export function rewardText(r: Reward): string {
  return usable(r.title) || usable(r.subtitle) || '리워드 쿠폰';
}

export const thresholdRewards = (rewards: Reward[] = []) =>
  rewards.filter(r => (r.stamps ?? 0) > 0).sort((a, b) => (a.stamps ?? 0) - (b.stamps ?? 0));

export function boardLength(target: number, rewards: Reward[] = []): number {
  const t = thresholdRewards(rewards);
  const top = t.length ? t[t.length - 1].stamps ?? 0 : 0;
  return Math.max(target, top);
}

export function nextReward(rewards: Reward[] = [], current: number): Reward | undefined {
  return thresholdRewards(rewards).find(r => (r.stamps ?? 0) > current);
}

export function remainingToNext(target: number, rewards: Reward[] = [], current: number): number {
  const n = nextReward(rewards, current);
  const at = n ? n.stamps ?? 0 : boardLength(target, rewards);
  return Math.max(at - current, 0);
}

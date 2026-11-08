import type { Reward } from '../api/endpoints';

export function StampBoard({ target, filled, rewards = [], justAdded = 0 }: {
  target: number; filled: number; rewards?: Reward[]; justAdded?: number;
}) {
  const rewardAt = new Set(rewards.map(r => r.stamps));
  return (
    <div className="board" role="img" aria-label={`스탬프 ${filled}/${target}`}>
      {Array.from({ length: target }, (_, i) => {
        const n = i + 1;
        const on = n <= filled;
        const isNew = on && n > filled - justAdded;
        const isReward = rewardAt.has(n);
        return (
          <div key={n} className={`cell${on ? ' on' : ''}${isNew ? ' new' : ''}${isReward ? ' reward' : ''}`}>
            {on ? (isReward ? '🎁' : '★') : isReward ? '🎁' : n}
          </div>
        );
      })}
    </div>
  );
}

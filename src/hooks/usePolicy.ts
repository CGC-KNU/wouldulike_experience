import { useEffect, useState } from 'react';
import { getPolicy } from '../api/endpoints';

export function usePolicy() {
  const [p, setP] = useState({ daily: 4, maxPerScan: 4, pinLen: 4 });
  useEffect(() => {
    getPolicy().then(d => setP({
      daily: d.stamp?.daily_limit_per_restaurant ?? 4,
      maxPerScan: d.stamp?.max_per_scan ?? 4,
      pinLen: d.pin?.length ?? 4,
    })).catch(() => {});
  }, []);
  return p;
}

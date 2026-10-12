import { useCallback, useEffect, useState } from 'react';
import * as streakApi from '../services/streakApi';
import useServerClock from './useServerClock';

export default function useStreak() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const clock = useServerClock();

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      try {
        const res = await streakApi.getStreak();
        clock.sync(res.serverTime);
        setData(res);
        setError(null);
        return res;
      } catch (err) {
        setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [clock.sync]
  );

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => load({ silent: true }), [load]);

  return { data, loading, error, reload: load, refresh, serverNow: clock.now, syncClock: clock.sync };
}

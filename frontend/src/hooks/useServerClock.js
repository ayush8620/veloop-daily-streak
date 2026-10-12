import { useCallback, useRef } from 'react';

// Keeps server time using performance.now(), so changing the device clock
// doesn't move the countdown.
export default function useServerClock() {
  const anchor = useRef(null);

  const sync = useCallback((serverTime) => {
    anchor.current = { server: new Date(serverTime).getTime(), perf: performance.now() };
  }, []);

  const now = useCallback(() => {
    if (!anchor.current) return null;
    return anchor.current.server + (performance.now() - anchor.current.perf);
  }, []);

  return { sync, now };
}

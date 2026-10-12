import { useEffect, useRef, useState } from 'react';

// Visual countdown only. When it hits zero we ask the backend again.
export default function useCountdown(target, serverNow, onDone) {
  const [left, setLeft] = useState(null);
  const fired = useRef(false);

  useEffect(() => {
    fired.current = false;
    if (!target) {
      setLeft(null);
      return undefined;
    }
    const end = new Date(target).getTime();
    const tick = () => {
      const now = serverNow();
      if (now == null) return;
      const ms = end - now;
      setLeft(Math.max(0, ms));
      if (ms <= 0 && !fired.current) {
        fired.current = true;
        onDone?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, serverNow, onDone]);

  return left;
}

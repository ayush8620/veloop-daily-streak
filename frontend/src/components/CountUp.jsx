import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

// Animates a number from its last value to the new one. Display only,
// the value itself always comes from the API.
export default function CountUp({ value, duration = 900, format = (n) => n.toLocaleString('en-IN') }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;
    from.current = value;
    if (reduce || start === value || typeof value !== 'number') {
      setShown(value);
      return undefined;
    }
    let raf;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(start + (value - start) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduce]);

  return <span className="tabular">{typeof shown === 'number' ? format(shown) : shown}</span>;
}

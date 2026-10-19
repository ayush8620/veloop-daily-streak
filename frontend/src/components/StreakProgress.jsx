import { Check, X } from 'lucide-react';
import styles from './StreakProgress.module.css';

// 7-day strip built from the card statuses the API returns.
export default function StreakProgress({ cards, compact = false }) {
  if (!cards?.length) return null;
  const done = cards.filter((c) => c.status === 'CLAIMED').length;
  // rail runs dot-centre to dot-centre, so fill up to the last claimed dot
  const frac = done > 1 ? (done - 1) / (cards.length - 1) : 0;

  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ''}`}>
      <div className={styles.head}>
        <span>Cycle progress</span>
        <span className={styles.count}><b>{done}</b> / {cards.length} days</span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-label="Streak cycle progress"
        aria-valuemin={0}
        aria-valuemax={cards.length}
        aria-valuenow={done}
        aria-valuetext={`${done} of ${cards.length} days claimed`}
      >
        <span className={styles.fill} style={{ width: `calc((100% - var(--dot)) * ${frac})` }} aria-hidden="true" />
        <ol className={styles.dots} aria-hidden="true">
          {cards.map((c) => {
            const s = c.status === 'CLAIMED' ? 'done' : c.status === 'TODAY' ? 'today' : c.status === 'MISSED' ? 'missed' : c.isNext ? 'next' : 'locked';
            return (
              <li key={c.day} className={`${styles.dot} ${styles[s]} ${c.reward?.isUltimate ? styles.vip : ''}`} title={`Day ${c.day}`}>
                {s === 'done' ? <Check size={12} strokeWidth={3} /> : s === 'missed' ? <X size={12} strokeWidth={3} /> : c.day}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

import { RotateCcw } from 'lucide-react';
import styles from './DailyStreak.module.css';

export default function ResetBanner({ reset }) {
  if (!reset) return null;
  return (
    <div className={styles.reset} role="status">
      <RotateCcw size={18} />
      <div className={styles.resetText}>
        <strong>Your streak has been reset.</strong> Day {reset.missedDay} was missed after a {reset.previousStreak}-day streak. Start again from Day 1.
      </div>
      <div className={styles.resetDays}>
        {reset.days.map((d) => (
          <span key={d.day} className={d.status === 'MISSED' ? styles.chipMissed : styles.chipDone}>
            D{d.day} {d.status === 'MISSED' ? 'Missed' : '✓'}
          </span>
        ))}
      </div>
    </div>
  );
}

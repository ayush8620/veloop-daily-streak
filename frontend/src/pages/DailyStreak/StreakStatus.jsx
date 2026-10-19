import { CheckCircle2, ChevronRight, Clock, Loader2 } from 'lucide-react';
import useCountdown from '../../hooks/useCountdown';
import { formatDuration, shortReward } from '../../utils/format';
import StreakProgress from '../../components/StreakProgress';
import styles from './DailyStreak.module.css';

function NextIn({ target, serverNow, onDone }) {
  const left = useCountdown(target, serverNow, onDone);
  if (left == null) return null;
  return <b className={styles.timer}>{formatDuration(left)}</b>;
}

// The strip between the top section and the cards: what's going on today,
// what comes next, and the 7-day progress. Everything here is read from the API state.
export default function StreakStatus({ streak, rewards, nextReward, serverNow, onUnlock, onClaim, claiming, weekDone }) {
  const nextCard = rewards.find((r) => r.isNext);
  const checkedInToday = !!streak.checkedInToday && !!nextCard;

  return (
    <section className={styles.status} aria-label="Today's streak status">
      <div className={styles.divider}>
        <span className={styles.spark}>✦</span>
        {streak.canClaim ? (
          <span>Your Day {streak.currentDay} reward is ready. Claim it now!</span>
        ) : weekDone ? (
          <span>Week complete! All rewards collected.</span>
        ) : (
          <span>Come back tomorrow for more rewards!</span>
        )}
        <span className={styles.spark}>✦</span>
      </div>

      <div className={styles.statusRow}>
        {streak.canClaim && (
          <div className={`${styles.statusMsg} ${styles.ready}`}>
            <span>
              Today: <b>{shortReward(nextReward)}</b>
            </span>
            <button type="button" className={styles.statusClaim} onClick={onClaim} disabled={claiming} aria-busy={claiming}>
              {claiming ? <><Loader2 size={15} className="spin" /> Claiming...</> : <>Claim now <ChevronRight size={15} /></>}
            </button>
          </div>
        )}
        {checkedInToday && (
          <div className={styles.statusMsg} role="status">
            <span className={styles.doneTag}><CheckCircle2 size={16} /> Checked in today</span>
            <span className={styles.nextLine}>
              <Clock size={14} /> Day {nextCard.day} · {shortReward(nextCard.reward)} in{' '}
              <NextIn target={streak.nextClaimAt} serverNow={serverNow} onDone={onUnlock} />
            </span>
          </div>
        )}
        <div className={styles.progress}>
          <StreakProgress cards={rewards} compact />
        </div>
      </div>
    </section>
  );
}

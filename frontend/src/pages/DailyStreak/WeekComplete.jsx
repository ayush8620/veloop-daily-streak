import { PartyPopper } from 'lucide-react';
import { day7 } from '../../assets/veloop';
import useCountdown from '../../hooks/useCountdown';
import { formatDuration } from '../../utils/format';
import styles from './DailyStreak.module.css';

function StartsIn({ target, serverNow, onDone }) {
  const left = useCountdown(target, serverNow, onDone);
  if (left == null) return null;
  return left > 0 ? <>New week starts in <b className={styles.timer}>{formatDuration(left)}</b></> : <>Your new week is ready.</>;
}

// shown after Day 7 until Day 1 of the next week is claimed
export default function WeekComplete({ done, serverNow, onUnlock }) {
  if (!done) return null;
  const { ves, giftCardINR } = done.earned;
  const parts = [ves > 0 && `${ves} VEs`, giftCardINR > 0 && `₹${giftCardINR} in gift cards`].filter(Boolean);

  return (
    <div className={styles.weekDone} role="status">
      <img src={day7} alt="" className={styles.weekDoneArt} />
      <div className={styles.weekDoneText}>
        <strong><PartyPopper size={16} /> {done.days}-day streak complete!</strong>
        <span>You earned {parts.join(' + ')} this week.</span>
        <span className={styles.weekDoneNext}>
          <StartsIn target={done.nextCycleAt} serverNow={serverNow} onDone={onUnlock} />
        </span>
      </div>
    </div>
  );
}

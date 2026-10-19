import { Check, CheckCircle2, ChevronRight, Clock, Loader2, Lock, X } from 'lucide-react';
import RewardArt from './RewardArt';
import { formatDuration, formatReward } from '../../utils/format';
import useCountdown from '../../hooks/useCountdown';
import styles from './RewardCard.module.css';

const STATE_CLASS = {
  CLAIMED: styles.claimed,
  TODAY: styles.today,
  AVAILABLE: styles.today,
  LOCKED: styles.locked,
  MISSED: styles.missed,
};

function Countdown({ target, serverNow, onDone }) {
  const left = useCountdown(target, serverNow, onDone);
  if (left == null) return null;
  return <span className={styles.timer}>{formatDuration(left)}</span>;
}

export default function RewardCard({ card, onClaim, claiming, serverNow, onUnlock }) {
  const { day, status, reward } = card;
  const { value, unit } = formatReward(reward);
  const ultimate = reward.isUltimate;
  const canClaim = (status === 'TODAY' || status === 'AVAILABLE') && card.claimable;

  let action;
  if (status === 'CLAIMED') {
    action = <span className={`${styles.btn} ${styles.btnClaimed}`}><CheckCircle2 size={16} /> Claimed</span>;
  } else if (canClaim) {
    action = (
      <button type="button" className={`${styles.btn} ${styles.btnClaim}`} onClick={onClaim} disabled={claiming} aria-busy={claiming}>
        {claiming ? (
          <><Loader2 size={15} className="spin" /> <span className={styles.claimFull}>Claiming...</span><span className={styles.claimShort}>Wait</span></>
        ) : (
          <>
            <span className={styles.claimFull}>Claim Reward</span>
            <span className={styles.claimShort}>Claim Now</span>
            <ChevronRight size={16} />
          </>
        )}
      </button>
    );
  } else if (status === 'MISSED') {
    action = <span className={`${styles.btn} ${styles.btnMissed}`}><X size={16} /> Missed</span>;
  } else if (card.isNext && card.nextClaimAt) {
    action = (
      <span className={`${styles.btn} ${styles.btnNext}`} title="Next reward unlocks in">
        <Clock size={14} />
        <Countdown target={card.nextClaimAt} serverNow={serverNow} onDone={onUnlock} />
      </span>
    );
  } else {
    action = <span className={`${styles.btn} ${styles.btnLocked}`}><Lock size={14} /> Locked</span>;
  }

  return (
    <div
      className={`${styles.card} ${STATE_CLASS[status] || styles.locked} ${ultimate ? styles.ultimate : ''} ${card.isNext ? styles.next : ''}`}
      role="group"
      aria-label={`Day ${day}: ${reward.title}, ${value} ${unit}, ${status.toLowerCase()}`}
      data-status={status}
      data-day={day}
    >
      <div className={styles.top}>
        <span className={styles.day}>Day {day}</span>
        {status === 'CLAIMED' && <span className={styles.check}><Check size={13} strokeWidth={3} /></span>}
        {reward.badge && status !== 'CLAIMED' && <span className={`${styles.badge} ${ultimate ? styles.badgeGold : ''}`}>{reward.badge}</span>}
      </div>
      {status === 'TODAY' && <span className={styles.ribbon}>Today</span>}
      {card.isNext && <span className={`${styles.ribbon} ${styles.ribbonNext}`}>Next</span>}

      <div className={styles.art}>
        <RewardArt type={reward.assetType} animate />
      </div>
      <div className={styles.title}>{reward.title}</div>
      <div className={`${styles.value} ${ultimate ? styles.valueGold : ''}`}>{value}</div>
      <div className={styles.unit}>{unit}</div>
      <div className={styles.action}>{action}</div>
    </div>
  );
}

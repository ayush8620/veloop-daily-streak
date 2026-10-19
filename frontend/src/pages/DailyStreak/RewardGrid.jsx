import { CheckCircle2, Clock, Gift, Lock } from 'lucide-react';
import RewardCard from './RewardCard';
import styles from './RewardCard.module.css';

const LEGEND = [
  { key: 'claimed', label: 'Claimed', icon: CheckCircle2 },
  { key: 'today', label: 'Claim today', icon: Gift },
  { key: 'next', label: 'Unlocks next', icon: Clock },
  { key: 'locked', label: 'Locked', icon: Lock },
];

export default function RewardGrid({ cards, onClaim, claiming, serverNow, onUnlock }) {
  return (
    <>
      <ul className={styles.legend} aria-label="Card states">
        {LEGEND.map(({ key, label, icon: Icon }) => (
          <li key={key} className={styles[`legend_${key}`]}>
            <Icon size={13} strokeWidth={2.5} aria-hidden="true" /> {label}
          </li>
        ))}
      </ul>
      <div className={styles.grid}>
        {cards.map((card) => (
          <RewardCard
            key={card.day}
            card={card}
            onClaim={onClaim}
            claiming={claiming}
            serverNow={serverNow}
            onUnlock={onUnlock}
          />
        ))}
      </div>
    </>
  );
}

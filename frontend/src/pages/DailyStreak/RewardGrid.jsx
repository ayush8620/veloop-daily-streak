import RewardCard from './RewardCard';
import styles from './RewardCard.module.css';

export default function RewardGrid({ cards, onClaim, claiming, serverNow, onUnlock }) {
  return (
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
  );
}

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import crownPodium from '../../assets/rewards/crown-podium.png';
import styles from './UltimateReward.module.css';

function Amazon() {
  return <span className={styles.amazonMark} aria-hidden="true">a</span>;
}

export default function UltimateReward({ reward, card }) {
  if (!reward) return null;
  const claimed = card?.status === 'CLAIMED';
  const brand = reward.metadata?.brand;
  const value = reward.currency === 'INR' ? `₹${reward.amount}` : `+${reward.amount}`;

  return (
    <div className={styles.box}>
      <motion.img
        src={crownPodium}
        alt=""
        className={styles.art}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className={styles.info}>
        <div className={styles.kicker}>{reward.title}</div>
        <div className={styles.value}>{value}</div>
        <div className={styles.pill}>
          {brand === 'Amazon' && <Amazon />} {reward.subtitle}
        </div>
        <div className={styles.unlockDesktop}>
          {claimed ? 'Unlocked!' : <>Unlock on <span>Day {reward.day}</span></>}
        </div>
      </div>
      <div className={styles.unlockMobile}>
        <span className={styles.lockCircle}><Lock size={20} /></span>
        <div>{claimed ? 'Unlocked' : 'Unlock on'}</div>
        {!claimed && <span className={styles.day}>Day {reward.day}</span>}
      </div>
    </div>
  );
}

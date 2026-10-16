import { motion } from 'framer-motion';
import { topLeft, mobileHero } from '../../assets/veloop';
import styles from './HeroBanner.module.css';

export function HeroDesktop() {
  return (
    <div className={styles.hero}>
      <motion.img
        src={topLeft}
        alt=""
        className={styles.heroArt}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className={styles.heroText}>
        <h2 className={styles.heading}>
          Daily Check-In
          <span className={styles.gold}>Rewards</span>
        </h2>
        <p className={styles.copy}>
          Check in every day and earn
          <br />
          <span className={styles.accent}>exciting rewards!</span>
        </p>
      </div>
    </div>
  );
}

// The supplied mobile hero is a finished banner (artwork + headline), used as-is.
export function HeroMobile() {
  return (
    <div className={styles.banner}>
      <img
        src={mobileHero}
        alt="Login Daily & Earn Bigger Rewards! Maintain your streak and unlock exciting rewards every day."
        className={styles.bannerImg}
      />
    </div>
  );
}

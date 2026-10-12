import { motion } from 'framer-motion';
import heroGift from '../../assets/rewards/hero-gift.png';
import calendar from '../../assets/rewards/calendar.png';
import giftBox from '../../assets/rewards/gift-box-mobile.png';
import styles from './HeroBanner.module.css';

export function HeroDesktop() {
  return (
    <div className={styles.hero}>
      <motion.img
        src={heroGift}
        alt=""
        className={styles.heroArt}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div>
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

export function HeroMobile() {
  return (
    <div className={styles.banner}>
      <img src={calendar} alt="" className={styles.calendar} />
      <div className={styles.bannerText}>
        <h2 className={styles.bannerTitle}>
          Login Daily &amp; Earn
          <span className={styles.gold}>Bigger Rewards!</span>
        </h2>
        <p className={styles.bannerCopy}>
          Maintain your streak and unlock <span className={styles.accent}>exciting rewards</span> every day.
        </p>
      </div>
      <motion.img
        src={giftBox}
        alt=""
        className={styles.bannerGift}
        animate={{ y: [0, -4, 0], rotate: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

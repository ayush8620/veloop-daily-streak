import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Gem } from 'lucide-react';
import { flame, vesCoin } from '../../assets/veloop';
import CountUp from '../../components/CountUp';
import styles from './StreakHeader.module.css';

// brief gold pulse on the balance when the server reports a higher value
function useBump(value) {
  const prev = useRef(value);
  const [bump, setBump] = useState(false);
  useEffect(() => {
    if (value > prev.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 1200);
      prev.current = value;
      return () => clearTimeout(t);
    }
    prev.current = value;
    return undefined;
  }, [value]);
  return bump;
}

export default function StreakHeader({ streak, wallet, checkedInToday, weekDone }) {
  // between Day 7 and the next week's Day 1 the finished week is still the streak to show
  const count = weekDone && !streak.currentStreak ? weekDone.days : streak.currentStreak;
  const bump = useBump(wallet.ves);
  let sub = count > 0 ? 'Keep it going!' : 'Start your streak today';
  if (checkedInToday) sub = 'Checked in today ✓';
  if (weekDone) sub = 'Week complete!';

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.back} aria-label="Back to home">
        <ArrowLeft size={20} />
      </Link>

      <div className={styles.titleWrap}>
        <span className={styles.icon}><CalendarDays size={22} /></span>
        <div className={styles.titleText}>
          <h1 className={styles.title}>
            Daily Streak <img src={flame} alt="" className={styles.titleFlame} />
          </h1>
          <p className={styles.subtitle}>Login daily, maintain your streak, and unlock bigger rewards every day!</p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={`${styles.balance} ${bump ? styles.bump : ''}`} aria-label={`${wallet.ves} VEs balance`}>
          <Gem size={18} className={styles.gem} aria-hidden="true" />
          <CountUp value={wallet.ves} />
        </div>
        <div className={`${styles.coins} ${bump ? styles.bump : ''}`} aria-label={`${wallet.ves} VEs collected`}>
          <img src={vesCoin} alt="" className={styles.coinImg} />
          <div aria-hidden="true">
            <div className={styles.coinValue}><CountUp value={wallet.ves} /> <span>VEs</span></div>
            <div className={styles.badgeSub}>Coins collected</div>
          </div>
        </div>
        <div className={styles.badge}>
          <img src={flame} alt="" className={styles.flame} />
          <div>
            <div className={styles.badgeTitle}>{count} Day Streak</div>
            <div className={styles.badgeSub}>{sub}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

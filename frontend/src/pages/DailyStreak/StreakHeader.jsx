import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarCheck2, Flame, Gem } from 'lucide-react';
import styles from './StreakHeader.module.css';

export default function StreakHeader({ streak, wallet }) {
  const navigate = useNavigate();
  const count = streak.currentStreak;
  const back = () => (window.history.length > 1 ? navigate(-1) : navigate('/'));

  return (
    <header className={styles.header}>
      <button type="button" className={styles.back} onClick={back} aria-label="Go back">
        <ArrowLeft size={20} />
      </button>

      <div className={styles.titleWrap}>
        <span className={styles.icon}><CalendarCheck2 size={22} /></span>
        <div>
          <h1 className={styles.title}>
            Daily Streak <Flame size={18} className={styles.titleFlame} />
          </h1>
          <p className={styles.subtitle}>Login daily, maintain your streak, and unlock bigger rewards every day!</p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.balance} title="VEs balance">
          <Gem size={18} className={styles.gem} />
          <span>{wallet.ves}</span>
        </div>
        <div className={styles.badge}>
          <Flame size={30} className={styles.flame} />
          <div>
            <div className={styles.badgeTitle}>{count} Day Streak</div>
            <div className={styles.badgeSub}>{count > 0 ? 'Keep it going!' : 'Start your streak today'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

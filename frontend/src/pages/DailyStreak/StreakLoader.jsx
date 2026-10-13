import Logo from '../../components/Logo';
import WakingNotice from '../../components/WakingNotice';
import styles from './Loading.module.css';

export default function StreakLoader() {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <div className={styles.ring}>
        <Logo size={56} />
      </div>
      <p>Loading your streak...</p>
      <WakingNotice className={styles.waking} />
    </div>
  );
}

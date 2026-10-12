import { AlertTriangle, RefreshCw } from 'lucide-react';
import styles from './DailyStreak.module.css';

export default function ErrorState({ error, onRetry }) {
  return (
    <div className={styles.errorState} role="alert">
      <AlertTriangle size={40} />
      <h2>Couldn&apos;t load your streak</h2>
      <p>{error?.message || 'Unable to process your request. Please try again.'}</p>
      <button type="button" className={styles.retry} onClick={onRetry}>
        <RefreshCw size={16} /> Try again
      </button>
    </div>
  );
}

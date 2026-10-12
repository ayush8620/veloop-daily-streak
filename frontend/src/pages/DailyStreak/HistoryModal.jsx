import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getHistory } from '../../services/streakApi';
import { shortReward } from '../../utils/format';
import styles from './DailyStreak.module.css';
import modal from './CpaDemo.module.css';

export default function HistoryModal({ open, onClose }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setItems(null);
    getHistory().then((r) => setItems(r.items)).catch(setError);
  }, [open]);

  if (!open) return null;
  return (
    <div className={modal.backdrop} onClick={onClose}>
      <div className={`${modal.modal} ${styles.history}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button type="button" className={modal.close} onClick={onClose} aria-label="Close"><X size={18} /></button>
        <h3 className={modal.title}>Streak Calendar</h3>
        {error && <p className={modal.meta}>{error.message}</p>}
        {!items && !error && <p className={modal.meta}>Loading...</p>}
        {items && items.length === 0 && <p className={modal.meta}>No check-ins yet. Claim Day 1 to start.</p>}
        {items && items.length > 0 && (
          <ul className={styles.historyList}>
            {items.map((c) => (
              <li key={c.claimId}>
                <span>Day {c.day}</span>
                <span className={styles.historyAmt}>{shortReward(c.reward)}</span>
                <span className={styles.historyDate}>{new Date(c.claimedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

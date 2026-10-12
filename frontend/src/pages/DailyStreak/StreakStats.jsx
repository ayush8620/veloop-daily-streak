import { CalendarCheck, CalendarDays, Star } from 'lucide-react';
import { shortReward } from '../../utils/format';
import styles from './StreakStats.module.css';

export default function StreakStats({ streak, nextReward }) {
  const items = [
    { key: 'total', label: 'Total Rewards', value: streak.totalRewards, icon: CalendarDays, tone: styles.purple },
    { key: 'checked', label: 'Checked In', value: streak.checkedIn, icon: CalendarCheck, tone: styles.green },
    { key: 'next', label: 'Next Reward', value: shortReward(nextReward), icon: Star, tone: styles.gold, gold: true },
  ];

  return (
    <div className={styles.row}>
      {items.map(({ key, label, value, icon: Icon, tone, gold }) => (
        <div key={key} className={styles.stat}>
          <span className={`${styles.icon} ${tone}`}><Icon size={20} /></span>
          <div className={styles.text}>
            <div className={styles.label}>{label}</div>
            <div className={`${styles.value} ${gold ? styles.goldText : ''}`}>{value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

import { CalendarCheck2, Gift, ShieldCheck, TrendingUp } from 'lucide-react';
import styles from './Info.module.css';

const ITEMS = [
  { icon: CalendarCheck2, title: 'Login Daily', text: 'Keep your streak alive to earn more!', tone: 'purple' },
  { icon: TrendingUp, title: 'Bigger Streak', text: 'More consecutive logins, bigger rewards!', tone: 'gold' },
  { icon: Gift, title: 'Exclusive Rewards', text: 'Get coins, gift cards & special bonuses!', tone: 'purple' },
  { icon: ShieldCheck, title: "Don't Miss Out", text: 'Come back every day & unlock all rewards!', tone: 'green' },
];

export default function WhyStreak() {
  return (
    <section className={styles.why}>
      <h3 className={styles.whyTitle}>
        <span>✦</span> Why Maintain Your Streak? <span>✦</span>
      </h3>
      <div className={styles.items}>
        {ITEMS.map(({ icon: Icon, title, text, tone }) => (
          <div key={title} className={styles.item}>
            <span className={`${styles.icon} ${styles[tone]}`}><Icon size={22} /></span>
            <div>
              <div className={styles.itemTitle}>{title}</div>
              <div className={styles.itemText}>{text}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

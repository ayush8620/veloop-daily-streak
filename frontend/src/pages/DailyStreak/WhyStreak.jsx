import { stayActive, biggerStreak, exclusiveReward, trust } from '../../assets/veloop';
import styles from './Info.module.css';

const ITEMS = [
  { img: stayActive, title: 'Login Daily', short: 'Stay Active', text: 'Keep your streak alive to earn more!' },
  { img: biggerStreak, title: 'Bigger Streak', text: 'More consecutive logins, bigger rewards!' },
  { img: exclusiveReward, title: 'Exclusive Rewards', text: 'Get coins, gift cards & special bonuses!' },
  { img: trust, title: "Don't Miss Out", text: 'Come back every day & unlock all rewards!' },
];

export default function WhyStreak() {
  return (
    <section className={styles.why}>
      <h3 className={styles.whyTitle}>
        <span>✦</span> Why Maintain Your Streak? <span>✦</span>
      </h3>
      <div className={styles.items}>
        {ITEMS.map(({ img, title, short, text }) => (
          <div key={title} className={styles.item}>
            <span className={styles.icon}><img src={img} alt="" loading="lazy" /></span>
            <div>
              <div className={styles.itemTitle}>
                {short ? <><span className={styles.long}>{title}</span><span className={styles.short}>{short}</span></> : title}
              </div>
              <div className={styles.itemText}>{text}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

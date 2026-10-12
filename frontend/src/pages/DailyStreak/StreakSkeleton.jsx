import styles from './Loading.module.css';

const Bone = ({ className = '', style }) => <div className={`${styles.bone} ${className}`} style={style} />;

export default function StreakSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Loading">
      <div className={styles.skHeader}>
        <Bone className={styles.skIcon} />
        <div style={{ flex: 1 }}>
          <Bone style={{ width: 160, height: 20 }} />
          <Bone style={{ width: '50%', height: 12, marginTop: 8 }} />
        </div>
        <Bone className={styles.skBadge} />
      </div>
      <div className={styles.skHero}>
        <div className={styles.skLeft}>
          <Bone className={styles.skBanner} />
          <div className={styles.skStats}>
            <Bone /><Bone /><Bone />
          </div>
        </div>
        <Bone className={styles.skUltimate} />
      </div>
      <div className={styles.skGrid}>
        {Array.from({ length: 7 }, (_, i) => <Bone key={i} className={styles.skCard} />)}
      </div>
      <Bone className={styles.skInfo} />
    </div>
  );
}

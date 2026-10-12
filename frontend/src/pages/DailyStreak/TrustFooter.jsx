import { ChevronRight } from 'lucide-react';
import Logo from '../../components/Logo';
import styles from './Info.module.css';

export default function TrustFooter() {
  return (
    <footer className={styles.trust}>
      <Logo size={28} />
      <div className={styles.trustText}>
        <span>Official rewards only on <a href="https://velooprewards.in" target="_blank" rel="noreferrer">VeloopRewards.in</a></span>
        <span className={styles.sep}>|</span>
        <span className={styles.stay}>Stay active, stay rewarded!</span>
      </div>
      <ChevronRight size={18} className={styles.chev} />
    </footer>
  );
}

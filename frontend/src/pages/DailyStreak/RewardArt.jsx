import { vesCoin, day4, day5, day7 } from '../../assets/veloop';
import styles from './RewardArt.module.css';

// assetType comes from the API; the images themselves live in the frontend
const ART = { coin: vesCoin, gift: day4, 'gift-card': day5, crown: day7 };

export default function RewardArt({ type, animate = false, className = '' }) {
  const src = ART[type] || vesCoin;
  // Day-4 / Day-7 art has a wide transparent burst; zoom the object to match the design
  const zoom = type === 'gift' || type === 'crown' ? styles.zoom : '';
  const motion = animate && (type === 'gift' || type === 'crown') ? styles.float : '';
  return <img src={src} alt="" className={`${styles.art} ${zoom} ${motion} ${className}`} draggable="false" loading="lazy" />;
}

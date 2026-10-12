import coins from '../../assets/rewards/coins.png';
import gift from '../../assets/rewards/gift.png';
import amazonCard from '../../assets/rewards/amazon-card.png';
import crown from '../../assets/rewards/crown.png';
import styles from './RewardArt.module.css';

// assetType comes from the API, the images themselves live here
const ART = { coin: coins, gift, 'gift-card': amazonCard, crown };

export default function RewardArt({ type, animate = false, className = '' }) {
  const src = ART[type] || coins;
  const motion = animate && (type === 'gift' || type === 'crown') ? styles.float : '';
  return <img src={src} alt="" className={`${styles.art} ${motion} ${className}`} draggable="false" />;
}

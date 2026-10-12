import styles from './Logo.module.css';

export default function Logo({ size = 32 }) {
  return (
    <span className={styles.logo} style={{ width: size, height: size }} aria-label="VELoop Rewards">
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
        <path d="M32 4 56 12v18c0 15-10 26-24 30C18 56 8 45 8 30V12z" fill="#1a1035" stroke="#f5b82e" strokeWidth="4" />
        <text x="32" y="40" fontFamily="Poppins, Arial" fontWeight="700" fontSize="20" fill="#f5b82e" textAnchor="middle">VR</text>
      </svg>
    </span>
  );
}

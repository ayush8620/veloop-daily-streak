import { Link } from 'react-router-dom';
import { Flame, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import styles from './Auth/Auth.module.css';

export default function HomePage() {
  const { user, logout } = useAuth();
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Logo size={44} />
        <h1 className={styles.title}>Hi{user ? `, ${user.name.split(' ')[0]}` : ''}</h1>
        <p className={styles.sub}>Welcome to VELoop Rewards.</p>
        <Link to="/daily-streak" className={styles.primary}>
          <Flame size={18} /> Open Daily Streak
        </Link>
        <button type="button" className={styles.ghost} onClick={logout}>
          <LogOut size={16} /> Log out
        </button>
      </div>
    </div>
  );
}

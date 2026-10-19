import { NavLink, Outlet } from 'react-router-dom';
import { Flame, History, House, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import styles from './AppLayout.module.css';

const LINKS = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/daily-streak', label: 'Daily Streak', short: 'Streak', icon: Flame },
  { to: '/history', label: 'History', icon: History },
];

const navClass = ({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`;

// Shared shell for every signed-in screen: brand bar + nav on desktop/tablet,
// bottom tab bar on phones.
export default function AppLayout() {
  const { user, logout } = useAuth();
  const first = user?.name?.split(' ')[0];

  return (
    <div className={styles.shell}>
      <a href="#main" className="visually-hidden-focusable">Skip to content</a>

      <header className={styles.topbar}>
        <NavLink to="/" className={styles.brand} aria-label="VELoop Rewards home">
          <Logo size={30} />
          <span>VELoop <b>Rewards</b></span>
        </NavLink>
        <nav className={styles.nav} aria-label="Main">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={navClass}>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.user}>
          {first && (
            <span className={styles.avatar} title={user.name} aria-hidden="true">{first[0].toUpperCase()}</span>
          )}
          <button type="button" className={styles.logout} onClick={logout}>
            <LogOut size={15} /> <span>Log out</span>
          </button>
        </div>
      </header>

      <div id="main" className={styles.content}>
        <Outlet />
      </div>

      <nav className={styles.tabbar} aria-label="Main">
        {LINKS.map(({ to, label, short, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}>
            <Icon size={20} />
            <span>{short || label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import WakingNotice from '../../components/WakingNotice';
import styles from './Auth.module.css';

export default function AuthForm({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate('/daily-streak', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Logo size={48} />
        <h1 className={styles.title}>{isLogin ? 'Welcome back' : 'Create account'}</h1>
        <p className={styles.sub}>{isLogin ? 'Log in to keep your streak going.' : 'Join VELoop Rewards and start your streak.'}</p>

        <form className={styles.form} onSubmit={submit} noValidate>
          {busy && <WakingNotice className={styles.waking} />}
          {error && <div className={styles.error} role="alert">{error}</div>}
          {!isLogin && (
            <div>
              <label className={styles.label} htmlFor="name">Name</label>
              <input id="name" className={styles.input} value={form.name} onChange={set('name')} autoComplete="name" required />
            </div>
          )}
          <div>
            <label className={styles.label} htmlFor="email">Email</label>
            <input id="email" type="email" className={styles.input} value={form.email} onChange={set('email')} autoComplete="email" required />
          </div>
          <div>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={form.password}
              onChange={set('password')}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
            />
          </div>
          <button type="submit" className={styles.primary} disabled={busy}>
            {busy && <Loader2 size={16} className="spin" />}
            {isLogin ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <div className={styles.switch}>
          {isLogin ? (
            <>New here? <Link to="/register">Create an account</Link></>
          ) : (
            <>Already have an account? <Link to="/login">Log in</Link></>
          )}
        </div>
      </div>
    </div>
  );
}

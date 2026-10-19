import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import WakingNotice from '../../components/WakingNotice';
import { topLeft } from '../../assets/veloop';
import styles from './Auth.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// same rules as the backend validators, checked here first for quicker feedback
function check(form, isLogin) {
  const e = {};
  if (!isLogin && (form.name.trim().length < 2 || form.name.trim().length > 60)) e.name = 'Name must be 2-60 characters.';
  if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email address.';
  if (isLogin ? !form.password : form.password.length < 8) e.password = isLogin ? 'Enter your password.' : 'Use at least 8 characters.';
  return e;
}

function Field({ id, label, error, children, hint }) {
  return (
    <div>
      <label className={styles.label} htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p className={styles.fieldError} id={`${id}-err`}>{error}</p>
      ) : hint ? (
        <p className={styles.hint} id={`${id}-hint`}>{hint}</p>
      ) : null}
    </div>
  );
}

export default function AuthForm({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const found = check(form, isLogin);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (isLogin) await login(form.email.trim(), form.password);
      else await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/daily-streak', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const describe = (k, hint) => (errors[k] ? `${k}-err` : hint ? `${k}-hint` : undefined);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.brandSide} aria-hidden="true">
          <img src={topLeft} alt="" className={styles.brandArt} />
          <h2 className={styles.brandTitle}>
            Daily Check-In <span>Rewards</span>
          </h2>
          <p className={styles.brandText}>Log in every day, keep your 7-day streak alive and unlock bigger rewards.</p>
        </aside>

        <div className={styles.card}>
          <Logo size={48} />
          <h1 className={styles.title}>{isLogin ? 'Welcome back' : 'Create account'}</h1>
          <p className={styles.sub}>{isLogin ? 'Log in to keep your streak going.' : 'Join VELoop Rewards and start your streak.'}</p>

          <form className={styles.form} onSubmit={submit} noValidate aria-busy={busy}>
            {busy && <WakingNotice className={styles.waking} />}
            {error && <div className={styles.error} role="alert">{error}</div>}
            {!isLogin && (
              <Field id="name" label="Name" error={errors.name}>
                <input
                  id="name"
                  className={`${styles.input} ${errors.name ? styles.invalid : ''}`}
                  value={form.name}
                  onChange={set('name')}
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={describe('name')}
                  required
                />
              </Field>
            )}
            <Field id="email" label="Email" error={errors.email}>
              <input
                id="email"
                type="email"
                inputMode="email"
                className={`${styles.input} ${errors.email ? styles.invalid : ''}`}
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={describe('email')}
                required
              />
            </Field>
            <Field id="password" label="Password" error={errors.password} hint={isLogin ? '' : 'At least 8 characters.'}>
              <div className={styles.pwWrap}>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  className={`${styles.input} ${errors.password ? styles.invalid : ''}`}
                  value={form.password}
                  onChange={set('password')}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  aria-invalid={!!errors.password}
                  aria-describedby={describe('password', !isLogin)}
                  required
                />
                <button
                  type="button"
                  className={styles.pwToggle}
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  aria-pressed={showPw}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
            <button type="submit" className={styles.primary} disabled={busy}>
              {busy && <Loader2 size={16} className="spin" />}
              {busy ? (isLogin ? 'Logging in...' : 'Creating account...') : isLogin ? 'Log in' : 'Sign up'}
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
    </main>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import * as streakApi from '../../services/streakApi';
import { formatDateTime } from '../../utils/format';
import { stayActive, vesCoin, day5 } from '../../assets/veloop';
import CountUp from '../../components/CountUp';
import StreakProgress from '../../components/StreakProgress';
import { EmptyView, ErrorView } from '../../components/StateView';
import WakingNotice from '../../components/WakingNotice';
import ui from '../../styles/ui.module.css';
import styles from './History.module.css';

const PAGE_SIZE = 20;

function dayLabel(date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function group(items) {
  const out = [];
  for (const t of items) {
    const label = dayLabel(t.createdAt);
    const last = out[out.length - 1];
    if (last && last.label === label) last.items.push(t);
    else out.push({ label, items: [t] });
  }
  return out;
}

function Skeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading history">
      <div className={styles.summary}>
        {[0, 1, 2].map((i) => <div key={i} className={`${ui.bone} ${styles.skStat}`} />)}
      </div>
      {[0, 1, 2, 3].map((i) => <div key={i} className={`${ui.bone} ${styles.skRow}`} />)}
    </div>
  );
}

export default function HistoryPage() {
  const [state, setState] = useState(null);
  const [tx, setTx] = useState({ items: [], total: 0, page: 0 });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, t] = await Promise.all([streakApi.getStreak(), streakApi.getTransactions(1, PAGE_SIZE)]);
      setState(s);
      setTx({ items: t.items, total: t.total, page: 1 });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = async () => {
    setMore(true);
    try {
      const t = await streakApi.getTransactions(tx.page + 1, PAGE_SIZE);
      setTx((p) => ({ items: [...p.items, ...t.items], total: t.total, page: p.page + 1 }));
    } catch (err) {
      setError(err);
    } finally {
      setMore(false);
    }
  };

  let body;
  if (error && !state) {
    body = <ErrorView title="Couldn't load your history" error={error} onRetry={load} retrying={loading} />;
  } else if (loading || !state) {
    body = <Skeleton />;
  } else {
    const { wallet, streak, rewards } = state;
    body = (
      <>
        <div className={styles.summary}>
          <div className={styles.stat}>
            <img src={vesCoin} alt="" />
            <div>
              <span className={styles.statLabel}>VEs balance</span>
              <b><CountUp value={wallet.ves} /></b>
            </div>
          </div>
          <div className={styles.stat}>
            <img src={day5} alt="" />
            <div>
              <span className={styles.statLabel}>Gift card rewards</span>
              <b>₹<CountUp value={wallet.giftCardINR} /></b>
            </div>
          </div>
          <div className={styles.stat}>
            <img src={stayActive} alt="" />
            <div>
              <span className={styles.statLabel}>Total claims</span>
              <b><CountUp value={tx.total} /></b>
            </div>
          </div>
        </div>

        <div className={styles.cycle}>
          <h2 className={styles.h2}>Current cycle <small>{streak.currentStreak} day streak</small></h2>
          <StreakProgress cards={rewards} />
        </div>

        <h2 className={styles.h2}>Claim history</h2>
        {tx.items.length === 0 ? (
          <EmptyView
            art={vesCoin}
            title="No claims yet"
            text="Claim your Day 1 reward to start your streak. Every claim shows up here with its reference."
            to="/daily-streak"
            cta="Go to Daily Streak"
          />
        ) : (
          <>
            {group(tx.items).map((g) => (
              <section key={g.label} className={styles.group} aria-label={g.label}>
                <h3 className={styles.groupLabel}>{g.label}</h3>
                <ul className={styles.list}>
                  {g.items.map((t) => {
                    const inr = t.currency === 'INR';
                    return (
                      <li key={t.transactionId} className={styles.row}>
                        <img src={inr ? day5 : vesCoin} alt="" className={styles.rowArt} />
                        <div className={styles.rowMain}>
                          <b>Day {t.streakDay} streak reward</b>
                          <span className={styles.ref}>{t.referenceId}</span>
                        </div>
                        <div className={styles.rowSide}>
                          <b className={inr ? styles.inr : styles.ves}>{inr ? `₹${t.amount}` : `+${t.amount} VEs`}</b>
                          <span>{formatDateTime(t.createdAt)}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
            {error && <p className={styles.inlineError} role="alert">{error.message}</p>}
            {tx.items.length < tx.total && (
              <button type="button" className={`${ui.btn} ${ui.ghost} ${styles.more}`} onClick={loadMore} disabled={more}>
                {more ? <><Loader2 size={16} className="spin" /> Loading...</> : 'Load more'}
              </button>
            )}
          </>
        )}
      </>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <Link to="/daily-streak" className={styles.back} aria-label="Back to Daily Streak"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className={styles.h1}>Streak History</h1>
            <p className={styles.sub}>Every reward you claimed, straight from your wallet.</p>
          </div>
        </header>
        <WakingNotice className={styles.waking} />
        {body}
      </div>
    </main>
  );
}

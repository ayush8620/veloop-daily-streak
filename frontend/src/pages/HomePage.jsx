import { Link } from 'react-router-dom';
import { CalendarCheck, CheckCircle2, ChevronRight, Clock, Flame, History, LogOut, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useStreak from '../hooks/useStreak';
import useCountdown from '../hooks/useCountdown';
import { formatDuration, shortReward } from '../utils/format';
import { vesCoin, day5, flame, topLeft } from '../assets/veloop';
import CountUp from '../components/CountUp';
import StreakProgress from '../components/StreakProgress';
import { ErrorView } from '../components/StateView';
import WakingNotice from '../components/WakingNotice';
import ui from '../styles/ui.module.css';
import styles from './Home.module.css';

function Countdown({ target, serverNow, onDone }) {
  const left = useCountdown(target, serverNow, onDone);
  return left == null ? null : <b className={styles.timer}>{formatDuration(left)}</b>;
}

function HomeSkeleton() {
  return (
    <div className={styles.grid} role="status" aria-busy="true" aria-label="Loading your rewards">
      <div className={`${ui.bone} ${styles.skToday}`} />
      <div className={`${ui.bone} ${styles.skSide}`} />
      <div className={`${ui.bone} ${styles.skSide}`} />
    </div>
  );
}

// Signed-in home: wallet, today's check-in and quick links into the streak.
export default function HomePage() {
  const { user, logout } = useAuth();
  const { data, loading, error, reload, refresh, serverNow } = useStreak();
  const first = user?.name?.split(' ')[0];

  let body;
  if (error && !data) {
    body = <div className={ui.panel}><ErrorView title="Couldn't load your rewards" error={error} onRetry={reload} /></div>;
  } else if (loading || !data) {
    body = <HomeSkeleton />;
  } else {
    const { streak, rewards, wallet, nextReward, lastReset } = data;
    const nextCard = rewards.find((r) => r.isNext);
    const checkedIn = !streak.canClaim && !!streak.lastClaimedAt && !!nextCard;

    body = (
      <div className={styles.grid}>
        <section className={`${ui.panel} ${styles.today}`} aria-labelledby="today-title">
          <div className={styles.todayHead}>
            <img src={flame} alt="" className={styles.flame} />
            <div>
              <h2 id="today-title" className={styles.h2}>{streak.currentStreak} Day Streak</h2>
              <p className={styles.muted}>Day {streak.currentDay} of {streak.totalRewards}</p>
            </div>
          </div>

          {lastReset && streak.currentStreak === 0 && (
            <p className={styles.resetNote}><RotateCcw size={15} /> Your last streak ended on Day {lastReset.missedDay}. Start again today.</p>
          )}

          <StreakProgress cards={rewards} />

          <div className={styles.todayBox}>
            {streak.canClaim ? (
              <>
                <div>
                  <div className={styles.label}>Today&apos;s reward is ready</div>
                  <div className={styles.reward}>{shortReward(nextReward)}</div>
                </div>
                <Link to="/daily-streak" className={`${ui.btn} ${ui.gold}`}>
                  Claim now <ChevronRight size={16} />
                </Link>
              </>
            ) : checkedIn ? (
              <>
                <div>
                  <div className={`${styles.label} ${styles.ok}`}><CheckCircle2 size={15} /> Checked in today</div>
                  <div className={styles.nextLine}>
                    <Clock size={14} /> Day {nextCard.day} · {shortReward(nextCard.reward)} in{' '}
                    <Countdown target={streak.nextClaimAt} serverNow={serverNow} onDone={refresh} />
                  </div>
                </div>
                <Link to="/daily-streak" className={`${ui.btn} ${ui.ghost}`}>
                  View streak <ChevronRight size={16} />
                </Link>
              </>
            ) : (
              <Link to="/daily-streak" className={`${ui.btn} ${ui.gold}`}>Open Daily Streak</Link>
            )}
          </div>
        </section>

        <section className={`${ui.panel} ${styles.wallet}`} aria-label="VEs balance">
          <img src={vesCoin} alt="" className={styles.walletArt} />
          <div>
            <div className={styles.label}>VEs balance</div>
            <div className={styles.big}><CountUp value={wallet.ves} /> <span className={styles.unit}>VEs</span></div>
          </div>
        </section>

        <section className={`${ui.panel} ${styles.wallet}`} aria-label="Gift card balance">
          <img src={day5} alt="" className={styles.walletArt} />
          <div>
            <div className={styles.label}>Amazon gift card rewards</div>
            <div className={styles.big}>₹<CountUp value={wallet.giftCardINR} /></div>
          </div>
        </section>

        <nav className={styles.links} aria-label="Shortcuts">
          <Link to="/daily-streak" className={styles.linkCard}>
            <span className={styles.linkIcon}><CalendarCheck size={20} /></span>
            <span><b>Daily Streak</b><small>Check in and see all 7 rewards</small></span>
            <ChevronRight size={18} />
          </Link>
          <Link to="/history" className={styles.linkCard}>
            <span className={styles.linkIcon}><History size={20} /></span>
            <span><b>History</b><small>Every claim with its reference</small></span>
            <ChevronRight size={18} />
          </Link>
        </nav>
      </div>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <img src={topLeft} alt="" className={styles.heroArt} />
        <div>
          <p className={styles.hello}>Hi{first ? `, ${first}` : ''} <Flame size={18} aria-hidden="true" /></p>
          <h1 className={styles.h1}>Welcome to <span>VELoop Rewards</span></h1>
          <p className={styles.muted}>Check in every day, keep your streak alive and unlock bigger rewards.</p>
        </div>
      </header>

      <WakingNotice className={styles.waking} />
      {body}

      <button type="button" className={styles.logoutMobile} onClick={logout}>
        <LogOut size={15} /> Log out
      </button>
    </main>
  );
}

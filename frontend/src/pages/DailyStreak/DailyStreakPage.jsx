import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronRight, Flame, LogOut } from 'lucide-react';
import useStreak from '../../hooks/useStreak';
import useCountdown from '../../hooks/useCountdown';
import { useAuth } from '../../context/AuthContext';
import * as streakApi from '../../services/streakApi';
import { formatDuration } from '../../utils/format';
import StreakHeader from './StreakHeader';
import { HeroDesktop, HeroMobile } from './HeroBanner';
import StreakStats from './StreakStats';
import UltimateReward from './UltimateReward';
import RewardGrid from './RewardGrid';
import CpaDemo from './CpaDemo';
import WakingNotice from '../../components/WakingNotice';
import loadingStyles from './Loading.module.css';
import StreakLoader from './StreakLoader';
import StreakSkeleton from './StreakSkeleton';
import WhyStreak from './WhyStreak';
import TrustFooter from './TrustFooter';
import ResetBanner from './ResetBanner';
import ErrorState from './ErrorState';
import HistoryModal from './HistoryModal';
import styles from './DailyStreak.module.css';

const LOADER_MS = 700;
const AD_MS = 3000;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function NextIn({ target, serverNow, onDone }) {
  const left = useCountdown(target, serverNow, onDone);
  if (left == null || left <= 0) return null;
  return <span className={styles.nextIn}>Next reward in <b>{formatDuration(left)}</b></span>;
}

export default function DailyStreakPage() {
  const { data, loading, error, reload, refresh, serverNow, syncClock } = useStreak();
  const { logout } = useAuth();
  const [loaderDone, setLoaderDone] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [cpa, setCpa] = useState({ open: false, phase: 'checking', progress: 0 });
  const [historyOpen, setHistoryOpen] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaderDone(true), LOADER_MS);
    return () => clearTimeout(t);
  }, []);

  // other tab claimed? refetch when this tab gets focus again
  useEffect(() => {
    const onFocus = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onFocus);
    return () => document.removeEventListener('visibilitychange', onFocus);
  }, [refresh]);

  const handleClaim = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setClaiming(true);
    const target = data?.rewards.find((r) => r.day === data.streak.currentDay);
    setCpa({ open: true, phase: 'checking', progress: 0, reward: target?.reward });

    try {
      // ask the server first, the button state alone isn't trusted
      const status = await streakApi.getStatus();
      syncClock(status.serverTime);
      if (!status.streak.canClaim) {
        throw { code: 'LOCKED', message: 'Your next reward is not available yet.' };
      }

      setCpa((c) => ({ ...c, phase: 'ad' }));
      const steps = 12;
      for (let i = 1; i <= steps; i++) {
        await wait(AD_MS / steps);
        setCpa((c) => ({ ...c, progress: Math.round((i / steps) * 100) }));
      }

      setCpa((c) => ({ ...c, phase: 'granting' }));
      const result = await streakApi.claimStreak();
      setCpa((c) => ({ ...c, phase: 'success', result }));
    } catch (err) {
      setCpa((c) => ({ ...c, phase: 'error', error: err }));
    } finally {
      await refresh();
      busy.current = false;
      setClaiming(false);
    }
  }, [data, refresh, syncClock]);

  const closeCpa = () => setCpa((c) => ({ ...c, open: false }));

  if (!loaderDone && !data && !error) {
    return <div className={styles.page}><StreakLoader /></div>;
  }

  if (error && !data) {
    return (
      <div className={styles.page}>
        <div className={styles.frame}>
          <ErrorState error={error} onRetry={() => reload()} />
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return <div className={styles.page}><div className={styles.frame}><WakingNotice className={loadingStyles.waking} /><StreakSkeleton /></div></div>;
  }

  const { streak, rewards, wallet, nextReward, ultimateReward, lastReset } = data;
  const ultimateCard = rewards.find((r) => r.day === ultimateReward?.day);
  const nextCard = rewards.find((r) => r.isNext);

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <StreakHeader streak={streak} wallet={wallet} />

        <div className={styles.body}>
          <div className="d-md-none mb-3">
            <HeroMobile />
          </div>

          <ResetBanner reset={lastReset} />

          <div className={`row g-3 ${styles.top}`}>
            <div className="col-12 col-lg-7 d-flex flex-column">
              <div className="d-none d-md-block">
                <HeroDesktop />
              </div>
              <div className={styles.streakRow}>
                <span className={styles.chip}><Flame size={16} /> {streak.currentStreak} Day Streak</span>
                <button type="button" className={styles.calendarBtn} onClick={() => setHistoryOpen(true)}>
                  <CalendarDays size={15} /> Streak Calendar <ChevronRight size={14} />
                </button>
              </div>
              <StreakStats streak={streak} nextReward={nextReward} />
            </div>
            <div className="col-12 col-lg-5">
              <UltimateReward reward={ultimateReward} card={ultimateCard} />
            </div>
          </div>

          <div className={styles.divider}>
            <span className={styles.spark}>✦</span>
            {streak.canClaim ? (
              <span>Your reward is ready. Claim it now!</span>
            ) : (
              <span>Come back tomorrow for more rewards!</span>
            )}
            <span className={styles.spark}>✦</span>
            {nextCard && <NextIn target={streak.nextClaimAt} serverNow={serverNow} onDone={refresh} />}
          </div>

          <RewardGrid cards={rewards} onClaim={handleClaim} claiming={claiming} serverNow={serverNow} onUnlock={refresh} />

          <div className="mt-3">
            <WhyStreak />
          </div>
          <TrustFooter />

          <div className={styles.footerLinks}>
            <button type="button" onClick={() => setHistoryOpen(true)}>History</button>
            <button type="button" onClick={logout}><LogOut size={13} /> Log out</button>
          </div>
        </div>
      </div>

      <CpaDemo
        open={cpa.open}
        phase={cpa.phase}
        reward={cpa.reward}
        result={cpa.result}
        error={cpa.error}
        progress={cpa.progress}
        onClose={closeCpa}
      />
      <HistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}

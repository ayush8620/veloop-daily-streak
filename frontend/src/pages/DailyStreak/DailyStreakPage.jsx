import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { flame } from '../../assets/veloop';
import useStreak from '../../hooks/useStreak';
import * as streakApi from '../../services/streakApi';
import { shortReward, isRetryable } from '../../utils/format';
import { useToast } from '../../components/Toast';
import { ErrorView } from '../../components/StateView';
import WakingNotice from '../../components/WakingNotice';
import StreakHeader from './StreakHeader';
import { HeroDesktop, HeroMobile } from './HeroBanner';
import StreakStats from './StreakStats';
import UltimateReward from './UltimateReward';
import RewardGrid from './RewardGrid';
import StreakStatus from './StreakStatus';
import CpaDemo from './CpaDemo';
import StreakLoader from './StreakLoader';
import StreakSkeleton from './StreakSkeleton';
import WhyStreak from './WhyStreak';
import TrustFooter from './TrustFooter';
import ResetBanner from './ResetBanner';
import WeekComplete from './WeekComplete';
import loadingStyles from './Loading.module.css';
import styles from './DailyStreak.module.css';

const LOADER_MS = 700;
const AD_MS = 3000;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function DailyStreakPage() {
  const { data, loading, error, reload, refresh, serverNow, syncClock } = useStreak();
  const toast = useToast();
  const [loaderDone, setLoaderDone] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [cpa, setCpa] = useState({ open: false, phase: 'checking', progress: 0 });
  const busy = useRef(false);
  // reused when the user retries after a network error, so the server
  // treats it as the same claim (idempotent) and never pays twice
  const claimKey = useRef(null);

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
    // a retry after a network error goes straight to the claim with the same key:
    // if the first request did reach the server, it just returns that result
    const isRetry = !!claimKey.current;
    if (!isRetry) claimKey.current = streakApi.newKey();
    const target = data?.rewards.find((r) => r.day === data.streak.currentDay);
    setCpa({ open: true, phase: isRetry ? 'granting' : 'checking', progress: 100, reward: target?.reward });

    let sent = false;
    try {
      if (!isRetry) {
        // ask the server first, the button state alone isn't trusted
        const status = await streakApi.getStatus();
        syncClock(status.serverTime);
        if (!status.streak.canClaim) {
          throw { code: 'LOCKED', message: 'Your next reward is not available yet.' };
        }

        setCpa((c) => ({ ...c, phase: 'ad', progress: 0 }));
        const steps = 12;
        for (let i = 1; i <= steps; i++) {
          await wait(AD_MS / steps);
          setCpa((c) => ({ ...c, progress: Math.round((i / steps) * 100) }));
        }
      }

      setCpa((c) => ({ ...c, phase: 'granting' }));
      sent = true;
      const result = await streakApi.claimStreak(claimKey.current);
      claimKey.current = null;
      setCpa((c) => ({ ...c, phase: 'success', result }));
    } catch (err) {
      if (!sent || !isRetryable(err)) claimKey.current = null;
      setCpa((c) => ({ ...c, phase: 'error', error: err }));
    } finally {
      // unlock first so "Try again" works straight away, then reload the real state
      busy.current = false;
      setClaiming(false);
      await refresh();
    }
  }, [data, refresh, syncClock]);

  const closeCpa = useCallback(() => {
    if (cpa.phase === 'success' && cpa.result) {
      const { claim } = cpa.result;
      toast.success(`${shortReward(claim.reward)} added to your wallet.`, { title: `Day ${claim.day} claimed` });
    }
    setCpa((c) => ({ ...c, open: false }));
  }, [cpa.phase, cpa.result, toast]);

  const retryLoad = async () => {
    setRetrying(true);
    await reload();
    setRetrying(false);
  };

  if (!loaderDone && !data && !error) {
    return <div className={styles.page}><StreakLoader /></div>;
  }

  if (error && !data) {
    return (
      <div className={styles.page}>
        <div className={`${styles.frame} ${styles.errorFrame}`}>
          <ErrorView title="Couldn't load your streak" error={error} onRetry={retryLoad} retrying={retrying} />
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className={styles.page}>
        <div className={styles.frame}>
          <WakingNotice className={loadingStyles.waking} />
          <StreakSkeleton />
        </div>
      </div>
    );
  }

  const { streak, rewards, wallet, nextReward, ultimateReward, lastReset, lastCompleted } = data;
  const ultimateCard = rewards.find((r) => r.day === ultimateReward?.day);
  const checkedInToday = !!streak.checkedInToday;

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <StreakHeader streak={streak} wallet={wallet} checkedInToday={checkedInToday} weekDone={lastCompleted} />

        <main className={styles.body}>
          <div className="d-md-none mb-3">
            <HeroMobile />
          </div>

          {error && (
            <div className={styles.stale} role="status">
              <span>Couldn&apos;t refresh your streak. Showing the last saved state.</span>
              <button type="button" onClick={refresh}>Retry</button>
            </div>
          )}
          <ResetBanner reset={lastReset} />
          <WeekComplete done={lastCompleted} serverNow={serverNow} onUnlock={refresh} />

          <div className={`row g-3 ${styles.top}`}>
            <div className="col-12 col-xl-7 d-flex flex-column">
              <div className="d-none d-md-block">
                <HeroDesktop />
              </div>
              <div className={styles.streakRow}>
                <span className={styles.chip}><img src={flame} alt="" className={styles.chipFlame} /> {lastCompleted && !streak.currentStreak ? lastCompleted.days : streak.currentStreak} Day Streak</span>
                <Link to="/history" className={styles.calendarBtn}>
                  <CalendarDays size={15} /> Streak Calendar <ChevronRight size={14} />
                </Link>
              </div>
              <StreakStats streak={streak} nextReward={nextReward} />
            </div>
            <div className="col-12 col-xl-5">
              <UltimateReward reward={ultimateReward} card={ultimateCard} />
            </div>
          </div>

          <StreakStatus
            weekDone={!!lastCompleted}
            streak={streak}
            rewards={rewards}
            nextReward={nextReward}
            serverNow={serverNow}
            onUnlock={refresh}
            onClaim={handleClaim}
            claiming={claiming}
          />

          <RewardGrid cards={rewards} onClaim={handleClaim} claiming={claiming} serverNow={serverNow} onUnlock={refresh} />

          <div className="mt-3">
            <WhyStreak />
          </div>
          <TrustFooter />
        </main>
      </div>

      <CpaDemo
        open={cpa.open}
        phase={cpa.phase}
        reward={cpa.reward}
        result={cpa.result}
        error={cpa.error}
        progress={cpa.progress}
        onClose={closeCpa}
        onRetry={handleClaim}
      />
    </div>
  );
}

import { useMemo } from 'react';
import type { Habit } from '../types/habit';
import { usePremium } from '../context/PremiumContext';
import { formatDate } from '../utils/dateHelpers';

interface Props {
  habit: Habit;
  onUpgrade: () => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HabitAnalytics({ habit, onUpgrade }: Props) {
  const { isPremium } = usePremium();

  const stats = useMemo(() => {
    const dates = habit.completionDates;
    const dateSet = new Set(dates);
    const now = new Date();

    // Day-of-week breakdown — last 90 days
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const dayTotal = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 90; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dow = d.getDay();
      if (habit.schedule.includes(dow)) {
        dayTotal[dow]++;
        if (dateSet.has(formatDate(d))) dayCounts[dow]++;
      }
    }
    const dayRates = dayCounts.map((c, i) => (dayTotal[i] > 0 ? c / dayTotal[i] : 0));
    const bestIdx = dayRates.indexOf(Math.max(...dayRates));
    const worstIdx = dayRates.indexOf(Math.min(...dayRates.filter((_, i) => dayTotal[i] > 0)));

    // 30-day completion rate
    let scheduled30 = 0;
    let done30 = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      if (habit.schedule.includes(d.getDay())) {
        scheduled30++;
        if (dateSet.has(formatDate(d))) done30++;
      }
    }
    const rate30 = scheduled30 > 0 ? Math.round((done30 / scheduled30) * 100) : 0;

    // Longest gap (in days) between completions
    let longestGap = 0;
    if (dates.length >= 2) {
      const sorted = [...dates].sort();
      for (let i = 1; i < sorted.length; i++) {
        const a = new Date(sorted[i - 1]);
        const b = new Date(sorted[i]);
        const gap = Math.round((b.getTime() - a.getTime()) / 86400000) - 1;
        if (gap > longestGap) longestGap = gap;
      }
    }

    // Last 12 weeks trend
    const weeks: { label: string; pct: number }[] = [];
    for (let w = 11; w >= 0; w--) {
      let s = 0;
      let d = 0;
      for (let i = 0; i < 7; i++) {
        const day = new Date(now);
        day.setDate(day.getDate() - (w * 7 + i));
        if (habit.schedule.includes(day.getDay())) {
          s++;
          if (dateSet.has(formatDate(day))) d++;
        }
      }
      weeks.push({ label: `W${12 - w}`, pct: s > 0 ? Math.round((d / s) * 100) : 0 });
    }

    return { dayRates, dayTotal, bestIdx, worstIdx, rate30, longestGap, weeks, scheduled30, done30 };
  }, [habit]);

  if (!isPremium) {
    return (
      <section className="px-4 pt-6">
        <h2 className="text-xs font-bold text-muted tracking-widest mb-3">ANALYTICS</h2>
        <div className="relative bg-white rounded-2xl p-6 shadow-sm overflow-hidden">
          <div className="blur-sm pointer-events-none select-none">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-mint rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-forest">73%</p>
                <p className="text-xs text-muted">30-day rate</p>
              </div>
              <div className="bg-mint rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-forest">Mon</p>
                <p className="text-xs text-muted">Best day</p>
              </div>
              <div className="bg-mint rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-forest">4d</p>
                <p className="text-xs text-muted">Longest gap</p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70">
            <div className="text-3xl mb-1">🔒</div>
            <p className="text-sm font-bold text-dark">Analytics is a Premium feature</p>
            <p className="text-xs text-muted mb-3">Unlock detailed insights for every habit.</p>
            <button onClick={onUpgrade} className="bg-forest text-white text-sm font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-forest/90 transition">
              Upgrade
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 pt-6">
      <h2 className="text-xs font-bold text-muted tracking-widest mb-3">ANALYTICS</h2>
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-mint rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-forest">{stats.rate30}%</p>
            <p className="text-xs text-muted mt-0.5">30-day rate</p>
          </div>
          <div className="bg-mint rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-forest">{stats.dayTotal[stats.bestIdx] > 0 ? DAY_NAMES[stats.bestIdx] : '—'}</p>
            <p className="text-xs text-muted mt-0.5">Best day</p>
          </div>
          <div className="bg-mint rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-forest">{stats.longestGap}d</p>
            <p className="text-xs text-muted mt-0.5">Longest gap</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-muted tracking-widest mb-2">BY DAY OF WEEK</p>
          <div className="flex items-end gap-2 h-24">
            {stats.dayRates.map((rate, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${Math.max(rate * 100, 4)}%`,
                      backgroundColor: habit.color || 'var(--color-sage)',
                      opacity: stats.dayTotal[i] > 0 ? 1 : 0.2,
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted">{DAY_NAMES[i][0]}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-muted tracking-widest mb-2">LAST 12 WEEKS</p>
          <div className="flex items-end gap-1 h-20">
            {stats.weeks.map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t"
                    style={{ height: `${Math.max(w.pct, 4)}%`, backgroundColor: habit.color || 'var(--color-forest)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {stats.dayTotal[stats.worstIdx] > 0 && stats.dayRates[stats.worstIdx] < 0.5 && (
          <p className="text-xs text-muted">💡 You miss this most often on <span className="font-semibold">{DAY_NAMES[stats.worstIdx]}s</span> — try a reminder.</p>
        )}
      </div>
    </section>
  );
}

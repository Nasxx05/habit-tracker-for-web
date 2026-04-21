import { useHabits } from '../context/HabitContext';
import { formatDate } from '../utils/dateHelpers';
import { BarRow, Sparkline } from './DataViz';
import HabitGlyph, { getGlyphForHabit } from './HabitGlyph';
import { IconTrending, IconFlame, IconSparkle } from './Icons';

function KPI({ label, value, unit, delta, up, accent }: { label: string; value: string | number; unit?: string; delta?: string; up?: boolean; accent?: boolean }) {
  return (
    <div style={{ padding: '14px 14px 12px', background: 'var(--color-card)', borderRadius: 16, border: '1px solid rgba(30,35,31,.08)', boxShadow: '0 1px 2px rgba(30,35,31,.04)' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-ink-4)' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <span className="tnum" style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6, color: accent ? 'var(--color-terracotta)' : 'var(--color-ink)' }}>{value}</span>
        {unit && <span style={{ fontSize: 11, color: 'var(--color-ink-3)' }}>{unit}</span>}
      </div>
      {delta && (
        <div style={{ fontSize: 10, color: up ? 'var(--color-sage-500)' : 'var(--color-ink-3)', fontWeight: 600, marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 3 }} className="tnum">
          {up && <IconTrending size={10} />}{delta}
        </div>
      )}
    </div>
  );
}

export default function Stats() {
  const { habits, setCurrentView } = useHabits();

  if (habits.length === 0) {
    return (
      <div className="max-w-3xl mx-auto pb-28 animate-fade-in" style={{ background: 'var(--color-bg)', minHeight: '100dvh' }}>
        <div style={{ padding: '12px 20px 6px' }}>
          <div style={{ fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>Stats</div>
          <div className="font-serif" style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5, marginTop: 2, color: 'var(--color-ink)' }}>Your rhythm</div>
        </div>
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--color-sage-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <IconSparkle size={28} style={{ color: 'var(--color-forest)' }} />
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: 'var(--color-ink)' }}>No stats yet</h3>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-ink-3)' }}>Start tracking habits to see your statistics.</p>
          <button onClick={() => setCurrentView('home')}
            style={{ background: 'var(--color-forest)', color: '#F5F2E8', fontWeight: 700, padding: '12px 24px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 14 }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalCompletions = habits.reduce((s, h) => s + h.completionDates.length, 0);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
  const activeStreaks = habits.filter(h => h.currentStreak > 0).length;

  // 30-day completion ratios
  const daily30: Array<{ value: number; color?: string }> = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = formatDate(d);
    const sched = habits.filter(h => h.schedule.includes(d.getDay()));
    const done = sched.filter(h => h.completionDates.includes(k)).length;
    daily30.push({ value: sched.length ? (done / sched.length) * 100 : 0 });
  }

  // Current month stats
  const now = new Date();
  let monthCompletions = 0;
  let monthPossible = 0;
  let perfectDays = 0;
  const daysInCurMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  for (let day = 1; day <= Math.min(daysInCurMonth, now.getDate()); day++) {
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    const k = formatDate(d);
    const sched = habits.filter(h => h.schedule.includes(d.getDay()));
    const done = sched.filter(h => h.completionDates.includes(k)).length;
    monthCompletions += done;
    monthPossible += sched.length;
    if (done === sched.length && sched.length > 0) perfectDays++;
  }
  const monthRate = monthPossible > 0 ? Math.round((monthCompletions / monthPossible) * 100) : 0;

  // Weekly rollup helper
  function weeklyRollup(h: typeof habits[0]) {
    const set = new Set(h.completionDates);
    const out: number[] = [];
    for (let w = 7; w >= 0; w--) {
      let c = 0;
      for (let d = 0; d < 7; d++) {
        const day = new Date();
        day.setDate(day.getDate() - (w * 7 + d));
        if (set.has(formatDate(day))) c++;
      }
      out.push(c);
    }
    return out;
  }

  const topHabits = [...habits].sort((a, b) => b.currentStreak - a.currentStreak).slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto pb-28 animate-fade-in" style={{ background: 'var(--color-bg)', minHeight: '100dvh' }}>

      {/* Header */}
      <div style={{ padding: '12px 20px 6px' }}>
        <div style={{ fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>Stats</div>
        <div className="font-serif" style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5, marginTop: 2, color: 'var(--color-ink)' }}>Your rhythm</div>
      </div>

      {/* KPI grid */}
      <div style={{ padding: '12px 16px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <KPI label="Completions" value={totalCompletions} delta="all time" />
        <KPI label="Perfect days" value={perfectDays} delta="this month" up />
        <KPI label="Longest streak" value={bestStreak} unit="days" accent />
        <KPI label="Active streaks" value={activeStreaks} delta={`of ${habits.length} habits`} up={activeStreaks > 0} />
      </div>

      {/* 30-day bars */}
      <div style={{ margin: '0 16px 14px', padding: 16, background: 'var(--color-card)', borderRadius: 18, border: '1px solid rgba(30,35,31,.08)', boxShadow: '0 1px 2px rgba(30,35,31,.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-ink-4)' }}>Daily completion</div>
            <div className="tnum" style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-ink)', marginTop: 2 }}>30 days</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-sage-500)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <IconTrending size={12} />{monthRate}% this month
          </div>
        </div>
        <BarRow values={daily30} width={Math.min(window.innerWidth - 64, 460)} height={72} color="var(--color-forest)" barWidth={6} />
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--color-ink-4)', fontWeight: 600, letterSpacing: '.08em' }}>
          <span>30 days ago</span><span>15 days ago</span><span>Today</span>
        </div>
      </div>

      {/* Habit leaderboard */}
      <div style={{ margin: '0 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 2 }}>Ranking</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: -0.3 }}>Strongest habits</div>
          </div>
        </div>
        <div style={{ padding: '8px 14px', background: 'var(--color-card)', borderRadius: 16, border: '1px solid rgba(30,35,31,.08)', boxShadow: '0 1px 2px rgba(30,35,31,.04)' }}>
          {topHabits.map((h, i) => {
            const { shape, color } = getGlyphForHabit(h.emoji, h.category, h.glyphShape, h.glyphColor);
            const rate = Math.round((h.completionDates.length / Math.max(1, Math.ceil((Date.now() - new Date(h.createdAt).getTime()) / 86400000))) * 100);
            return (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i ? '1px solid rgba(30,35,31,.08)' : 'none' }}>
                <div className="tnum" style={{ width: 20, fontSize: 12, fontWeight: 700, color: 'var(--color-ink-4)', textAlign: 'center' }}>{i + 1}</div>
                <HabitGlyph shape={shape} color={color} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)' }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-ink-3)' }} className="tnum">
                    {Math.min(100, rate)}% · <span style={{ color: 'var(--color-terracotta)' }}>{h.currentStreak} day streak</span>
                  </div>
                </div>
                <div style={{ width: 64, flexShrink: 0 }}>
                  <Sparkline values={weeklyRollup(h)} width={64} height={22} color={color} fill={`color-mix(in oklch, ${color} 20%, transparent)`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Best time of day */}
      <div style={{ margin: '0 16px 20px', padding: 18, background: 'var(--color-card)', borderRadius: 18, border: '1px solid rgba(30,35,31,.08)', boxShadow: '0 1px 2px rgba(30,35,31,.04)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-ink-4)' }}>Habits at a glance</div>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {habits.map(h => {
            const { shape, color } = getGlyphForHabit(h.emoji, h.category, h.glyphShape, h.glyphColor);
            const totalDays = Math.max(1, Math.ceil((Date.now() - new Date(h.createdAt).getTime()) / 86400000));
            const rate = Math.min(100, Math.round((h.completionDates.length / totalDays) * 100));
            return (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <HabitGlyph shape={shape} color={color} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>{h.name}</span>
                    <span className="tnum" style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-ink-3)' }}>{rate}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--color-sage-100)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${rate}%`, background: color, borderRadius: 2, transition: 'width .6s' }} />
                  </div>
                </div>
                {h.currentStreak > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: 'var(--color-terracotta)', flexShrink: 0 }} className="tnum">
                    <IconFlame size={12} />{h.currentStreak}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

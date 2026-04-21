import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { formatDate } from '../utils/dateHelpers';
import HabitGlyph, { getGlyphForHabit } from './HabitGlyph';
import { IconClose, IconFlame } from './Icons';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function weekHeadline(rate: number) {
  if (rate >= 85) return 'An exceptional week.';
  if (rate >= 70) return 'A very strong week.';
  if (rate >= 55) return 'A solid week.';
  if (rate >= 35) return 'A mixed week.';
  if (rate > 0) return 'A challenging week.';
  return 'A fresh start.';
}

const REFLECTION_PROMPTS = [
  'Which habit felt hardest this week — and what made it so?',
  'What small win are you most proud of this week?',
  'What would make next week even better?',
  'Which habit surprised you — positively or negatively?',
];

export default function WeeklyReview() {
  const { habits, setCurrentView } = useHabits();
  const [reflection, setReflection] = useState('');

  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekNumber = getISOWeek(today);
  const promptIndex = weekNumber % REFLECTION_PROMPTS.length;

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return {
      date: d,
      dateStr: formatDate(d),
      dayName: DAY_NAMES[d.getDay()],
      dowIndex: d.getDay(),
      isFuture: formatDate(d) > formatDate(today),
    };
  });

  const dailyStats = weekDays.map((day) => {
    if (day.isFuture) return { ...day, completed: 0, scheduled: 0, rate: 0 };
    const scheduled = habits.filter((h) => h.schedule.includes(day.date.getDay()));
    const completed = scheduled.filter((h) => h.completionDates.includes(day.dateStr));
    return {
      ...day,
      completed: completed.length,
      scheduled: scheduled.length,
      rate: scheduled.length > 0 ? Math.round((completed.length / scheduled.length) * 100) : 0,
    };
  });

  const pastDays = dailyStats.filter((d) => !d.isFuture);
  const totalScheduled = pastDays.reduce((sum, d) => sum + d.scheduled, 0);
  const totalCompleted = pastDays.reduce((sum, d) => sum + d.completed, 0);
  const weekRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

  const habitStats = habits.map((h) => {
    const scheduledDays = pastDays.filter((d) => h.schedule.includes(d.date.getDay()));
    const completedDays = scheduledDays.filter((d) => h.completionDates.includes(d.dateStr));
    return {
      habit: h,
      scheduled: scheduledDays.length,
      completed: completedDays.length,
      rate: scheduledDays.length > 0 ? Math.round((completedDays.length / scheduledDays.length) * 100) : 0,
    };
  }).filter((h) => h.scheduled > 0 && h.completed > 0).sort((a, b) => b.rate - a.rate);

  const wins = habitStats.filter((h) => h.rate >= 70).slice(0, 4);

  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const maxBarH = 60;

  return (
    <div className="max-w-3xl mx-auto pb-28 animate-fade-in" style={{ background: 'var(--color-bg-soft)', minHeight: '100dvh' }}>

      {/* Top bar */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => setCurrentView('home')}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-ink-2)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}
        >
          <IconClose size={18} />Close
        </button>
        <div style={{ fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '.1em', fontWeight: 600, textTransform: 'uppercase' }}>
          Week {weekNumber} · Review
        </div>
        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-forest)', fontSize: 13, fontWeight: 700 }}>
          Share
        </button>
      </div>

      {/* Editorial headline */}
      <div style={{ padding: '8px 20px 16px' }}>
        <div className="font-serif" style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.8, color: 'var(--color-ink)', lineHeight: 1.1 }}>
          {weekHeadline(weekRate)}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-ink-3)', marginTop: 4 }}>{weekLabel}</div>
      </div>

      {/* Hero stat */}
      <div style={{ margin: '0 16px 14px', padding: 22, background: 'var(--color-forest)', color: '#F5F2E8', borderRadius: 22, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'color-mix(in oklch, var(--color-terracotta) 35%, transparent)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', opacity: 0.7 }}>Completion rate</div>
          <div className="tnum" style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1, marginTop: 6 }}>
            {weekRate}<span style={{ fontSize: 28, opacity: 0.6 }}>%</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 14, opacity: 0.85 }}>
            {totalCompleted} of {totalScheduled} habits completed
            {totalScheduled === 0 && ' — start tracking to see stats'}
          </div>
        </div>
      </div>

      {/* Day-by-day breakdown */}
      {pastDays.length > 0 && (
        <div style={{ margin: '0 16px 14px', padding: 18, background: 'var(--color-card)', borderRadius: 20, border: '1px solid rgba(30,35,31,.08)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 14 }}>Day by day</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {dailyStats.map((d, i) => {
              const pct = d.scheduled > 0 ? d.completed / d.scheduled : 0;
              const barH = d.isFuture ? 0 : Math.max(4, pct * maxBarH);
              const barColor = pct === 1
                ? 'var(--color-forest)'
                : pct >= 0.66
                  ? 'var(--color-sage-300)'
                  : 'var(--color-sage-200)';
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  {!d.isFuture && d.scheduled > 0 && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-ink-3)' }} className="tnum">
                      {d.completed}/{d.scheduled}
                    </div>
                  )}
                  {(!d.isFuture && d.scheduled === 0) && (
                    <div style={{ fontSize: 10, color: 'var(--color-ink-4)' }}>—</div>
                  )}
                  {d.isFuture && <div style={{ fontSize: 10, color: 'var(--color-ink-4)' }} />}
                  <div style={{ height: maxBarH, display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{
                      width: 20, height: d.isFuture ? 4 : barH, borderRadius: 10,
                      background: d.isFuture ? 'var(--color-sage-100)' : barColor,
                      opacity: d.isFuture ? 0.4 : 1,
                    }} />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-ink-4)' }}>
                    {DAY_SHORT[d.dowIndex]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Wins this week */}
      {wins.length > 0 && (
        <div style={{ margin: '0 16px 14px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-ink-4)', padding: '0 6px 10px' }}>
            Wins this week
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {wins.map(({ habit, completed, scheduled, rate }) => {
              const { shape, color } = getGlyphForHabit(habit.emoji, habit.category, habit.glyphShape, habit.glyphColor);
              const badge = rate === 100
                ? `${scheduled}/${scheduled}`
                : habit.currentStreak > 0
                  ? `${habit.currentStreak}`
                  : `${completed}/${scheduled}`;
              const showFlame = habit.currentStreak > 1;
              return (
                <div key={habit.id} style={{ padding: '12px 14px', background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.08)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <HabitGlyph shape={shape} color={color} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)' }}>{habit.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginTop: 1 }}>
                      {completed}/{scheduled} days · {rate}% completion
                    </div>
                  </div>
                  <div className="tnum" style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-terracotta)', padding: '4px 8px', background: 'color-mix(in oklch, var(--color-terracotta) 12%, transparent)', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                    {showFlame && <IconFlame size={10} />}{badge}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reflection prompt */}
      <div style={{ margin: '0 16px 24px', padding: 20, borderRadius: 20, background: 'var(--color-butter)', border: '1px solid color-mix(in oklch, var(--color-butter) 60%, var(--color-ink))' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-ink-2)' }}>A question for you</div>
        <div className="font-serif" style={{ fontSize: 18, lineHeight: 1.4, marginTop: 8, color: 'var(--color-ink)' }}>
          {REFLECTION_PROMPTS[promptIndex]}
        </div>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Start writing…"
          rows={3}
          style={{
            marginTop: 14, width: '100%', padding: 12, background: 'rgba(255,255,255,.5)',
            border: 'none', borderRadius: 12, fontSize: 13, color: 'var(--color-ink)',
            resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Empty state */}
      {habits.length === 0 && (
        <div style={{ margin: '0 16px', padding: '32px 20px', textAlign: 'center', background: 'var(--color-card)', borderRadius: 20, border: '1px solid rgba(30,35,31,.08)' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: 'var(--color-ink)' }}>No data yet</h3>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-ink-3)' }}>Start tracking habits to see your weekly review.</p>
          <button onClick={() => setCurrentView('home')}
            style={{ background: 'var(--color-forest)', color: '#F5F2E8', fontWeight: 700, padding: '12px 24px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 14 }}>
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

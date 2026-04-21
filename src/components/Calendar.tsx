import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { getDaysInMonth, getFirstDayOfMonth, getMonthName, formatDate, getToday } from '../utils/dateHelpers';
import { Ring } from './DataViz';
import HabitGlyph, { getGlyphForHabit } from './HabitGlyph';
import { IconChevronL, IconChevronR, IconCheckSm } from './Icons';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
      <span style={{ fontSize: 10, color: 'var(--color-ink-3)', fontWeight: 600 }}>{label}</span>
    </div>
  );
}

export default function Calendar() {
  const { habits } = useHabits();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedHabitId, setSelectedHabitId] = useState<string | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(getToday());

  const todayStr = getToday();
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    setSelectedDate(null);
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    setSelectedDate(null);
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const getRatio = (dateStr: string): number | null => {
    const d = new Date(dateStr + 'T12:00:00');
    const dow = d.getDay();
    const relevant = selectedHabitId === 'all'
      ? habits.filter(h => h.schedule.includes(dow))
      : habits.filter(h => h.id === selectedHabitId && h.schedule.includes(dow));
    if (relevant.length === 0) return null;
    const done = relevant.filter(h => h.completionDates.includes(dateStr)).length;
    return done / relevant.length;
  };

  // Monthly stats
  let perfectDays = 0;
  let totalCompletions = 0;
  let totalPossible = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(viewYear, viewMonth, day);
    const dateStr = formatDate(d);
    if (dateStr > todayStr) break;
    const dow = d.getDay();
    const relevant = selectedHabitId === 'all'
      ? habits.filter(h => h.schedule.includes(dow))
      : habits.filter(h => h.id === selectedHabitId && h.schedule.includes(dow));
    const done = relevant.filter(h => h.completionDates.includes(dateStr)).length;
    totalCompletions += done;
    totalPossible += relevant.length;
    if (done === relevant.length && relevant.length > 0) perfectDays++;
  }
  const completionRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;

  // How many days elapsed this month up to today
  const daysElapsed = viewYear === today.getFullYear() && viewMonth === today.getMonth()
    ? today.getDate()
    : viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth())
      ? 0
      : daysInMonth;

  return (
    <div className="max-w-3xl mx-auto pb-28 animate-fade-in" style={{ background: 'var(--color-bg)', minHeight: '100dvh' }}>

      {/* Header */}
      <div style={{ padding: '12px 20px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>Calendar</div>
          <div className="font-serif" style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5, marginTop: 2, color: 'var(--color-ink)' }}>
            {getMonthName(viewMonth)} {viewYear}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: 16, border: '1px solid rgba(30,35,31,.08)', background: 'var(--color-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-ink-2)' }}>
            <IconChevronL size={16} />
          </button>
          <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 16, border: '1px solid rgba(30,35,31,.08)', background: 'var(--color-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-ink-2)' }}>
            <IconChevronR size={16} />
          </button>
        </div>
      </div>

      {/* Habit filter */}
      {habits.length > 1 && (
        <div style={{ padding: '8px 20px 6px', display: 'flex', gap: 6, overflowX: 'auto' }} className="no-scrollbar">
          <button onClick={() => setSelectedHabitId('all')}
            style={{ padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: selectedHabitId === 'all' ? 'var(--color-forest)' : 'var(--color-card)', color: selectedHabitId === 'all' ? '#F5F2E8' : 'var(--color-ink-2)', border: selectedHabitId === 'all' ? 'none' : '1px solid rgba(30,35,31,.08)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            All Habits
          </button>
          {habits.map(habit => (
            <button key={habit.id} onClick={() => setSelectedHabitId(habit.id)}
              style={{ padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: selectedHabitId === habit.id ? 'var(--color-forest)' : 'var(--color-card)', color: selectedHabitId === habit.id ? '#F5F2E8' : 'var(--color-ink-2)', border: selectedHabitId === habit.id ? 'none' : '1px solid rgba(30,35,31,.08)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {habit.name}
            </button>
          ))}
        </div>
      )}

      {/* Month stat summary */}
      <div style={{ margin: '12px 16px 16px', padding: 16, background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.08)', borderRadius: 18, boxShadow: '0 1px 2px rgba(30,35,31,.04)', display: 'flex', gap: 20, alignItems: 'center' }}>
        <Ring value={perfectDays} total={Math.max(1, daysElapsed)} size={64} stroke={6} color="var(--color-forest)" track="var(--color-sage-100)">
          <div className="tnum" style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-forest)' }}>{completionRate}%</div>
        </Ring>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: '.1em', fontWeight: 700, color: 'var(--color-ink-4)', textTransform: 'uppercase' }}>This month</div>
          <div className="tnum" style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: -.3, marginTop: 2 }}>{perfectDays} perfect days</div>
          <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 2 }}>out of {daysElapsed} so far</div>
        </div>
      </div>

      {/* Weekday header */}
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {WEEKDAYS.map((l, i) => (
          <div key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: 'var(--color-ink-4)', textAlign: 'center' }}>{l}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = formatDate(new Date(viewYear, viewMonth, day));
          const isFuture = dateStr > todayStr;
          const isToday = dateStr === todayStr;
          const isSelected = selectedDate === dateStr;
          const ratio = isFuture ? null : getRatio(dateStr);

          const bg = isToday ? 'var(--color-forest)'
            : isFuture ? 'transparent'
            : ratio === 1 ? 'color-mix(in oklch, var(--color-forest) 82%, white)'
            : ratio !== null && ratio >= 0.5 ? 'color-mix(in oklch, var(--color-forest) 40%, var(--color-sage-100))'
            : ratio !== null && ratio > 0 ? 'var(--color-sage-100)'
            : 'var(--color-bg-soft)';

          const textColor = isToday ? '#F5F2E8'
            : isFuture ? 'var(--color-ink-4)'
            : ratio === 1 ? 'white'
            : 'var(--color-ink-2)';

          return (
            <button
              key={day}
              onClick={() => !isFuture && setSelectedDate(isSelected ? null : dateStr)}
              disabled={isFuture}
              style={{
                aspectRatio: '1', borderRadius: 12, position: 'relative',
                background: bg,
                border: isFuture ? '1px dashed rgba(30,35,31,.12)' : isSelected ? '2px solid var(--color-forest)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: textColor,
                fontSize: 13, fontWeight: isToday ? 700 : 600,
                cursor: isFuture ? 'default' : 'pointer',
                outline: 'none',
              }}
              className="tnum"
            >
              {day}
              {ratio === 1 && !isToday && (
                <div style={{ position: 'absolute', top: 3, right: 3, width: 4, height: 4, borderRadius: 2, background: 'var(--color-terracotta)' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <LegendDot color="color-mix(in oklch, var(--color-forest) 82%, white)" label="Perfect day" />
        <LegendDot color="color-mix(in oklch, var(--color-forest) 40%, var(--color-sage-100))" label="Most done" />
        <LegendDot color="var(--color-sage-100)" label="Partial" />
        <LegendDot color="var(--color-bg-soft)" label="Missed" />
      </div>

      {/* Selected day habits */}
      {selectedDate && (
        <div style={{ padding: '4px 16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 2 }}>Selected day</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: -0.3 }}>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>
            {(() => {
              const r = getRatio(selectedDate);
              return r !== null && <span className="tnum" style={{ fontSize: 11, color: 'var(--color-ink-3)' }}>{Math.round(r * 100)}% done</span>;
            })()}
          </div>

          {(() => {
            const selDow = new Date(selectedDate + 'T12:00:00').getDay();
            const scheduled = habits.filter(h => h.schedule.includes(selDow));
            if (scheduled.length === 0) return <p style={{ fontSize: 13, color: 'var(--color-ink-3)', textAlign: 'center', padding: '16px 0' }}>No habits scheduled</p>;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {scheduled.map(h => {
                  const done = h.completionDates.includes(selectedDate);
                  const { shape, color } = getGlyphForHabit(h.emoji, h.category, h.glyphShape, h.glyphColor);
                  return (
                    <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.08)', borderRadius: 14 }}>
                      <HabitGlyph shape={shape} color={color} size={32} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>{h.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-ink-3)' }}>{h.target || h.category}</div>
                      </div>
                      <div style={{
                        width: 24, height: 24, borderRadius: 12,
                        background: done ? 'var(--color-forest)' : 'transparent',
                        border: done ? 'none' : '1.5px solid rgba(30,35,31,.14)',
                        color: '#F5F2E8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {done && <IconCheckSm size={14} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

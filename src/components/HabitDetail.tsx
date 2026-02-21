import { useState, useEffect, useRef } from 'react';
import { useHabits } from '../context/HabitContext';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
  formatDate,
  getToday,
} from '../utils/dateHelpers';
import EditHabitModal from './EditHabitModal';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getInsights(habit: { name: string; currentStreak: number; longestStreak: number; completionDates: string[] }) {
  const insights: { icon: string; title: string; body: string }[] = [];
  const dates = habit.completionDates;

  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  const dayTotal = [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    dayTotal[dow]++;
    if (dates.includes(formatDate(d))) dayCounts[dow]++;
  }
  const dayNames = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
  let worstDay = 0;
  let worstRate = 1;
  dayTotal.forEach((total, i) => {
    if (total > 0) {
      const rate = dayCounts[i] / total;
      if (rate < worstRate) { worstRate = rate; worstDay = i; }
    }
  });
  if (worstRate < 0.5 && dayTotal[worstDay] >= 2) {
    insights.push({ icon: '📈', title: 'Consistency Tip', body: `You tend to miss this habit on ${dayNames[worstDay]}. Try setting a reminder earlier on those days.` });
  }

  const nextMilestones = [7, 14, 30, 60, 100];
  for (const milestone of nextMilestones) {
    if (habit.currentStreak > 0 && habit.currentStreak < milestone) {
      const remaining = milestone - habit.currentStreak;
      if (remaining <= 5) {
        insights.push({ icon: '🎯', title: 'Next Milestone', body: `You're ${remaining} day${remaining === 1 ? '' : 's'} away from a ${milestone}-day streak! Keep going.` });
      }
      break;
    }
  }

  if (habit.longestStreak >= 3) {
    insights.push({ icon: '⏰', title: 'Optimal Time', body: `Your longest streaks happen when you stay consistent. Try completing "${habit.name}" at the same time each day.` });
  }

  if (insights.length === 0) {
    insights.push({ icon: '💡', title: 'Getting Started', body: `Start building momentum with "${habit.name}". Even one day completed is a great start!` });
  }

  return insights.slice(0, 3);
}

export default function HabitDetail() {
  const { habits, selectedHabitId, setCurrentView, reflections, addReflection, toggleHabit, toggleSkipDay } = useHabits();
  const habit = habits.find((h) => h.id === selectedHabitId);

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const todayStr = getToday();
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Auto-save reflection — fixed: don't clear text immediately
  useEffect(() => {
    if (!reflectionText.trim() || !habit) return;
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      addReflection(habit.id, reflectionText.trim());
      setSaveStatus('saved');
      // Keep text visible for 2s then clear
      saveTimerRef.current = setTimeout(() => {
        setReflectionText('');
        setSaveStatus('idle');
      }, 2000);
    }, 2000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [reflectionText, habit, addReflection]);

  if (!habit) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted">Habit not found</p>
        <button onClick={() => setCurrentView('home')} className="mt-4 text-forest font-semibold cursor-pointer">Go back</button>
      </div>
    );
  }

  const habitReflections = reflections.filter((r) => r.habitId === habit.id).slice(0, 5);
  const insights = getInsights(habit);
  const totalDays = habit.completionDates.length;
  const skipDates = habit.skipDates || [];
  const isSkippedToday = skipDates.includes(todayStr);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-fade-in">
      {/* Top Bar */}
      <div className="sticky top-0 bg-cream/90 backdrop-blur-md z-10 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setCurrentView('home')}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-mint transition text-dark text-lg cursor-pointer">←</button>
        <h1 className="text-lg font-bold text-dark">{habit.emoji} {habit.name}</h1>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-mint transition text-muted cursor-pointer">⋯</button>
          {showMenu && (
            <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-48 animate-fade-in z-20">
              <button onClick={() => { setShowMenu(false); setShowEdit(true); }}
                className="w-full text-left px-4 py-2.5 text-sm text-dark hover:bg-mint transition cursor-pointer">✏️ Edit Habit</button>
              <button onClick={() => { toggleHabit(habit.id); setShowMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-dark hover:bg-mint transition cursor-pointer">
                {habit.isCompletedToday ? '↩️ Undo Today' : '✅ Complete Today'}
              </button>
              <button onClick={() => { toggleSkipDay(habit.id, todayStr); setShowMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-dark hover:bg-mint transition cursor-pointer">
                {isSkippedToday ? '🔄 Remove Skip' : '💤 Skip Today (Rest Day)'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Skip Day Banner */}
      {isSkippedToday && (
        <div className="mx-4 mt-2 px-4 py-3 bg-peach-light rounded-2xl flex items-center gap-2">
          <span>💤</span>
          <span className="text-sm font-medium text-dark">Today is a rest day — your streak is safe!</span>
        </div>
      )}

      {/* Activity Calendar */}
      <section className="px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-muted tracking-widest">ACTIVITY</h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="text-muted hover:text-dark transition cursor-pointer px-2">←</button>
            <span className="text-sm font-semibold text-dark bg-mint px-3 py-1 rounded-full">
              {getMonthName(viewMonth)} {viewYear}
            </span>
            <button onClick={nextMonth} className="text-muted hover:text-dark transition cursor-pointer px-2">→</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((d, i) => (
              <div key={i} className="text-center text-xs font-semibold text-muted py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDate(new Date(viewYear, viewMonth, day));
              const isFuture = dateStr > todayStr;
              const isToday = dateStr === todayStr;
              const completed = habit.completionDates.includes(dateStr);
              const skipped = skipDates.includes(dateStr);

              return (
                <div key={day}
                  className={`aspect-square rounded-full flex items-center justify-center text-xs font-medium transition ${
                    skipped ? 'bg-peach-light text-peach'
                    : completed ? 'bg-sage text-white'
                    : isToday ? 'border-2 border-sage text-forest'
                    : isFuture ? 'text-gray-300'
                    : 'text-muted'
                  }`}
                >{day}</div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex gap-4 mt-3 justify-center text-xs text-muted">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-sage" /><span>Done</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-peach-light" /><span>Rest</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full border border-gray-300" /><span>Missed</span></div>
          </div>
        </div>
      </section>

      {/* Streak Stats */}
      <section className="px-4 pt-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-forest">{habit.currentStreak}</p>
            <p className="text-xs font-bold text-muted tracking-widest mt-1">CURRENT</p>
            <p className="text-xs text-muted">Streak</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-peach">{habit.longestStreak}</p>
            <p className="text-xs font-bold text-muted tracking-widest mt-1">LONGEST</p>
            <p className="text-xs text-muted">Streak</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-forest">{totalDays}</p>
            <p className="text-xs font-bold text-muted tracking-widest mt-1">TOTAL</p>
            <p className="text-xs text-muted">Days</p>
          </div>
        </div>
      </section>

      {/* Daily Reflection — fixed auto-save */}
      <section className="px-4 pt-6">
        <h2 className="text-xs font-bold text-muted tracking-widest mb-3">DAILY REFLECTION</h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="How did your mind feel today? Breathe, and jot down a quick thought..."
            className="w-full resize-none border-0 outline-none text-sm text-dark placeholder:text-sage-light min-h-[80px] bg-transparent"
          />
          <p className="text-xs text-muted mt-1">
            {saveStatus === 'saving' && 'Auto-saving ···'}
            {saveStatus === 'saved' && '✓ Saved — clearing soon'}
          </p>
        </div>
      </section>

      {/* Improvement Insights */}
      <section className="px-4 pt-6">
        <h2 className="text-xs font-bold text-muted tracking-widest mb-3">IMPROVEMENT INSIGHTS</h2>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-mint">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{insight.icon}</span>
                <div>
                  <p className="font-semibold text-dark text-sm">{insight.title}</p>
                  <p className="text-muted text-sm mt-1">{insight.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Reflections */}
      {habitReflections.length > 0 && (
        <section className="px-4 pt-6">
          <h2 className="text-xs font-bold text-muted tracking-widest mb-3">RECENT REFLECTIONS</h2>
          <div className="space-y-3">
            {habitReflections.map((r) => {
              const date = new Date(r.createdAt);
              const monthShort = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
              const dayNum = date.getDate();
              return (
                <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-peach" />
                    <span className="text-xs font-bold text-muted">{monthShort} {dayNum}</span>
                    <span className="ml-auto text-lg">{habit.emoji}</span>
                  </div>
                  <p className="text-sm text-dark leading-relaxed">{r.text}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <EditHabitModal habit={habit} isOpen={showEdit} onClose={() => setShowEdit(false)} />
    </div>
  );
}

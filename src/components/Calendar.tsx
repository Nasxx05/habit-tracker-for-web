import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
  formatDate,
  getToday,
} from '../utils/dateHelpers';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const { habits } = useHabits();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedHabitId, setSelectedHabitId] = useState<string | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  // Schedule-aware completion status
  const getCompletionStatus = (dateStr: string): 'all' | 'partial' | 'none' => {
    const d = new Date(dateStr + 'T12:00:00');
    const dow = d.getDay();
    const relevantHabits = selectedHabitId === 'all'
      ? habits.filter((h) => h.schedule.includes(dow))
      : habits.filter((h) => h.id === selectedHabitId && h.schedule.includes(dow));
    if (relevantHabits.length === 0) return 'none';
    const completed = relevantHabits.filter((h) => h.completionDates.includes(dateStr)).length;
    if (completed === relevantHabits.length) return 'all';
    if (completed > 0) return 'partial';
    return 'none';
  };

  // Monthly stats — schedule-aware
  let perfectDays = 0;
  let totalCompletions = 0;
  let totalPossible = 0;
  let bestStreak = 0;
  let currentRunStreak = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(viewYear, viewMonth, day);
    const dateStr = formatDate(d);
    if (dateStr > todayStr) break;
    const dow = d.getDay();
    const relevantHabits = selectedHabitId === 'all'
      ? habits.filter((h) => h.schedule.includes(dow))
      : habits.filter((h) => h.id === selectedHabitId && h.schedule.includes(dow));
    const completedCount = relevantHabits.filter((h) => h.completionDates.includes(dateStr)).length;
    totalCompletions += completedCount;
    totalPossible += relevantHabits.length;
    if (completedCount === relevantHabits.length && relevantHabits.length > 0) {
      perfectDays++;
      currentRunStreak++;
      bestStreak = Math.max(bestStreak, currentRunStreak);
    } else {
      currentRunStreak = 0;
    }
  }

  const completionRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-24 animate-fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-dark">Calendar</h1>
        <p className="text-muted text-sm mt-1">Track your progress over time</p>
      </div>

      {/* Habit filter */}
      {habits.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <button
            onClick={() => setSelectedHabitId('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              selectedHabitId === 'all' ? 'bg-forest text-white' : 'bg-mint text-forest hover:bg-sage-light'
            }`}
          >All Habits</button>
          {habits.map((habit) => (
            <button key={habit.id} onClick={() => setSelectedHabitId(habit.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                selectedHabitId === habit.id ? 'bg-forest text-white' : 'bg-mint text-forest hover:bg-sage-light'
              }`}
            >{habit.emoji} {habit.name}</button>
          ))}
        </div>
      )}

      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-mint text-lg transition cursor-pointer text-muted">←</button>
        <h2 className="text-lg font-bold text-dark">{getMonthName(viewMonth)} {viewYear}</h2>
        <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-mint text-lg transition cursor-pointer text-muted">→</button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-muted py-1">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = formatDate(new Date(viewYear, viewMonth, day));
            const isFuture = dateStr > todayStr;
            const isToday = dateStr === todayStr;
            const status = isFuture ? 'future' : getCompletionStatus(dateStr);

            return (
              <button key={day} disabled={isFuture}
                onClick={() => !isFuture && setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition cursor-pointer disabled:cursor-default ${
                  status === 'all' ? 'bg-sage/30 border-2 border-sage'
                  : status === 'partial' ? 'bg-peach/10 border-2 border-peach-light'
                  : status === 'none' ? 'bg-cream border border-gray-200'
                  : 'bg-white border border-gray-100'
                } ${isToday ? 'ring-2 ring-forest ring-offset-1' : ''} ${
                  selectedDate === dateStr ? 'ring-2 ring-sage ring-offset-1' : ''
                }`}
              >
                <span className={`text-xs font-semibold ${
                  isFuture ? 'text-gray-300' : isToday ? 'text-forest' : 'text-dark'
                }`}>{day}</span>
                {!isFuture && (
                  <span className="text-xs mt-0.5">
                    {status === 'all' ? '✓' : status === 'partial' ? '·' : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Detail */}
      {selectedDate && (
        <div className="mt-4 bg-white border-2 border-sage-light rounded-2xl p-5 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-dark">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <button onClick={() => setSelectedDate(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-mint text-muted text-lg cursor-pointer">×</button>
          </div>
          {(() => {
            const selDow = new Date(selectedDate + 'T12:00:00').getDay();
            const scheduled = habits.filter((h) => h.schedule.includes(selDow));
            const completedHabits = scheduled.filter((h) => h.completionDates.includes(selectedDate));
            const missedHabits = scheduled.filter((h) => !h.completionDates.includes(selectedDate) && h.createdAt.split('T')[0] <= selectedDate);
            return (
              <div className="space-y-3">
                {completedHabits.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-sage mb-2">Completed ({completedHabits.length})</p>
                    <div className="space-y-2">
                      {completedHabits.map((h) => (
                        <div key={h.id} className="flex items-center gap-3 px-3 py-2 bg-mint rounded-xl">
                          <span className="text-xl">{h.emoji}</span>
                          <span className="font-medium text-dark">{h.name}</span>
                          <span className="ml-auto text-sage text-sm font-semibold">✓</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {missedHabits.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-muted mb-2">Missed ({missedHabits.length})</p>
                    <div className="space-y-2">
                      {missedHabits.map((h) => (
                        <div key={h.id} className="flex items-center gap-3 px-3 py-2 bg-cream rounded-xl">
                          <span className="text-xl opacity-50">{h.emoji}</span>
                          <span className="font-medium text-muted">{h.name}</span>
                          <span className="ml-auto text-gray-300 text-sm">—</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {completedHabits.length === 0 && missedHabits.length === 0 && (
                  <p className="text-muted text-center py-4">No habits scheduled on this day</p>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Monthly Stats */}
      <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-sm text-dark mb-4">{getMonthName(viewMonth)} Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted text-sm">Perfect Days</span>
            <span className="font-bold text-sage">{perfectDays} ✓</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted text-sm">Completion Rate</span>
            <span className="font-bold text-forest">{completionRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted text-sm">Best Streak</span>
            <span className="font-bold text-peach">{bestStreak} days 🔥</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted justify-center">
        <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-sage/30 border-2 border-sage" /><span>All done</span></div>
        <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-peach/10 border-2 border-peach-light" /><span>Partial</span></div>
        <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-cream border border-gray-200" /><span>Missed</span></div>
      </div>
    </div>
  );
}

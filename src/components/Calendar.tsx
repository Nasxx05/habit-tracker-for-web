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
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    setSelectedDate(null);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Compute which dates had completions
  const getCompletionStatus = (dateStr: string): 'all' | 'partial' | 'none' => {
    const relevantHabits = selectedHabitId === 'all'
      ? habits
      : habits.filter((h) => h.id === selectedHabitId);

    if (relevantHabits.length === 0) return 'none';

    const completed = relevantHabits.filter((h) =>
      h.completionDates.includes(dateStr)
    ).length;

    if (completed === relevantHabits.length) return 'all';
    if (completed > 0) return 'partial';
    return 'none';
  };

  // Monthly stats
  const relevantHabits = selectedHabitId === 'all'
    ? habits
    : habits.filter((h) => h.id === selectedHabitId);

  let perfectDays = 0;
  let totalCompletions = 0;
  let totalPossible = 0;
  let bestStreak = 0;
  let currentRunStreak = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(new Date(viewYear, viewMonth, day));
    if (dateStr > todayStr) break;

    const completedCount = relevantHabits.filter((h) =>
      h.completionDates.includes(dateStr)
    ).length;

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

  const completionRate = totalPossible > 0
    ? Math.round((totalCompletions / totalPossible) * 100)
    : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-24">
      {/* Habit filter */}
      {habits.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedHabitId('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              selectedHabitId === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Habits
          </button>
          {habits.map((habit) => (
            <button
              key={habit.id}
              onClick={() => setSelectedHabitId(habit.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                selectedHabitId === habit.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {habit.emoji} {habit.name}
            </button>
          ))}
        </div>
      )}

      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={prevMonth}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-xl transition cursor-pointer"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          {getMonthName(viewMonth)} {viewYear}
        </h2>
        <button
          onClick={nextMonth}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-xl transition cursor-pointer"
        >
          →
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before start of month */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = formatDate(new Date(viewYear, viewMonth, day));
          const isFuture = dateStr > todayStr;
          const isToday = dateStr === todayStr;
          const status = isFuture ? 'future' : getCompletionStatus(dateStr);

          return (
            <button
              key={day}
              disabled={isFuture}
              onClick={() => !isFuture && setSelectedDate(selectedDate === dateStr ? null : dateStr)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition cursor-pointer disabled:cursor-default ${
                status === 'all'
                  ? 'bg-green-100 border-2 border-green-400'
                  : status === 'partial'
                    ? 'bg-yellow-50 border-2 border-yellow-300'
                    : status === 'none'
                      ? 'bg-gray-50 border border-gray-200'
                      : 'bg-white border border-gray-100'
              } ${isToday ? 'ring-2 ring-purple-500 ring-offset-1' : ''} ${
                selectedDate === dateStr ? 'ring-2 ring-blue-500 ring-offset-1' : ''
              }`}
            >
              <span
                className={`text-xs font-semibold ${
                  isFuture ? 'text-gray-300' : isToday ? 'text-purple-600' : 'text-gray-700'
                }`}
              >
                {day}
              </span>
              {!isFuture && (
                <span className="text-xs mt-0.5">
                  {status === 'all' ? '✓' : status === 'partial' ? '·' : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Detail */}
      {selectedDate && (
        <div className="mt-6 bg-white border-2 border-blue-200 rounded-2xl p-5 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-900">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-lg cursor-pointer"
            >
              ×
            </button>
          </div>
          {(() => {
            const completedHabits = habits.filter((h) =>
              h.completionDates.includes(selectedDate)
            );
            const missedHabits = habits.filter(
              (h) => !h.completionDates.includes(selectedDate) && h.createdAt.split('T')[0] <= selectedDate
            );

            return (
              <div className="space-y-3">
                {completedHabits.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-green-600 mb-2">
                      Completed ({completedHabits.length})
                    </p>
                    <div className="space-y-2">
                      {completedHabits.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center gap-3 px-3 py-2 bg-green-50 rounded-xl"
                        >
                          <span className="text-xl">{h.emoji}</span>
                          <span className="font-medium text-gray-800">{h.name}</span>
                          <span className="ml-auto text-green-500 text-sm font-semibold">✓</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {missedHabits.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-400 mb-2">
                      Missed ({missedHabits.length})
                    </p>
                    <div className="space-y-2">
                      {missedHabits.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl"
                        >
                          <span className="text-xl opacity-50">{h.emoji}</span>
                          <span className="font-medium text-gray-400">{h.name}</span>
                          <span className="ml-auto text-gray-300 text-sm">—</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {completedHabits.length === 0 && missedHabits.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No habits tracked on this day</p>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Monthly Stats */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4">
          {getMonthName(viewMonth)} Stats
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Perfect Days</span>
            <span className="font-bold text-green-600">{perfectDays} ✓</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Completion Rate</span>
            <span className="font-bold text-blue-600">{completionRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Best Streak</span>
            <span className="font-bold text-orange-500">{bestStreak} days 🔥</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 justify-center">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-400" />
          <span>All done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-yellow-50 border-2 border-yellow-300" />
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200" />
          <span>Missed</span>
        </div>
      </div>
    </div>
  );
}

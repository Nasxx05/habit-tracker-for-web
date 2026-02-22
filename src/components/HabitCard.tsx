import { useState } from 'react';
import confetti from 'canvas-confetti';
import type { Habit } from '../types/habit';
import { useHabits } from '../context/HabitContext';
import { getToday } from '../utils/dateHelpers';

interface HabitCardProps {
  habit: Habit;
  tutorialTarget?: boolean;
}

export default function HabitCard({ habit, tutorialTarget }: HabitCardProps) {
  const { toggleHabit, selectHabit, toggleSkipDay } = useHabits();
  const [isAnimating, setIsAnimating] = useState(false);

  const todayStr = getToday();
  const isSkippedToday = (habit.skipDates || []).includes(todayStr);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSkippedToday) return;
    if (!habit.isCompletedToday) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);
      const newStreak = habit.currentStreak + 1;
      if (newStreak === 7 || newStreak === 30 || newStreak === 100 || newStreak === 365) {
        setTimeout(() => {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }, 200);
      }
    }
    toggleHabit(habit.id);
  };

  const handleSkipToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSkipDay(habit.id, todayStr);
  };

  const handleCardClick = () => {
    selectHabit(habit.id);
  };

  const subtitle = isSkippedToday
    ? 'Rest Day — streak protected'
    : habit.isCompletedToday
      ? `${habit.target || habit.category} · Done`
      : `${habit.target || habit.category} · Not started`;

  return (
    <div
      onClick={handleCardClick}
      className={`relative bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 ${
        isAnimating ? 'scale-[1.02]' : ''
      } ${isSkippedToday ? 'opacity-60' : ''}`}
    >
      {/* Skip button */}
      <div className="absolute top-3 right-3">
        <button
          onClick={handleSkipToggle}
          className="w-7 h-7 flex items-center justify-center rounded-full text-xs text-muted hover:bg-mint hover:text-forest transition cursor-pointer opacity-40 hover:opacity-100"
          aria-label={isSkippedToday ? 'Remove skip' : 'Skip today'}
          title={isSkippedToday ? 'Remove rest day' : 'Mark as rest day'}
        >
          💤
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-mint rounded-xl flex items-center justify-center text-2xl shrink-0">
          {habit.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-dark truncate">{habit.name}</h3>
          <p className="text-xs text-muted mt-0.5">{subtitle}</p>
        </div>

        <button
          onClick={handleToggle}
          disabled={isSkippedToday}
          data-tutorial={tutorialTarget ? 'complete-btn' : undefined}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer ${
            isSkippedToday
              ? 'bg-peach-light text-peach cursor-not-allowed'
              : habit.isCompletedToday
                ? 'bg-sage text-white shadow-sm'
                : 'border-2 border-sage-light text-sage hover:border-sage hover:bg-mint'
          } ${isAnimating ? 'animate-bounce-once' : ''}`}
          aria-label={habit.isCompletedToday ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isSkippedToday ? '💤' : habit.isCompletedToday ? '✓' : '+'}
        </button>
      </div>

      {/* Streak indicator */}
      {habit.currentStreak > 0 && !isSkippedToday && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-xs">🔥</span>
          <span className="text-xs font-semibold text-peach">{habit.currentStreak} day streak</span>
        </div>
      )}
    </div>
  );
}

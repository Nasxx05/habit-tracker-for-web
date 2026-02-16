import { useState } from 'react';
import confetti from 'canvas-confetti';
import type { Habit } from '../types/habit';
import { useHabits } from '../context/HabitContext';

interface HabitCardProps {
  habit: Habit;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const { toggleHabit, deleteHabit } = useHabits();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleToggle = () => {
    if (!habit.isCompletedToday) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);

      // Check for milestone celebrations
      const newStreak = habit.currentStreak + 1;
      if (newStreak === 7 || newStreak === 30 || newStreak === 100 || newStreak === 365) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }, 200);
      }
    }
    toggleHabit(habit.id);
  };

  const streakFires = habit.currentStreak >= 30
    ? '🔥🔥🔥🔥'
    : habit.currentStreak >= 14
      ? '🔥🔥🔥'
      : habit.currentStreak >= 7
        ? '🔥🔥'
        : '🔥';

  return (
    <div
      className={`relative rounded-2xl p-4 mb-3 transition-all duration-300 ${
        habit.isCompletedToday
          ? 'bg-green-50 border-2 border-green-400 shadow-md shadow-green-100'
          : 'bg-gray-50 border-2 border-gray-200 hover:shadow-md'
      } ${isAnimating ? 'scale-[1.02] -translate-y-0.5' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex justify-between items-center gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-semibold flex items-center gap-2 ${
              habit.isCompletedToday ? 'text-gray-900' : 'text-gray-600'
            }`}
          >
            <span className="text-2xl shrink-0">{habit.emoji}</span>
            <span className="truncate">{habit.name}</span>
          </h3>
          <p
            className={`mt-1 font-semibold text-sm ${
              habit.isCompletedToday ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            {habit.currentStreak > 0 ? (
              <>
                {streakFires} {habit.currentStreak} day{habit.currentStreak !== 1 ? 's' : ''}
              </>
            ) : (
              'No streak yet — start today!'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {showActions && (
            <button
              onClick={() => deleteHabit(habit.id)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
              aria-label="Delete habit"
            >
              🗑️
            </button>
          )}
          <button
            onClick={handleToggle}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm transition-all duration-300 shrink-0 cursor-pointer ${
              habit.isCompletedToday
                ? 'bg-green-500 text-white shadow-green-200 shadow-md'
                : 'bg-white border-2 border-gray-300 hover:border-purple-400'
            } ${isAnimating ? 'animate-bounce-once' : ''}`}
            aria-label={habit.isCompletedToday ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {habit.isCompletedToday ? '✓' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

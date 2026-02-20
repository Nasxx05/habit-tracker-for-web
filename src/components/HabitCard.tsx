import { useState } from 'react';
import confetti from 'canvas-confetti';
import type { Habit } from '../types/habit';
import { useHabits } from '../context/HabitContext';
import EditHabitModal from './EditHabitModal';

interface HabitCardProps {
  habit: Habit;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const { toggleHabit, selectHabit } = useHabits();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const subtitle = habit.isCompletedToday
    ? `${habit.target || habit.category} · Done`
    : `${habit.target || habit.category} · Not started`;

  return (
    <>
      <div
        onClick={() => selectHabit(habit.id)}
        className={`relative bg-white rounded-2xl p-4 shadow-sm transition-all duration-300 cursor-pointer hover:shadow-md ${
          isAnimating ? 'scale-[1.02]' : ''
        }`}
      >
        {/* Edit button */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-xs text-muted hover:bg-mint hover:text-forest transition cursor-pointer opacity-0 hover:opacity-100 group-hover:opacity-100"
          style={{ opacity: undefined }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '0.4'; }}
          aria-label="Edit habit"
        >
          ✏️
        </button>

        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-12 h-12 bg-mint rounded-xl flex items-center justify-center text-2xl shrink-0">
            {habit.emoji}
          </div>

          {/* Name & subtitle */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-dark truncate">{habit.name}</h3>
            <p className="text-xs text-muted mt-0.5">{subtitle}</p>
          </div>

          {/* Status indicator */}
          <button
            onClick={handleToggle}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer ${
              habit.isCompletedToday
                ? 'bg-sage text-white shadow-sm'
                : 'border-2 border-sage-light text-sage hover:border-sage hover:bg-mint'
            } ${isAnimating ? 'animate-bounce-once' : ''}`}
            aria-label={habit.isCompletedToday ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {habit.isCompletedToday ? '✓' : '+'}
          </button>
        </div>
      </div>

      <EditHabitModal habit={habit} isOpen={showEdit} onClose={() => setShowEdit(false)} />
    </>
  );
}

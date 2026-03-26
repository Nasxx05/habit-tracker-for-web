import { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { Habit } from '../types/habit';
import { useHabits } from '../context/HabitContext';
import CompletionCelebration from './CompletionCelebration';
import PersonalDetailsModal from './PersonalDetailsModal';

interface HabitCardProps {
  habit: Habit;
  tutorialTarget?: boolean;
}

export default function HabitCard({ habit, tutorialTarget }: HabitCardProps) {
  const { toggleHabit, selectHabit, hasCollectedDetails } = useHabits();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const wasFirstCompletionRef = useRef(false);

  const hasFreezeActive = habit.freezeDates && habit.freezeDates.length > 0 && habit.currentStreak > 0 && !habit.isCompletedToday;
  const isInComeback = habit.currentStreak === 0 && habit.longestStreak > 2 && habit.completionDates.length > 0 && !habit.isCompletedToday;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!habit.isCompletedToday) {
      wasFirstCompletionRef.current = habit.completionDates.length === 0;
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);
      const newStreak = habit.currentStreak + 1;
      if (newStreak === 7 || newStreak === 30 || newStreak === 100 || newStreak === 365) {
        setTimeout(() => {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }, 200);
      }
      setTimeout(() => setShowCelebration(true), 350);
    }
    toggleHabit(habit.id);
  };

  const handleCardClick = () => {
    selectHabit(habit.id);
  };

  const subtitle = habit.isCompletedToday
    ? `${habit.target || habit.category} · Done`
    : `${habit.target || habit.category} · Not started`;

  return (
    <div
      onClick={handleCardClick}
      className={`relative bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 ${
        isAnimating ? 'scale-[1.02]' : ''
      }`}
    >
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
          data-tutorial={tutorialTarget ? 'complete-btn' : undefined}
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

      {/* Streak indicator */}
      {habit.currentStreak > 0 && (
        <div className="mt-2 flex items-center gap-1">
          {hasFreezeActive ? (
            <>
              <span className="text-xs">🧊</span>
              <span className="text-xs font-semibold text-blue-400">{habit.currentStreak} day streak (freeze active)</span>
            </>
          ) : (
            <>
              <span className="text-xs">🔥</span>
              <span className="text-xs font-semibold text-peach">{habit.currentStreak} day streak</span>
            </>
          )}
        </div>
      )}

      {/* Comeback mode indicator */}
      {isInComeback && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-xs">🔄</span>
          <span className="text-xs font-semibold text-peach">
            Get back to {habit.longestStreak} days 💪
          </span>
        </div>
      )}

      <CompletionCelebration
        habit={habit}
        isOpen={showCelebration}
        onClose={() => {
          setShowCelebration(false);
          if (!hasCollectedDetails && wasFirstCompletionRef.current) {
            setTimeout(() => setShowDetailsModal(true), 300);
          }
        }}
      />

      <PersonalDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
}

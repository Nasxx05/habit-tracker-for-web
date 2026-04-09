import { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { Habit } from '../types/habit';
import { useHabits } from '../context/HabitContext';
import { getToday } from '../utils/dateHelpers';
import CompletionCelebration from './CompletionCelebration';
import PersonalDetailsModal from './PersonalDetailsModal';

interface HabitCardProps {
  habit: Habit;
  tutorialTarget?: boolean;
}

export default function HabitCard({ habit, tutorialTarget }: HabitCardProps) {
  const { toggleHabit, incrementHabit, selectHabit, hasCollectedDetails } = useHabits();
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

  const today = getToday();
  const isQuantitative = !!(habit.targetCount && habit.targetCount > 0);
  const todayCount = habit.progressByDate?.[today] || 0;
  const progressPct = isQuantitative ? Math.min(100, Math.round((todayCount / (habit.targetCount as number)) * 100)) : 0;

  const subtitle = isQuantitative
    ? `${todayCount}/${habit.targetCount} ${habit.target || habit.category}`
    : habit.isCompletedToday
      ? `${habit.target || habit.category} · Done`
      : `${habit.target || habit.category} · Not started`;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const willComplete = todayCount + 1 >= (habit.targetCount as number);
    if (willComplete && !habit.isCompletedToday) {
      wasFirstCompletionRef.current = habit.completionDates.length === 0;
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);
      setTimeout(() => setShowCelebration(true), 350);
    }
    incrementHabit(habit.id, 1);
  };

  return (
    <div
      onClick={handleCardClick}
      style={habit.color ? { borderLeft: `4px solid ${habit.color}` } : undefined}
      className={`relative bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 ${
        isAnimating ? 'scale-[1.02]' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${habit.color ? '' : 'bg-mint'}`}
          style={habit.color ? { backgroundColor: `${habit.color}33` } : undefined}
        >
          {habit.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-dark truncate">{habit.name}</h3>
          <p className="text-xs text-muted mt-0.5">{subtitle}</p>
        </div>

        <button
          onClick={isQuantitative ? handleIncrement : handleToggle}
          data-tutorial={tutorialTarget ? 'complete-btn' : undefined}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer ${
            habit.isCompletedToday
              ? 'bg-sage text-white shadow-sm'
              : 'border-2 border-sage-light text-sage hover:border-sage hover:bg-mint'
          } ${isAnimating ? 'animate-bounce-once' : ''}`}
          aria-label={isQuantitative ? 'Add one' : habit.isCompletedToday ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {habit.isCompletedToday ? '✓' : isQuantitative ? '+1' : '+'}
        </button>
      </div>

      {/* Progress bar for quantitative habits */}
      {isQuantitative && (
        <div className="mt-3 w-full h-1.5 bg-cream rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${progressPct}%`, backgroundColor: habit.color || 'var(--color-sage)' }}
          />
        </div>
      )}

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

import { useState, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type { Habit } from '../types/habit';
import { useHabits } from '../context/HabitContext';
import { getToday } from '../utils/dateHelpers';
import EditHabitModal from './EditHabitModal';

const SWIPE_THRESHOLD = 40;
const SWIPE_OPEN_X = -80;

interface HabitCardProps {
  habit: Habit;
  tutorialTarget?: boolean;
}

export default function HabitCard({ habit, tutorialTarget }: HabitCardProps) {
  const { toggleHabit, selectHabit, toggleSkipDay } = useHabits();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);
  const isHorizontal = useRef<boolean | null>(null);

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

  // Swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = true;
    isHorizontal.current = null;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Determine swipe direction on first significant movement
    if (isHorizontal.current === null) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isHorizontal.current = Math.abs(dx) > Math.abs(dy);
      }
      return;
    }

    if (!isHorizontal.current) return; // vertical scroll, ignore

    const base = isOpen ? SWIPE_OPEN_X : 0;
    const newX = Math.min(0, Math.max(SWIPE_OPEN_X - 10, base + dx));
    setSwipeX(newX);
  }, [isOpen]);

  const handleTouchEnd = useCallback(() => {
    isSwiping.current = false;
    if (isHorizontal.current === false) return; // was vertical scroll

    if (isOpen) {
      // If already open, close if swiped right enough
      if (swipeX > SWIPE_OPEN_X + SWIPE_THRESHOLD) {
        setSwipeX(0);
        setIsOpen(false);
      } else {
        setSwipeX(SWIPE_OPEN_X);
      }
    } else {
      // If closed, open if swiped left enough
      if (swipeX < -SWIPE_THRESHOLD) {
        setSwipeX(SWIPE_OPEN_X);
        setIsOpen(true);
      } else {
        setSwipeX(0);
      }
    }
  }, [isOpen, swipeX]);

  const handleCardClick = () => {
    if (isOpen) {
      setSwipeX(0);
      setIsOpen(false);
      return;
    }
    selectHabit(habit.id);
  };

  const subtitle = isSkippedToday
    ? 'Rest Day — streak protected'
    : habit.isCompletedToday
      ? `${habit.target || habit.category} · Done`
      : `${habit.target || habit.category} · Not started`;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        {/* Edit action revealed on swipe */}
        <div className="absolute right-0 top-0 bottom-0 w-[80px] bg-forest flex items-center justify-center z-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEdit(true);
              setSwipeX(0);
              setIsOpen(false);
            }}
            className="flex flex-col items-center gap-1 text-white cursor-pointer"
            aria-label="Edit habit"
          >
            <span className="text-lg">✏️</span>
            <span className="text-xs font-medium">Edit</span>
          </button>
        </div>

        {/* Swipeable card content */}
        <div
          onClick={handleCardClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md z-10 ${
            isAnimating ? 'scale-[1.02]' : ''
          } ${isSkippedToday ? 'opacity-60' : ''}`}
          style={{
            transform: `translateX(${swipeX}px)`,
            transition: isSwiping.current ? 'none' : 'transform 0.3s ease-out',
          }}
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
      </div>

      <EditHabitModal habit={habit} isOpen={showEdit} onClose={() => setShowEdit(false)} />
    </>
  );
}

import { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { Habit } from '../types/habit';
import { useHabits } from '../context/HabitContext';
import { getToday } from '../utils/dateHelpers';
import CompletionCelebration from './CompletionCelebration';
import PersonalDetailsModal from './PersonalDetailsModal';
import HabitGlyph, { getGlyphForHabit } from './HabitGlyph';
import { TrendBars } from './DataViz';
import { IconFlame, IconCheck, IconPlus, IconClock, IconSnowflake } from './Icons';

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
  const { shape, color } = getGlyphForHabit(habit.emoji, habit.category, habit.glyphShape, habit.glyphColor);

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
  const isPartialQuant = isQuantitative && !habit.isCompletedToday;

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
      style={{
        background: 'var(--color-card)',
        borderRadius: 18,
        padding: '14px 14px 12px',
        boxShadow: '0 1px 2px rgba(30,35,31,.04)',
        border: '1px solid rgba(30,35,31,.08)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transform: isAnimating ? 'scale(1.02)' : 'none',
        transition: 'transform .3s, box-shadow .2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <HabitGlyph shape={shape} color={color} size={44} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {habit.name}
            </div>
            {habit.currentStreak >= 7 && !hasFreezeActive && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: 'var(--color-terracotta)', flexShrink: 0 }} className="tnum">
                <IconFlame size={11} />{habit.currentStreak}
              </div>
            )}
            {hasFreezeActive && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: 'var(--color-ice)', flexShrink: 0 }} className="tnum">
                <IconSnowflake size={11} />{habit.currentStreak}
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
            {habit.target && <span>{habit.target}</span>}
            {habit.target && habit.category && <span style={{ width: 2, height: 2, borderRadius: 1, background: 'var(--color-ink-4)', display: 'inline-block' }} />}
            <span>{habit.category}</span>
            {habit.reminderTime && (
              <>
                <span style={{ width: 2, height: 2, borderRadius: 1, background: 'var(--color-ink-4)', display: 'inline-block' }} />
                <span className="tnum" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <IconClock size={10} />{habit.reminderTime}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Complete button */}
        {habit.isCompletedToday ? (
          <button
            onClick={handleToggle}
            data-tutorial={tutorialTarget ? 'complete-btn' : undefined}
            style={{
              width: 44, height: 44, borderRadius: 22,
              background: 'var(--color-forest)',
              color: '#F5F2E8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 10px color-mix(in oklch, var(--color-forest) 25%, transparent)',
              flexShrink: 0,
            }}
            className={isAnimating ? 'animate-bounce-once' : ''}
          >
            <IconCheck size={20} />
          </button>
        ) : isPartialQuant ? (
          <button
            onClick={handleIncrement}
            data-tutorial={tutorialTarget ? 'complete-btn' : undefined}
            style={{
              width: 44, height: 44, borderRadius: 22,
              border: `1.5px solid ${color}`,
              background: `color-mix(in oklch, ${color} 12%, transparent)`,
              color: color,
              fontWeight: 700, fontSize: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
            className="tnum"
          >
            +1
          </button>
        ) : (
          <button
            onClick={handleToggle}
            data-tutorial={tutorialTarget ? 'complete-btn' : undefined}
            style={{
              width: 44, height: 44, borderRadius: 22,
              border: '1.5px solid rgba(30,35,31,.14)',
              background: 'transparent',
              color: 'var(--color-ink-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <IconPlus size={18} />
          </button>
        )}
      </div>

      {/* Bottom row: trend bars + count */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <TrendBars completedDates={habit.completionDates} schedule={habit.schedule} days={14} />
        {isPartialQuant ? (
          <div style={{ fontSize: 10, color: 'var(--color-ink-3)', fontWeight: 600 }} className="tnum">
            <span style={{ color: 'var(--color-ink)', fontSize: 12, fontWeight: 700 }}>{todayCount}</span>/{habit.targetCount} today
          </div>
        ) : (
          <div style={{ fontSize: 10, color: 'var(--color-ink-4)', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            Last 14d
          </div>
        )}
      </div>

      {/* Partial progress underline bar */}
      {isPartialQuant && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, width: `${progressPct}%`, background: color, transition: 'width .5s' }} />
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

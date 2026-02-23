import { useState, useEffect } from 'react';
import type { Habit } from '../types/habit';

interface CompletionCelebrationProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
}

const MOODS = [
  { emoji: '😫', label: 'Tough' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😊', label: 'Great' },
  { emoji: '🔥', label: 'Amazing' },
];

const QUOTES = [
  '"Small daily improvements over time lead to stunning results."',
  '"Success is the sum of small efforts repeated day in and day out."',
  '"You don\'t have to be extreme, just consistent."',
  '"The secret of getting ahead is getting started."',
  '"Every day is a chance to get better."',
  '"Motivation gets you started. Habit keeps you going."',
  '"It\'s not about perfect. It\'s about effort."',
  '"One day or day one. You decide."',
];

export default function CompletionCelebration({ habit, isOpen, onClose }: CompletionCelebrationProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [closing, setClosing] = useState(false);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedMood(null);
      setClosing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 250);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Bottom Sheet */}
      <div
        className={`relative w-full max-w-lg bg-white rounded-t-3xl px-6 pt-3 pb-8 ${closing ? 'celebration-sheet-out' : 'celebration-sheet-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center mb-5">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Habit emoji + celebration */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-mint rounded-2xl text-4xl mb-3">
            {habit.emoji}
          </div>
          <h2 className="text-2xl font-bold text-dark">Amazing work!</h2>
          <p className="text-muted text-sm mt-1">
            You completed <span className="font-semibold text-forest">{habit.name}</span>
          </p>
        </div>

        {/* Mood Picker */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-dark text-center mb-3">How did it feel?</p>
          <div className="flex justify-center gap-3">
            {MOODS.map((mood, i) => (
              <button
                key={mood.emoji}
                onClick={() => setSelectedMood(i)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-200 cursor-pointer ${
                  selectedMood === i
                    ? 'ring-2 ring-forest ring-offset-2 bg-mint scale-110'
                    : 'bg-cream hover:bg-mint hover:scale-105'
                }`}
                aria-label={mood.label}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="mt-6 px-4">
          <p className="text-sm text-muted text-center italic leading-relaxed">{quote}</p>
        </div>

        {/* Streak callout */}
        {habit.currentStreak > 0 && (
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <span className="text-sm">🔥</span>
            <span className="text-sm font-bold text-peach">{habit.currentStreak} day streak!</span>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleClose}
          className="mt-6 w-full py-3.5 bg-forest text-white font-semibold rounded-2xl hover:bg-forest/90 transition cursor-pointer text-base"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

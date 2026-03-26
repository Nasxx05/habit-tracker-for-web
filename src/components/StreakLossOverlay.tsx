import { useEffect, useState } from 'react';

interface StreakLossOverlayProps {
  streakCount: number;
  habitName: string;
  habitEmoji: string;
  onDismiss: () => void;
}

export default function StreakLossOverlay({ streakCount, habitName, habitEmoji, onDismiss }: StreakLossOverlayProps) {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');

  useEffect(() => {
    requestAnimationFrame(() => setPhase('visible'));
  }, []);

  const handleDismiss = () => {
    setPhase('exit');
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${
        phase === 'enter' ? 'opacity-0' : phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleDismiss}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className={`relative bg-white rounded-3xl p-6 mx-6 max-w-sm w-full shadow-2xl transition-all duration-300 ${
          phase === 'visible' ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Flame going out animation */}
        <div className="text-center mb-4">
          <div className="streak-loss-flame text-5xl mb-2">
            🔥
          </div>
          <div className="streak-loss-smoke text-3xl opacity-0">
            💨
          </div>
        </div>

        <div className="text-center">
          <div className="streak-loss-counter text-4xl font-bold text-dark mb-2">
            {streakCount}
          </div>
          <p className="text-sm text-muted mb-1">day streak ended</p>
          <p className="text-xs text-muted mb-4">
            {habitEmoji} {habitName}
          </p>

          <div className="bg-mint rounded-2xl p-4 mb-4">
            <p className="text-sm font-semibold text-forest">
              Don't wait — start fresh today.
            </p>
            <p className="text-xs text-muted mt-1">
              Every streak started at day 1
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full bg-forest text-white font-semibold py-3 rounded-full hover:bg-forest/90 transition cursor-pointer"
          >
            Let's go 💪
          </button>
        </div>
      </div>
    </div>
  );
}

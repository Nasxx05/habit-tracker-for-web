import { useEffect, useState } from 'react';
import { MILESTONE_LABELS } from '../utils/streakCalculator';

interface StreakBadgeToastProps {
  milestone: number;
  habitName: string;
  habitEmoji: string;
  onDismiss: () => void;
}

export default function StreakBadgeToast({ milestone, habitName, habitEmoji, onDismiss }: StreakBadgeToastProps) {
  const [visible, setVisible] = useState(false);
  const info = MILESTONE_LABELS[milestone];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!info) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-lg border border-peach-light p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-peach-light to-peach rounded-full flex items-center justify-center text-2xl badge-pop">
            {info.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-peach tracking-wider">NEW BADGE UNLOCKED!</p>
            <p className="text-sm font-bold text-dark mt-0.5">{info.label}</p>
            <p className="text-xs text-muted mt-0.5">
              {habitEmoji} {habitName} · {milestone}-day streak
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

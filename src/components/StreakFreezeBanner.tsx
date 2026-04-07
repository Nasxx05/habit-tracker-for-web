import { useEffect, useState } from 'react';

interface StreakFreezeBannerProps {
  habitName: string;
  habitEmoji: string;
  freezesLeft: number;
  onDismiss: () => void;
}

export default function StreakFreezeBanner({ habitName, habitEmoji, freezesLeft, onDismiss }: StreakFreezeBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-lg border border-blue-100 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-xl">
            🧊
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-dark">🧊 Streak freeze used!</p>
            <p className="text-xs text-muted mt-0.5">
              {habitEmoji} {habitName} preserved · You have {freezesLeft} left this week.
            </p>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="text-muted text-lg cursor-pointer hover:text-dark"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

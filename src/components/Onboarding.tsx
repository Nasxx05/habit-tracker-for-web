import { useState, useRef, useCallback, useEffect } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const totalScreens = 3;

  const goTo = useCallback((index: number) => {
    if (isAnimating || index === currentScreen || index < 0 || index >= totalScreens) return;
    setDirection(index > currentScreen ? 'left' : 'right');
    setIsAnimating(true);
    setCurrentScreen(index);
  }, [currentScreen, isAnimating]);

  const next = useCallback(() => {
    if (currentScreen < totalScreens - 1) {
      goTo(currentScreen + 1);
    } else {
      onComplete();
    }
  }, [currentScreen, goTo, onComplete]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentScreen < totalScreens - 1) {
        goTo(currentScreen + 1);
      } else if (diff < 0 && currentScreen > 0) {
        goTo(currentScreen - 1);
      }
    }
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft' && currentScreen > 0) goTo(currentScreen - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen, next, goTo]);

  const animationClass = direction === 'left' ? 'onboarding-slide-left' : 'onboarding-slide-right';

  return (
    <div
      className="min-h-dvh flex flex-col overflow-hidden"
      style={{ background: '#F5F5F0' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip button */}
      {currentScreen < 2 && (
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 z-10 text-muted font-medium px-4 py-2 rounded-full hover:bg-white/60 transition-colors cursor-pointer"
          style={{ fontSize: '0.95rem' }}
        >
          Skip
        </button>
      )}

      {/* Screen content */}
      <div className="flex-1 flex items-center justify-center px-10 md:px-14">
        <div key={currentScreen} className={`w-full max-w-sm text-center ${animationClass}`}>
          {currentScreen === 0 && <Screen1 />}
          {currentScreen === 1 && <Screen2 />}
          {currentScreen === 2 && <Screen3 />}
        </div>
      </div>

      {/* Bottom area: button + dots */}
      <div className="pb-12 px-10 md:px-14 flex flex-col items-center gap-8">
        {/* Action button */}
        {currentScreen === 0 && (
          <button
            onClick={next}
            className="w-full max-w-sm py-4 rounded-full font-semibold text-base transition-all duration-200 cursor-pointer hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: '#2D4A3E', color: '#fff' }}
          >
            Next →
          </button>
        )}
        {currentScreen === 1 && (
          <button
            onClick={next}
            className="w-full max-w-sm py-4 rounded-full font-semibold text-base transition-all duration-200 cursor-pointer hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: '#2C2C2C', color: '#fff' }}
          >
            Continue →
          </button>
        )}
        {currentScreen === 2 && (
          <button
            onClick={onComplete}
            className="w-full max-w-sm py-4 rounded-full font-semibold text-base transition-all duration-200 cursor-pointer hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: '#fff', color: '#2D4A3E', border: '2px solid #2D4A3E' }}
          >
            Get Started →
          </button>
        )}

        {/* Progress dots */}
        <div className="flex items-center gap-2.5">
          {Array.from({ length: totalScreens }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full cursor-pointer border-none p-0"
              style={{
                width: i === currentScreen ? '24px' : '8px',
                height: '8px',
                backgroundColor: i === currentScreen ? '#2D4A3E' : '#c3d9cf',
              }}
              aria-label={`Go to screen ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Individual Screens ---------- */

function Screen1() {
  return (
    <>
      {/* Circular illustration with plant leaves */}
      <div className="mx-auto mb-10" style={{ width: '160px', height: '160px' }}>
        <svg viewBox="0 0 160 160" width="160" height="160">
          {/* Beige circle background */}
          <circle cx="80" cy="80" r="78" fill="#E8DCCC" />
          {/* Stem */}
          <path d="M80 120 Q80 90 80 65" stroke="#2D4A3E" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Left leaf */}
          <path d="M80 85 Q55 70 50 45 Q70 55 80 75" fill="#5A8F7B" />
          <path d="M80 85 Q60 72 55 50" stroke="#3D6B5A" strokeWidth="1" fill="none" />
          {/* Right leaf */}
          <path d="M80 75 Q105 55 115 35 Q95 50 80 65" fill="#7DB8A0" />
          <path d="M80 75 Q100 58 110 40" stroke="#5A9A80" strokeWidth="1" fill="none" />
          {/* Small top leaf */}
          <path d="M80 65 Q70 50 65 38 Q78 48 80 60" fill="#A8C5B8" />
          {/* Soil/base */}
          <ellipse cx="80" cy="120" rx="20" ry="6" fill="#C4A882" />
        </svg>
      </div>
      <h1
        className="text-3xl font-bold mb-3"
        style={{ color: '#2D4A3E', lineHeight: 1.3 }}
      >
        Welcome
      </h1>
      <p
        className="text-base leading-relaxed"
        style={{ color: '#8A8A8A' }}
      >
        Begin your journey to a calmer mind and better habits.
      </p>
    </>
  );
}

function Screen2() {
  return (
    <>
      {/* Decorative element */}
      <div className="mx-auto mb-10" style={{ width: '120px', height: '120px' }}>
        <svg viewBox="0 0 120 120" width="120" height="120">
          <circle cx="60" cy="60" r="55" fill="none" stroke="#A8C5B8" strokeWidth="1.5" strokeDasharray="6 4" />
          <circle cx="60" cy="60" r="40" fill="#EAF2ED" />
          <text x="60" y="68" textAnchor="middle" fontSize="36">🍃</text>
        </svg>
      </div>
      <h1
        className="text-3xl font-bold mb-1"
        style={{ color: '#2C2C2C', lineHeight: 1.3 }}
      >
        Your daily
      </h1>
      <p
        className="text-3xl mb-6"
        style={{ color: '#A8C5B8', fontStyle: 'italic', fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        rituals
      </p>
      <p
        className="text-base leading-relaxed"
        style={{ color: '#8A8A8A' }}
      >
        Cultivate consistency through gentle movements and mindful tracking.
      </p>
    </>
  );
}

function Screen3() {
  return (
    <>
      {/* Decorative element */}
      <div className="mx-auto mb-10" style={{ width: '120px', height: '120px' }}>
        <svg viewBox="0 0 120 120" width="120" height="120">
          <circle cx="60" cy="60" r="55" fill="#EAF2ED" />
          {/* Abstract balance symbol */}
          <line x1="35" y1="60" x2="85" y2="60" stroke="#2D4A3E" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="35" cy="60" r="8" fill="#A8C5B8" />
          <circle cx="85" cy="60" r="8" fill="#5A8F7B" />
          <line x1="60" y1="60" x2="60" y2="85" stroke="#2D4A3E" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="60" cy="42" r="5" fill="#2D4A3E" />
        </svg>
      </div>
      <h1
        className="text-3xl font-bold mb-3"
        style={{ color: '#2C2C2C', lineHeight: 1.3 }}
      >
        Find your daily balance
      </h1>
      <p
        className="text-base leading-relaxed"
        style={{ color: '#8A8A8A' }}
      >
        Take a deep breath. Start small.
      </p>
    </>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useHabits } from '../context/HabitContext';

interface TutorialStep {
  type: 'card' | 'spotlight';
  target?: string;
  title: string;
  message: string;
  emoji: string;
  buttonText: string;
  tooltipPosition?: 'above' | 'below';
  waitFor?: 'habit-added' | 'habit-completed';
}

const STEPS: TutorialStep[] = [
  {
    type: 'card',
    title: 'Your dashboard is ready!',
    message: "Let me show you around. It'll only take a moment.",
    emoji: '🎯',
    buttonText: "Let's go",
  },
  {
    type: 'spotlight',
    target: 'fab',
    title: 'Create a habit',
    message: 'Tap the + button to add your first habit',
    emoji: '👆',
    buttonText: 'Skip',
    tooltipPosition: 'above',
    waitFor: 'habit-added',
  },
  {
    type: 'spotlight',
    target: 'complete-btn',
    title: 'Complete it!',
    message: 'Tap the circle to mark your habit as done',
    emoji: '✅',
    buttonText: 'Skip',
    tooltipPosition: 'below',
    waitFor: 'habit-completed',
  },
  {
    type: 'card',
    title: 'You started a streak!',
    message: 'Complete habits daily to build longer streaks. Consistency is key!',
    emoji: '🔥',
    buttonText: 'Next',
  },
  {
    type: 'spotlight',
    target: 'bottom-nav',
    title: 'Explore the app',
    message: 'View your calendar, stats, and profile anytime',
    emoji: '🧭',
    buttonText: "I'm ready!",
    tooltipPosition: 'above',
  },
];

export default function TutorialGuide() {
  const { habits, completedToday } = useHabits();

  const [stepIndex, setStepIndex] = useState<number>(() => {
    if (localStorage.getItem('tutorialCompleted') === 'true') return -1;
    const saved = localStorage.getItem('tutorialStep');
    return saved !== null ? parseInt(saved) : 0;
  });

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [transitioning, setTransitioning] = useState(true);
  const prevHabitsRef = useRef(habits.length);
  const prevCompletedRef = useRef(completedToday);
  const animFrameRef = useRef(0);

  const finish = useCallback(() => {
    localStorage.setItem('tutorialCompleted', 'true');
    localStorage.removeItem('tutorialStep');
    setStepIndex(-1);
  }, []);

  const goTo = useCallback((next: number) => {
    setTransitioning(true);
    setTimeout(() => setStepIndex(next), 300);
  }, []);

  // Skip for existing users who already have habits
  useEffect(() => {
    if (stepIndex === 0 && habits.length > 0 && !localStorage.getItem('tutorialStep')) {
      finish();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist step
  useEffect(() => {
    if (stepIndex >= 0) {
      localStorage.setItem('tutorialStep', String(stepIndex));
    }
  }, [stepIndex]);

  // Show after a brief delay so dashboard can render first
  useEffect(() => {
    if (stepIndex < 0) return;
    setTransitioning(true);
    const t = setTimeout(() => setTransitioning(false), stepIndex === 0 ? 800 : 500);
    return () => clearTimeout(t);
  }, [stepIndex]);

  // Detect habit added → advance from step 1
  useEffect(() => {
    if (stepIndex === 1 && habits.length > prevHabitsRef.current) {
      goTo(2);
    }
    prevHabitsRef.current = habits.length;
  }, [habits.length, stepIndex, goTo]);

  // Detect habit completed → advance from step 2
  useEffect(() => {
    if (stepIndex === 2 && completedToday > prevCompletedRef.current) {
      goTo(3);
    }
    prevCompletedRef.current = completedToday;
  }, [completedToday, stepIndex, goTo]);

  // Track target element position with rAF
  useEffect(() => {
    const step = stepIndex >= 0 && stepIndex < STEPS.length ? STEPS[stepIndex] : null;
    if (!step || step.type !== 'spotlight' || !step.target) {
      setTargetRect(null);
      return;
    }

    const track = () => {
      const el = document.querySelector(`[data-tutorial="${step.target}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        setTargetRect((prev) => {
          if (
            !prev ||
            Math.abs(prev.top - r.top) > 0.5 ||
            Math.abs(prev.left - r.left) > 0.5 ||
            Math.abs(prev.width - r.width) > 0.5 ||
            Math.abs(prev.height - r.height) > 0.5
          ) {
            return r;
          }
          return prev;
        });
      } else {
        setTargetRect(null);
      }
      animFrameRef.current = requestAnimationFrame(track);
    };

    const delay = setTimeout(track, 100);
    return () => {
      clearTimeout(delay);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [stepIndex]);

  const advance = useCallback(() => {
    if (stepIndex < STEPS.length - 1) {
      goTo(stepIndex + 1);
    } else {
      finish();
    }
  }, [stepIndex, goTo, finish]);

  if (stepIndex < 0 || stepIndex >= STEPS.length || transitioning) return null;

  const step = STEPS[stepIndex];

  // ── Centered card steps ──
  if (step.type === 'card') {
    return (
      <div key={stepIndex} className="fixed inset-0 z-[45] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 animate-fade-in" />
        <div className="relative bg-white rounded-3xl p-8 mx-6 max-w-sm w-full shadow-2xl tutorial-card-enter">
          <div className="text-center">
            <div className="text-5xl mb-4">{step.emoji}</div>
            <h3 className="text-xl font-bold text-dark mb-2">{step.title}</h3>
            <p className="text-muted text-sm mb-6 leading-relaxed">{step.message}</p>
            <button
              onClick={advance}
              className="bg-forest text-white font-semibold px-8 py-3 rounded-full hover:bg-forest/90 active:scale-95 transition cursor-pointer"
            >
              {step.buttonText}
            </button>
            {stepIndex === 0 && (
              <button
                onClick={finish}
                className="block mx-auto mt-3 text-sm text-muted hover:text-dark transition cursor-pointer"
              >
                Skip tour
              </button>
            )}
          </div>
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex ? 'bg-forest w-4' : i < stepIndex ? 'bg-sage w-1.5' : 'bg-gray-200 w-1.5'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Spotlight steps ──
  if (!targetRect) return null;

  const pad = 10;
  const isAbove = step.tooltipPosition === 'above';

  return (
    <div key={stepIndex}>
      {/* Dimmed overlay with hole (non-waitFor only) */}
      {!step.waitFor && (
        <div
          className="fixed z-[44] animate-fade-in"
          style={{
            top: targetRect.top - pad,
            left: targetRect.left - pad,
            width: targetRect.width + pad * 2,
            height: targetRect.height + pad * 2,
            borderRadius: 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Pulsing ring around target */}
      <div
        className="fixed z-[44] pointer-events-none tutorial-pulse-ring"
        style={{
          top: targetRect.top - pad,
          left: targetRect.left - pad,
          width: targetRect.width + pad * 2,
          height: targetRect.height + pad * 2,
          borderRadius: 16,
          border: '2px solid rgba(168, 197, 184, 0.8)',
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[46]"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          ...(isAbove
            ? { bottom: window.innerHeight - targetRect.top + pad + 16 }
            : { top: targetRect.bottom + pad + 16 }),
        }}
      >
        <div className="bg-white rounded-2xl p-4 shadow-2xl w-[280px] relative tutorial-tooltip-enter">
          {/* Arrow */}
          <div
            className="absolute w-3 h-3 bg-white"
            style={{
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              ...(isAbove
                ? { bottom: -6, boxShadow: '2px 2px 4px rgba(0,0,0,0.1)' }
                : { top: -6, boxShadow: '-2px -2px 4px rgba(0,0,0,0.1)' }),
            }}
          />
          <h3 className="text-base font-bold text-dark mb-1">{step.title}</h3>
          <p className="text-sm text-muted mb-3">{step.message}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === stepIndex ? 'bg-forest w-4' : i < stepIndex ? 'bg-sage w-1.5' : 'bg-gray-200 w-1.5'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={step.waitFor ? finish : advance}
              className={`text-sm font-semibold transition cursor-pointer ${
                step.waitFor
                  ? 'text-muted hover:text-dark'
                  : 'bg-forest text-white px-4 py-1.5 rounded-full hover:bg-forest/90 active:scale-95'
              }`}
            >
              {step.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

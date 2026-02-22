import { useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { getGreeting } from '../utils/dateHelpers';
import Onboarding from './Onboarding';

export default function WelcomeScreen() {
  const { hasVisitedBefore, setHasVisitedBefore, setCurrentView, completedToday, totalHabits } = useHabits();
  const greeting = getGreeting();

  const handleContinue = () => {
    setHasVisitedBefore(true);
    setCurrentView('home');
  };

  useEffect(() => {
    if (hasVisitedBefore && totalHabits > 0) {
      const timer = setTimeout(handleContinue, 1500);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const progressPercent = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  // First-time visitors see the onboarding flow
  if (!hasVisitedBefore) {
    return <Onboarding onComplete={handleContinue} />;
  }

  // Returning visitors see the splash screen
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 text-white animate-fade-in cursor-pointer"
      style={{ background: 'linear-gradient(135deg, #2D4A3E 0%, #A8C5B8 100%)' }}
      onClick={handleContinue}
    >
      <p className="text-5xl mb-4">{greeting.emoji}</p>
      <h1 className="text-3xl font-bold mb-2">{greeting.text}!</h1>
      {totalHabits > 0 ? (
        <>
          <p className="text-white/80 text-lg mb-6">
            {completedToday === totalHabits
              ? "You've completed all habits today!"
              : `${completedToday} of ${totalHabits} habits done today`}
          </p>
          <div className="w-64 h-3 bg-white/20 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </>
      ) : (
        <p className="text-white/80 text-lg mb-8">Ready to build some habits?</p>
      )}
      <button
        onClick={handleContinue}
        className="bg-white text-forest font-semibold px-10 py-4 rounded-full text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer"
      >
        Continue →
      </button>
    </div>
  );
}

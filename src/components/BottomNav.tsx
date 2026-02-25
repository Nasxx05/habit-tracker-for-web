import { useHabits } from '../context/HabitContext';
import type { View } from '../types/habit';

export default function BottomNav() {
  const { currentView, setCurrentView } = useHabits();

  const leftItems: { view: View; label: string; icon: string }[] = [
    { view: 'home', label: 'Today', icon: '🏠' },
    { view: 'calendar', label: 'Calendar', icon: '📅' },
  ];

  const rightItems: { view: View; label: string; icon: string }[] = [
    { view: 'stats', label: 'Stats', icon: '📊' },
    { view: 'profile', label: 'Profile', icon: '👤' },
  ];

  const renderTab = (item: { view: View; label: string; icon: string }) => {
    const isActive = currentView === item.view || (item.view === 'home' && currentView === 'weekly-review');
    return (
      <button
        key={item.view}
        onClick={() => setCurrentView(item.view)}
        className="flex-1 flex items-center justify-center py-3 cursor-pointer"
      >
        <span className={`text-2xl ${isActive ? '' : 'opacity-40'}`}>{item.icon}</span>
      </button>
    );
  };

  return (
    <div data-tutorial="bottom-nav" className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="max-w-3xl mx-auto flex items-center relative">
        {leftItems.map(renderTab)}
        <div className="flex-1" />
        {rightItems.map(renderTab)}

        <div className="absolute inset-x-0 -top-6 flex justify-center pointer-events-none">
          <button
            data-tutorial="fab"
            onClick={() => {
              setCurrentView('home');
              window.dispatchEvent(new CustomEvent('open-add-habit'));
            }}
            className="pointer-events-auto w-14 h-14 bg-forest text-white rounded-full flex items-center justify-center text-2xl shadow-lg shadow-forest/30 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

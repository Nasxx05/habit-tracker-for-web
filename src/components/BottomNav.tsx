import { useHabits } from '../context/HabitContext';
import type { View } from '../types/habit';

export default function BottomNav() {
  const { currentView, setCurrentView } = useHabits();

  const navItems: { view: View; label: string; icon: string }[] = [
    { view: 'home', label: 'Today', icon: '🏠' },
    { view: 'calendar', label: 'Calendar', icon: '📅' },
    { view: 'stats', label: 'Stats', icon: '📊' },
    { view: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="max-w-3xl mx-auto flex items-center justify-around relative">
        {navItems.map((item, i) => {
          const isActive = currentView === item.view;
          // Insert FAB spacer in the middle
          if (i === 2) {
            return (
              <div key="fab-spacer" className="flex items-center gap-0">
                {/* FAB button */}
                <div className="relative -top-5 mx-3">
                  <button
                    onClick={() => {
                      setCurrentView('home');
                      window.dispatchEvent(new CustomEvent('open-add-habit'));
                    }}
                    className="w-14 h-14 bg-forest text-white rounded-full flex items-center justify-center text-2xl shadow-lg shadow-forest/30 hover:scale-105 transition-transform cursor-pointer"
                  >
                    +
                  </button>
                </div>
                {/* Stats button after FAB */}
                <button
                  onClick={() => setCurrentView(item.view)}
                  className="flex flex-col items-center py-2 px-3 cursor-pointer"
                >
                  <span className={`text-xl ${isActive ? '' : 'opacity-50'}`}>{item.icon}</span>
                  <span className={`text-xs mt-0.5 ${isActive ? 'text-forest font-semibold' : 'text-muted'}`}>
                    {item.label}
                  </span>
                  {isActive && <div className="w-1 h-1 rounded-full bg-forest mt-0.5" />}
                </button>
              </div>
            );
          }
          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className="flex flex-col items-center py-2 px-3 cursor-pointer"
            >
              <span className={`text-xl ${isActive ? '' : 'opacity-50'}`}>{item.icon}</span>
              <span className={`text-xs mt-0.5 ${isActive ? 'text-forest font-semibold' : 'text-muted'}`}>
                {item.label}
              </span>
              {isActive && <div className="w-1 h-1 rounded-full bg-forest mt-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

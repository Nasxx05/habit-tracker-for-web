import { useHabits } from '../context/HabitContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { currentView, setCurrentView } = useHabits();

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-10 border-b border-gray-100">
      <div className="flex justify-between items-center px-4 py-3 max-w-3xl mx-auto">
        <button
          onClick={onToggleSidebar}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-xl cursor-pointer"
          aria-label="Menu"
        >
          ☰
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Habit Streaks
        </h1>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentView('calendar')}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition text-xl cursor-pointer ${
              currentView === 'calendar' ? 'bg-purple-100' : 'hover:bg-gray-100'
            }`}
            aria-label="Calendar view"
          >
            📅
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition text-xl cursor-pointer ${
              currentView === 'dashboard' ? 'bg-purple-100' : 'hover:bg-gray-100'
            }`}
            aria-label="Dashboard view"
          >
            🏠
          </button>
        </div>
      </div>
    </header>
  );
}

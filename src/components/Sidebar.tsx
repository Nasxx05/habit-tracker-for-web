import { useHabits } from '../context/HabitContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { habits, setCurrentView } = useHabits();

  const totalCompletions = habits.reduce((sum, h) => sum + h.completionDates.length, 0);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);

  const handleNav = (view: 'dashboard' | 'calendar') => {
    setCurrentView(view);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-slide-right p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl cursor-pointer"
          >
            ×
          </button>
        </div>

        <nav className="space-y-2 mb-8">
          <button
            onClick={() => handleNav('dashboard')}
            className="w-full text-left px-4 py-3 rounded-xl hover:bg-purple-50 transition font-medium text-gray-700 cursor-pointer"
          >
            🏠 Dashboard
          </button>
          <button
            onClick={() => handleNav('calendar')}
            className="w-full text-left px-4 py-3 rounded-xl hover:bg-purple-50 transition font-medium text-gray-700 cursor-pointer"
          >
            📅 Calendar History
          </button>
        </nav>

        {/* Stats summary */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 mt-auto">
          <h3 className="font-bold text-gray-900 mb-3">Overall Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Habits</span>
              <span className="font-bold text-gray-900">{habits.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Completions</span>
              <span className="font-bold text-purple-600">{totalCompletions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Best Streak</span>
              <span className="font-bold text-orange-500">{bestStreak} 🔥</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

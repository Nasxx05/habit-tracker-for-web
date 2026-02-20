import { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { getGreeting, formatDate } from '../utils/dateHelpers';
import HabitCard from './HabitCard';
import AddHabitModal from './AddHabitModal';

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function Dashboard() {
  const { habits, completedToday, totalHabits, profile } = useHabits();
  const [showAddModal, setShowAddModal] = useState(false);

  // Listen for FAB open event
  useEffect(() => {
    const handler = () => setShowAddModal(true);
    window.addEventListener('open-add-habit', handler);
    return () => window.removeEventListener('open-add-habit', handler);
  }, []);

  const greeting = getGreeting();
  const today = new Date();
  const todayDow = today.getDay();
  const percent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Week days centered on today
  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - todayDow + i);
    return {
      label: WEEK_DAYS[i],
      date: d.getDate(),
      isToday: formatDate(d) === formatDate(today),
    };
  });

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-fade-in">
      {/* Greeting */}
      <section className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-mint flex items-center justify-center text-lg">
              👤
            </div>
            <div>
              <p className="text-sm text-muted">{greeting.text}</p>
              <p className="text-lg font-bold text-dark">{profile.name}</p>
            </div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-mint transition cursor-pointer text-muted">
            🔔
          </button>
        </div>
      </section>

      {/* Week Day Selector */}
      <section className="px-4 pt-3 pb-1">
        <div className="flex justify-between">
          {weekDates.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted font-medium">{d.label}</span>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition ${
                  d.isToday
                    ? 'bg-forest text-white'
                    : 'text-dark'
                }`}
              >
                {d.date}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Journey Card */}
      <section className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-bold text-muted tracking-widest">DAILY JOURNEY</p>
            <button className="text-muted text-sm cursor-pointer">⋯</button>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <p className="text-4xl font-bold text-forest">{percent}%</p>
            <div className="flex gap-2">
              {habits.slice(0, 4).map((h) => (
                <span key={h.id} className="w-8 h-8 bg-mint rounded-full flex items-center justify-center text-sm">
                  {h.emoji}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted mb-3">
            {completedToday} of {totalHabits} Completed
          </p>
          <div className="w-full h-2.5 bg-cream rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percent}%`,
                background: 'linear-gradient(to right, #A8C5B8, #2D4A3E)',
              }}
            />
          </div>
        </div>
      </section>

      {/* Today's Habits */}
      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-dark">Today's Habits</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-1.5 rounded-full bg-mint text-forest text-sm font-semibold hover:bg-sage-light transition cursor-pointer"
          >
            + New
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <div className="text-5xl mb-3">{greeting.emoji}</div>
            <h3 className="text-lg font-bold text-dark mb-1">No habits yet!</h3>
            <p className="text-muted text-sm mb-5">Start by adding your first habit to track.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-forest text-white font-semibold px-6 py-3 rounded-full hover:bg-forest/90 transition cursor-pointer"
            >
              + Add Your First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        )}
      </section>

      <AddHabitModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}

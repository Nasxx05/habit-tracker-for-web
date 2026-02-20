import { useState, useEffect, useRef } from 'react';
import { useHabits } from '../context/HabitContext';
import { getGreeting, formatDate } from '../utils/dateHelpers';
import HabitCard from './HabitCard';
import AddHabitModal from './AddHabitModal';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function Dashboard() {
  const { habits, completedToday, totalHabits, profile, setCurrentView, toggleHabit } = useHabits();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [showJourneyMenu, setShowJourneyMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  // Listen for FAB open event
  useEffect(() => {
    const handler = () => setShowAddModal(true);
    window.addEventListener('open-add-habit', handler);
    return () => window.removeEventListener('open-add-habit', handler);
  }, []);

  // Close journey menu when clicking outside
  useEffect(() => {
    if (!showJourneyMenu) return;
    const handler = () => setShowJourneyMenu(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showJourneyMenu]);

  // Scroll to today on mount
  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = todayRef.current;
      container.scrollLeft = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
    }
  }, []);

  const greeting = getGreeting();
  const today = new Date();
  const todayStr = formatDate(today);
  const isViewingToday = selectedDate === todayStr;

  // Generate 6 weeks of dates: 4 weeks back + 2 weeks forward
  const dates = Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 28 + i);
    const dateStr = formatDate(d);
    return {
      label: DAY_LABELS[d.getDay()],
      date: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      dateStr,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
      isFirstOfMonth: d.getDate() === 1,
    };
  });

  // Stats for selected date
  const habitsCompletedOnDate = habits.filter((h) =>
    h.completionDates.includes(selectedDate)
  ).length;
  const displayCompleted = isViewingToday ? completedToday : habitsCompletedOnDate;
  const percent = totalHabits > 0 ? Math.round((displayCompleted / totalHabits) * 100) : 0;

  // Format selected date for display
  const selDateObj = new Date(selectedDate + 'T12:00:00');
  const selDateDisplay = isViewingToday
    ? 'Today'
    : selDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-fade-in">
      {/* Greeting */}
      <section className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Profile picture — tap to go to profile */}
            <button
              onClick={() => setCurrentView('profile')}
              className="w-10 h-10 rounded-full bg-mint flex items-center justify-center text-lg cursor-pointer hover:ring-2 hover:ring-sage transition"
            >
              👤
            </button>
            <div>
              <p className="text-sm text-muted">{greeting.text}</p>
              <p className="text-lg font-bold text-dark">{profile.name}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scrollable Date Selector */}
      <section className="px-4 pt-3 pb-1">
        <div
          ref={scrollRef}
          className="flex gap-1 overflow-x-auto pb-2 hide-scrollbar scroll-smooth snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
        >
          {dates.map((d) => (
            <div
              key={d.dateStr}
              ref={d.isToday ? todayRef : undefined}
              onClick={() => setSelectedDate(d.dateStr)}
              className={`flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 px-2 py-1.5 rounded-xl snap-center transition-all ${
                d.isSelected ? 'bg-mint scale-105' : 'opacity-70 hover:opacity-100 active:scale-95'
              }`}
            >
              <span className="text-[10px] text-muted font-medium">{d.label}</span>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  d.isSelected
                    ? 'bg-forest text-white shadow-md shadow-forest/20'
                    : d.isToday
                    ? 'ring-2 ring-forest text-forest'
                    : 'text-dark hover:bg-mint'
                }`}
              >
                {d.date}
              </div>
              {d.isFirstOfMonth && (
                <span className="text-[9px] text-sage font-semibold">{d.month}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Daily Journey Card */}
      <section className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-bold text-muted tracking-widest">
              {isViewingToday ? 'DAILY JOURNEY' : selDateDisplay.toUpperCase()}
            </p>
            {/* 3-dot menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowJourneyMenu((v) => !v);
                }}
                className="text-muted text-sm cursor-pointer hover:text-dark transition px-1"
              >
                ⋯
              </button>
              {showJourneyMenu && (
                <div className="absolute right-0 top-6 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 min-w-[180px]">
                  {isViewingToday && displayCompleted < totalHabits && totalHabits > 0 && (
                    <button
                      onClick={() => {
                        habits.forEach((h) => {
                          if (!h.isCompletedToday) toggleHabit(h.id);
                        });
                        setShowJourneyMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-dark hover:bg-mint transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>✅</span> Complete All
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const text = `${profile.name}'s Habit Progress: ${displayCompleted}/${totalHabits} completed (${percent}%)`;
                      navigator.clipboard.writeText(text);
                      setShowJourneyMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-dark hover:bg-mint transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>📋</span> Copy Progress
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('calendar');
                      setShowJourneyMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-dark hover:bg-mint transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>📅</span> Full Calendar
                  </button>
                  {!isViewingToday && (
                    <button
                      onClick={() => {
                        setSelectedDate(todayStr);
                        setShowJourneyMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-dark hover:bg-mint transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>📍</span> Back to Today
                    </button>
                  )}
                </div>
              )}
            </div>
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
            {displayCompleted} of {totalHabits} Completed
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
          <h2 className="text-base font-bold text-dark">
            {isViewingToday ? "Today's Habits" : `Habits · ${selDateDisplay}`}
          </h2>
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
        ) : isViewingToday ? (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        ) : (
          /* Past date: show read-only completion status */
          <div className="space-y-3">
            {habits.map((habit) => {
              const wasCompleted = habit.completionDates.includes(selectedDate);
              return (
                <div
                  key={habit.id}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-mint rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {habit.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-dark truncate">{habit.name}</h3>
                      <p className="text-xs text-muted mt-0.5">
                        {wasCompleted ? `${habit.target || habit.category} · Done` : `${habit.target || habit.category} · Missed`}
                      </p>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        wasCompleted
                          ? 'bg-sage text-white'
                          : 'border-2 border-gray-200 text-gray-300'
                      }`}
                    >
                      {wasCompleted ? '✓' : '–'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <AddHabitModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}

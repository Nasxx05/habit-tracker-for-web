import { useState, useEffect, useRef, useCallback } from 'react';
import { useHabits } from '../context/HabitContext';
import { usePremium, FREE_HABIT_LIMIT } from '../context/PremiumContext';
import { getGreeting, formatDate } from '../utils/dateHelpers';
import HabitCard from './HabitCard';
import AchievementsSection from './AchievementsSection';
import UpgradeModal from './UpgradeModal';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

interface DashboardProps {
  onOpenAddHabit: () => void;
}

export default function Dashboard({ onOpenAddHabit }: DashboardProps) {
  const { habits, scheduledToday, completedToday, totalHabits, profile, setCurrentView, toggleHabit, reorderHabits, streakBadges, notificationPermission, requestNotificationPermission } = useHabits();
  const { isPremium, freezesLeft } = usePremium();
  const [showFreezeUpgrade, setShowFreezeUpgrade] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [showJourneyMenu, setShowJourneyMenu] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

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

  // Generate last 7 days + today (8 dates total)
  const dates = Array.from({ length: 8 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 7 + i);
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

  // For today: use scheduled habits; for past dates: use schedule-aware
  const selDateObj = new Date(selectedDate + 'T12:00:00');
  const selDow = selDateObj.getDay();
  const habitsScheduledOnDate = habits.filter((h) => h.schedule.includes(selDow));
  const habitsCompletedOnDate = habitsScheduledOnDate.filter((h) => h.completionDates.includes(selectedDate)).length;
  const displayCompleted = isViewingToday ? completedToday : habitsCompletedOnDate;
  const displayTotal = isViewingToday ? totalHabits : habitsScheduledOnDate.length;
  const percent = displayTotal > 0 ? Math.round((displayCompleted / displayTotal) * 100) : 0;

  // Category filtering
  const categories = ['all', ...new Set(scheduledToday.map((h) => h.category))];
  const filteredHabits = categoryFilter === 'all'
    ? scheduledToday
    : scheduledToday.filter((h) => h.category === categoryFilter);

  const selDateDisplay = isViewingToday
    ? 'Today'
    : selDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Comeback mode: habits where streak broke and longestStreak > 2
  const comebackHabits = habits.filter(
    (h) => h.currentStreak === 0 && h.longestStreak > 2 && h.completionDates.length > 0 && !h.isCompletedToday
  );

  // Drag-to-reorder handlers
  const getHabitIndex = useCallback((filteredIndex: number) => {
    const habit = filteredHabits[filteredIndex];
    return habits.findIndex((h) => h.id === habit?.id);
  }, [filteredHabits, habits]);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      const fromIndex = getHabitIndex(dragIndex);
      const toIndex = getHabitIndex(index);
      if (fromIndex !== -1 && toIndex !== -1) {
        reorderHabits(fromIndex, toIndex);
      }
      setDragIndex(index);
    }
  }, [dragIndex, reorderHabits, getHabitIndex]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
  }, []);

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-fade-in">
      {/* Greeting */}
      <section className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('profile')}
              className="w-10 h-10 rounded-full bg-mint flex items-center justify-center text-lg cursor-pointer hover:ring-2 hover:ring-sage transition overflow-hidden"
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                '👤'
              )}
            </button>
            <div>
              <p className="text-sm text-muted">{greeting.text}</p>
              <p className="text-lg font-bold text-dark">{profile.name}</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('weekly-review')}
            className="px-3 py-1.5 rounded-full bg-mint text-forest text-xs font-semibold hover:bg-sage-light transition cursor-pointer"
          >
            Weekly Review
          </button>
        </div>
      </section>

      {/* Streak Freeze Status — premium feature */}
      {isViewingToday && habits.length > 0 && (
        <section className="px-4 pt-1">
          {isPremium ? (
            <div
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full"
              title={`${freezesLeft} streak freezes left this week`}
            >
              <span>🧊</span>
              <span>x{freezesLeft}</span>
            </div>
          ) : (
            <button
              onClick={() => setShowFreezeUpgrade(true)}
              title="Upgrade to Premium to unlock Streak Freeze"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gray-100 text-muted px-2.5 py-1 rounded-full hover:bg-gray-200 transition cursor-pointer"
            >
              <span>🔒</span>
              <span>🧊 Streak Freeze — Premium only</span>
            </button>
          )}
        </section>
      )}

      {/* Notification Permission Banner */}
      {isViewingToday && habits.some((h) => h.reminderTime) && notificationPermission === 'denied' && (
        <section className="px-4 pt-2">
          <div className="bg-peach-light/40 rounded-xl p-3 flex items-start gap-2">
            <span className="text-sm mt-0.5">🔕</span>
            <div>
              <p className="text-xs font-semibold text-dark">Notifications are blocked</p>
              <p className="text-xs text-muted mt-0.5">
                You have reminders set but notifications are disabled. Go to your browser settings to allow notifications for this site.
              </p>
            </div>
          </div>
        </section>
      )}

      {isViewingToday && habits.some((h) => h.reminderTime) && notificationPermission === 'default' && (
        <section className="px-4 pt-2">
          <div className="bg-mint rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-start gap-2">
              <span className="text-sm mt-0.5">🔔</span>
              <p className="text-xs text-dark">Enable notifications for habit reminders</p>
            </div>
            <button
              onClick={requestNotificationPermission}
              className="text-xs font-semibold text-forest bg-white px-3 py-1.5 rounded-full cursor-pointer hover:bg-sage-light transition shrink-0"
            >
              Allow
            </button>
          </div>
        </section>
      )}

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

      {/* Comeback Mode Banner */}
      {isViewingToday && comebackHabits.length > 0 && (
        <section className="px-4 pt-2">
          <div className="bg-gradient-to-r from-peach-light/50 to-peach/20 rounded-2xl p-4 border border-peach/20">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔄</div>
              <div className="flex-1">
                <p className="text-xs font-bold text-peach tracking-wider mb-1">COMEBACK MODE</p>
                {comebackHabits.slice(0, 2).map((h) => (
                  <p key={h.id} className="text-sm text-dark">
                    {h.emoji} You were at <span className="font-bold">{h.longestStreak} days</span>.
                    Get back there in {h.longestStreak} days 💪
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Daily Journey Card */}
      <section className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-bold text-muted tracking-widest">
              {isViewingToday ? 'DAILY JOURNEY' : selDateDisplay.toUpperCase()}
            </p>
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
                  {isViewingToday && displayCompleted < displayTotal && displayTotal > 0 && (
                    <button
                      onClick={() => {
                        scheduledToday.forEach((h) => {
                          if (!h.isCompletedToday) toggleHabit(h.id);
                        });
                        setShowJourneyMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-dark hover:bg-mint transition cursor-pointer"
                    >
                      Complete All
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const text = `${profile.name}'s Habit Progress: ${displayCompleted}/${displayTotal} completed (${percent}%)`;
                      navigator.clipboard.writeText(text);
                      setShowJourneyMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-dark hover:bg-mint transition cursor-pointer"
                  >
                    Copy Progress
                  </button>
                  <button
                    onClick={() => { setCurrentView('calendar'); setShowJourneyMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-dark hover:bg-mint transition cursor-pointer"
                  >
                    Full Calendar
                  </button>
                  <button
                    onClick={() => { setCurrentView('weekly-review'); setShowJourneyMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-dark hover:bg-mint transition cursor-pointer"
                  >
                    Weekly Review
                  </button>
                  {!isViewingToday && (
                    <button
                      onClick={() => { setSelectedDate(todayStr); setShowJourneyMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-dark hover:bg-mint transition cursor-pointer"
                    >
                      Back to Today
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <p className="text-4xl font-bold text-forest">{percent}%</p>
          </div>
          <p className="text-sm text-muted mb-3">
            {displayCompleted} of {displayTotal} Completed
          </p>
          <div className="w-full h-2.5 bg-cream rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${percent}%`, background: 'linear-gradient(to right, #A8C5B8, #2D4A3E)' }}
            />
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      {isViewingToday && <AchievementsSection badges={streakBadges} />}

      {/* Category Filter */}
      {categories.length > 2 && isViewingToday && (
        <section className="px-4 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  categoryFilter === cat ? 'bg-forest text-white' : 'bg-mint text-forest hover:bg-sage-light'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Habits List */}
      <section className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-dark">
            {isViewingToday ? "Today's Habits" : `Habits · ${selDateDisplay}`}
          </h2>
          <button
            onClick={onOpenAddHabit}
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
              onClick={onOpenAddHabit}
              className="bg-forest text-white font-semibold px-6 py-3 rounded-full hover:bg-forest/90 transition cursor-pointer"
            >
              + Add Your First Habit
            </button>
          </div>
        ) : filteredHabits.length === 0 && isViewingToday ? (
          <div className="text-center py-8 bg-white rounded-2xl shadow-sm">
            <div className="text-4xl mb-2">😌</div>
            <h3 className="text-base font-bold text-dark mb-1">
              {categoryFilter !== 'all' ? `No ${categoryFilter} habits scheduled` : 'Nothing scheduled today'}
            </h3>
            <p className="text-muted text-sm">Enjoy your free time or add a new habit!</p>
          </div>
        ) : isViewingToday ? (
          <div className="space-y-3">
            {filteredHabits.map((habit, index) => (
              <div
                key={habit.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`transition-all ${dragIndex === index ? 'opacity-50 scale-[1.02]' : ''}`}
              >
                <HabitCard habit={habit} tutorialTarget={index === 0} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {habitsScheduledOnDate.map((habit) => {
              const wasCompleted = habit.completionDates.includes(selectedDate);
              const wasSkipped = (habit.skipDates || []).includes(selectedDate);
              const wasFrozen = (habit.freezeDates || []).includes(selectedDate);
              return (
                <div key={habit.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-mint rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {habit.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-dark truncate">{habit.name}</h3>
                      <p className="text-xs text-muted mt-0.5">
                        {wasFrozen
                          ? '🧊 Streak Freeze Used'
                          : wasSkipped
                          ? 'Rest Day'
                          : wasCompleted
                          ? `${habit.target || habit.category} · Done`
                          : `${habit.target || habit.category} · Missed`}
                      </p>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        wasFrozen
                          ? 'bg-blue-50 text-blue-400'
                          : wasSkipped
                          ? 'bg-peach-light text-peach'
                          : wasCompleted
                          ? 'bg-sage text-white'
                          : 'border-2 border-gray-200 text-gray-300'
                      }`}
                    >
                      {wasFrozen ? '🧊' : wasSkipped ? '💤' : wasCompleted ? '✓' : '–'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Free Plan Indicator */}
      {!isPremium && (
        <section className="px-4 pt-4">
          <div className="text-center text-xs text-muted">
            Free Plan – {Math.min(habits.length, FREE_HABIT_LIMIT)}/{FREE_HABIT_LIMIT} habits used
          </div>
        </section>
      )}

      <UpgradeModal isOpen={showFreezeUpgrade} onClose={() => setShowFreezeUpgrade(false)} />
    </div>
  );
}

import { useHabits } from '../context/HabitContext';
import { getToday, formatDate, getMonthName } from '../utils/dateHelpers';

export default function Stats() {
  const { habits, setCurrentView } = useHabits();
  const todayStr = getToday();

  // Empty state
  if (habits.length === 0) {
    return (
      <div className="max-w-3xl mx-auto pb-24 animate-fade-in">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-dark">Statistics</h1>
          <p className="text-muted text-sm mt-1">Your habit tracking overview</p>
        </div>
        <div className="px-4">
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <p className="text-5xl mb-3">📊</p>
            <h3 className="text-lg font-bold text-dark mb-1">No stats yet</h3>
            <p className="text-muted text-sm mb-5">Create some habits and start tracking to see your statistics here.</p>
            <button
              onClick={() => setCurrentView('home')}
              className="bg-forest text-white font-semibold px-6 py-3 rounded-full hover:bg-forest/90 transition cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalCompletions = habits.reduce((sum, h) => sum + h.completionDates.length, 0);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
  const activeStreaks = habits.filter((h) => h.currentStreak > 0).length;

  // Last 7 days — schedule-aware
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = formatDate(d);
    const dow = d.getDay();
    const scheduled = habits.filter((h) => h.schedule.includes(dow));
    const completed = scheduled.filter((h) => h.completionDates.includes(dateStr)).length;
    return {
      day: d.toLocaleString('en-US', { weekday: 'short' }),
      completed,
      total: scheduled.length,
      isFuture: dateStr > todayStr,
    };
  });

  // This month stats — schedule-aware
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  let monthCompletions = 0;
  let monthPossible = 0;
  let perfectDays = 0;

  for (let day = 1; day <= now.getDate(); day++) {
    const d = new Date(thisYear, thisMonth, day);
    const dateStr = formatDate(d);
    const dow = d.getDay();
    const scheduled = habits.filter((h) => h.schedule.includes(dow));
    const completedCount = scheduled.filter((h) => h.completionDates.includes(dateStr)).length;
    monthCompletions += completedCount;
    monthPossible += scheduled.length;
    if (scheduled.length > 0 && completedCount === scheduled.length) perfectDays++;
  }
  const monthRate = monthPossible > 0 ? Math.round((monthCompletions / monthPossible) * 100) : 0;

  const maxBar = Math.max(...last7.map((d) => d.total), 1);

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-fade-in">
      <div className="px-4 py-4">
        <h1 className="text-2xl font-bold text-dark">Statistics</h1>
        <p className="text-muted text-sm mt-1">Your habit tracking overview</p>
      </div>

      {/* Overview Cards */}
      <section className="px-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-muted tracking-widest">TOTAL</p>
            <p className="text-3xl font-bold text-forest mt-1">{totalCompletions}</p>
            <p className="text-xs text-muted mt-1">Completions</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-muted tracking-widest">BEST</p>
            <p className="text-3xl font-bold text-peach mt-1">{bestStreak}</p>
            <p className="text-xs text-muted mt-1">Day streak</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-muted tracking-widest">ACTIVE</p>
            <p className="text-3xl font-bold text-forest mt-1">{activeStreaks}</p>
            <p className="text-xs text-muted mt-1">Streaks now</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-muted tracking-widest">PERFECT</p>
            <p className="text-3xl font-bold text-forest mt-1">{perfectDays}</p>
            <p className="text-xs text-muted mt-1">Days this month</p>
          </div>
        </div>
      </section>

      {/* Weekly Chart */}
      <section className="px-4 pt-6">
        <h2 className="text-xs font-bold text-muted tracking-widest mb-3">LAST 7 DAYS</h2>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-end justify-between gap-2 h-32">
            {last7.map((d, i) => {
              const height = maxBar > 0 ? (d.completed / maxBar) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-dark">{d.completed}</span>
                  <div className="w-full bg-cream rounded-t-lg relative" style={{ height: '80px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-500"
                      style={{
                        height: `${height}%`,
                        background: 'linear-gradient(to top, #2D4A3E, #A8C5B8)',
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Monthly Summary */}
      <section className="px-4 pt-6">
        <h2 className="text-xs font-bold text-muted tracking-widest mb-3">
          {getMonthName(thisMonth).toUpperCase()} SUMMARY
        </h2>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-dark font-medium">Completion Rate</span>
            <span className="text-sm font-bold text-forest">{monthRate}%</span>
          </div>
          <div className="w-full h-3 bg-cream rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${monthRate}%`, background: 'linear-gradient(to right, #A8C5B8, #2D4A3E)' }}
            />
          </div>
          <p className="text-xs text-muted mt-2">
            {monthCompletions} of {monthPossible} scheduled completions this month
          </p>
        </div>
      </section>

      {/* Per-Habit Stats */}
      <section className="px-4 pt-6">
        <h2 className="text-xs font-bold text-muted tracking-widest mb-3">HABITS BREAKDOWN</h2>
        <div className="space-y-2">
          {habits.map((h) => (
            <div key={h.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <span className="text-2xl">{h.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-dark truncate">{h.name}</p>
                <p className="text-xs text-muted">{h.currentStreak > 0 ? `${h.currentStreak} day streak 🔥` : 'No active streak'}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-forest">{h.completionDates.length}</p>
                <p className="text-xs text-muted">days</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

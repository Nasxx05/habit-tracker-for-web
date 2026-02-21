import { useHabits } from '../context/HabitContext';
import { formatDate } from '../utils/dateHelpers';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WeeklyReview() {
  const { habits, setCurrentView } = useHabits();

  const today = new Date();
  const dayOfWeek = today.getDay();
  // Start from last Monday (or this Monday if today is Mon)
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return {
      date: d,
      dateStr: formatDate(d),
      dayName: DAY_NAMES[d.getDay()],
      shortDay: DAY_NAMES[d.getDay()].slice(0, 3),
      isFuture: formatDate(d) > formatDate(today),
    };
  });

  // Calculate stats for each day
  const dailyStats = weekDays.map((day) => {
    if (day.isFuture) return { ...day, completed: 0, scheduled: 0, rate: 0 };
    const scheduled = habits.filter((h) => h.schedule.includes(day.date.getDay()));
    const completed = scheduled.filter((h) => h.completionDates.includes(day.dateStr));
    return {
      ...day,
      completed: completed.length,
      scheduled: scheduled.length,
      rate: scheduled.length > 0 ? Math.round((completed.length / scheduled.length) * 100) : 0,
    };
  });

  // Overall week stats
  const pastDays = dailyStats.filter((d) => !d.isFuture);
  const totalScheduled = pastDays.reduce((sum, d) => sum + d.scheduled, 0);
  const totalCompleted = pastDays.reduce((sum, d) => sum + d.completed, 0);
  const weekRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
  const perfectDays = pastDays.filter((d) => d.scheduled > 0 && d.completed === d.scheduled).length;
  const bestDay = pastDays.reduce((best, d) => d.rate > best.rate ? d : best, pastDays[0]);
  const worstDay = pastDays.filter((d) => d.scheduled > 0).reduce((worst, d) => d.rate < worst.rate ? d : worst, pastDays[0]);

  // Per-habit weekly breakdown
  const habitStats = habits.map((h) => {
    const scheduledDays = pastDays.filter((d) => h.schedule.includes(d.date.getDay()));
    const completedDays = scheduledDays.filter((d) => h.completionDates.includes(d.dateStr));
    return {
      habit: h,
      scheduled: scheduledDays.length,
      completed: completedDays.length,
      rate: scheduledDays.length > 0 ? Math.round((completedDays.length / scheduledDays.length) * 100) : 0,
    };
  }).filter((h) => h.scheduled > 0).sort((a, b) => b.rate - a.rate);

  // Missed habits (lowest completion)
  const struggling = habitStats.filter((h) => h.rate < 50);
  const thriving = habitStats.filter((h) => h.rate >= 80);

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-fade-in">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => setCurrentView('home')}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-mint transition text-dark text-lg cursor-pointer"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold text-dark">Weekly Review</h1>
          <p className="text-muted text-sm">
            {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {weekDays[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Overall Score */}
      <section className="px-4 pt-2">
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <p className="text-6xl font-bold text-forest">{weekRate}%</p>
          <p className="text-muted text-sm mt-2">Weekly Completion Rate</p>
          <div className="w-full h-3 bg-cream rounded-full overflow-hidden mt-4">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${weekRate}%`, background: 'linear-gradient(to right, #A8C5B8, #2D4A3E)' }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div>
              <p className="text-2xl font-bold text-forest">{totalCompleted}</p>
              <p className="text-xs text-muted">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-peach">{perfectDays}</p>
              <p className="text-xs text-muted">Perfect Days</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-sage">{totalScheduled - totalCompleted}</p>
              <p className="text-xs text-muted">Missed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Breakdown Chart */}
      <section className="px-4 pt-6">
        <h2 className="text-xs font-bold text-muted tracking-widest mb-3">DAILY BREAKDOWN</h2>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-end justify-between gap-2 h-36">
            {dailyStats.map((d) => {
              const height = d.isFuture ? 0 : d.rate;
              const isToday = d.dateStr === formatDate(today);
              return (
                <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1">
                  {!d.isFuture && (
                    <span className="text-xs font-semibold text-dark">{d.rate}%</span>
                  )}
                  <div className="w-full bg-cream rounded-t-lg relative" style={{ height: '90px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-500"
                      style={{
                        height: `${height}%`,
                        background: d.rate === 100
                          ? 'linear-gradient(to top, #2D4A3E, #A8C5B8)'
                          : d.rate >= 50
                            ? 'linear-gradient(to top, #A8C5B8, #c3d9cf)'
                            : 'linear-gradient(to top, #E8985E, #f5c9a3)',
                      }}
                    />
                  </div>
                  <span className={`text-xs ${isToday ? 'font-bold text-forest' : 'text-muted'}`}>
                    {d.shortDay}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="px-4 pt-6">
        <h2 className="text-xs font-bold text-muted tracking-widest mb-3">HIGHLIGHTS</h2>
        <div className="space-y-3">
          {bestDay && bestDay.rate > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-mint flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-semibold text-dark text-sm">Best Day</p>
                <p className="text-muted text-sm">{bestDay.dayName} — {bestDay.rate}% completion ({bestDay.completed}/{bestDay.scheduled})</p>
              </div>
            </div>
          )}
          {worstDay && worstDay.scheduled > 0 && worstDay.rate < 100 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-peach-light flex items-start gap-3">
              <span className="text-2xl">📉</span>
              <div>
                <p className="font-semibold text-dark text-sm">Needs Attention</p>
                <p className="text-muted text-sm">{worstDay.dayName} — {worstDay.rate}% completion. Consider adjusting your schedule.</p>
              </div>
            </div>
          )}
          {perfectDays >= 5 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-mint flex items-start gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="font-semibold text-dark text-sm">On Fire!</p>
                <p className="text-muted text-sm">{perfectDays} perfect days this week. You're building strong momentum!</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Thriving Habits */}
      {thriving.length > 0 && (
        <section className="px-4 pt-6">
          <h2 className="text-xs font-bold text-muted tracking-widest mb-3">THRIVING</h2>
          <div className="space-y-2">
            {thriving.map(({ habit, completed, scheduled, rate }) => (
              <div key={habit.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <span className="text-2xl">{habit.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark truncate">{habit.name}</p>
                  <p className="text-xs text-muted">{completed}/{scheduled} days</p>
                </div>
                <span className="text-sm font-bold text-forest">{rate}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Struggling Habits */}
      {struggling.length > 0 && (
        <section className="px-4 pt-6">
          <h2 className="text-xs font-bold text-muted tracking-widest mb-3">NEEDS WORK</h2>
          <div className="space-y-2">
            {struggling.map(({ habit, completed, scheduled, rate }) => (
              <div key={habit.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <span className="text-2xl">{habit.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark truncate">{habit.name}</p>
                  <p className="text-xs text-muted">{completed}/{scheduled} days</p>
                </div>
                <span className="text-sm font-bold text-peach">{rate}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Habits Breakdown */}
      <section className="px-4 pt-6">
        <h2 className="text-xs font-bold text-muted tracking-widest mb-3">ALL HABITS</h2>
        <div className="space-y-2">
          {habitStats.map(({ habit, completed, scheduled, rate }) => (
            <div key={habit.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{habit.emoji}</span>
                <span className="text-sm font-semibold text-dark flex-1 truncate">{habit.name}</span>
                <span className="text-sm font-bold text-forest">{rate}%</span>
              </div>
              <div className="w-full h-2 bg-cream rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${rate}%`,
                    background: rate >= 80
                      ? 'linear-gradient(to right, #A8C5B8, #2D4A3E)'
                      : rate >= 50
                        ? '#A8C5B8'
                        : '#E8985E',
                  }}
                />
              </div>
              <p className="text-xs text-muted mt-1">{completed} of {scheduled} scheduled days</p>
            </div>
          ))}
        </div>
      </section>

      {habits.length === 0 && (
        <section className="px-4 pt-6">
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <p className="text-5xl mb-3">📊</p>
            <h3 className="text-lg font-bold text-dark mb-1">No data yet</h3>
            <p className="text-muted text-sm">Start tracking habits to see your weekly review.</p>
          </div>
        </section>
      )}
    </div>
  );
}

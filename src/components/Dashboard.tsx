import { useState, useEffect, useCallback } from 'react';
import { useHabits } from '../context/HabitContext';
import { usePremium, FREE_HABIT_LIMIT } from '../context/PremiumContext';
import { formatDate } from '../utils/dateHelpers';
import HabitCard from './HabitCard';
import AchievementsSection from './AchievementsSection';
import { Ring } from './DataViz';
import { IconPlus, IconSparkle, IconChevronR, IconFlame } from './Icons';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface DashboardProps {
  onOpenAddHabit: () => void;
}

export default function Dashboard({ onOpenAddHabit }: DashboardProps) {
  const { habits, scheduledToday, completedToday, totalHabits, profile, setCurrentView, toggleHabit, reorderHabits, streakBadges, notificationPermission, requestNotificationPermission } = useHabits();
  const { isPremium } = usePremium();

  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [showJourneyMenu, setShowJourneyMenu] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!showJourneyMenu) return;
    const handler = () => setShowJourneyMenu(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showJourneyMenu]);

  const today = new Date();
  const todayStr = formatDate(today);
  const isViewingToday = selectedDate === todayStr;

  // 5-day strip
  const dates = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 2 + i);
    const dateStr = formatDate(d);
    return {
      label: DAY_LABELS[d.getDay()],
      date: d.getDate(),
      dateStr,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
    };
  });

  // 7-day week strip for hero card
  const weekDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const k = formatDate(d);
    const scheduled = habits.filter(h => h.schedule.includes(d.getDay()));
    const done = scheduled.filter(h => h.completionDates.includes(k)).length;
    const ratio = scheduled.length ? done / scheduled.length : 0;
    weekDays.push({ d, ratio, label: DAY_SHORT[d.getDay()], date: d.getDate(), isToday: i === 0 });
  }

  const selDateObj = new Date(selectedDate + 'T12:00:00');
  const selDow = selDateObj.getDay();
  const habitsScheduledOnDate = habits.filter(h => h.schedule.includes(selDow));
  const habitsCompletedOnDate = habitsScheduledOnDate.filter(h => h.completionDates.includes(selectedDate)).length;
  const displayCompleted = isViewingToday ? completedToday : habitsCompletedOnDate;
  const displayTotal = isViewingToday ? totalHabits : habitsScheduledOnDate.length;
  const percent = displayTotal > 0 ? Math.round((displayCompleted / displayTotal) * 100) : 0;

  const categories = ['all', ...new Set(scheduledToday.map(h => h.category))];
  const filteredHabits = categoryFilter === 'all'
    ? scheduledToday
    : scheduledToday.filter(h => h.category === categoryFilter);

  const selDateDisplay = isViewingToday
    ? 'Today'
    : selDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const comebackHabits = habits.filter(
    h => h.currentStreak === 0 && h.longestStreak > 2 && h.completionDates.length > 0 && !h.isCompletedToday
  );

  const topStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

  const getHabitIndex = useCallback((filteredIndex: number) => {
    const habit = filteredHabits[filteredIndex];
    return habits.findIndex(h => h.id === habit?.id);
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

  const nowHour = today.getHours();
  const greetingWord = nowHour < 12 ? 'Good morning' : nowHour < 17 ? 'Good afternoon' : 'Good evening';
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  return (
    <div className="max-w-3xl mx-auto pb-28 animate-fade-in" style={{ background: 'var(--color-bg)', minHeight: '100dvh' }}>

      {/* Header */}
      <div style={{ padding: '14px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>{dateLabel}</div>
          <div className="font-serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, color: 'var(--color-ink)', marginTop: 2 }}>
            {greetingWord}, {profile.name || 'there'}.
          </div>
        </div>
        <button
          onClick={() => setCurrentView('profile')}
          style={{
            width: 40, height: 40, borderRadius: 20,
            background: 'var(--color-sage-100)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-forest)', fontWeight: 700, fontSize: 14,
            border: 'none', cursor: 'pointer', overflow: 'hidden',
          }}
        >
          {profile.avatar
            ? <img src={profile.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
        </button>
      </div>

      {/* Notification banners */}
      {isViewingToday && habits.some(h => h.reminderTime) && notificationPermission === 'denied' && (
        <div style={{ margin: '0 16px 12px', padding: '12px 16px', borderRadius: 14, background: 'var(--color-terracotta-soft)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 14 }}>🔕</span>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--color-ink)' }}>Notifications blocked</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-ink-2)' }}>Enable in browser settings to get habit reminders.</p>
          </div>
        </div>
      )}
      {isViewingToday && habits.some(h => h.reminderTime) && notificationPermission === 'default' && (
        <div style={{ margin: '0 16px 12px', padding: '12px 16px', borderRadius: 14, background: 'var(--color-sage-50)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-ink-2)' }}>Enable notifications for habit reminders</p>
          <button
            onClick={requestNotificationPermission}
            style={{ border: 'none', cursor: 'pointer', background: 'var(--color-forest)', color: '#F5F2E8', borderRadius: 999, padding: '6px 12px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            Allow
          </button>
        </div>
      )}

      {/* Hero card */}
      <div style={{ margin: '6px 16px 16px', padding: 22, background: 'var(--color-card)', borderRadius: 24, boxShadow: '0 1px 2px rgba(30,35,31,.04), 0 1px 1px rgba(30,35,31,.03)', border: '1px solid rgba(30,35,31,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Ring value={displayCompleted} total={displayTotal} size={120} stroke={9} color="var(--color-forest)" track="var(--color-sage-100)">
            <div className="font-mono tnum" style={{ fontSize: 28, fontWeight: 600, color: 'var(--color-forest)', letterSpacing: -1 }}>
              {percent}<span style={{ fontSize: 14, marginLeft: 1 }}>%</span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--color-ink-3)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 1, fontWeight: 600 }}>
              {isViewingToday ? 'of today' : selDateDisplay}
            </div>
          </Ring>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: '.12em', color: 'var(--color-ink-4)', fontWeight: 700, textTransform: 'uppercase' }}>
              {isViewingToday ? 'Today' : selDateDisplay}
            </div>
            <div style={{ marginTop: 4, fontSize: 26, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: -0.6 }} className="tnum">
              {displayCompleted}<span style={{ color: 'var(--color-ink-4)', fontWeight: 500 }}>/{displayTotal}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 2 }}>habits complete</div>

            {topStreak > 0 && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--color-terracotta-soft)', borderRadius: 10 }}>
                <IconFlame size={14} style={{ color: 'var(--color-terracotta)' }} />
                <span className="tnum" style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)' }}>
                  {topStreak}<span style={{ fontWeight: 500, color: 'var(--color-ink-3)', marginLeft: 4 }}>day streak</span>
                </span>
              </div>
            )}
          </div>

          {/* Menu */}
          <div style={{ position: 'relative', alignSelf: 'flex-start' }}>
            <button
              onClick={e => { e.stopPropagation(); setShowJourneyMenu(v => !v); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-3)', fontSize: 18, lineHeight: 1, padding: '4px 8px' }}
            >
              ⋯
            </button>
            {showJourneyMenu && (
              <div style={{ position: 'absolute', right: 0, top: 32, background: 'var(--color-card)', borderRadius: 14, boxShadow: '0 2px 6px rgba(30,35,31,.05), 0 8px 24px rgba(30,35,31,.05)', border: '1px solid rgba(30,35,31,.08)', padding: '4px 0', zIndex: 50, minWidth: 180 }}>
                {isViewingToday && displayCompleted < displayTotal && displayTotal > 0 && (
                  <button onClick={() => { scheduledToday.forEach(h => { if (!h.isCompletedToday) toggleHabit(h.id); }); setShowJourneyMenu(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, color: 'var(--color-ink)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Complete All
                  </button>
                )}
                <button onClick={() => { navigator.clipboard.writeText(`${profile.name}'s Habit Progress: ${displayCompleted}/${displayTotal} (${percent}%)`); setShowJourneyMenu(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, color: 'var(--color-ink)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Copy Progress
                </button>
                <button onClick={() => { setCurrentView('calendar'); setShowJourneyMenu(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, color: 'var(--color-ink)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Full Calendar
                </button>
                <button onClick={() => { setCurrentView('weekly-review'); setShowJourneyMenu(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, color: 'var(--color-ink)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Weekly Review
                </button>
                {!isViewingToday && (
                  <button onClick={() => { setSelectedDate(todayStr); setShowJourneyMenu(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, color: 'var(--color-ink)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Back to Today
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Week strip */}
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px dashed rgba(30,35,31,.08)', display: 'flex', justifyContent: 'space-between' }}>
          {weekDays.map((wd, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: wd.isToday ? 'var(--color-forest)' : 'var(--color-ink-4)', letterSpacing: '.08em' }}>{wd.label}</div>
              <div style={{
                width: 30, height: 30, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: wd.isToday ? 'var(--color-forest)' : 'transparent',
                border: wd.isToday ? 'none' : '1px solid rgba(30,35,31,.12)',
                color: wd.isToday ? '#F5F2E8' : 'var(--color-ink-2)',
                fontWeight: 700, fontSize: 13, position: 'relative',
              }} className="tnum">
                {wd.date}
                {!wd.isToday && wd.ratio > 0 && (
                  <div style={{
                    position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
                    width: 4, height: 4, borderRadius: 2,
                    background: wd.ratio === 1 ? 'var(--color-forest)' : wd.ratio >= 0.5 ? 'var(--color-sage-300)' : 'var(--color-sage-200)',
                  }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5-day date selector */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {dates.map(d => (
            <button
              key={d.dateStr}
              onClick={() => setSelectedDate(d.dateStr)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: 'none',
                borderRadius: d.isSelected ? 20 : 14,
                padding: d.isSelected ? '10px 16px' : '8px 12px',
                background: d.isSelected ? 'var(--color-forest)' : 'var(--color-card)',
                boxShadow: d.isSelected ? '0 4px 12px rgba(36,64,46,.2)' : '0 1px 2px rgba(30,35,31,.04)',
                transition: 'all .2s',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 600, color: d.isSelected ? 'rgba(245,242,232,.7)' : 'var(--color-ink-4)', letterSpacing: '.06em' }}>{d.label}</span>
              <span className="tnum" style={{ fontSize: 17, fontWeight: 700, marginTop: 2, color: d.isSelected ? '#F5F2E8' : 'var(--color-ink)' }}>{d.date}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Comeback callout */}
      {isViewingToday && comebackHabits.length > 0 && (
        <div style={{ margin: '0 16px 16px', padding: '14px 16px', borderRadius: 16, background: 'var(--color-butter)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconSparkle size={18} style={{ color: 'var(--color-ink-2)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)' }}>Ready for a comeback?</div>
            <div style={{ fontSize: 11, color: 'var(--color-ink-2)', marginTop: 1 }}>
              {comebackHabits.slice(0, 2).map(h => h.name).join(' · ')}
            </div>
          </div>
          <IconChevronR size={16} style={{ color: 'var(--color-ink-3)' }} />
        </div>
      )}

      {/* Achievements */}
      {isViewingToday && <AchievementsSection badges={streakBadges} />}

      {/* Category Filter */}
      {categories.length > 2 && isViewingToday && (
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, overflowX: 'auto' }} className="no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                background: categoryFilter === cat ? 'var(--color-forest)' : 'var(--color-card)',
                color: categoryFilter === cat ? '#F5F2E8' : 'var(--color-ink-2)',
                border: categoryFilter === cat ? 'none' : '1px solid rgba(30,35,31,.08)',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Habits Section */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 2 }}>Habits</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: -0.3 }}>
              {isViewingToday ? "Today's habits" : selDateDisplay}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="tnum" style={{ fontSize: 11, color: 'var(--color-ink-3)', fontWeight: 500 }}>{displayCompleted}/{displayTotal}</span>
            <button
              onClick={onOpenAddHabit}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 999, background: 'var(--color-sage-50)', color: 'var(--color-forest)', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              <IconPlus size={14} />New
            </button>
          </div>
        </div>

        {habits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--color-card)', borderRadius: 20, border: '1px solid rgba(30,35,31,.08)' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--color-sage-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <IconSparkle size={28} style={{ color: 'var(--color-forest)' }} />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: 'var(--color-ink)' }}>No habits yet</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-ink-3)' }}>Start building your daily routine.</p>
            <button
              onClick={onOpenAddHabit}
              style={{ background: 'var(--color-forest)', color: '#F5F2E8', fontWeight: 700, padding: '12px 24px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 14 }}
            >
              Add your first habit
            </button>
          </div>
        ) : filteredHabits.length === 0 && isViewingToday ? (
          <div style={{ textAlign: 'center', padding: '32px 24px', background: 'var(--color-card)', borderRadius: 20, border: '1px solid rgba(30,35,31,.08)' }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-ink-3)' }}>
              {categoryFilter !== 'all' ? `No ${categoryFilter} habits today` : 'Nothing scheduled today'}
            </p>
          </div>
        ) : isViewingToday ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredHabits.map((habit, index) => (
              <div
                key={habit.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={e => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                style={{ opacity: dragIndex === index ? 0.5 : 1, transform: dragIndex === index ? 'scale(1.02)' : 'none', transition: 'all .2s' }}
              >
                <HabitCard habit={habit} tutorialTarget={index === 0} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {habitsScheduledOnDate.map(habit => {
              const wasCompleted = habit.completionDates.includes(selectedDate);
              const wasSkipped = (habit.skipDates || []).includes(selectedDate);
              const wasFrozen = (habit.freezeDates || []).includes(selectedDate);
              return (
                <div key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--color-card)', borderRadius: 16, border: '1px solid rgba(30,35,31,.08)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink)' }}>{habit.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginTop: 2 }}>
                      {wasFrozen ? '🧊 Streak Freeze' : wasSkipped ? 'Rest day' : wasCompleted ? `${habit.target || habit.category} · Done` : `${habit.target || habit.category} · Missed`}
                    </div>
                  </div>
                  <div style={{
                    width: 28, height: 28, borderRadius: 14,
                    background: wasFrozen ? 'var(--color-ice)' : wasSkipped ? 'var(--color-butter)' : wasCompleted ? 'var(--color-forest)' : 'transparent',
                    border: wasCompleted || wasFrozen || wasSkipped ? 'none' : '1.5px solid rgba(30,35,31,.14)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#F5F2E8', fontSize: 11,
                  }}>
                    {wasFrozen ? '🧊' : wasSkipped ? '💤' : wasCompleted ? '✓' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!isPremium && habits.length > 0 && (
        <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 11, color: 'var(--color-ink-4)' }}>
          Free plan · {Math.min(habits.length, FREE_HABIT_LIMIT)}/{FREE_HABIT_LIMIT} habits
        </div>
      )}
    </div>
  );
}

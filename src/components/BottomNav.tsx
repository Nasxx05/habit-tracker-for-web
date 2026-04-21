import { useHabits } from '../context/HabitContext';
import type { View } from '../types/habit';
import { IconHome, IconCalendar, IconChart, IconUser, IconPlus } from './Icons';

const NAV_ITEMS: { view: View; Icon: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }>; label: string }[] = [
  { view: 'home', Icon: IconHome, label: 'Today' },
  { view: 'calendar', Icon: IconCalendar, label: 'Calendar' },
  { view: 'stats', Icon: IconChart, label: 'Stats' },
  { view: 'profile', Icon: IconUser, label: 'Profile' },
];

interface BottomNavProps {
  onOpenAddHabit: () => void;
}

export default function BottomNav({ onOpenAddHabit }: BottomNavProps) {
  const { currentView, setCurrentView } = useHabits();

  return (
    <div
      data-tutorial="bottom-nav"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'color-mix(in oklch, var(--color-bg) 88%, transparent)',
        backdropFilter: 'saturate(1.2) blur(20px)',
        borderTop: '1px solid rgba(30,35,31,.08)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start',
        padding: `10px 8px max(env(safe-area-inset-bottom, 0px), 16px)`,
        zIndex: 40,
      }}
    >
      {/* Left pair */}
      {NAV_ITEMS.slice(0, 2).map(({ view, Icon, label }) => {
        const on = currentView === view || (view === 'home' && (currentView === 'weekly-review' || currentView === 'habit-detail'));
        return (
          <button
            key={view}
            onClick={() => setCurrentView(view)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: on ? 'var(--color-forest)' : 'var(--color-ink-4)',
              padding: '8px 10px', borderRadius: 14,
              background: 'none', border: 'none', cursor: 'pointer', flex: 1,
            }}
          >
            <Icon size={22} />
            <span style={{ fontSize: 10, fontWeight: on ? 700 : 500, letterSpacing: .01 }}>{label}</span>
          </button>
        );
      })}

      {/* FAB */}
      <button
        data-tutorial="fab"
        onClick={onOpenAddHabit}
        aria-label="Add habit"
        style={{
          width: 52, height: 52, borderRadius: 26,
          background: 'var(--color-forest)',
          color: '#F5F2E8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(36,64,46,.3)',
          marginTop: -8, flex: 'none',
        }}
      >
        <IconPlus size={22} />
      </button>

      {/* Right pair */}
      {NAV_ITEMS.slice(2).map(({ view, Icon, label }) => {
        const on = currentView === view;
        return (
          <button
            key={view}
            onClick={() => setCurrentView(view)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: on ? 'var(--color-forest)' : 'var(--color-ink-4)',
              padding: '8px 10px', borderRadius: 14,
              background: 'none', border: 'none', cursor: 'pointer', flex: 1,
            }}
          >
            <Icon size={22} />
            <span style={{ fontSize: 10, fontWeight: on ? 700 : 500, letterSpacing: .01 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

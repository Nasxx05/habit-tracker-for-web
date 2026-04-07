import React from 'react';
import { useHabits } from '../context/HabitContext';
import type { View } from '../types/habit';

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? 'var(--color-forest)' : 'var(--color-muted)'} className="w-6 h-6">
      <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
      <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? 'var(--color-forest)' : 'var(--color-muted)'} className="w-6 h-6">
      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? 'var(--color-forest)' : 'var(--color-muted)'} className="w-6 h-6">
      <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? 'var(--color-forest)' : 'var(--color-muted)'} className="w-6 h-6">
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
  );
}

const leftItems: { view: View; icon: (active: boolean) => React.ReactNode }[] = [
  { view: 'home', icon: (active) => <HomeIcon active={active} /> },
  { view: 'calendar', icon: (active) => <CalendarIcon active={active} /> },
];

const rightItems: { view: View; icon: (active: boolean) => React.ReactNode }[] = [
  { view: 'stats', icon: (active) => <ChartIcon active={active} /> },
  { view: 'profile', icon: (active) => <ProfileIcon active={active} /> },
];

export default function BottomNav() {
  const { currentView, setCurrentView } = useHabits();

  const renderTab = (item: { view: View; icon: (active: boolean) => React.ReactNode }) => {
    const isActive = currentView === item.view || (item.view === 'home' && currentView === 'weekly-review');
    return (
      <button
        key={item.view}
        onClick={() => setCurrentView(item.view)}
        className="flex-1 flex items-center justify-center py-3 cursor-pointer"
      >
        {item.icon(isActive)}
      </button>
    );
  };

  return (
    <div data-tutorial="bottom-nav" className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
      <div className="max-w-3xl mx-auto flex items-center relative pt-2">
        {leftItems.map(renderTab)}
        <div className="flex-1" />
        {rightItems.map(renderTab)}

        <div className="absolute inset-x-0 -top-7 flex justify-center pointer-events-none">
          <button
            data-tutorial="fab"
            onClick={() => {
              setCurrentView('home');
              window.dispatchEvent(new CustomEvent('open-add-habit'));
            }}
            className="pointer-events-auto w-14 h-14 bg-forest text-white rounded-full flex items-center justify-center text-2xl shadow-lg shadow-forest/30 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

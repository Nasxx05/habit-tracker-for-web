import { useState } from 'react';
import { useHabits } from '../context/HabitContext';

export default function Profile() {
  const { habits, profile, updateProfile, milestones, setCurrentView } = useHabits();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);

  const totalCompletions = habits.reduce((sum, h) => sum + h.completionDates.length, 0);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
  const totalPossible = habits.reduce((sum, h) => sum + h.completionDates.length, 0);
  const completionRate = totalPossible > 0
    ? Math.round((totalCompletions / Math.max(totalPossible, 1)) * 100)
    : 0;
  const unlockedCount = milestones.filter((m) => m.unlocked).length;

  const joinDate = new Date(profile.joinDate);
  const joinStr = joinDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });

  const saveName = () => {
    if (nameInput.trim()) {
      updateProfile({ name: nameInput.trim() });
    }
    setEditingName(false);
  };

  const menuItems = [
    { icon: '✏️', label: 'Edit Profile', action: () => setEditingName(true) },
    { icon: '📊', label: 'View Statistics', action: () => setCurrentView('stats') },
    { icon: '📅', label: 'Calendar History', action: () => setCurrentView('calendar') },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-fade-in">
      {/* Top Bar */}
      <div className="px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark">Profile</h1>
        <button
          onClick={() => setCurrentView('home')}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-mint transition text-muted cursor-pointer"
        >
          ⚙️
        </button>
      </div>

      {/* Profile Card */}
      <section className="px-4 pt-2">
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full bg-mint flex items-center justify-center text-4xl mx-auto">
              👤
            </div>
            <button
              onClick={() => setEditingName(true)}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-sage rounded-full flex items-center justify-center text-white text-xs shadow-md cursor-pointer"
            >
              ✏️
            </button>
          </div>
          {editingName ? (
            <div className="mt-4 flex items-center justify-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                className="px-3 py-2 border-2 border-sage-light rounded-xl text-center font-bold text-dark focus:border-forest focus:outline-none"
                autoFocus
                maxLength={30}
              />
              <button onClick={saveName} className="text-forest font-semibold text-sm cursor-pointer">Save</button>
            </div>
          ) : (
            <h2 className="text-xl font-bold text-dark mt-4">{profile.name}</h2>
          )}
          <p className="text-muted text-sm mt-1">
            {profile.tagline || `Mindful since ${joinStr}`}
          </p>
        </div>
      </section>

      {/* Personal Growth Stats */}
      <section className="px-4 pt-6">
        <h2 className="text-xs font-bold text-muted tracking-widest mb-3">PERSONAL GROWTH</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-mint rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">📋</p>
            <p className="text-xl font-bold text-forest">{habits.length}</p>
            <p className="text-xs text-muted mt-0.5">Total Habits</p>
          </div>
          <div className="bg-mint rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">🔥</p>
            <p className="text-xl font-bold text-forest">{bestStreak}</p>
            <p className="text-xs text-muted mt-0.5">Day Streak</p>
          </div>
          <div className="bg-mint rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">🔄</p>
            <p className="text-xl font-bold text-forest">{completionRate}%</p>
            <p className="text-xs text-muted mt-0.5">Completion</p>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-muted tracking-widest">MILESTONES</h2>
          <span className="text-xs font-semibold text-sage bg-mint px-2.5 py-1 rounded-full">
            {unlockedCount} Unlocked
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`flex-shrink-0 w-24 text-center ${m.unlocked ? '' : 'opacity-40'}`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto shadow-sm ${
                m.unlocked ? 'bg-mint border-2 border-sage' : 'bg-cream border-2 border-gray-200'
              }`}>
                {m.unlocked ? m.icon : '🔒'}
              </div>
              <p className="text-xs font-semibold text-dark mt-2 leading-tight">{m.name}</p>
              <p className="text-xs text-muted leading-tight">{m.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu */}
      <section className="px-4 pt-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-mint transition cursor-pointer ${
                i < menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <span className="w-9 h-9 bg-mint rounded-full flex items-center justify-center text-lg">{item.icon}</span>
              <span className="text-sm font-medium text-dark flex-1 text-left">{item.label}</span>
              <span className="text-muted text-sm">›</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

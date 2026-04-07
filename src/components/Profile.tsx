import { useState, useRef } from 'react';
import { useHabits } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import SettingsModal from './SettingsModal';

export default function Profile() {
  const { habits, profile, updateProfile, milestones, setCurrentView } = useHabits();
  const { user, signOut } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [editingTagline, setEditingTagline] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [taglineInput, setTaglineInput] = useState(profile.tagline);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        updateProfile({ avatar: canvas.toDataURL('image/jpeg', 0.8) });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const totalCompletions = habits.reduce((sum, h) => sum + h.completionDates.length, 0);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
  // Calculate total scheduled days since each habit was created
  const today = new Date();
  const totalPossible = habits.reduce((sum, h) => {
    const created = new Date(h.createdAt);
    let possible = 0;
    const d = new Date(created);
    while (d <= today) {
      if (h.schedule.includes(d.getDay())) possible++;
      d.setDate(d.getDate() + 1);
    }
    return sum + possible;
  }, 0);
  const completionRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;
  const unlockedCount = milestones.filter((m) => m.unlocked).length;

  const joinDate = new Date(profile.joinDate);
  const joinStr = joinDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });

  const saveName = () => {
    if (nameInput.trim()) updateProfile({ name: nameInput.trim() });
    setEditingName(false);
  };

  const saveTagline = () => {
    updateProfile({ tagline: taglineInput.trim() });
    setEditingTagline(false);
  };

  const menuItems = [
    { icon: '📋', label: 'Weekly Review', action: () => setCurrentView('weekly-review') },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-fade-in">
      <div className="px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark">Profile</h1>
        <button
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          className="w-10 h-10 rounded-full bg-mint flex items-center justify-center text-lg cursor-pointer hover:bg-sage-light transition"
        >
          ⚙️
        </button>
      </div>

      {/* Profile Card */}
      <section className="px-4 pt-2">
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="relative inline-block">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarPick} className="hidden" />
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover mx-auto" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-mint flex items-center justify-center text-4xl mx-auto">👤</div>
            )}
            <button onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-sage rounded-full flex items-center justify-center text-white text-xs shadow-md cursor-pointer hover:bg-forest transition">📷</button>
          </div>
          {editingName ? (
            <div className="mt-4 flex items-center justify-center gap-2">
              <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                className="px-3 py-2 border-2 border-sage-light rounded-xl text-center font-bold text-dark focus:border-forest focus:outline-none"
                autoFocus maxLength={30} />
              <button onClick={saveName} className="text-forest font-semibold text-sm cursor-pointer">Save</button>
            </div>
          ) : (
            <h2 className="text-xl font-bold text-dark mt-4 cursor-pointer hover:text-forest transition" onClick={() => setEditingName(true)}>
              {profile.name}
            </h2>
          )}
          {editingTagline ? (
            <div className="mt-2 flex items-center justify-center gap-2">
              <input type="text" value={taglineInput} onChange={(e) => setTaglineInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveTagline()}
                placeholder="Your personal tagline..."
                className="px-3 py-1.5 border-2 border-sage-light rounded-xl text-center text-sm text-dark focus:border-forest focus:outline-none"
                autoFocus maxLength={60} />
              <button onClick={saveTagline} className="text-forest font-semibold text-sm cursor-pointer">Save</button>
            </div>
          ) : (
            <p className="text-muted text-sm mt-1 cursor-pointer hover:text-forest transition" onClick={() => { setTaglineInput(profile.tagline); setEditingTagline(true); }}>
              {profile.tagline || `Mindful since ${joinStr}`}
            </p>
          )}
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
          <span className="text-xs font-semibold text-sage bg-mint px-2.5 py-1 rounded-full">{unlockedCount} Unlocked</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {milestones.map((m) => (
            <div key={m.id} className={`flex-shrink-0 w-24 text-center ${m.unlocked ? '' : 'opacity-40'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto shadow-sm ${
                m.unlocked ? 'bg-mint border-2 border-sage' : 'bg-cream border-2 border-gray-200'
              }`}>{m.unlocked ? m.icon : '🔒'}</div>
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
            <button key={i} onClick={item.action}
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

      {/* Cloud Sync */}
      <section className="px-4 pt-6">
        <h2 className="text-xs font-bold text-muted tracking-widest mb-3">CLOUD SYNC</h2>
        {user ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-mint rounded-full flex items-center justify-center text-lg">☁️</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-dark">Synced</p>
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full" />
            </div>
            <button
              onClick={signOut}
              className="w-full py-2.5 text-sm text-muted font-medium border border-gray-200 rounded-xl hover:bg-cream transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full bg-white rounded-2xl p-5 shadow-sm flex items-center gap-3 hover:bg-mint/30 transition cursor-pointer"
          >
            <div className="w-9 h-9 bg-mint rounded-full flex items-center justify-center text-lg">🔐</div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-dark">Sign in to sync</p>
              <p className="text-xs text-muted">Keep your streaks safe across devices</p>
            </div>
            <span className="text-muted text-sm">›</span>
          </button>
        )}
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

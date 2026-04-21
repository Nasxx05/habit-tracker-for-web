import { useState, useRef } from 'react';
import { useHabits } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import SettingsModal from './SettingsModal';
import { IconSettings, IconFlame, IconSparkle, IconTrophy, IconPalette, IconBell, IconShare, IconChevronR } from './Icons';

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
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const min = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size);
        updateProfile({ avatar: canvas.toDataURL('image/jpeg', 0.8) });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const totalCompletions = habits.reduce((s, h) => s + h.completionDates.length, 0);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
  const today = new Date();
  const totalPossible = habits.reduce((sum, h) => {
    const created = new Date(h.createdAt);
    let possible = 0;
    const d = new Date(created);
    while (d <= today) { if (h.schedule.includes(d.getDay())) possible++; d.setDate(d.getDate() + 1); }
    return sum + possible;
  }, 0);
  const completionRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;
  const unlockedCount = milestones.filter(m => m.unlocked).length;

  const joinDate = new Date(profile.joinDate);
  const joinStr = joinDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  const saveName = () => { if (nameInput.trim()) updateProfile({ name: nameInput.trim() }); setEditingName(false); };
  const saveTagline = () => { updateProfile({ tagline: taglineInput.trim() }); setEditingTagline(false); };

  const menuItems = [
    { Icon: IconPalette, label: 'Appearance', right: 'Warm / light' },
    { Icon: IconBell, label: 'Reminders', right: 'All habits' },
    { Icon: IconShare, label: 'Export data', right: 'JSON', action: () => setShowSettings(true) },
    { Icon: IconSettings, label: 'Settings', action: () => setShowSettings(true) },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-28 animate-fade-in" style={{ background: 'var(--color-bg)', minHeight: '100dvh' }}>

      {/* Header */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>Profile</div>
        <button onClick={() => setShowSettings(true)} style={{ width: 32, height: 32, borderRadius: 16, border: '1px solid rgba(30,35,31,.08)', background: 'var(--color-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-ink-2)' }}>
          <IconSettings size={16} />
        </button>
      </div>

      {/* Identity */}
      <div style={{ padding: '6px 20px 18px', textAlign: 'center' }}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarPick} style={{ display: 'none' }} />
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {profile.avatar ? (
            <img src={profile.avatar} alt="Profile" style={{ width: 80, height: 80, borderRadius: 40, objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: 40, margin: '0 auto',
              background: 'linear-gradient(135deg, var(--color-sage-200), var(--color-sage-400))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-forest-ink)', fontSize: 28, fontWeight: 700,
            }}>{initials}</div>
          )}
          <button onClick={() => fileInputRef.current?.click()}
            style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: 12, background: 'var(--color-forest)', color: '#F5F2E8', border: 'none', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            +
          </button>
        </div>

        {editingName ? (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              style={{ padding: '6px 12px', border: '1.5px solid var(--color-sage-200)', borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 16, color: 'var(--color-ink)', background: 'var(--color-card)', outline: 'none' }}
              autoFocus maxLength={30} />
            <button onClick={saveName} style={{ color: 'var(--color-forest)', fontWeight: 700, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>Save</button>
          </div>
        ) : (
          <div className="font-serif" style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.4, marginTop: 12, cursor: 'pointer', color: 'var(--color-ink)' }} onClick={() => setEditingName(true)}>
            {profile.name || 'Your name'}
          </div>
        )}

        {editingTagline ? (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <input type="text" value={taglineInput} onChange={e => setTaglineInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveTagline()}
              placeholder="Your personal tagline..."
              style={{ padding: '5px 10px', border: '1.5px solid var(--color-sage-200)', borderRadius: 8, textAlign: 'center', fontSize: 12, color: 'var(--color-ink)', background: 'var(--color-card)', outline: 'none' }}
              autoFocus maxLength={60} />
            <button onClick={saveTagline} style={{ color: 'var(--color-forest)', fontWeight: 700, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>Save</button>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--color-ink-3)', marginTop: 2, cursor: 'pointer' }} onClick={() => { setTaglineInput(profile.tagline); setEditingTagline(true); }}>
            {profile.tagline || `Building quiet daily wins.`}
          </div>
        )}
        <div className="tnum" style={{ marginTop: 8, fontSize: 11, color: 'var(--color-ink-4)', fontWeight: 500 }}>Member since {joinStr}</div>
      </div>

      {/* Lifetime stats — forest card */}
      <div style={{ margin: '0 16px 16px', padding: 18, borderRadius: 20, background: 'var(--color-forest)', color: '#F5F2E8', position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', opacity: .7 }}>Lifetime</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 12 }}>
          <div>
            <div className="tnum" style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6 }}>{totalCompletions}</div>
            <div style={{ fontSize: 10, opacity: .7, marginTop: 2 }}>Completions</div>
          </div>
          <div>
            <div className="tnum" style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, color: 'var(--color-butter)' }}>{bestStreak}</div>
            <div style={{ fontSize: 10, opacity: .7, marginTop: 2 }}>Longest streak</div>
          </div>
          <div>
            <div className="tnum" style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6 }}>{completionRate}%</div>
            <div style={{ fontSize: 10, opacity: .7, marginTop: 2 }}>Completion rate</div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div style={{ padding: '0 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 2 }}>{unlockedCount} Unlocked</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: -0.3 }}>Achievements</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {milestones.slice(0, 8).map((m, i) => {
            const IconComp = i % 3 === 0 ? IconFlame : i % 3 === 1 ? IconSparkle : IconTrophy;
            return (
              <div key={m.id} style={{
                padding: '12px 8px', borderRadius: 14, background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.08)',
                textAlign: 'center', opacity: m.unlocked ? 1 : 0.4,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 16, margin: '0 auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: m.unlocked ? 'color-mix(in oklch, var(--color-terracotta) 18%, transparent)' : 'var(--color-bg-soft)',
                  color: 'var(--color-terracotta)',
                }}>
                  <IconComp size={16} />
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-ink-2)', marginTop: 6, letterSpacing: .04, lineHeight: 1.3 }}>{m.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Menu */}
      <div style={{ margin: '4px 16px 14px', background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.08)', borderRadius: 16, overflow: 'hidden' }}>
        <button onClick={() => setCurrentView('weekly-review')}
          style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, borderTop: 'none', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--color-sage-50)', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconSparkle size={16} />
          </div>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>Weekly Review</span>
          <IconChevronR size={16} style={{ color: 'var(--color-ink-4)' }} />
        </button>
        {menuItems.map((item, i) => (
          <button key={i} onClick={item.action}
            style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, borderTop: '1px solid rgba(30,35,31,.08)', background: 'none', border: 'none', borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: 'rgba(30,35,31,.08)', cursor: item.action ? 'pointer' : 'default', textAlign: 'left' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--color-sage-50)', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <item.Icon size={16} />
            </div>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>{item.label}</span>
            {item.right && <span style={{ fontSize: 12, color: 'var(--color-ink-3)' }}>{item.right}</span>}
            <IconChevronR size={16} style={{ color: 'var(--color-ink-4)' }} />
          </button>
        ))}
      </div>

      {/* Cloud Sync */}
      <div style={{ margin: '0 16px 20px' }}>
        {user ? (
          <div style={{ padding: 18, background: 'var(--color-card)', borderRadius: 16, border: '1px solid rgba(30,35,31,.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--color-sage-50)', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>☁️</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)' }}>Synced</div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--color-ok)' }} />
            </div>
            <button onClick={signOut} style={{ width: '100%', padding: '10px', fontSize: 13, fontWeight: 600, color: 'var(--color-ink-3)', background: 'var(--color-bg-soft)', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
              Sign Out
            </button>
          </div>
        ) : (
          <button onClick={() => setShowAuthModal(true)}
            style={{ width: '100%', padding: '14px 16px', background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.08)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--color-sage-50)', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔐</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)' }}>Sign in to sync</div>
              <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginTop: 1 }}>Keep your streaks safe across devices</div>
            </div>
            <IconChevronR size={16} style={{ color: 'var(--color-ink-4)' }} />
          </button>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

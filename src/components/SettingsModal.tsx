import { useState, useRef } from 'react';
import { useHabits } from '../context/HabitContext';
import { useTheme } from '../context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Section = 'menu' | 'backup' | 'profile' | 'notifications';

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    habits,
    profile,
    updateProfile,
    exportData,
    importData,
    notificationPermission,
    requestNotificationPermission,
  } = useHabits();
  const { theme, toggleTheme } = useTheme();
  const [section, setSection] = useState<Section>('menu');
  const [nameInput, setNameInput] = useState(profile.name);
  const [taglineInput, setTaglineInput] = useState(profile.tagline);
  const [importMsg, setImportMsg] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const close = () => {
    setSection('menu');
    onClose();
  };

  const handleExportJSON = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `streakly-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const rows = ['Habit,Emoji,Category,Date,Completed'];
    habits.forEach((h) => {
      h.completionDates.forEach((date) => {
        rows.push(`"${h.name}","${h.emoji}","${h.category}","${date}","Yes"`);
      });
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `streakly-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importData(reader.result as string);
      setImportMsg(ok ? 'Data restored successfully!' : 'Invalid backup file.');
      setTimeout(() => setImportMsg(''), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const saveProfile = () => {
    if (nameInput.trim()) updateProfile({ name: nameInput.trim() });
    updateProfile({ tagline: taglineInput.trim() });
    setSection('menu');
  };

  const menuItems: { icon: string; label: string; section: Section }[] = [
    { icon: '💾', label: 'Data Backup', section: 'backup' },
    { icon: '✏️', label: 'Edit Profile', section: 'profile' },
    { icon: '🔔', label: 'Notifications', section: 'notifications' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {section !== 'menu' && (
              <button onClick={() => setSection('menu')} className="text-muted text-xl cursor-pointer hover:text-dark">‹</button>
            )}
            <h2 className="text-xl font-bold text-dark">
              {section === 'menu' ? 'Settings'
                : section === 'backup' ? 'Data Backup'
                : section === 'profile' ? 'Edit Profile'
                : 'Notifications'}
            </h2>
          </div>
          <button onClick={close} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-mint text-muted text-xl transition cursor-pointer">×</button>
        </div>

        {section === 'menu' && (
          <>
            <div className="bg-cream rounded-2xl overflow-hidden">
              {menuItems.map((item, i) => (
                <button
                  key={item.section}
                  onClick={() => setSection(item.section)}
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
            <div className="bg-cream rounded-2xl overflow-hidden mt-3">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-mint transition cursor-pointer"
              >
                <span className="w-9 h-9 bg-mint rounded-full flex items-center justify-center text-lg">{theme === 'dark' ? '🌙' : '☀️'}</span>
                <span className="text-sm font-medium text-dark flex-1 text-left">Dark Mode</span>
                <span className={`relative inline-flex w-10 h-6 rounded-full transition ${theme === 'dark' ? 'bg-forest' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-4' : ''}`} />
                </span>
              </button>
            </div>
          </>
        )}

        {section === 'backup' && (
          <div className="space-y-2">
            <button onClick={handleExportJSON}
              className="w-full flex items-center gap-3 px-4 py-4 bg-cream rounded-xl hover:bg-mint transition cursor-pointer">
              <span className="w-9 h-9 bg-mint rounded-full flex items-center justify-center text-lg">📥</span>
              <span className="text-sm font-medium text-dark flex-1 text-left">Export Backup (JSON)</span>
              <span className="text-muted text-sm">›</span>
            </button>
            <button onClick={handleExportCSV}
              className="w-full flex items-center gap-3 px-4 py-4 bg-cream rounded-xl hover:bg-mint transition cursor-pointer">
              <span className="w-9 h-9 bg-mint rounded-full flex items-center justify-center text-lg">📊</span>
              <span className="text-sm font-medium text-dark flex-1 text-left">Export Data (CSV)</span>
              <span className="text-muted text-sm">›</span>
            </button>
            <button onClick={() => importInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-4 py-4 bg-cream rounded-xl hover:bg-mint transition cursor-pointer">
              <span className="w-9 h-9 bg-mint rounded-full flex items-center justify-center text-lg">📤</span>
              <span className="text-sm font-medium text-dark flex-1 text-left">Restore from Backup</span>
              <span className="text-muted text-sm">›</span>
            </button>
            <input ref={importInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            {importMsg && (
              <p className={`text-sm text-center mt-2 ${importMsg.includes('success') ? 'text-forest' : 'text-red-500'}`}>
                {importMsg}
              </p>
            )}
          </div>
        )}

        {section === 'profile' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={30}
                className="w-full px-4 py-3 border-2 border-sage-light rounded-xl focus:border-forest focus:outline-none transition text-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Tagline</label>
              <input
                type="text"
                value={taglineInput}
                onChange={(e) => setTaglineInput(e.target.value)}
                maxLength={60}
                placeholder="Your personal tagline..."
                className="w-full px-4 py-3 border-2 border-sage-light rounded-xl focus:border-forest focus:outline-none transition text-dark"
              />
            </div>
            <button
              onClick={saveProfile}
              className="w-full bg-forest text-white font-semibold py-3 rounded-xl hover:bg-forest/90 transition cursor-pointer"
            >
              Save
            </button>
          </div>
        )}

        {section === 'notifications' && (
          <div className="space-y-3">
            <div className="bg-cream rounded-xl p-4">
              <p className="text-sm font-semibold text-dark mb-1">Browser Notifications</p>
              <p className="text-xs text-muted mb-3">
                Status:{' '}
                <span className="font-semibold text-forest">
                  {notificationPermission === 'granted' ? 'Enabled'
                    : notificationPermission === 'denied' ? 'Blocked in browser settings'
                    : notificationPermission === 'unsupported' ? 'Not supported'
                    : 'Not set'}
                </span>
              </p>
              {notificationPermission === 'default' && (
                <button
                  onClick={requestNotificationPermission}
                  className="w-full bg-forest text-white font-semibold py-2.5 rounded-xl hover:bg-forest/90 transition cursor-pointer text-sm"
                >
                  Enable Notifications
                </button>
              )}
              {notificationPermission === 'denied' && (
                <p className="text-xs text-muted">
                  Notifications are blocked. Update your browser site settings to allow them.
                </p>
              )}
            </div>
            <p className="text-xs text-muted px-2">
              Reminders are configured per habit. Set a reminder time when adding or editing a habit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

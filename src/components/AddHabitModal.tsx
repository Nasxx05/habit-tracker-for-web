import { useState, useRef, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { usePremium, FREE_HABIT_LIMIT } from '../context/PremiumContext';
import UpgradeModal from './UpgradeModal';
import type { HabitTemplate } from '../types/habit';

const EMOJI_OPTIONS = [
  '💪', '📚', '🏃', '💧', '🧘', '✍️', '🎯',
  '🎨', '🎵', '🌱', '🔥', '⭐', '💡', '❤️',
  '🍎', '😴', '🚶', '🧹', '💊', '🙏',
  '📝', '🎸', '🏋️', '🚴', '🧠', '📱', '🐕', '🍳',
];

const CATEGORIES = ['General', 'Health', 'Fitness', 'Mindfulness', 'Learning', 'Productivity', 'Self-care', 'Social'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const COLOR_PALETTE = ['#6C5CE7', '#A29BFE', '#4ECDC4', '#FF6B6B', '#FDA085', '#FDCB58', '#26DE81', '#3B82F6', '#EC4899', '#8B5CF6'];

const TEMPLATES: HabitTemplate[] = [
  { name: 'Drink Water', emoji: '💧', category: 'Health', target: '8 glasses', schedule: [0, 1, 2, 3, 4, 5, 6] },
  { name: 'Exercise', emoji: '🏃', category: 'Fitness', target: '30 minutes', schedule: [1, 2, 3, 4, 5] },
  { name: 'Read', emoji: '📚', category: 'Learning', target: '20 pages', schedule: [0, 1, 2, 3, 4, 5, 6] },
  { name: 'Meditate', emoji: '🧘', category: 'Mindfulness', target: '10 minutes', schedule: [0, 1, 2, 3, 4, 5, 6] },
  { name: 'Journal', emoji: '✍️', category: 'Self-care', target: '5 minutes', schedule: [0, 1, 2, 3, 4, 5, 6] },
  { name: 'Walk', emoji: '🚶', category: 'Health', target: '10,000 steps', schedule: [0, 1, 2, 3, 4, 5, 6] },
  { name: 'No Social Media', emoji: '📱', category: 'Productivity', target: 'Before noon', schedule: [1, 2, 3, 4, 5] },
  { name: 'Sleep 8 Hours', emoji: '😴', category: 'Health', target: '8 hours', schedule: [0, 1, 2, 3, 4, 5, 6] },
  { name: 'Cook a Meal', emoji: '🍳', category: 'Self-care', target: '1 meal', schedule: [0, 1, 2, 3, 4, 5, 6] },
  { name: 'Gym', emoji: '🏋️', category: 'Fitness', target: '1 hour', schedule: [1, 3, 5] },
  { name: 'Practice Guitar', emoji: '🎸', category: 'Learning', target: '20 minutes', schedule: [0, 1, 2, 3, 4, 5, 6] },
  { name: 'Gratitude', emoji: '🙏', category: 'Mindfulness', target: '3 things', schedule: [0, 1, 2, 3, 4, 5, 6] },
];

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddHabitModal({ isOpen, onClose }: AddHabitModalProps) {
  const { addHabit, habits } = useHabits();
  const { isPremium } = usePremium();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💪');
  const [category, setCategory] = useState('General');
  const [target, setTarget] = useState('');
  const [targetCount, setTargetCount] = useState<string>('');
  const [color, setColor] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [reminderTime, setReminderTime] = useState('');
  const [showTemplates, setShowTemplates] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (!isPremium && habits.length >= FREE_HABIT_LIMIT) {
        setShowUpgrade(true);
        onClose();
        return;
      }
      setShowTemplates(true);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isPremium, habits.length, onClose]);

  const applyTemplate = (template: HabitTemplate) => {
    setName(template.name);
    setSelectedEmoji(template.emoji);
    setCategory(template.category);
    setTarget(template.target);
    setSchedule(template.schedule);
    setShowTemplates(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const toggleDay = (day: number) => {
    setSchedule((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!isPremium && habits.length >= FREE_HABIT_LIMIT) {
      setShowUpgrade(true);
      onClose();
      return;
    }
    const tc = parseInt(targetCount, 10);
    addHabit(
      name.trim(),
      selectedEmoji,
      category,
      target,
      schedule,
      reminderTime || null,
      Number.isFinite(tc) && tc > 0 ? tc : null,
      isPremium ? color : null
    );
    setName('');
    setSelectedEmoji('💪');
    setCategory('General');
    setTarget('');
    setTargetCount('');
    setColor(null);
    setSchedule([0, 1, 2, 3, 4, 5, 6]);
    setReminderTime('');
    setShowTemplates(true);
    onClose();
  };

  if (!isOpen) {
    return <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-dark">Add New Habit</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-mint text-muted text-xl transition cursor-pointer">×</button>
        </div>

        {/* Quick Templates */}
        {showTemplates && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-dark">Quick Start</label>
              <button onClick={() => setShowTemplates(false)} className="text-xs text-muted hover:text-forest cursor-pointer">Custom →</button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => applyTemplate(t)}
                  className="flex items-center gap-2 p-3 bg-mint rounded-xl hover:bg-sage-light transition cursor-pointer text-left"
                >
                  <span className="text-xl">{t.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">{t.name}</p>
                    <p className="text-xs text-muted truncate">{t.target}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Habit Name</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Meditation"
              className="w-full px-4 py-3 border-2 border-sage-light rounded-xl focus:border-forest focus:outline-none transition text-dark"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Icon</label>
            <div className="grid grid-cols-7 gap-1.5">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl p-1.5 rounded-lg transition cursor-pointer ${
                    selectedEmoji === emoji ? 'bg-mint ring-2 ring-sage' : 'hover:bg-cream'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition cursor-pointer ${
                    category === c ? 'bg-forest text-white' : 'bg-mint text-forest hover:bg-sage-light'
                  }`}
                >{c}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Target label (optional)</label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., minutes, glasses, pages"
              className="w-full px-4 py-3 border-2 border-sage-light rounded-xl focus:border-forest focus:outline-none transition text-dark"
              maxLength={40}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Target count (optional)</label>
            <input
              type="number"
              min="0"
              value={targetCount}
              onChange={(e) => setTargetCount(e.target.value)}
              placeholder="e.g., 8 (for 8 glasses) — leave empty for simple checkbox"
              className="w-full px-4 py-3 border-2 border-sage-light rounded-xl focus:border-forest focus:outline-none transition text-dark"
            />
            <p className="text-xs text-muted mt-1">Set a number to enable tap-to-increment (e.g. tap +1 each glass).</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">
              Color {!isPremium && <span className="text-xs text-muted font-normal">· Premium</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => isPremium && setColor(null)}
                disabled={!isPremium}
                className={`w-8 h-8 rounded-full border-2 ${color === null ? 'ring-2 ring-forest' : 'border-sage-light'} ${!isPremium ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} bg-mint flex items-center justify-center text-xs`}
              >
                ✕
              </button>
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => isPremium && setColor(c)}
                  disabled={!isPremium}
                  className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-forest' : ''} ${!isPremium ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            {!isPremium && (
              <p className="text-xs text-muted mt-1">🔒 Upgrade to Premium to color-code your habits.</p>
            )}
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Schedule</label>
            <div className="flex gap-1.5">
              {DAY_LABELS.map((label, i) => (
                <button key={label} type="button" onClick={() => toggleDay(i)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    schedule.includes(i) ? 'bg-forest text-white' : 'bg-cream text-muted'
                  }`}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Reminder (optional)</label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-sage-light rounded-xl focus:border-forest focus:outline-none transition text-dark"
              />
              {reminderTime && (
                <button type="button" onClick={() => setReminderTime('')}
                  className="text-muted hover:text-dark cursor-pointer text-sm px-2"
                >Clear</button>
              )}
            </div>
            {reminderTime && (
              <p className="text-xs text-muted mt-1">Notification at {reminderTime} on scheduled days</p>
            )}
          </div>

          {/* Preview */}
          <div className="p-3 bg-mint rounded-xl flex items-center gap-3">
            <span className="text-3xl">{selectedEmoji}</span>
            <div>
              <span className="text-sm font-bold text-dark">{name || 'Your habit name'}</span>
              <p className="text-xs text-muted">{target || category}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-forest text-white font-semibold py-3.5 rounded-xl hover:bg-forest/90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Create Habit
          </button>
        </form>
      </div>
    </div>
  );
}

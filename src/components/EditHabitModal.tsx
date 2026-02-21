import { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import type { Habit } from '../types/habit';

const EMOJI_OPTIONS = [
  '💪', '📚', '🏃', '💧', '🧘', '✍️', '🎯',
  '🎨', '🎵', '🌱', '🔥', '⭐', '💡', '❤️',
  '🍎', '😴', '🚶', '🧹', '💊', '🙏',
  '📝', '🎸', '🏋️', '🚴', '🧠', '📱', '🐕', '🍳',
];

const CATEGORIES = ['General', 'Health', 'Fitness', 'Mindfulness', 'Learning', 'Productivity', 'Self-care', 'Social'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface EditHabitModalProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditHabitModal({ habit, isOpen, onClose }: EditHabitModalProps) {
  const { editHabit, deleteHabit } = useHabits();
  const [name, setName] = useState(habit.name);
  const [emoji, setEmoji] = useState(habit.emoji);
  const [category, setCategory] = useState(habit.category || 'General');
  const [target, setTarget] = useState(habit.target || '');
  const [schedule, setSchedule] = useState<number[]>(habit.schedule || [0, 1, 2, 3, 4, 5, 6]);
  const [reminderTime, setReminderTime] = useState(habit.reminderTime || '');
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(habit.name);
      setEmoji(habit.emoji);
      setCategory(habit.category || 'General');
      setTarget(habit.target || '');
      setSchedule(habit.schedule || [0, 1, 2, 3, 4, 5, 6]);
      setReminderTime(habit.reminderTime || '');
      setShowDelete(false);
    }
  }, [isOpen, habit]);

  const toggleDay = (day: number) => {
    setSchedule((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    editHabit(habit.id, { name: name.trim(), emoji, category, target, schedule, reminderTime: reminderTime || null });
    onClose();
  };

  const handleDelete = () => {
    deleteHabit(habit.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-dark">Edit Habit</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-mint text-muted text-xl cursor-pointer">×</button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Habit Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-sage-light rounded-xl focus:border-forest focus:outline-none transition text-dark" maxLength={50} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Icon</label>
            <div className="grid grid-cols-7 gap-1.5">
              {EMOJI_OPTIONS.map((e) => (
                <button key={e} type="button" onClick={() => setEmoji(e)}
                  className={`text-2xl p-1.5 rounded-lg transition cursor-pointer ${emoji === e ? 'bg-mint ring-2 ring-sage' : 'hover:bg-cream'}`}
                >{e}</button>
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
            <label className="block text-sm font-semibold text-dark mb-1.5">Target (optional)</label>
            <input type="text" value={target} onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., 10 minutes, 8 glasses"
              className="w-full px-4 py-3 border-2 border-sage-light rounded-xl focus:border-forest focus:outline-none transition text-dark" maxLength={40} />
          </div>

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

          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Reminder (optional)</label>
            <div className="flex items-center gap-2">
              <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-sage-light rounded-xl focus:border-forest focus:outline-none transition text-dark" />
              {reminderTime && (
                <button type="button" onClick={() => setReminderTime('')}
                  className="text-muted hover:text-dark cursor-pointer text-sm px-2">Clear</button>
              )}
            </div>
            {reminderTime && <p className="text-xs text-muted mt-1">Notification at {reminderTime} on scheduled days</p>}
          </div>

          <button onClick={handleSave} disabled={!name.trim()}
            className="w-full bg-forest text-white font-semibold py-3.5 rounded-xl hover:bg-forest/90 transition disabled:opacity-50 cursor-pointer">
            Save Changes
          </button>

          {!showDelete ? (
            <button onClick={() => setShowDelete(true)}
              className="w-full text-center text-sm text-muted hover:text-red-500 transition cursor-pointer py-2">
              Delete this habit
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-sm text-red-600 mb-3">Are you sure? This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowDelete(false)} className="flex-1 py-2 rounded-lg bg-cream text-dark text-sm font-medium cursor-pointer">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium cursor-pointer">Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

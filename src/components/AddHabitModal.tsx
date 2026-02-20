import { useState, useRef, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';

const EMOJI_OPTIONS = [
  '💪', '📚', '🏃', '💧', '🧘', '✍️', '🎯',
  '🎨', '🎵', '🌱', '🔥', '⭐', '💡', '❤️',
  '🍎', '😴', '🚶', '🧹', '💊', '🙏',
  '📝', '🎸', '🏋️', '🚴', '🧠', '📱', '🐕', '🍳',
];

const CATEGORIES = ['General', 'Health', 'Fitness', 'Mindfulness', 'Learning', 'Productivity', 'Self-care', 'Social'];

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddHabitModal({ isOpen, onClose }: AddHabitModalProps) {
  const { addHabit } = useHabits();
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💪');
  const [category, setCategory] = useState('General');
  const [target, setTarget] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addHabit(name.trim(), selectedEmoji, category, target);
    setName('');
    setSelectedEmoji('💪');
    setCategory('General');
    setTarget('');
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
          <h2 className="text-xl font-bold text-dark">Add New Habit</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-mint text-muted text-xl transition cursor-pointer"
          >
            ×
          </button>
        </div>

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
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition cursor-pointer ${
                    category === c ? 'bg-forest text-white' : 'bg-mint text-forest hover:bg-sage-light'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Target (optional)</label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., 10 minutes, 8 glasses"
              className="w-full px-4 py-3 border-2 border-sage-light rounded-xl focus:border-forest focus:outline-none transition text-dark"
            />
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

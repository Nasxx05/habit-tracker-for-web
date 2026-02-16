import { useState, useRef, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';

const EMOJI_OPTIONS = [
  '💪', '📚', '🏃', '💧', '🧘', '✍️', '🎯',
  '🎨', '🎵', '🌱', '🔥', '⭐', '💡', '❤️',
  '🍎', '😴', '🚶', '🧹', '💊', '🙏',
  '📝', '🎸', '🏋️', '🚴', '🧠', '📱', '🐕', '🍳',
];

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddHabitModal({ isOpen, onClose }: AddHabitModalProps) {
  const { addHabit } = useHabits();
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💪');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addHabit(name.trim(), selectedEmoji);
    setName('');
    setSelectedEmoji('💪');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Habit</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-2xl transition cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Habit Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Exercise 30 minutes"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition text-gray-900"
              maxLength={50}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Choose an Emoji
            </label>
            <div className="grid grid-cols-7 gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl p-2 rounded-lg transition cursor-pointer ${
                    selectedEmoji === emoji
                      ? 'bg-purple-100 ring-2 ring-purple-500'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-xl text-center">
            <span className="text-3xl">{selectedEmoji}</span>
            <span className="ml-2 text-lg font-semibold text-gray-700">
              {name || 'Your habit name'}
            </span>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-purple-600 text-white font-semibold py-4 rounded-xl hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Create Habit
          </button>
        </form>
      </div>
    </div>
  );
}

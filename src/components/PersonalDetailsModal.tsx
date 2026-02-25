import { useState } from 'react';
import { useHabits } from '../context/HabitContext';

interface PersonalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEX_OPTIONS: { value: 'male' | 'female'; label: string; icon: string }[] = [
  { value: 'male', label: 'Male', icon: '♂' },
  { value: 'female', label: 'Female', icon: '♀' },
];

export default function PersonalDetailsModal({ isOpen, onClose }: PersonalDetailsModalProps) {
  const { updateProfile, setHasCollectedDetails } = useHabits();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | null>(null);
  const [closing, setClosing] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const updates: Record<string, unknown> = {};
    if (name.trim()) updates.name = name.trim();
    const ageNum = parseInt(age, 10);
    if (ageNum > 0 && ageNum < 150) updates.age = ageNum;
    if (sex) updates.sex = sex;

    updateProfile(updates);
    setHasCollectedDetails(true);
    setClosing(true);
    setTimeout(onClose, 250);
  };

  const handleSkip = () => {
    setHasCollectedDetails(true);
    setClosing(true);
    setTimeout(onClose, 250);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleSkip}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Bottom Sheet */}
      <div
        className={`relative w-full max-w-lg bg-white rounded-t-3xl px-6 pt-3 pb-8 ${closing ? 'celebration-sheet-out' : 'celebration-sheet-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-mint rounded-2xl text-3xl mb-3">
            👋
          </div>
          <h2 className="text-xl font-bold text-dark">Let's get to know you!</h2>
          <p className="text-muted text-sm mt-1">Personalize your experience</p>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="text-xs font-bold text-muted tracking-widest mb-1.5 block">YOUR NAME</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should we call you?"
            maxLength={30}
            className="w-full px-4 py-3 bg-cream rounded-xl text-dark text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sage placeholder:text-muted/50"
            autoFocus
          />
        </div>

        {/* Age */}
        <div className="mb-4">
          <label className="text-xs font-bold text-muted tracking-widest mb-1.5 block">AGE</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Your age"
            min={1}
            max={149}
            className="w-full px-4 py-3 bg-cream rounded-xl text-dark text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sage placeholder:text-muted/50"
          />
        </div>

        {/* Sex */}
        <div className="mb-6">
          <label className="text-xs font-bold text-muted tracking-widest mb-1.5 block">GENDER</label>
          <div className="flex gap-2">
            {SEX_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSex(opt.value)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition cursor-pointer flex flex-col items-center gap-1 ${
                  sex === opt.value
                    ? 'bg-forest text-white'
                    : 'bg-cream text-dark hover:bg-mint'
                }`}
              >
                <span className="text-base">{opt.icon}</span>
                <span className="text-xs">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 bg-forest text-white font-semibold rounded-2xl hover:bg-forest/90 transition cursor-pointer text-base"
        >
          Save & Continue
        </button>

        {/* Skip */}
        <button
          onClick={handleSkip}
          className="w-full mt-2 py-2.5 text-muted text-sm font-medium hover:text-dark transition cursor-pointer"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

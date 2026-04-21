import { useState, useRef, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { usePremium, FREE_HABIT_LIMIT } from '../context/PremiumContext';
import UpgradeModal from './UpgradeModal';
import HabitGlyph, { GLYPH_SHAPES, GLYPH_COLORS, getGlyphForHabit } from './HabitGlyph';
import type { GlyphShape } from './HabitGlyph';
import type { HabitTemplate } from '../types/habit';
import { IconClose, IconClock, IconRepeat, IconBell, IconChevronR } from './Icons';

const CATEGORIES = ['General', 'Health', 'Fitness', 'Mindfulness', 'Learning', 'Productivity', 'Self-care', 'Social'];
const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-ink-4)', padding: '0 2px' }}>
      {children}
    </div>
  );
}

export default function AddHabitModal({ isOpen, onClose }: AddHabitModalProps) {
  const { addHabit, habits } = useHabits();
  const { isPremium } = usePremium();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💪');
  const [selectedShape, setSelectedShape] = useState<GlyphShape>('disc');
  const [selectedColor, setSelectedColor] = useState(GLYPH_COLORS[0].value);
  const [category, setCategory] = useState('General');
  const [target, setTarget] = useState('');
  const [targetCount, setTargetCount] = useState<string>('');
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
    const { shape, color } = getGlyphForHabit(template.emoji, template.category);
    setSelectedShape(shape);
    setSelectedColor(color);
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

  const reset = () => {
    setName('');
    setSelectedEmoji('💪');
    setSelectedShape('disc');
    setSelectedColor(GLYPH_COLORS[0].value);
    setCategory('General');
    setTarget('');
    setTargetCount('');
    setSchedule([0, 1, 2, 3, 4, 5, 6]);
    setReminderTime('');
    setShowTemplates(true);
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
      null,
      selectedShape,
      selectedColor,
    );
    reset();
    onClose();
  };

  if (!isOpen) {
    return <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />;
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 }}
      className="animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) { reset(); onClose(); } }}
    >
      <div
        style={{ background: 'var(--color-bg)', width: '100%', maxWidth: 480, borderRadius: '24px 24px 0 0', maxHeight: '92dvh', overflowY: 'auto', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
        className="animate-slide-up no-scrollbar"
      >
        {/* Header */}
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--color-bg)', zIndex: 2, borderBottom: '1px solid rgba(30,35,31,.06)' }}>
          <button onClick={() => { reset(); onClose(); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-ink-2)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconClose size={16} />Cancel
          </button>
          <div style={{ fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '.1em', fontWeight: 700, textTransform: 'uppercase' }}>New Habit</div>
          <button
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={!name.trim()}
            style={{ background: name.trim() ? 'var(--color-forest)' : 'var(--color-sage-100)', color: name.trim() ? '#F5F2E8' : 'var(--color-ink-4)', border: 'none', borderRadius: 999, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: name.trim() ? 'pointer' : 'default', transition: 'all .2s' }}
          >
            Save
          </button>
        </div>

        {/* Identity preview */}
        <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <HabitGlyph shape={selectedShape} color={selectedColor} size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>Preview</div>
            <div className="font-serif" style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: -0.4, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name || 'Habit name'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 2 }}>{target || category}</div>
          </div>
        </div>

        {/* Quick Templates */}
        {showTemplates && (
          <div style={{ padding: '4px 16px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <FieldLabel>Quick start</FieldLabel>
              <button onClick={() => setShowTemplates(false)} style={{ fontSize: 11, color: 'var(--color-ink-3)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Custom →</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 180, overflowY: 'auto' }} className="no-scrollbar">
              {TEMPLATES.map((t) => {
                const { shape, color } = getGlyphForHabit(t.emoji, t.category);
                return (
                  <button key={t.name} onClick={() => applyTemplate(t)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.08)', borderRadius: 14, cursor: 'pointer', textAlign: 'left' }}>
                    <HabitGlyph shape={shape} color={color} size={32} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.target}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '0 0 8px' }}>

          {/* Name */}
          <div style={{ padding: '4px 16px 12px' }}>
            <FieldLabel>Name</FieldLabel>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Meditation"
              maxLength={50}
              style={{
                marginTop: 8, width: '100%', padding: '14px 16px',
                background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.10)',
                borderRadius: 14, fontSize: 15, color: 'var(--color-ink)',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Shape picker */}
          <div style={{ padding: '4px 16px 12px' }}>
            <FieldLabel>Shape</FieldLabel>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
              {GLYPH_SHAPES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedShape(s)}
                  style={{
                    width: 52, height: 52, flexShrink: 0, borderRadius: 14,
                    border: selectedShape === s ? '2px solid var(--color-forest)' : '1px solid rgba(30,35,31,.10)',
                    background: 'var(--color-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <HabitGlyph shape={s} color={selectedShape === s ? selectedColor : 'var(--color-ink-3)'} size={28} tile={false} />
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div style={{ padding: '4px 16px 14px' }}>
            <FieldLabel>Color</FieldLabel>
            <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {GLYPH_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.value)}
                  style={{
                    width: 30, height: 30, borderRadius: 15, cursor: 'pointer',
                    background: c.value,
                    border: selectedColor === c.value ? '3px solid var(--color-card)' : '3px solid transparent',
                    boxShadow: selectedColor === c.value ? '0 0 0 2px var(--color-forest)' : 'none',
                    outline: 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Target */}
          <div style={{ padding: '4px 16px 12px' }}>
            <FieldLabel>Target (optional)</FieldLabel>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., 30 minutes, 8 glasses"
              maxLength={40}
              style={{
                marginTop: 8, width: '100%', padding: '14px 16px',
                background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.10)',
                borderRadius: 14, fontSize: 14, color: 'var(--color-ink)',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Target count */}
          <div style={{ padding: '4px 16px 12px' }}>
            <FieldLabel>Target count (optional)</FieldLabel>
            <input
              type="number"
              min="0"
              value={targetCount}
              onChange={(e) => setTargetCount(e.target.value)}
              placeholder="e.g., 8 — enables tap-to-increment"
              style={{
                marginTop: 8, width: '100%', padding: '14px 16px',
                background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.10)',
                borderRadius: 14, fontSize: 14, color: 'var(--color-ink)',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Schedule */}
          <div style={{ padding: '4px 16px 14px' }}>
            <FieldLabel>Schedule</FieldLabel>
            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
              {DAY_SHORT.map((label, i) => {
                const on = schedule.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    style={{
                      flex: 1, padding: '10px 0', textAlign: 'center', borderRadius: 12,
                      background: on ? 'var(--color-forest)' : 'var(--color-card)',
                      border: on ? 'none' : '1px solid rgba(30,35,31,.10)',
                      color: on ? '#F5F2E8' : 'var(--color-ink-3)',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}
                  >{label}</button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div style={{ padding: '4px 16px 12px' }}>
            <FieldLabel>Category</FieldLabel>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  style={{
                    padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                    background: category === c ? 'var(--color-forest)' : 'var(--color-card)',
                    color: category === c ? '#F5F2E8' : 'var(--color-ink-2)',
                    border: category === c ? 'none' : '1px solid rgba(30,35,31,.10)',
                    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >{c}</button>
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div style={{ padding: '4px 16px 16px' }}>
            <FieldLabel>Reminder (optional)</FieldLabel>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.10)', borderRadius: 14 }}>
              <IconClock size={18} style={{ color: 'var(--color-ink-3)', flexShrink: 0 }} />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: 'var(--color-ink)', fontFamily: 'inherit' }}
              />
              {reminderTime && (
                <button type="button" onClick={() => setReminderTime('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--color-ink-3)', fontWeight: 600 }}>Clear</button>
              )}
            </div>
          </div>

          {/* Submit */}
          <div style={{ padding: '8px 16px 4px' }}>
            <button
              type="submit"
              disabled={!name.trim()}
              style={{
                width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                background: name.trim() ? 'var(--color-forest)' : 'var(--color-sage-100)',
                color: name.trim() ? '#F5F2E8' : 'var(--color-ink-4)',
                fontSize: 15, fontWeight: 700, cursor: name.trim() ? 'pointer' : 'default',
                transition: 'all .2s',
              }}
            >
              Start tracking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import HabitGlyph, { GLYPH_SHAPES, GLYPH_COLORS, getGlyphForHabit } from './HabitGlyph';
import type { GlyphShape } from './HabitGlyph';
import type { Habit } from '../types/habit';
import { IconClose, IconClock } from './Icons';

const CATEGORIES = ['General', 'Health', 'Fitness', 'Mindfulness', 'Learning', 'Productivity', 'Self-care', 'Social'];
const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-ink-4)', padding: '0 2px' }}>
      {children}
    </div>
  );
}

interface EditHabitModalProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditHabitModal({ habit, isOpen, onClose }: EditHabitModalProps) {
  const { editHabit, deleteHabit } = useHabits();

  const initGlyph = getGlyphForHabit(habit.emoji, habit.category || 'General', habit.glyphShape, habit.glyphColor);

  const [name, setName] = useState(habit.name);
  const [selectedShape, setSelectedShape] = useState<GlyphShape>(initGlyph.shape);
  const [selectedColor, setSelectedColor] = useState(initGlyph.color);
  const [category, setCategory] = useState(habit.category || 'General');
  const [target, setTarget] = useState(habit.target || '');
  const [targetCount, setTargetCount] = useState<string>(habit.targetCount ? String(habit.targetCount) : '');
  const [schedule, setSchedule] = useState<number[]>(habit.schedule || [0, 1, 2, 3, 4, 5, 6]);
  const [reminderTime, setReminderTime] = useState(habit.reminderTime || '');
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const g = getGlyphForHabit(habit.emoji, habit.category || 'General', habit.glyphShape, habit.glyphColor);
      setName(habit.name);
      setSelectedShape(g.shape);
      setSelectedColor(g.color);
      setCategory(habit.category || 'General');
      setTarget(habit.target || '');
      setTargetCount(habit.targetCount ? String(habit.targetCount) : '');
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
    const tc = parseInt(targetCount, 10);
    editHabit(habit.id, {
      name: name.trim(),
      category,
      target,
      targetCount: Number.isFinite(tc) && tc > 0 ? tc : null,
      schedule,
      reminderTime: reminderTime || null,
      glyphShape: selectedShape,
      glyphColor: selectedColor,
    });
    onClose();
  };

  const handleDelete = () => {
    deleteHabit(habit.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 }}
      className="animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{ background: 'var(--color-bg)', width: '100%', maxWidth: 480, borderRadius: '24px 24px 0 0', maxHeight: '92dvh', overflowY: 'auto', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
        className="animate-slide-up no-scrollbar"
      >
        {/* Header */}
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--color-bg)', zIndex: 2, borderBottom: '1px solid rgba(30,35,31,.06)' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-ink-2)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconClose size={16} />Cancel
          </button>
          <div style={{ fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '.1em', fontWeight: 700, textTransform: 'uppercase' }}>Edit Habit</div>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            style={{ background: name.trim() ? 'var(--color-forest)' : 'var(--color-sage-100)', color: name.trim() ? '#F5F2E8' : 'var(--color-ink-4)', border: 'none', borderRadius: 999, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: name.trim() ? 'pointer' : 'default', transition: 'all .2s' }}
          >
            Save
          </button>
        </div>

        {/* Preview */}
        <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <HabitGlyph shape={selectedShape} color={selectedColor} size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="font-serif" style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: -0.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name || 'Habit name'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 2 }}>{target || category}</div>
          </div>
        </div>

        {/* Name */}
        <div style={{ padding: '4px 16px 12px' }}>
          <FieldLabel>Name</FieldLabel>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

        {/* Save */}
        <div style={{ padding: '8px 16px 4px' }}>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            style={{
              width: '100%', padding: '16px', borderRadius: 16, border: 'none',
              background: name.trim() ? 'var(--color-forest)' : 'var(--color-sage-100)',
              color: name.trim() ? '#F5F2E8' : 'var(--color-ink-4)',
              fontSize: 15, fontWeight: 700, cursor: name.trim() ? 'pointer' : 'default',
              transition: 'all .2s',
            }}
          >
            Save Changes
          </button>
        </div>

        {/* Delete */}
        <div style={{ padding: '8px 16px 4px' }}>
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)}
              style={{ width: '100%', textAlign: 'center', fontSize: 13, color: 'var(--color-ink-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0' }}>
              Delete this habit
            </button>
          ) : (
            <div style={{ padding: 16, background: 'color-mix(in oklch, var(--color-terracotta) 8%, var(--color-card))', borderRadius: 16, border: '1px solid color-mix(in oklch, var(--color-terracotta) 20%, transparent)', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--color-terracotta)', marginBottom: 12, fontWeight: 600 }}>Are you sure? This cannot be undone.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowDelete(false)} style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.10)', color: 'var(--color-ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleDelete} style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'var(--color-terracotta)', border: 'none', color: '#F5F2E8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

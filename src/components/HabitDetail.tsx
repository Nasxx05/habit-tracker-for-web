import { useState, useEffect, useRef } from 'react';
import { useHabits } from '../context/HabitContext';
import { usePremium } from '../context/PremiumContext';
import { formatDate, getToday } from '../utils/dateHelpers';
import EditHabitModal from './EditHabitModal';
import ShareCardModal from './ShareCardModal';
import UpgradeModal from './UpgradeModal';
import HabitGlyph, { getGlyphForHabit } from './HabitGlyph';
import { Heatmap, Sparkline } from './DataViz';
import { IconChevronL, IconShare, IconMore, IconEdit, IconTrending } from './Icons';

function StatBlock({ label, value, unit, accent }: { label: string; value: number; unit: string; accent?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-ink-4)' }}>{label}</div>
      <div className="tnum" style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.6, color: accent ? 'var(--color-terracotta)' : 'var(--color-ink)', marginTop: 3 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--color-ink-3)', fontWeight: 500, marginTop: -2 }}>{unit}</div>
    </div>
  );
}

export default function HabitDetail() {
  const { habits, selectedHabitId, setCurrentView, reflections, addReflection, toggleHabit, toggleSkipDay } = useHabits();
  const { isPremium, freezesLeft } = usePremium();
  const habit = habits.find(h => h.id === selectedHabitId);

  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showShareUpgrade, setShowShareUpgrade] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const todayStr = getToday();

  useEffect(() => {
    if (!reflectionText.trim() || !habit) return;
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      addReflection(habit.id, reflectionText.trim());
      setSaveStatus('saved');
      saveTimerRef.current = setTimeout(() => { setReflectionText(''); setSaveStatus('idle'); }, 2000);
    }, 2000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [reflectionText, habit, addReflection]);

  if (!habit) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
        <p style={{ color: 'var(--color-ink-3)', margin: '0 0 16px' }}>Habit not found</p>
        <button onClick={() => setCurrentView('home')} style={{ color: 'var(--color-forest)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Go back</button>
      </div>
    );
  }

  const { shape, color } = getGlyphForHabit(habit.emoji, habit.category, habit.glyphShape, habit.glyphColor);
  const skipDates = habit.skipDates || [];
  const isSkippedToday = skipDates.includes(todayStr);
  const habitReflections = reflections.filter(r => r.habitId === habit.id).slice(0, 3);

  // 8-week weekly rollup for sparkline
  const weekly: number[] = [];
  const set = new Set(habit.completionDates);
  for (let w = 7; w >= 0; w--) {
    let c = 0;
    for (let d = 0; d < 7; d++) {
      const day = new Date();
      day.setDate(day.getDate() - (w * 7 + d));
      if (set.has(formatDate(day))) c++;
    }
    weekly.push(c);
  }

  const daysSinceCreated = Math.max(1, Math.ceil((Date.now() - new Date(habit.createdAt).getTime()) / 86400000));
  const completionRate = Math.min(100, Math.round((habit.completionDates.length / daysSinceCreated) * 100));

  return (
    <div className="max-w-3xl mx-auto pb-28 animate-fade-in" style={{ background: 'var(--color-bg)', minHeight: '100dvh' }}>

      {/* Top bar */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'color-mix(in oklch, var(--color-bg) 90%, transparent)', backdropFilter: 'blur(16px)', zIndex: 10 }}>
        <button onClick={() => setCurrentView('home')} style={{ background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.08)', width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-ink-2)' }}>
          <IconChevronL size={18} />
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => { if (isPremium) setShowShare(true); else setShowShareUpgrade(true); }} style={{ background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.08)', width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-ink-2)' }}>
            <IconShare size={16} />
          </button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.08)', width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-ink-2)' }}>
              <IconMore size={16} />
            </button>
            {showMenu && (
              <div style={{ position: 'absolute', right: 0, top: 42, background: 'var(--color-card)', borderRadius: 14, boxShadow: '0 2px 6px rgba(30,35,31,.05), 0 8px 24px rgba(30,35,31,.05)', border: '1px solid rgba(30,35,31,.08)', padding: '4px 0', zIndex: 50, minWidth: 200 }}>
                <button onClick={() => { setShowMenu(false); setShowEdit(true); }} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, color: 'var(--color-ink)', background: 'none', border: 'none', cursor: 'pointer' }}>Edit Habit</button>
                <button onClick={() => { toggleHabit(habit.id); setShowMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, color: 'var(--color-ink)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {habit.isCompletedToday ? 'Undo Today' : 'Complete Today'}
                </button>
                <button onClick={() => { toggleSkipDay(habit.id, todayStr); setShowMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, color: 'var(--color-ink)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {isSkippedToday ? 'Remove Skip' : 'Skip Today (Rest Day)'}
                </button>
                <div style={{ height: 1, background: 'rgba(30,35,31,.08)', margin: '4px 0' }} />
                <div style={{ padding: '10px 16px', fontSize: 13, color: 'var(--color-ink-2)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Streak Freeze</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isPremium ? 'var(--color-ice)' : 'var(--color-ink-4)' }}>
                    {isPremium ? `🧊 ${freezesLeft} left` : '· Premium'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '8px 20px 20px', display: 'flex', gap: 16, alignItems: 'center' }}>
        <HabitGlyph shape={shape} color={color} size={60} />
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>{habit.category} · {habit.target || 'daily'}</div>
          <div className="font-serif" style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6, color: 'var(--color-ink)', marginTop: 2 }}>{habit.name}</div>
        </div>
      </div>

      {/* Skip banner */}
      {isSkippedToday && (
        <div style={{ margin: '0 16px 14px', padding: '12px 16px', borderRadius: 14, background: 'var(--color-butter)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>💤</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>Today is a rest day — streak is safe!</span>
        </div>
      )}

      {/* Stat trio */}
      <div style={{ margin: '0 16px 14px', background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.08)', borderRadius: 20, padding: 16, boxShadow: '0 1px 2px rgba(30,35,31,.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr', alignItems: 'center', gap: 12 }}>
          <StatBlock label="Current" value={habit.currentStreak} unit="days" accent />
          <div style={{ background: 'rgba(30,35,31,.08)', width: 1, height: 36, justifySelf: 'center' }} />
          <StatBlock label="Longest" value={habit.longestStreak} unit="days" />
          <div style={{ background: 'rgba(30,35,31,.08)', width: 1, height: 36, justifySelf: 'center' }} />
          <StatBlock label="Total" value={habit.completionDates.length} unit="done" />
        </div>
      </div>

      {/* 17-week heatmap */}
      <div style={{ margin: '0 16px 14px', background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.08)', borderRadius: 20, padding: 18, boxShadow: '0 1px 2px rgba(30,35,31,.04)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-ink-4)' }}>Last 17 weeks</div>
            <div className="tnum" style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', marginTop: 2 }}>
              {habit.completionDates.length} completions <span style={{ fontWeight: 500, color: 'var(--color-ink-3)' }}>· {completionRate}% rate</span>
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }} className="no-scrollbar">
          <Heatmap completedDates={habit.completionDates} weeks={17} cell={12} gap={3} color={color} empty="var(--color-sage-100)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 10, fontSize: 10, color: 'var(--color-ink-4)', fontWeight: 600 }}>
          Less
          <div style={{ display: 'flex', gap: 2 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--color-sage-100)' }} />
            <div style={{ width: 10, height: 10, borderRadius: 2, background: `color-mix(in oklch, ${color} 40%, var(--color-sage-100))` }} />
            <div style={{ width: 10, height: 10, borderRadius: 2, background: `color-mix(in oklch, ${color} 70%, var(--color-sage-100))` }} />
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
          </div>
          More
        </div>
      </div>

      {/* 8-week sparkline */}
      <div style={{ margin: '0 16px 14px', background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.08)', borderRadius: 20, padding: 18, boxShadow: '0 1px 2px rgba(30,35,31,.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-ink-4)' }}>8-week trend</div>
            <div className="tnum" style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', marginTop: 2 }}>
              Avg {(weekly.reduce((a, b) => a + b, 0) / weekly.length).toFixed(1)} days/week
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-sage-500)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <IconTrending size={12} />Tracking
          </div>
        </div>
        <Sparkline values={weekly} width={Math.min(window.innerWidth - 68, 400)} height={72} color={color} fill={`color-mix(in oklch, ${color} 20%, transparent)`} />
      </div>

      {/* Reflection */}
      <div style={{ margin: '0 16px 14px', padding: '18px 20px', borderRadius: 20, background: 'var(--color-forest)', color: '#F5F2E8' }}>
        {habitReflections.length > 0 && (
          <>
            <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, opacity: .7 }}>
              Latest reflection
            </div>
            <div className="font-serif" style={{ fontSize: 16, lineHeight: 1.5, marginTop: 8, fontWeight: 400, letterSpacing: -0.2 }}>
              "{habitReflections[0].text}"
            </div>
            <div style={{ marginTop: 10, fontSize: 11, opacity: .65 }}>
              {new Date(habitReflections[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {habitReflections.length} reflection{habitReflections.length !== 1 ? 's' : ''} total
            </div>
          </>
        )}
        {habitReflections.length === 0 && (
          <div style={{ fontSize: 13, opacity: .7, fontStyle: 'italic' }}>No reflections yet. Add one below.</div>
        )}
      </div>

      {/* Write reflection */}
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 8 }}>Daily Reflection</div>
        <div style={{ background: 'var(--color-card)', border: '1px solid rgba(30,35,31,.08)', borderRadius: 16, overflow: 'hidden' }}>
          <textarea
            value={reflectionText}
            onChange={e => setReflectionText(e.target.value)}
            placeholder={`How did "${habit.name}" go today?`}
            rows={3}
            style={{
              width: '100%', padding: '14px 16px', background: 'none', border: 'none', outline: 'none', resize: 'none',
              fontFamily: 'inherit', fontSize: 14, color: 'var(--color-ink)', lineHeight: 1.5,
            }}
          />
          {saveStatus !== 'idle' && (
            <div style={{ padding: '6px 16px 10px', fontSize: 11, color: 'var(--color-ink-3)', fontWeight: 600 }}>
              {saveStatus === 'saving' ? 'Saving…' : '✓ Saved'}
            </div>
          )}
        </div>
        <button onClick={() => { setShowEdit(true); }} style={{ marginTop: 10, width: '100%', padding: '12px', background: 'var(--color-sage-50)', color: 'var(--color-forest)', fontWeight: 700, fontSize: 13, borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <IconEdit size={14} />Edit habit settings
        </button>
      </div>

      <EditHabitModal isOpen={showEdit} onClose={() => setShowEdit(false)} habit={habit} />
      <ShareCardModal isOpen={showShare} onClose={() => setShowShare(false)} habit={habit} />
      <UpgradeModal isOpen={showShareUpgrade} onClose={() => setShowShareUpgrade(false)} />
    </div>
  );
}

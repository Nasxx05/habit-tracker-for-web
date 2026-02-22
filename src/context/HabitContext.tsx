import { createContext, useContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Habit, View, Reflection, UserProfile, Milestone, UndoAction, ThemeMode } from '../types/habit';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getToday, formatDate } from '../utils/dateHelpers';
import { calculateStreak, calculateLongestStreak } from '../utils/streakCalculator';

const DEFAULT_MILESTONES: Milestone[] = [
  { id: 'first-step', name: 'First Step', description: 'Complete 1 habit', icon: '🌱', unlocked: false, unlockedAt: null },
  { id: 'week-warrior', name: 'Week Warrior', description: '7 Day Streak', icon: '🔥', unlocked: false, unlockedAt: null },
  { id: 'consistent', name: 'Consistent', description: '14 Day Streak', icon: '🌟', unlocked: false, unlockedAt: null },
  { id: 'month-master', name: 'Month Master', description: '30 Day Streak', icon: '🏆', unlocked: false, unlockedAt: null },
  { id: 'centurion', name: 'Centurion', description: '100 Completions', icon: '💯', unlocked: false, unlockedAt: null },
  { id: 'collector', name: 'Collector', description: '5 Active Habits', icon: '📋', unlocked: false, unlockedAt: null },
  { id: 'reflective', name: 'Reflective', description: '10 Reflections', icon: '📝', unlocked: false, unlockedAt: null },
  { id: 'perfect-week', name: 'Perfect Week', description: '7 Perfect Days', icon: '💎', unlocked: false, unlockedAt: null },
];

interface HabitContextType {
  habits: Habit[];
  currentView: View;
  hasVisitedBefore: boolean;
  selectedHabitId: string | null;
  profile: UserProfile;
  reflections: Reflection[];
  milestones: Milestone[];
  theme: ThemeMode;
  undoAction: UndoAction | null;
  addHabit: (name: string, emoji: string, category?: string, target?: string, schedule?: number[], reminderTime?: string | null) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string) => void;
  editHabit: (id: string, updates: Partial<Pick<Habit, 'name' | 'emoji' | 'category' | 'target' | 'schedule' | 'reminderTime'>>) => void;
  reorderHabits: (startIndex: number, endIndex: number) => void;
  setCurrentView: (view: View) => void;
  setHasVisitedBefore: (value: boolean) => void;
  selectHabit: (id: string | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addReflection: (habitId: string, text: string) => void;
  toggleSkipDay: (habitId: string, date: string) => void;
  setTheme: (mode: ThemeMode) => void;
  executeUndo: () => void;
  dismissUndo: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  completedToday: number;
  totalHabits: number;
  scheduledToday: Habit[];
}

const HabitContext = createContext<HabitContextType | null>(null);

// Ensure all habits have required fields (handles data from older versions)
function migrateHabits(rawHabits: Habit[]): Habit[] {
  if (!Array.isArray(rawHabits)) return [];
  return rawHabits.filter((h) => h && typeof h === 'object' && h.id).map((h) => ({
    ...h,
    schedule: Array.isArray(h.schedule) ? h.schedule : [0, 1, 2, 3, 4, 5, 6],
    skipDates: Array.isArray(h.skipDates) ? h.skipDates : [],
    target: h.target || '',
    reminderTime: h.reminderTime ?? null,
    completionDates: Array.isArray(h.completionDates) ? h.completionDates : [],
    createdAt: h.createdAt || new Date().toISOString(),
    longestStreak: h.longestStreak || 0,
    currentStreak: h.currentStreak || 0,
  }));
}

export function HabitProvider({ children }: { children: ReactNode }) {
  const [rawHabits, setHabits] = useLocalStorage<Habit[]>('habits', []);
  const habits = useMemo(() => migrateHabits(rawHabits), [rawHabits]);
  const [currentView, setCurrentView] = useLocalStorage<View>('currentView', 'welcome');
  const [hasVisitedBefore, setHasVisitedBefore] = useLocalStorage<boolean>('hasVisited', false);
  const [lastActiveDate, setLastActiveDate] = useLocalStorage<string>('lastActiveDate', '');
  const [selectedHabitId, setSelectedHabitId] = useLocalStorage<string | null>('selectedHabitId', null);
  const [rawProfile, setProfile] = useLocalStorage<UserProfile>('userProfile', {
    name: 'User',
    tagline: '',
    joinDate: new Date().toISOString(),
    avatar: '',
  });
  const profile = useMemo(() => ({ ...rawProfile, tagline: rawProfile.tagline || '', avatar: rawProfile.avatar || '' }), [rawProfile]);
  const [reflections, setReflections] = useLocalStorage<Reflection[]>('reflections', []);
  const [milestones, setMilestones] = useLocalStorage<Milestone[]>('milestones', DEFAULT_MILESTONES);
  const [theme, setThemeStorage] = useLocalStorage<ThemeMode>('themeMode', 'light');
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  // Auto-dismiss undo after 5 seconds
  useEffect(() => {
    if (!undoAction) return;
    const timer = setTimeout(() => setUndoAction(null), 5000);
    return () => clearTimeout(timer);
  }, [undoAction]);

  // Persist migrated habits back to storage if needed
  useEffect(() => {
    const needsMigration = rawHabits.some((h) => !h.schedule || !h.skipDates || h.target === undefined);
    if (needsMigration) {
      setHabits(migrateHabits(rawHabits));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check and unlock milestones
  useEffect(() => {
    const totalCompletions = habits.reduce((sum, h) => sum + h.completionDates.length, 0);
    const bestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
    const today = getToday();

    // Count perfect days (last 30 days)
    let perfectDayCount = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const scheduled = habits.filter((h) => h.schedule.includes(d.getDay()));
      if (scheduled.length > 0 && scheduled.every((h) => h.completionDates.includes(dateStr))) {
        perfectDayCount++;
      }
    }

    setMilestones((prev: Milestone[]) => {
      let changed = false;
      const updated = prev.map((m) => {
        if (m.unlocked) return m;
        let shouldUnlock = false;
        if (m.id === 'first-step' && totalCompletions >= 1) shouldUnlock = true;
        if (m.id === 'week-warrior' && bestStreak >= 7) shouldUnlock = true;
        if (m.id === 'consistent' && bestStreak >= 14) shouldUnlock = true;
        if (m.id === 'month-master' && bestStreak >= 30) shouldUnlock = true;
        if (m.id === 'centurion' && totalCompletions >= 100) shouldUnlock = true;
        if (m.id === 'collector' && habits.length >= 5) shouldUnlock = true;
        if (m.id === 'reflective' && reflections.length >= 10) shouldUnlock = true;
        if (m.id === 'perfect-week' && perfectDayCount >= 7) shouldUnlock = true;
        if (shouldUnlock) {
          changed = true;
          return { ...m, unlocked: true, unlockedAt: today };
        }
        return m;
      });
      return changed ? updated : prev;
    });
  }, [habits, reflections, setMilestones]);

  // Reset daily completion status when the day changes
  useEffect(() => {
    const today = getToday();
    if (lastActiveDate && lastActiveDate !== today) {
      setHabits((prev: Habit[]) =>
        prev.map((habit) => ({
          ...habit,
          skipDates: habit.skipDates || [],
          isCompletedToday: habit.completionDates.includes(today),
          currentStreak: calculateStreak(habit.completionDates, habit.completionDates.includes(today), habit.skipDates || []),
        }))
      );
    }
    setLastActiveDate(today);
  }, [lastActiveDate, setHabits, setLastActiveDate]);

  // Midnight check interval
  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const today = getToday();
      if (lastActiveDate !== today) {
        setLastActiveDate(today);
        setHabits((prev: Habit[]) =>
          prev.map((habit) => ({
            ...habit,
            isCompletedToday: false,
            currentStreak: calculateStreak(habit.completionDates, false, habit.skipDates || []),
          }))
        );
      }
    }, 60000);
    return () => clearInterval(checkMidnight);
  }, [lastActiveDate, setLastActiveDate, setHabits]);

  // Request notification permission on first reminder set
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Schedule notifications
  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const today = new Date();
    const dayOfWeek = today.getDay();
    const timers: ReturnType<typeof setTimeout>[] = [];

    habits.forEach((habit) => {
      if (!habit.reminderTime || !habit.schedule.includes(dayOfWeek) || habit.isCompletedToday) return;

      const [hours, minutes] = habit.reminderTime.split(':').map(Number);
      const reminderDate = new Date();
      reminderDate.setHours(hours, minutes, 0, 0);

      const delay = reminderDate.getTime() - Date.now();
      if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
        const timer = setTimeout(() => {
          new Notification(`${habit.emoji} ${habit.name}`, {
            body: `Time to complete your habit! ${habit.target || ''}`.trim(),
            icon: '/favicon.ico',
          });
        }, delay);
        timers.push(timer);
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [habits]);

  const addHabit = useCallback(
    (name: string, emoji: string, category = 'General', target = '', schedule: number[] = [0, 1, 2, 3, 4, 5, 6], reminderTime: string | null = null) => {
      if (reminderTime) requestNotificationPermission();
      const newHabit: Habit = {
        id: uuidv4(),
        name,
        emoji,
        category,
        createdAt: new Date().toISOString(),
        currentStreak: 0,
        longestStreak: 0,
        completionDates: [],
        isCompletedToday: false,
        schedule,
        reminderTime,
        target,
        skipDates: [],
      };
      setHabits((prev: Habit[]) => [...prev, newHabit]);
    },
    [setHabits, requestNotificationPermission]
  );

  const deleteHabit = useCallback(
    (id: string) => {
      const habitToDelete = habits.find((h) => h.id === id);
      if (habitToDelete) {
        setUndoAction({ type: 'delete', habitId: id, habitData: { ...habitToDelete }, timestamp: Date.now() });
      }
      setHabits((prev: Habit[]) => prev.filter((h) => h.id !== id));
    },
    [habits, setHabits]
  );

  const toggleHabit = useCallback(
    (id: string) => {
      const today = getToday();
      setHabits((prev: Habit[]) =>
        prev.map((habit) => {
          if (habit.id !== id) return habit;
          const newCompleted = !habit.isCompletedToday;
          let newDates: string[];
          if (newCompleted) {
            newDates = habit.completionDates.includes(today)
              ? habit.completionDates
              : [...habit.completionDates, today];
          } else {
            newDates = habit.completionDates.filter((d) => d !== today);
          }
          const skipDates = habit.skipDates || [];
          const newStreak = calculateStreak(newDates, newCompleted, skipDates);
          const newLongest = Math.max(calculateLongestStreak(newDates, skipDates), habit.longestStreak);
          return {
            ...habit,
            isCompletedToday: newCompleted,
            completionDates: newDates,
            currentStreak: newStreak,
            longestStreak: newLongest,
          };
        })
      );
      setUndoAction({ type: 'toggle', habitId: id, timestamp: Date.now() });
    },
    [setHabits]
  );

  const editHabit = useCallback(
    (id: string, updates: Partial<Pick<Habit, 'name' | 'emoji' | 'category' | 'target' | 'schedule' | 'reminderTime'>>) => {
      if (updates.reminderTime) requestNotificationPermission();
      setHabits((prev: Habit[]) =>
        prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
      );
    },
    [setHabits, requestNotificationPermission]
  );

  const reorderHabits = useCallback(
    (startIndex: number, endIndex: number) => {
      setHabits((prev: Habit[]) => {
        const result = [...prev];
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
      });
    },
    [setHabits]
  );

  const selectHabit = useCallback(
    (id: string | null) => {
      setSelectedHabitId(id);
      if (id) setCurrentView('habit-detail');
    },
    [setSelectedHabitId, setCurrentView]
  );

  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      setProfile((prev: UserProfile) => ({ ...prev, ...updates }));
    },
    [setProfile]
  );

  const addReflection = useCallback(
    (habitId: string, text: string) => {
      const newReflection: Reflection = {
        id: uuidv4(),
        habitId,
        date: getToday(),
        text,
        createdAt: new Date().toISOString(),
      };
      setReflections((prev: Reflection[]) => [newReflection, ...prev]);
    },
    [setReflections]
  );

  const toggleSkipDay = useCallback(
    (habitId: string, date: string) => {
      setHabits((prev: Habit[]) =>
        prev.map((h) => {
          if (h.id !== habitId) return h;
          const skipDates = h.skipDates || [];
          const newSkipDates = skipDates.includes(date)
            ? skipDates.filter((d) => d !== date)
            : [...skipDates, date];
          const newStreak = calculateStreak(h.completionDates, h.isCompletedToday, newSkipDates);
          const newLongest = Math.max(calculateLongestStreak(h.completionDates, newSkipDates), h.longestStreak);
          return { ...h, skipDates: newSkipDates, currentStreak: newStreak, longestStreak: newLongest };
        })
      );
    },
    [setHabits]
  );

  const setTheme = useCallback(
    (mode: ThemeMode) => {
      setThemeStorage(mode);
    },
    [setThemeStorage]
  );

  const executeUndo = useCallback(() => {
    if (!undoAction) return;
    if (undoAction.type === 'toggle') {
      const today = getToday();
      setHabits((prev: Habit[]) =>
        prev.map((habit) => {
          if (habit.id !== undoAction.habitId) return habit;
          const newCompleted = !habit.isCompletedToday;
          let newDates: string[];
          if (newCompleted) {
            newDates = habit.completionDates.includes(today)
              ? habit.completionDates
              : [...habit.completionDates, today];
          } else {
            newDates = habit.completionDates.filter((d) => d !== today);
          }
          const skipDates = habit.skipDates || [];
          const newStreak = calculateStreak(newDates, newCompleted, skipDates);
          const newLongest = Math.max(calculateLongestStreak(newDates, skipDates), habit.longestStreak);
          return { ...habit, isCompletedToday: newCompleted, completionDates: newDates, currentStreak: newStreak, longestStreak: newLongest };
        })
      );
    } else if (undoAction.type === 'delete' && undoAction.habitData) {
      setHabits((prev: Habit[]) => [...prev, undoAction.habitData!]);
    }
    setUndoAction(null);
  }, [undoAction, setHabits]);

  const dismissUndo = useCallback(() => {
    setUndoAction(null);
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify({
      habits,
      profile,
      reflections,
      milestones,
      exportDate: new Date().toISOString(),
      version: 2,
    }, null, 2);
  }, [habits, profile, reflections, milestones]);

  const importData = useCallback((json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.habits && Array.isArray(data.habits)) {
        setHabits(data.habits.map((h: Habit) => ({ ...h, skipDates: h.skipDates || [] })));
      }
      if (data.profile) setProfile(data.profile);
      if (data.reflections) setReflections(data.reflections);
      if (data.milestones) setMilestones(data.milestones);
      return true;
    } catch {
      return false;
    }
  }, [setHabits, setProfile, setReflections, setMilestones]);

  const today = new Date();
  const dayOfWeek = today.getDay();
  const scheduledToday = habits.filter((h) => h.schedule.includes(dayOfWeek));
  const completedToday = scheduledToday.filter((h) => h.isCompletedToday).length;
  const totalHabits = scheduledToday.length;

  return (
    <HabitContext.Provider
      value={{
        habits,
        currentView,
        hasVisitedBefore,
        selectedHabitId,
        profile,
        reflections,
        milestones,
        theme,
        undoAction,
        addHabit,
        deleteHabit,
        toggleHabit,
        editHabit,
        reorderHabits,
        setCurrentView,
        setHasVisitedBefore,
        selectHabit,
        updateProfile,
        addReflection,
        toggleSkipDay,
        setTheme,
        executeUndo,
        dismissUndo,
        exportData,
        importData,
        completedToday,
        totalHabits,
        scheduledToday,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}

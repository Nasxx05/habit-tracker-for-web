import { createContext, useContext, useCallback, useEffect, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Habit, View, Reflection, UserProfile, Milestone } from '../types/habit';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getToday } from '../utils/dateHelpers';
import { calculateStreak, calculateLongestStreak } from '../utils/streakCalculator';

const DEFAULT_MILESTONES: Milestone[] = [
  { id: 'early-bird', name: 'Early Bird', description: '7am Streak', icon: '🌅', unlocked: false, unlockedAt: null },
  { id: 'zen-master', name: 'Zen Master', description: '10 Meditations', icon: '🧘', unlocked: false, unlockedAt: null },
  { id: 'hydrated', name: 'Hydrated', description: 'Water Goal', icon: '💧', unlocked: false, unlockedAt: null },
  { id: 'deep-focus', name: 'Deep Focus', description: '50 Hours', icon: '🧠', unlocked: false, unlockedAt: null },
  { id: 'week-warrior', name: 'Week Warrior', description: '7 Day Streak', icon: '🔥', unlocked: false, unlockedAt: null },
  { id: 'month-master', name: 'Month Master', description: '30 Day Streak', icon: '🏆', unlocked: false, unlockedAt: null },
  { id: 'centurion', name: 'Centurion', description: '100 Completions', icon: '💯', unlocked: false, unlockedAt: null },
  { id: 'consistent', name: 'Consistent', description: '14 Day Streak', icon: '🌟', unlocked: false, unlockedAt: null },
];

interface HabitContextType {
  habits: Habit[];
  currentView: View;
  hasVisitedBefore: boolean;
  selectedHabitId: string | null;
  profile: UserProfile;
  reflections: Reflection[];
  milestones: Milestone[];
  addHabit: (name: string, emoji: string, category?: string, target?: string, schedule?: number[]) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string) => void;
  editHabit: (id: string, updates: Partial<Pick<Habit, 'name' | 'emoji' | 'category' | 'target' | 'schedule' | 'reminderTime'>>) => void;
  reorderHabits: (startIndex: number, endIndex: number) => void;
  setCurrentView: (view: View) => void;
  setHasVisitedBefore: (value: boolean) => void;
  selectHabit: (id: string | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addReflection: (habitId: string, text: string) => void;
  completedToday: number;
  totalHabits: number;
}

const HabitContext = createContext<HabitContextType | null>(null);

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', []);
  const [currentView, setCurrentView] = useLocalStorage<View>('currentView', 'welcome');
  const [hasVisitedBefore, setHasVisitedBefore] = useLocalStorage<boolean>('hasVisited', false);
  const [lastActiveDate, setLastActiveDate] = useLocalStorage<string>('lastActiveDate', '');
  const [selectedHabitId, setSelectedHabitId] = useLocalStorage<string | null>('selectedHabitId', null);
  const [profile, setProfile] = useLocalStorage<UserProfile>('userProfile', {
    name: 'User',
    tagline: '',
    joinDate: new Date().toISOString(),
  });
  const [reflections, setReflections] = useLocalStorage<Reflection[]>('reflections', []);
  const [milestones, setMilestones] = useLocalStorage<Milestone[]>('milestones', DEFAULT_MILESTONES);

  // Check and unlock milestones
  useEffect(() => {
    const totalCompletions = habits.reduce((sum, h) => sum + h.completionDates.length, 0);
    const bestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
    const today = getToday();

    setMilestones((prev: Milestone[]) => {
      let changed = false;
      const updated = prev.map((m) => {
        if (m.unlocked) return m;
        let shouldUnlock = false;
        if (m.id === 'week-warrior' && bestStreak >= 7) shouldUnlock = true;
        if (m.id === 'consistent' && bestStreak >= 14) shouldUnlock = true;
        if (m.id === 'month-master' && bestStreak >= 30) shouldUnlock = true;
        if (m.id === 'centurion' && totalCompletions >= 100) shouldUnlock = true;
        if (shouldUnlock) {
          changed = true;
          return { ...m, unlocked: true, unlockedAt: today };
        }
        return m;
      });
      return changed ? updated : prev;
    });
  }, [habits, setMilestones]);

  // Reset daily completion status when the day changes
  useEffect(() => {
    const today = getToday();
    if (lastActiveDate && lastActiveDate !== today) {
      setHabits((prev: Habit[]) =>
        prev.map((habit) => ({
          ...habit,
          isCompletedToday: habit.completionDates.includes(today),
          currentStreak: calculateStreak(habit.completionDates, habit.completionDates.includes(today)),
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
            currentStreak: calculateStreak(habit.completionDates, false),
          }))
        );
      }
    }, 60000);
    return () => clearInterval(checkMidnight);
  }, [lastActiveDate, setLastActiveDate, setHabits]);

  const addHabit = useCallback(
    (name: string, emoji: string, category = 'General', target = '', schedule: number[] = [0, 1, 2, 3, 4, 5, 6]) => {
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
        reminderTime: null,
        target,
      };
      setHabits((prev: Habit[]) => [...prev, newHabit]);
    },
    [setHabits]
  );

  const deleteHabit = useCallback(
    (id: string) => {
      setHabits((prev: Habit[]) => prev.filter((h) => h.id !== id));
    },
    [setHabits]
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
          const newStreak = calculateStreak(newDates, newCompleted);
          const newLongest = Math.max(calculateLongestStreak(newDates), habit.longestStreak);
          return {
            ...habit,
            isCompletedToday: newCompleted,
            completionDates: newDates,
            currentStreak: newStreak,
            longestStreak: newLongest,
          };
        })
      );
    },
    [setHabits]
  );

  const editHabit = useCallback(
    (id: string, updates: Partial<Pick<Habit, 'name' | 'emoji' | 'category' | 'target' | 'schedule' | 'reminderTime'>>) => {
      setHabits((prev: Habit[]) =>
        prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
      );
    },
    [setHabits]
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

  const completedToday = habits.filter((h) => h.isCompletedToday).length;
  const totalHabits = habits.length;

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
        completedToday,
        totalHabits,
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

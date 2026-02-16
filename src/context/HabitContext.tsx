import { createContext, useContext, useCallback, useEffect, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Habit, View } from '../types/habit';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getToday } from '../utils/dateHelpers';
import { calculateStreak, calculateLongestStreak } from '../utils/streakCalculator';

interface HabitContextType {
  habits: Habit[];
  currentView: View;
  hasVisitedBefore: boolean;
  addHabit: (name: string, emoji: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string) => void;
  editHabit: (id: string, name: string, emoji: string) => void;
  reorderHabits: (startIndex: number, endIndex: number) => void;
  setCurrentView: (view: View) => void;
  setHasVisitedBefore: (value: boolean) => void;
  completedToday: number;
  totalHabits: number;
}

const HabitContext = createContext<HabitContextType | null>(null);

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', []);
  const [currentView, setCurrentView] = useLocalStorage<View>('currentView', 'welcome');
  const [hasVisitedBefore, setHasVisitedBefore] = useLocalStorage<boolean>('hasVisited', false);
  const [lastActiveDate, setLastActiveDate] = useLocalStorage<string>('lastActiveDate', '');

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
    (name: string, emoji: string) => {
      const newHabit: Habit = {
        id: uuidv4(),
        name,
        emoji,
        createdAt: new Date().toISOString(),
        currentStreak: 0,
        longestStreak: 0,
        completionDates: [],
        isCompletedToday: false,
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
          const newLongest = Math.max(
            calculateLongestStreak(newDates),
            habit.longestStreak
          );

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
    (id: string, name: string, emoji: string) => {
      setHabits((prev: Habit[]) =>
        prev.map((h) => (h.id === id ? { ...h, name, emoji } : h))
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

  const completedToday = habits.filter((h) => h.isCompletedToday).length;
  const totalHabits = habits.length;

  return (
    <HabitContext.Provider
      value={{
        habits,
        currentView,
        hasVisitedBefore,
        addHabit,
        deleteHabit,
        toggleHabit,
        editHabit,
        reorderHabits,
        setCurrentView,
        setHasVisitedBefore,
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

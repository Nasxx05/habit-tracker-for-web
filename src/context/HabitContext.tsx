import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Habit, View, Reflection, UserProfile, Milestone, UndoAction, StreakBadge } from '../types/habit';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getToday, formatDate } from '../utils/dateHelpers';
import { calculateStreak, calculateLongestStreak, STREAK_MILESTONES } from '../utils/streakCalculator';
import { uploadData, downloadData } from '../lib/sync';
import { usePremium } from './PremiumContext';

const DEFAULT_MILESTONES: Milestone[] = [
  { id: 'first-step', name: 'First Step', description: 'Complete 1 habit', icon: '🌱', unlocked: false, unlockedAt: null },
  { id: 'week-warrior', name: 'Week Warrior', description: '7 Day Streak', icon: '🔥', unlocked: false, unlockedAt: null },
  { id: 'consistent', name: 'Consistent', description: '14 Day Streak', icon: '🌟', unlocked: false, unlockedAt: null },
  { id: 'month-master', name: 'Month Master', description: '30 Day Streak', icon: '🏆', unlocked: false, unlockedAt: null },
  { id: 'centurion', name: 'Centurion', description: '100 Completions', icon: '💯', unlocked: false, unlockedAt: null },
  { id: 'collector', name: 'Collector', description: '5 Active Habits', icon: '📋', unlocked: false, unlockedAt: null },
  { id: 'reflective', name: 'Reflective', description: '10 Reflections', icon: '📝', unlocked: false, unlockedAt: null },
];

interface FreezeEvent {
  habitId: string;
  habitName: string;
  habitEmoji: string;
  freezesLeft: number;
}

interface StreakLossEvent {
  habitId: string;
  habitName: string;
  habitEmoji: string;
  lostStreak: number;
}

interface BadgeEvent {
  milestone: number;
  habitName: string;
  habitEmoji: string;
}

interface HabitContextType {
  habits: Habit[];
  currentView: View;
  hasVisitedBefore: boolean;
  selectedHabitId: string | null;
  profile: UserProfile;
  reflections: Reflection[];
  milestones: Milestone[];
  undoAction: UndoAction | null;
  hasCollectedDetails: boolean;
  streakBadges: StreakBadge[];
  freezeEvent: FreezeEvent | null;
  streakLossEvent: StreakLossEvent | null;
  badgeEvent: BadgeEvent | null;
  notificationPermission: NotificationPermission | 'unsupported';
  setHasCollectedDetails: (value: boolean) => void;
  addHabit: (name: string, emoji: string, category?: string, target?: string, schedule?: number[], reminderTime?: string | null, targetCount?: number | null, color?: string | null) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string) => void;
  incrementHabit: (id: string, delta?: number) => void;
  toggleReminder: (id: string) => void;
  editHabit: (id: string, updates: Partial<Pick<Habit, 'name' | 'emoji' | 'category' | 'target' | 'schedule' | 'reminderTime' | 'targetCount' | 'color'>>) => void;
  reorderHabits: (startIndex: number, endIndex: number) => void;
  setCurrentView: (view: View) => void;
  setHasVisitedBefore: (value: boolean) => void;
  selectHabit: (id: string | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addReflection: (habitId: string, text: string) => void;
  toggleSkipDay: (habitId: string, date: string) => void;
  executeUndo: () => void;
  dismissUndo: () => void;
  dismissFreezeEvent: () => void;
  dismissStreakLossEvent: () => void;
  dismissBadgeEvent: () => void;
  requestNotificationPermission: () => Promise<void>;
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
    freezeDates: Array.isArray(h.freezeDates) ? h.freezeDates : [],
    target: h.target || '',
    targetCount: typeof h.targetCount === 'number' ? h.targetCount : null,
    progressByDate: h.progressByDate && typeof h.progressByDate === 'object' ? h.progressByDate : {},
    color: typeof h.color === 'string' ? h.color : null,
    reminderTime: h.reminderTime ?? null,
    completionDates: Array.isArray(h.completionDates) ? h.completionDates : [],
    createdAt: h.createdAt || new Date().toISOString(),
    longestStreak: h.longestStreak || 0,
    currentStreak: h.currentStreak || 0,
  }));
}

export function HabitProvider({ children, syncUserId }: { children: ReactNode; syncUserId?: string | null }) {
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
  const [hasCollectedDetails, setHasCollectedDetails] = useLocalStorage<boolean>('hasCollectedDetails', false);
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);

  // Streak freeze state — premium feature, backed by PremiumContext / Supabase
  const { isPremium, freezesLeft, consumeFreeze } = usePremium();
  const isPremiumRef = useRef(isPremium);
  const freezesLeftRef = useRef(freezesLeft);
  const consumeFreezeRef = useRef(consumeFreeze);
  isPremiumRef.current = isPremium;
  freezesLeftRef.current = freezesLeft;
  consumeFreezeRef.current = consumeFreeze;
  const [freezeEvent, setFreezeEvent] = useState<FreezeEvent | null>(null);

  // Streak loss state
  const [streakLossEvent, setStreakLossEvent] = useState<StreakLossEvent | null>(null);

  // Streak badges
  const [streakBadges, setStreakBadges] = useLocalStorage<StreakBadge[]>('streakBadges', []);
  const [badgeEvent, setBadgeEvent] = useState<BadgeEvent | null>(null);

  // --- Cloud sync ---
  const hasSyncedRef = useRef(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Download from cloud on first sign-in
  useEffect(() => {
    if (!syncUserId || hasSyncedRef.current) return;
    hasSyncedRef.current = true;
    downloadData(syncUserId).then((cloud) => {
      if (!cloud) {
        uploadData(syncUserId, { habits, profile, reflections, milestones });
        return;
      }
      if (cloud.habits?.length) {
        setHabits(cloud.habits);
        const hasCompletions = cloud.habits.some((h) => h.completionDates?.length > 0);
        if (hasCompletions) setHasCollectedDetails(true);
      }
      if (cloud.profile?.name) setProfile(cloud.profile);
      if (cloud.reflections?.length) setReflections(cloud.reflections);
      if (cloud.milestones?.length) setMilestones(cloud.milestones);
    });
  }, [syncUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced upload on data changes (after initial sync)
  useEffect(() => {
    if (!syncUserId || !hasSyncedRef.current) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      uploadData(syncUserId, { habits, profile, reflections, milestones });
    }, 2000);
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, [syncUserId, habits, profile, reflections, milestones]);

  // Auto-dismiss undo after 5 seconds
  useEffect(() => {
    if (!undoAction) return;
    const timer = setTimeout(() => setUndoAction(null), 5000);
    return () => clearTimeout(timer);
  }, [undoAction]);

  // Persist migrated habits back to storage if needed
  useEffect(() => {
    const needsMigration = rawHabits.some((h) => !h.schedule || !h.skipDates || h.target === undefined || !Array.isArray(h.freezeDates));
    if (needsMigration) {
      setHabits(migrateHabits(rawHabits));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        if (m.id === 'first-step' && totalCompletions >= 1) shouldUnlock = true;
        if (m.id === 'week-warrior' && bestStreak >= 7) shouldUnlock = true;
        if (m.id === 'consistent' && bestStreak >= 14) shouldUnlock = true;
        if (m.id === 'month-master' && bestStreak >= 30) shouldUnlock = true;
        if (m.id === 'centurion' && totalCompletions >= 100) shouldUnlock = true;
        if (m.id === 'collector' && habits.length >= 5) shouldUnlock = true;
        if (m.id === 'reflective' && reflections.length >= 10) shouldUnlock = true;
        if (shouldUnlock) {
          changed = true;
          return { ...m, unlocked: true, unlockedAt: today };
        }
        return m;
      });
      return changed ? updated : prev;
    });
  }, [habits, reflections, setMilestones]);

  // Reset daily completion status when the day changes — with freeze logic.
  // Runs on mount and every 60s so habits reset correctly even when the app
  // stays open across midnight. A ref tracks lastActiveDate so the interval
  // closure always sees the previous date before updating it.
  const lastActiveDateRef = useRef(lastActiveDate);
  lastActiveDateRef.current = lastActiveDate;

  useEffect(() => {
    const runDayChangeCheck = () => {
      const today = getToday();
      const prevDate = lastActiveDateRef.current;

      if (prevDate && prevDate !== today) {
        const missedDate = prevDate; // The day that was missed
        const missedDateObj = new Date(missedDate + 'T12:00:00');
        const missedDow = missedDateObj.getDay();
        // Premium-gated freeze pool from Supabase. Free users get 0.
        let freezesAvailable = isPremiumRef.current ? freezesLeftRef.current : 0;
        let freezeAppliedTo: FreezeEvent | null = null;
        let streakLost: StreakLossEvent | null = null;

        setHabits((prev: Habit[]) => {
          // Find habits that missed yesterday and had an active streak — sorted by streak desc.
          // Freeze as many as we have freezes for, prioritizing the highest streaks.
          const habitsNeedingFreeze = prev
            .filter((h) => {
              if (!h.schedule.includes(missedDow)) return false;
              if (h.completionDates.includes(missedDate)) return false;
              if ((h.skipDates || []).includes(missedDate)) return false;
              if ((h.freezeDates || []).includes(missedDate)) return false;
              const dayBefore = new Date(missedDateObj);
              dayBefore.setDate(dayBefore.getDate() - 1);
              const dayBeforeStr = formatDate(dayBefore);
              const hadStreak = h.completionDates.includes(dayBeforeStr) ||
                (h.skipDates || []).includes(dayBeforeStr) ||
                (h.freezeDates || []).includes(dayBeforeStr);
              return hadStreak || h.currentStreak > 0;
            })
            .sort((a, b) => b.currentStreak - a.currentStreak);

          const freezeIds = new Set(habitsNeedingFreeze.slice(0, freezesAvailable).map((h) => h.id));

          return prev.map((habit) => {
            const freezeDates = habit.freezeDates || [];
            const skipDates = habit.skipDates || [];
            const wasScheduled = habit.schedule.includes(missedDow);
            const wasCompleted = habit.completionDates.includes(missedDate);
            const wasSkipped = skipDates.includes(missedDate);

            let newFreezeDates = freezeDates;

            if (freezeIds.has(habit.id)) {
              // Consume one freeze from the pool (Supabase + local state)
              const remaining = consumeFreezeRef.current();
              if (remaining >= 0) {
                newFreezeDates = [...freezeDates, missedDate];
                freezesAvailable = remaining;
                if (!freezeAppliedTo) {
                  freezeAppliedTo = {
                    habitId: habit.id,
                    habitName: habit.name,
                    habitEmoji: habit.emoji,
                    freezesLeft: remaining,
                  };
                }
              }
            } else if (wasScheduled && !wasCompleted && !wasSkipped && habit.currentStreak > 0) {
              // Streak breaks — record for loss animation
              if (!streakLost || habit.currentStreak > streakLost.lostStreak) {
                streakLost = {
                  habitId: habit.id,
                  habitName: habit.name,
                  habitEmoji: habit.emoji,
                  lostStreak: habit.currentStreak,
                };
              }
            }

            const newStreak = calculateStreak(
              habit.completionDates,
              habit.completionDates.includes(today),
              skipDates,
              newFreezeDates
            );
            const newLongest = Math.max(
              calculateLongestStreak(habit.completionDates, skipDates, newFreezeDates),
              habit.longestStreak
            );

            return {
              ...habit,
              freezeDates: newFreezeDates,
              isCompletedToday: habit.completionDates.includes(today),
              currentStreak: newStreak,
              longestStreak: newLongest,
            };
          });
        });

        if (freezeAppliedTo) {
          // Delay showing the event so state settles
          setTimeout(() => setFreezeEvent(freezeAppliedTo), 500);
        }
        if (streakLost) {
          setTimeout(() => setStreakLossEvent(streakLost), freezeAppliedTo ? 5000 : 500);
        }
      }

      if (prevDate !== today) {
        lastActiveDateRef.current = today;
        setLastActiveDate(today);
      }
    };

    runDayChangeCheck();
    const interval = setInterval(runDayChangeCheck, 60000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Notification permission state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      setNotificationPermission(result);
    }
  }, []);

  // Track which habits have already been notified today to prevent duplicates
  const [lastNotified, setLastNotified] = useLocalStorage<Record<string, string>>('lastNotified', {});

  // Interval-based notification engine (checks every 60s)
  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const checkNotifications = () => {
      const now = new Date();
      const todayStr = getToday();
      const currentHH = String(now.getHours()).padStart(2, '0');
      const currentMM = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHH}:${currentMM}`;
      const dayOfWeek = now.getDay();

      // Per-habit reminders
      habits.forEach((habit) => {
        if (!habit.reminderTime) return;
        if (!habit.schedule.includes(dayOfWeek)) return;
        if (habit.isCompletedToday) return;
        if (lastNotified[habit.id] === todayStr) return;

        if (habit.reminderTime === currentTime) {
          new Notification(`⏰ Time to ${habit.name}!`, {
            body: `${habit.emoji} Keep your streak going.${habit.currentStreak > 0 ? ` ${habit.currentStreak} day streak!` : ''}`,
            icon: '/favicon.ico',
            tag: `habit-${habit.id}`,
          });
          setLastNotified((prev: Record<string, string>) => ({ ...prev, [habit.id]: todayStr }));
        }
      });

      // 9 PM end-of-day nudge
      if (currentTime === '21:00') {
        const unchecked = habits.filter(
          (h) => h.schedule.includes(dayOfWeek) && !h.isCompletedToday && h.reminderTime
        );
        if (unchecked.length > 0 && lastNotified['__eod_nudge'] !== todayStr) {
          new Notification(`You still have ${unchecked.length} habit${unchecked.length > 1 ? 's' : ''} unchecked today`, {
            body: `Don't break your streak! ${unchecked.map((h) => h.emoji).join(' ')}`,
            icon: '/favicon.ico',
            tag: 'eod-nudge',
          });
          setLastNotified((prev: Record<string, string>) => ({ ...prev, '__eod_nudge': todayStr }));
        }
      }
    };

    // Run immediately, then every 60 seconds
    checkNotifications();
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, [habits, lastNotified, setLastNotified]);

  const addHabit = useCallback(
    (name: string, emoji: string, category = 'General', target = '', schedule: number[] = [0, 1, 2, 3, 4, 5, 6], reminderTime: string | null = null, targetCount: number | null = null, color: string | null = null) => {
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
        targetCount,
        progressByDate: {},
        color,
        skipDates: [],
        freezeDates: [],
      };
      setHabits((prev: Habit[]) => [...prev, newHabit]);
    },
    [setHabits, requestNotificationPermission]
  );

  const incrementHabit = useCallback(
    (id: string, delta = 1) => {
      const today = getToday();
      setHabits((prev: Habit[]) =>
        prev.map((habit) => {
          if (habit.id !== id) return habit;
          if (!habit.targetCount || habit.targetCount <= 0) return habit;
          const currentCount = habit.progressByDate?.[today] || 0;
          const nextCount = Math.max(0, currentCount + delta);
          const newProgress = { ...(habit.progressByDate || {}), [today]: nextCount };
          const reachedTarget = nextCount >= habit.targetCount;
          const wasCompleted = habit.completionDates.includes(today);
          let newDates = habit.completionDates;
          if (reachedTarget && !wasCompleted) {
            newDates = [...habit.completionDates, today];
          } else if (!reachedTarget && wasCompleted) {
            newDates = habit.completionDates.filter((d) => d !== today);
          }
          const isCompletedToday = reachedTarget;
          const skipDates = habit.skipDates || [];
          const freezeDates = habit.freezeDates || [];
          const newStreak = calculateStreak(newDates, isCompletedToday, skipDates, freezeDates);
          const newLongest = Math.max(calculateLongestStreak(newDates, skipDates, freezeDates), habit.longestStreak);
          return {
            ...habit,
            progressByDate: newProgress,
            completionDates: newDates,
            isCompletedToday,
            currentStreak: newStreak,
            longestStreak: newLongest,
          };
        })
      );
    },
    [setHabits]
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
          const freezeDates = habit.freezeDates || [];
          const newStreak = calculateStreak(newDates, newCompleted, skipDates, freezeDates);
          const newLongest = Math.max(calculateLongestStreak(newDates, skipDates, freezeDates), habit.longestStreak);

          // Check for streak badge milestones
          if (newCompleted && newStreak > 0) {
            for (const milestone of STREAK_MILESTONES) {
              if (newStreak === milestone) {
                const alreadyEarned = streakBadges.some(
                  (b) => b.habitId === habit.id && b.milestone === milestone
                );
                if (!alreadyEarned) {
                  const newBadge: StreakBadge = {
                    id: uuidv4(),
                    habitId: habit.id,
                    habitName: habit.name,
                    habitEmoji: habit.emoji,
                    milestone,
                    unlockedAt: today,
                  };
                  setStreakBadges((prev: StreakBadge[]) => [...prev, newBadge]);
                  setTimeout(() => setBadgeEvent({
                    milestone,
                    habitName: habit.name,
                    habitEmoji: habit.emoji,
                  }), 400);
                }
                break;
              }
            }
          }

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
    [setHabits, streakBadges, setStreakBadges]
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

  const toggleReminder = useCallback(
    (id: string) => {
      setHabits((prev: Habit[]) =>
        prev.map((h) => {
          if (h.id !== id) return h;
          // If reminder exists, remove it. Otherwise set to "08:00" as default.
          const newReminderTime = h.reminderTime ? null : '08:00';
          return { ...h, reminderTime: newReminderTime };
        })
      );
      // Request permission when enabling
      const habit = habits.find((h) => h.id === id);
      if (habit && !habit.reminderTime) {
        requestNotificationPermission();
      }
    },
    [setHabits, habits, requestNotificationPermission]
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
          const freezeDates = h.freezeDates || [];
          const newSkipDates = skipDates.includes(date)
            ? skipDates.filter((d) => d !== date)
            : [...skipDates, date];
          const newStreak = calculateStreak(h.completionDates, h.isCompletedToday, newSkipDates, freezeDates);
          const newLongest = Math.max(calculateLongestStreak(h.completionDates, newSkipDates, freezeDates), h.longestStreak);
          return { ...h, skipDates: newSkipDates, currentStreak: newStreak, longestStreak: newLongest };
        })
      );
    },
    [setHabits]
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
          const freezeDates = habit.freezeDates || [];
          const newStreak = calculateStreak(newDates, newCompleted, skipDates, freezeDates);
          const newLongest = Math.max(calculateLongestStreak(newDates, skipDates, freezeDates), habit.longestStreak);
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

  const dismissFreezeEvent = useCallback(() => setFreezeEvent(null), []);
  const dismissStreakLossEvent = useCallback(() => setStreakLossEvent(null), []);
  const dismissBadgeEvent = useCallback(() => setBadgeEvent(null), []);

  const exportData = useCallback(() => {
    return JSON.stringify({
      habits,
      profile,
      reflections,
      milestones,
      streakBadges,
      exportDate: new Date().toISOString(),
      version: 2,
    }, null, 2);
  }, [habits, profile, reflections, milestones, streakBadges]);

  const importData = useCallback((json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.habits && Array.isArray(data.habits)) {
        setHabits(data.habits.map((h: Habit) => ({ ...h, skipDates: h.skipDates || [], freezeDates: h.freezeDates || [] })));
      }
      if (data.profile) setProfile(data.profile);
      if (data.reflections) setReflections(data.reflections);
      if (data.milestones) setMilestones(data.milestones);
      if (data.streakBadges) setStreakBadges(data.streakBadges);
      return true;
    } catch {
      return false;
    }
  }, [setHabits, setProfile, setReflections, setMilestones, setStreakBadges]);

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
        undoAction,
        hasCollectedDetails,
        streakBadges,
        freezeEvent,
        streakLossEvent,
        badgeEvent,
        notificationPermission,
        setHasCollectedDetails,
        addHabit,
        deleteHabit,
        toggleHabit,
        incrementHabit,
        toggleReminder,
        editHabit,
        reorderHabits,
        setCurrentView,
        setHasVisitedBefore,
        selectHabit,
        updateProfile,
        addReflection,
        toggleSkipDay,
        executeUndo,
        dismissUndo,
        dismissFreezeEvent,
        dismissStreakLossEvent,
        dismissBadgeEvent,
        requestNotificationPermission,
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

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  completionDates: string[]; // ["2026-02-15", "2026-02-14", ...]
  isCompletedToday: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  notificationTime: string;
}

export interface AppStats {
  totalHabitsCompleted: number;
  perfectDays: number;
  joinDate: string;
}

export type View = 'welcome' | 'dashboard' | 'calendar';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: string;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  completionDates: string[];
  isCompletedToday: boolean;
  schedule: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  reminderTime: string | null; // "HH:MM" format
  target: string; // e.g., "10 minutes", "8 glasses"
  skipDates: string[]; // dates marked as rest/skip days (YYYY-MM-DD)
}

export interface HabitTemplate {
  name: string;
  emoji: string;
  category: string;
  target: string;
  schedule: number[];
}

export interface Reflection {
  id: string;
  habitId: string;
  date: string;
  text: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  tagline: string;
  joinDate: string;
  avatar: string; // base64 data URL or empty string
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface UndoAction {
  type: 'toggle' | 'delete';
  habitId: string;
  habitData?: Habit; // full habit data for delete undo
  timestamp: number;
}

export type View = 'welcome' | 'home' | 'calendar' | 'habit-detail' | 'profile' | 'stats' | 'weekly-review';

export type ThemeMode = 'light' | 'dark' | 'system';

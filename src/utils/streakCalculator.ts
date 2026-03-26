import { formatDate } from './dateHelpers';

export const calculateStreak = (
  completionDates: string[],
  completedToday: boolean,
  skipDates: string[] = [],
  freezeDates: string[] = []
): number => {
  const dateSet = new Set(completionDates);
  const bridgeDates = new Set([...skipDates, ...freezeDates]);
  const today = new Date();
  const todayStr = formatDate(today);

  if (completedToday) dateSet.add(todayStr);

  let streak = 0;
  const current = new Date(today);

  if (!completedToday) {
    // When not completed today, check if chain from yesterday is preserved
    // This handles the freeze case: yesterday was frozen, streak is still alive
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);
    if (!dateSet.has(yesterdayStr) && !bridgeDates.has(yesterdayStr)) {
      return 0;
    }
    // Start counting from yesterday since today isn't done yet
    current.setDate(current.getDate() - 1);
  }

  while (true) {
    const dateStr = formatDate(current);
    if (dateSet.has(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else if (bridgeDates.has(dateStr)) {
      // Skip/freeze days bridge the streak but don't count toward it
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export const calculateLongestStreak = (completionDates: string[], skipDates: string[] = [], freezeDates: string[] = []): number => {
  if (completionDates.length === 0) return 0;

  const bridgeSet = new Set([...skipDates, ...freezeDates]);
  const sorted = [...completionDates].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);

    // Count gap days that are bridged (skipped or frozen)
    let allBridged = true;
    const check = new Date(prev);
    check.setDate(check.getDate() + 1);
    let gapDays = 0;
    while (check < curr) {
      if (!bridgeSet.has(formatDate(check))) {
        allBridged = false;
        break;
      }
      gapDays++;
      check.setDate(check.getDate() + 1);
    }

    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1 || (diffDays > 1 && allBridged && gapDays > 0)) {
      current++;
      longest = Math.max(longest, current);
    } else if (diffDays > 1) {
      current = 1;
    }
  }

  return longest;
};

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const;

export const MILESTONE_LABELS: Record<number, { label: string; icon: string }> = {
  3: { label: '3-Day Starter', icon: '🌱' },
  7: { label: 'Week Warrior', icon: '🔥' },
  14: { label: 'Two Week Titan', icon: '⚡' },
  30: { label: 'Monthly Master', icon: '🏆' },
  60: { label: 'Sixty-Day Sage', icon: '💎' },
  100: { label: 'Centurion', icon: '👑' },
};

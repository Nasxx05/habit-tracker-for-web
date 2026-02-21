import { formatDate } from './dateHelpers';

export const calculateStreak = (
  completionDates: string[],
  completedToday: boolean,
  skipDates: string[] = []
): number => {
  if (!completedToday) return 0;

  const dateSet = new Set(completionDates);
  const skipSet = new Set(skipDates);
  const today = new Date();
  const todayStr = formatDate(today);
  if (completedToday) dateSet.add(todayStr);

  let streak = 0;
  const current = new Date(today);

  while (true) {
    const dateStr = formatDate(current);
    if (dateSet.has(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else if (skipSet.has(dateStr)) {
      // Skip days don't break the streak but don't count towards it
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export const calculateLongestStreak = (completionDates: string[], skipDates: string[] = []): number => {
  if (completionDates.length === 0) return 0;

  const skipSet = new Set(skipDates);
  const sorted = [...completionDates].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);

    // Count gap days that are skipped
    let gapDays = 0;
    let allSkipped = true;
    const check = new Date(prev);
    check.setDate(check.getDate() + 1);
    while (check < curr) {
      if (!skipSet.has(formatDate(check))) {
        allSkipped = false;
        break;
      }
      gapDays++;
      check.setDate(check.getDate() + 1);
    }

    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1 || (diffDays > 1 && allSkipped && gapDays > 0)) {
      current++;
      longest = Math.max(longest, current);
    } else if (diffDays > 1) {
      current = 1;
    }
  }

  return longest;
};

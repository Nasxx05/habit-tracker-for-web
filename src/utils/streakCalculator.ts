import { formatDate } from './dateHelpers';

export const calculateStreak = (
  completionDates: string[],
  completedToday: boolean
): number => {
  if (!completedToday) return 0;

  const sortedDates = [...completionDates].sort().reverse();
  if (sortedDates.length === 0) return 1;

  const today = new Date();
  const todayStr = formatDate(today);

  // Build set including today if completing
  const dateSet = new Set(sortedDates);
  if (completedToday) dateSet.add(todayStr);

  let streak = 0;
  const current = new Date(today);

  while (true) {
    const dateStr = formatDate(current);
    if (dateSet.has(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export const calculateLongestStreak = (completionDates: string[]): number => {
  if (completionDates.length === 0) return 0;

  const sorted = [...completionDates].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diffDays > 1) {
      current = 1;
    }
  }

  return longest;
};

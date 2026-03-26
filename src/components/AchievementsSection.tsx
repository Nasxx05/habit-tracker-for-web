import type { StreakBadge } from '../types/habit';
import { MILESTONE_LABELS, STREAK_MILESTONES } from '../utils/streakCalculator';

interface AchievementsSectionProps {
  badges: StreakBadge[];
}

export default function AchievementsSection({ badges }: AchievementsSectionProps) {
  if (badges.length === 0) return null;

  // Deduplicate: show the highest milestone per habit, plus all unique milestones
  const uniqueBadges = new Map<string, StreakBadge>();
  for (const badge of badges) {
    const key = `${badge.habitId}-${badge.milestone}`;
    if (!uniqueBadges.has(key)) {
      uniqueBadges.set(key, badge);
    }
  }
  const displayBadges = Array.from(uniqueBadges.values())
    .sort((a, b) => b.milestone - a.milestone);

  return (
    <section className="px-4 pt-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-muted tracking-widest">ACHIEVEMENTS</h3>
          <span className="text-xs text-muted">{displayBadges.length}/{STREAK_MILESTONES.length * Math.max(1, new Set(badges.map(b => b.habitId)).size)}</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {displayBadges.slice(0, 8).map((badge) => {
            const info = MILESTONE_LABELS[badge.milestone];
            if (!info) return null;
            return (
              <div
                key={badge.id}
                className="flex-shrink-0 flex flex-col items-center gap-1 w-16"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-peach-light to-peach rounded-full flex items-center justify-center text-xl shadow-sm">
                  {info.icon}
                </div>
                <span className="text-[10px] font-semibold text-dark text-center leading-tight">
                  {badge.milestone}d
                </span>
                <span className="text-[9px] text-muted text-center leading-tight truncate w-full">
                  {badge.habitEmoji} {badge.habitName}
                </span>
              </div>
            );
          })}

          {/* Show locked milestone placeholders */}
          {displayBadges.length < 4 && STREAK_MILESTONES
            .filter(m => !displayBadges.some(b => b.milestone === m))
            .slice(0, 4 - displayBadges.length)
            .map((m) => {
              const info = MILESTONE_LABELS[m];
              return (
                <div key={`locked-${m}`} className="flex-shrink-0 flex flex-col items-center gap-1 w-16 opacity-30">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                    {info.icon}
                  </div>
                  <span className="text-[10px] font-semibold text-muted text-center leading-tight">
                    {m}d
                  </span>
                  <span className="text-[9px] text-muted text-center leading-tight">
                    Locked
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}

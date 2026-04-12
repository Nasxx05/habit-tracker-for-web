import { useState } from 'react';
import type { Habit } from '../types/habit';
import { formatDate, getMonthName } from '../utils/dateHelpers';

interface WeeklyTrendProps {
  habits: Habit[];
  todayStr: string;
}

type WeekData = {
  label: string;
  rate: number;
  completed: number;
  total: number;
  isCurrent: boolean;
};

const WEEKS = 4;

// Chart layout constants
const CHART_HEIGHT = 160;
const PLOT_TOP = 8;
const PLOT_BOTTOM = 30;
const PLOT_LEFT = 32;
const PLOT_RIGHT = 16;

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function HeatmapChart({ habits, todayStr }: WeeklyTrendProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonday = getMonday(today);

  // Build data for each of the last WEEKS weeks
  const weeks: WeekData[] = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    const monday = new Date(currentMonday);
    monday.setDate(monday.getDate() - w * 7);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);

    let completed = 0;
    let total = 0;

    for (let d = 0; d < 7; d++) {
      const day = new Date(monday);
      day.setDate(day.getDate() + d);
      const dateStr = formatDate(day);
      if (dateStr > todayStr) break;

      const dow = day.getDay();
      const scheduled = habits.filter(
        (h) => h.schedule.includes(dow) && h.createdAt.split('T')[0] <= dateStr
      );
      completed += scheduled.filter((h) => h.completionDates.includes(dateStr)).length;
      total += scheduled.length;
    }

    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const monthDay = `${getMonthName(monday.getMonth()).substring(0, 3)} ${monday.getDate()}`;
    weeks.push({
      label: monthDay,
      rate,
      completed,
      total,
      isCurrent: w === 0,
    });
  }

  // Plot dimensions
  const plotH = CHART_HEIGHT - PLOT_TOP - PLOT_BOTTOM;

  // Y-axis gridlines
  const ySteps = [0, 25, 50, 75, 100];

  return (
    <div>
      {/* SVG trend line */}
      <div style={{ position: 'relative', height: `${CHART_HEIGHT}px` }}>
        {/* Y-axis labels + gridlines */}
        {ySteps.map((pct) => {
          const y = PLOT_TOP + plotH - (pct / 100) * plotH;
          return (
            <div key={pct} style={{ position: 'absolute', top: `${y}px`, left: 0, right: 0 }}>
              <span
                className="text-muted"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '-6px',
                  fontSize: '10px',
                  width: `${PLOT_LEFT - 6}px`,
                  textAlign: 'right',
                }}
              >
                {pct}%
              </span>
              <div
                style={{
                  marginLeft: `${PLOT_LEFT}px`,
                  marginRight: `${PLOT_RIGHT}px`,
                  height: '1px',
                  backgroundColor: pct === 0 ? '#ddd' : '#f0f0ec',
                }}
              />
            </div>
          );
        })}

        {/* Data points, line, and X labels — absolutely positioned within plot area */}
        <div
          style={{
            position: 'absolute',
            top: `${PLOT_TOP}px`,
            left: `${PLOT_LEFT}px`,
            right: `${PLOT_RIGHT}px`,
            height: `${plotH}px`,
          }}
        >
          {/* Connecting lines (SVG overlay) */}
          <svg
            style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
            preserveAspectRatio="none"
          >
            {weeks.map((w, i) => {
              if (i === 0) return null;
              const prev = weeks[i - 1];
              const segments = weeks.length - 1;
              const x1 = `${((i - 1) / segments) * 100}%`;
              const y1 = plotH - (prev.rate / 100) * plotH;
              const x2 = `${(i / segments) * 100}%`;
              const y2 = plotH - (w.rate / 100) * plotH;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#A29BFE"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Data points + X-axis labels */}
          {weeks.map((w, i) => {
            const segments = weeks.length - 1;
            const xPct = segments > 0 ? (i / segments) * 100 : 50;
            const yPos = plotH - (w.rate / 100) * plotH;
            const isActive = activeIdx === i;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${xPct}%`,
                  top: 0,
                  height: '100%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  width: '48px',
                }}
                onClick={() => setActiveIdx(isActive ? null : i)}
              >
                {/* Rate label above dot */}
                <div
                  className="animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: `${yPos - 20}px`,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#6C5CE7',
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {w.rate}%
                </div>

                {/* Dot */}
                <div
                  style={{
                    position: 'absolute',
                    top: `${yPos - 6}px`,
                    width: isActive ? '14px' : '10px',
                    height: isActive ? '14px' : '10px',
                    borderRadius: '50%',
                    backgroundColor: w.isCurrent ? '#6C5CE7' : '#A29BFE',
                    border: '2.5px solid #fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.15s',
                  }}
                />

                {/* X-axis label */}
                <span
                  className="text-muted"
                  style={{
                    position: 'absolute',
                    bottom: `-${PLOT_BOTTOM - 4}px`,
                    fontSize: '10px',
                    whiteSpace: 'nowrap',
                    fontWeight: w.isCurrent ? 600 : 400,
                    color: w.isCurrent ? '#6C5CE7' : undefined,
                  }}
                >
                  {w.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected week detail */}
      {activeIdx !== null && (
        <div className="mt-2 bg-cream rounded-xl px-3 py-2.5 flex items-center justify-between animate-fade-in">
          <span className="text-xs font-semibold text-dark">
            Week of {weeks[activeIdx].label}{weeks[activeIdx].isCurrent ? ' (current)' : ''}
          </span>
          <span className="text-xs text-muted">
            {weeks[activeIdx].completed}/{weeks[activeIdx].total} done
          </span>
        </div>
      )}
    </div>
  );
}

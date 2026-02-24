import { useState, useRef, useEffect } from 'react';
import type { Habit } from '../types/habit';
import { formatDate, getMonthName } from '../utils/dateHelpers';

interface HeatmapChartProps {
  habits: Habit[];
  todayStr: string;
}

type CellData = {
  date: string;
  rate: number;
  completed: number;
  total: number;
};

const CELL_SIZE = 11;
const CELL_GAP = 2;
const LABEL_WIDTH = 24;
const WEEKS_TO_SHOW = 4;

// Mon=0 ... Sun=6 (GitHub layout)
function toMonRow(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

function getCellColor(cell: CellData | null): string {
  if (!cell) return 'transparent';
  if (cell.rate < 0) return 'transparent'; // no habits scheduled
  if (cell.rate === 0) return '#e8e8e3';   // scheduled but none done
  if (cell.rate <= 0.25) return '#EAF2ED'; // mint
  if (cell.rate <= 0.50) return '#c3d9cf'; // sage-light
  if (cell.rate <= 0.75) return '#A8C5B8'; // sage
  return '#2D4A3E';                        // forest
}

function formatCellDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function HeatmapChart({ habits, todayStr }: HeatmapChartProps) {
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  // Start from a Monday, WEEKS_TO_SHOW weeks back
  const todayRow = toMonRow(todayDate.getDay());
  const startDate = new Date(todayDate);
  startDate.setDate(startDate.getDate() - ((WEEKS_TO_SHOW - 1) * 7 + todayRow));

  // Build grid: grid[row][col] where row=day-of-week, col=week-index
  const grid: (CellData | null)[][] = Array.from({ length: 7 }, () =>
    Array(WEEKS_TO_SHOW).fill(null)
  );

  let activeDays = 0;

  const cursor = new Date(startDate);
  for (let week = 0; week < WEEKS_TO_SHOW; week++) {
    for (let row = 0; row < 7; row++) {
      const dateStr = formatDate(cursor);
      if (dateStr <= todayStr) {
        const dow = cursor.getDay();
        const createdBefore = habits.filter(
          (h) => h.schedule.includes(dow) && h.createdAt.split('T')[0] <= dateStr
        );
        const completed = createdBefore.filter((h) =>
          h.completionDates.includes(dateStr)
        ).length;
        const total = createdBefore.length;
        const rate = total > 0 ? completed / total : -1;
        grid[row][week] = { date: dateStr, rate, completed, total };
        if (completed > 0) activeDays++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  // Compute month labels based on the Monday of each week
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  for (let week = 0; week < WEEKS_TO_SHOW; week++) {
    const monday = new Date(startDate);
    monday.setDate(monday.getDate() + week * 7);
    const month = monday.getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ col: week, label: getMonthName(month).substring(0, 3) });
      lastMonth = month;
    }
  }

  // Auto-scroll to right end on mount (in case of overflow)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const colStep = CELL_SIZE + CELL_GAP;
  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', ''];

  return (
    <div onClick={() => setSelectedCell(null)}>
      <div style={{ display: 'flex' }}>
        {/* Fixed day-of-week labels */}
        <div style={{ width: `${LABEL_WIDTH}px`, flexShrink: 0, paddingTop: '18px' }}>
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="text-muted"
              style={{
                height: `${colStep}px`,
                lineHeight: `${colStep}px`,
                fontSize: '9px',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Scrollable grid area */}
        <div
          ref={scrollRef}
          className="hide-scrollbar"
          style={{ flex: 1, overflowX: 'auto' }}
        >
          {/* Month labels */}
          <div style={{ position: 'relative', height: '16px', marginBottom: '2px' }}>
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="text-muted"
                style={{
                  position: 'absolute',
                  left: `${m.col * colStep}px`,
                  fontSize: '10px',
                  whiteSpace: 'nowrap',
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Cell grid: flex row of week columns */}
          <div style={{ display: 'flex', gap: `${CELL_GAP}px` }}>
            {Array.from({ length: WEEKS_TO_SHOW }).map((_, week) => (
              <div
                key={week}
                style={{ display: 'flex', flexDirection: 'column', gap: `${CELL_GAP}px` }}
              >
                {Array.from({ length: 7 }).map((_, row) => {
                  const cell = grid[row][week];
                  const bg = getCellColor(cell);
                  const isSelected = selectedCell?.date === cell?.date;
                  return (
                    <div
                      key={row}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (cell && cell.rate >= 0) {
                          setSelectedCell(isSelected ? null : cell);
                        }
                      }}
                      style={{
                        width: `${CELL_SIZE}px`,
                        height: `${CELL_SIZE}px`,
                        borderRadius: '2px',
                        backgroundColor: bg,
                        cursor: cell && cell.rate >= 0 ? 'pointer' : 'default',
                        outline: isSelected ? '2px solid #2D4A3E' : 'none',
                        outlineOffset: '-1px',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend + active days */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-muted">{activeDays} active days</span>
        <div className="flex items-center gap-1">
          <span className="text-muted" style={{ fontSize: '10px' }}>Less</span>
          {['#e8e8e3', '#EAF2ED', '#c3d9cf', '#A8C5B8', '#2D4A3E'].map((color, i) => (
            <div
              key={i}
              style={{
                width: `${CELL_SIZE}px`,
                height: `${CELL_SIZE}px`,
                borderRadius: '2px',
                backgroundColor: color,
              }}
            />
          ))}
          <span className="text-muted" style={{ fontSize: '10px' }}>More</span>
        </div>
      </div>

      {/* Selected cell detail */}
      {selectedCell && (
        <div
          className="mt-3 bg-cream rounded-xl px-3 py-2.5 flex items-center justify-between animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs font-semibold text-dark">
            {formatCellDate(selectedCell.date)}
          </span>
          <span className="text-xs text-muted">
            {selectedCell.completed}/{selectedCell.total} done · {Math.round(selectedCell.rate * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}

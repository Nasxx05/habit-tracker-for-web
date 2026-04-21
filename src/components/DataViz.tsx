import React from 'react';

interface RingProps {
  value: number;
  total: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
}

export function Ring({ value = 0, total = 1, size = 160, stroke = 10, color = 'var(--color-forest)', track = 'var(--color-sage-100)', children }: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

export function MiniRing({ value = 0, total = 1, size = 36, stroke = 3, color = 'var(--color-forest)' }: { value: number; total: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-sage-100)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
    </svg>
  );
}

interface HeatmapProps {
  completedDates: string[];
  weeks?: number;
  endDate?: Date;
  cell?: number;
  gap?: number;
  color?: string;
  empty?: string;
}

export function Heatmap({ completedDates, weeks = 17, endDate, cell = 12, gap = 3, color = 'var(--color-forest)', empty = 'var(--color-sage-100)' }: HeatmapProps) {
  const set = new Set(completedDates);
  const end = endDate || new Date();
  const endDow = end.getDay();
  const endAligned = new Date(end);
  endAligned.setDate(end.getDate() + (6 - endDow));
  const days = weeks * 7;
  const start = new Date(endAligned);
  start.setDate(endAligned.getDate() - days + 1);

  const cols: Array<Array<{ key: string; done: boolean; future: boolean; empty?: boolean }>> = [];
  for (let w = 0; w < weeks; w++) {
    const col: typeof cols[0] = [];
    for (let d = 0; d < 7; d++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + w * 7 + d);
      if (cur > end) { col.push({ key: '', done: false, future: true, empty: true }); continue; }
      const key = cur.toISOString().slice(0, 10);
      col.push({ key, done: set.has(key), future: cur > end });
    }
    cols.push(col);
  }
  const width = weeks * (cell + gap) - gap;
  const height = 7 * (cell + gap) - gap;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {cols.map((col, i) => col.map((c, j) => {
        if (c.empty) return null;
        const x = i * (cell + gap);
        const y = j * (cell + gap);
        return <rect key={`${i}-${j}`} x={x} y={y} width={cell} height={cell} rx={2.5}
          fill={c.done ? color : empty} opacity={c.future ? 0 : 1} />;
      }))}
    </svg>
  );
}

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
}

export function Sparkline({ values, width = 240, height = 60, color = 'var(--color-forest)', fill = 'var(--color-sage-100)' }: SparklineProps) {
  if (!values.length) return null;
  const max = Math.max(1, ...values);
  const stepX = width / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => [i * stepX, height - (v / max) * (height - 6) - 3]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L${width} ${height} L0 ${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={area} fill={fill} opacity=".55" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={color} />
    </svg>
  );
}

interface BarRowProps {
  values: Array<{ value: number; color?: string }>;
  width?: number;
  height?: number;
  color?: string;
  track?: string;
  barWidth?: number;
  gap?: number;
}

export function BarRow({ values, width = 240, height = 48, color = 'var(--color-forest)', track = 'var(--color-sage-100)', barWidth = 6, gap: gapProp }: BarRowProps) {
  const n = values.length;
  const g = gapProp ?? Math.max(2, (width - n * barWidth) / Math.max(1, n - 1));
  const max = Math.max(1, ...values.map(v => v.value));
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {values.map((v, i) => {
        const x = i * (barWidth + g);
        const h = Math.max(2, (v.value / max) * (height - 2));
        return (
          <g key={i}>
            <rect x={x} y={0} width={barWidth} height={height} rx={barWidth / 2} fill={track} opacity=".6" />
            <rect x={x} y={height - h} width={barWidth} height={h} rx={barWidth / 2} fill={v.color || color} />
          </g>
        );
      })}
    </svg>
  );
}

interface TrendBarsProps {
  completedDates: string[];
  schedule: number[];
  days?: number;
}

export function TrendBars({ completedDates, schedule, days = 14 }: TrendBarsProps) {
  const set = new Set(completedDates);
  const dots: Array<{ on: boolean; scheduled: boolean }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const scheduled = schedule.includes(d.getDay());
    dots.push({ on: set.has(key), scheduled });
  }
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {dots.map((d, i) => (
        <div key={i} style={{
          width: 4,
          height: d.on ? 14 : d.scheduled ? 6 : 4,
          borderRadius: 2,
          background: d.on ? 'var(--color-forest)' : d.scheduled ? 'rgba(30,35,31,.14)' : 'rgba(30,35,31,.08)',
          opacity: d.scheduled ? 1 : 0.5,
        }} />
      ))}
    </div>
  );
}

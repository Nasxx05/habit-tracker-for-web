import React from 'react';

export type GlyphShape = 'disc' | 'ring' | 'square' | 'diamond' | 'triangle' | 'hex' | 'arc' | 'bar';

export const GLYPH_SHAPES: GlyphShape[] = ['disc', 'ring', 'square', 'diamond', 'triangle', 'hex'];

export const GLYPH_COLORS = [
  { name: 'moss', value: 'var(--color-h-moss)' },
  { name: 'sage', value: 'var(--color-h-sage)' },
  { name: 'ocean', value: 'var(--color-h-ocean)' },
  { name: 'sky', value: 'var(--color-h-sky)' },
  { name: 'plum', value: 'var(--color-h-plum)' },
  { name: 'rose', value: 'var(--color-h-rose)' },
  { name: 'clay', value: 'var(--color-h-clay)' },
  { name: 'wheat', value: 'var(--color-h-wheat)' },
];

const SHAPE_PATHS: Record<string, (fg: string, filled: boolean) => React.ReactNode> = {
  disc: (fg, filled) => <circle cx="12" cy="12" r="6" fill={filled ? fg : 'none'} stroke={fg} strokeWidth="1.8" />,
  ring: (fg) => <circle cx="12" cy="12" r="6" fill="none" stroke={fg} strokeWidth="2.6" />,
  square: (fg, filled) => <rect x="6" y="6" width="12" height="12" rx="2.5" fill={filled ? fg : 'none'} stroke={fg} strokeWidth="1.8" />,
  diamond: (fg, filled) => <path d="M12 4l8 8-8 8-8-8z" fill={filled ? fg : 'none'} stroke={fg} strokeWidth="1.8" strokeLinejoin="round" />,
  triangle: (fg, filled) => <path d="M12 5l8 14H4z" fill={filled ? fg : 'none'} stroke={fg} strokeWidth="1.8" strokeLinejoin="round" />,
  hex: (fg, filled) => <path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z" fill={filled ? fg : 'none'} stroke={fg} strokeWidth="1.8" strokeLinejoin="round" />,
  arc: (fg) => <path d="M6 18a6 6 0 1 1 12 0" fill="none" stroke={fg} strokeWidth="2.6" strokeLinecap="round" />,
  bar: (fg) => <>
    <rect x="5" y="9" width="3" height="6" rx="1" fill={fg} />
    <rect x="10.5" y="6" width="3" height="12" rx="1" fill={fg} />
    <rect x="16" y="11" width="3" height="4" rx="1" fill={fg} />
  </>,
};

interface HabitGlyphProps {
  shape?: GlyphShape;
  color?: string;
  size?: number;
  filled?: boolean;
  tile?: boolean;
}

export default function HabitGlyph({ shape = 'disc', color = 'var(--color-h-moss)', size = 44, filled = true, tile = true }: HabitGlyphProps) {
  const renderer = SHAPE_PATHS[shape] || SHAPE_PATHS.disc;
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: tile ? `color-mix(in oklch, ${color} 18%, transparent)` : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} style={{ display: 'block' }}>
        {renderer(color, filled)}
      </svg>
    </div>
  );
}

const EMOJI_TO_GLYPH: Record<string, { shape: GlyphShape; color: string }> = {
  '🧘': { shape: 'disc', color: 'var(--color-h-moss)' },
  '🧘‍♀️': { shape: 'disc', color: 'var(--color-h-moss)' },
  '🧘‍♂️': { shape: 'disc', color: 'var(--color-h-moss)' },
  '📚': { shape: 'square', color: 'var(--color-h-clay)' },
  '📖': { shape: 'square', color: 'var(--color-h-clay)' },
  '💧': { shape: 'ring', color: 'var(--color-h-ocean)' },
  '🚶': { shape: 'hex', color: 'var(--color-h-sage)' },
  '🚶‍♂️': { shape: 'hex', color: 'var(--color-h-sage)' },
  '🏋️': { shape: 'diamond', color: 'var(--color-h-plum)' },
  '🏋️‍♂️': { shape: 'diamond', color: 'var(--color-h-plum)' },
  '🌙': { shape: 'arc', color: 'var(--color-h-sky)' },
  '😴': { shape: 'arc', color: 'var(--color-h-sky)' },
  '✍️': { shape: 'triangle', color: 'var(--color-h-rose)' },
  '📝': { shape: 'triangle', color: 'var(--color-h-rose)' },
  '🎨': { shape: 'hex', color: 'var(--color-h-wheat)' },
  '🎸': { shape: 'diamond', color: 'var(--color-h-rose)' },
  '🏃': { shape: 'hex', color: 'var(--color-h-sage)' },
  '🏃‍♂️': { shape: 'hex', color: 'var(--color-h-sage)' },
  '🥗': { shape: 'disc', color: 'var(--color-h-sage)' },
  '💊': { shape: 'ring', color: 'var(--color-h-sky)' },
  '🧹': { shape: 'square', color: 'var(--color-h-wheat)' },
  '💰': { shape: 'diamond', color: 'var(--color-h-wheat)' },
  '🎯': { shape: 'disc', color: 'var(--color-h-clay)' },
  '❤️': { shape: 'triangle', color: 'var(--color-h-rose)' },
  '🧠': { shape: 'disc', color: 'var(--color-h-plum)' },
};

const CATEGORY_GLYPHS: Record<string, { shape: GlyphShape; color: string }> = {
  Health: { shape: 'ring', color: 'var(--color-h-ocean)' },
  Fitness: { shape: 'diamond', color: 'var(--color-h-plum)' },
  Movement: { shape: 'hex', color: 'var(--color-h-sage)' },
  Mindfulness: { shape: 'disc', color: 'var(--color-h-moss)' },
  Learning: { shape: 'square', color: 'var(--color-h-clay)' },
  Sleep: { shape: 'arc', color: 'var(--color-h-sky)' },
  Creativity: { shape: 'hex', color: 'var(--color-h-wheat)' },
  Finance: { shape: 'diamond', color: 'var(--color-h-wheat)' },
  Social: { shape: 'triangle', color: 'var(--color-h-rose)' },
  Productivity: { shape: 'square', color: 'var(--color-h-ocean)' },
};

export function getGlyphForHabit(emoji: string, category: string, existingShape?: GlyphShape, existingColor?: string): { shape: GlyphShape; color: string } {
  if (existingShape && existingColor) return { shape: existingShape, color: existingColor };
  if (EMOJI_TO_GLYPH[emoji]) return EMOJI_TO_GLYPH[emoji];
  if (CATEGORY_GLYPHS[category]) return CATEGORY_GLYPHS[category];
  const shapes = GLYPH_SHAPES;
  const colors = GLYPH_COLORS;
  const hash = emoji.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return { shape: shapes[hash % shapes.length], color: colors[hash % colors.length].value };
}

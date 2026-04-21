import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const strokeBase: React.SVGAttributes<SVGElement> = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Svg({ size = 20, children, className, style, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', ...style }} className={className} {...strokeBase} {...rest}>
      {children}
    </svg>
  );
}

export const IconHome = (p: IconProps) => <Svg {...p}><path d="M3.5 11.5 12 4l8.5 7.5"/><path d="M5.5 10v9h13v-9"/><path d="M10 19v-5h4v5"/></Svg>;
export const IconCalendar = (p: IconProps) => <Svg {...p}><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17"/><path d="M8 3v4M16 3v4"/></Svg>;
export const IconChart = (p: IconProps) => <Svg {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></Svg>;
export const IconUser = (p: IconProps) => <Svg {...p}><circle cx="12" cy="8.5" r="3.5"/><path d="M4.5 20c1.2-3.8 4.1-5.5 7.5-5.5s6.3 1.7 7.5 5.5"/></Svg>;
export const IconPlus = (p: IconProps) => <Svg {...p}><path d="M12 5v14M5 12h14"/></Svg>;
export const IconCheck = (p: IconProps) => <Svg {...p}><path d="M4.5 12.5 10 18 20 6.5"/></Svg>;
export const IconCheckSm = (p: IconProps) => <Svg {...p}><path d="M5 12l5 5 9-10"/></Svg>;
export const IconFlame = (p: IconProps) => <Svg {...p}><path d="M12 3c1 4 5 5 5 10a5 5 0 1 1-10 0c0-3 2-4 2-7 2 1 3 2 3 4"/></Svg>;
export const IconSnowflake = (p: IconProps) => <Svg {...p}><path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13"/></Svg>;
export const IconLeaf = (p: IconProps) => <Svg {...p}><path d="M4 20c8-1 14-6 16-16-8 1-14 6-16 16z"/><path d="M4 20c4-4 8-8 11-11"/></Svg>;
export const IconSparkle = (p: IconProps) => <Svg {...p}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M7 7l3.5 3.5M13.5 13.5 17 17M7 17l3.5-3.5M13.5 10.5 17 7"/></Svg>;
export const IconTrophy = (p: IconProps) => <Svg {...p}><path d="M7 4h10v5a5 5 0 1 1-10 0V4z"/><path d="M7 6H4.5v2a3 3 0 0 0 3 3M17 6h2.5v2a3 3 0 0 1-3 3"/><path d="M10 14h4v3h-4zM8 20h8"/></Svg>;
export const IconBell = (p: IconProps) => <Svg {...p}><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2.5h-15L6 16z"/><path d="M10 20a2 2 0 0 0 4 0"/></Svg>;
export const IconSettings = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Svg>;
export const IconArrow = (p: IconProps) => <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Svg>;
export const IconArrowL = (p: IconProps) => <Svg {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></Svg>;
export const IconChevronR = (p: IconProps) => <Svg {...p}><path d="M9 6l6 6-6 6"/></Svg>;
export const IconChevronL = (p: IconProps) => <Svg {...p}><path d="M15 6l-6 6 6 6"/></Svg>;
export const IconChevronD = (p: IconProps) => <Svg {...p}><path d="M6 9l6 6 6-6"/></Svg>;
export const IconClose = (p: IconProps) => <Svg {...p}><path d="M6 6l12 12M18 6 6 18"/></Svg>;
export const IconMore = (p: IconProps) => <Svg {...p}><circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none"/></Svg>;
export const IconEdit = (p: IconProps) => <Svg {...p}><path d="M4 20h4l11-11-4-4L4 16v4z"/><path d="M14 6l4 4"/></Svg>;
export const IconClock = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2.5"/></Svg>;
export const IconTarget = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></Svg>;
export const IconShare = (p: IconProps) => <Svg {...p}><path d="M4 12v7h16v-7"/><path d="M12 4v11M8 8l4-4 4 4"/></Svg>;
export const IconRepeat = (p: IconProps) => <Svg {...p}><path d="M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4"/></Svg>;
export const IconTrending = (p: IconProps) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M15 7h6v6"/></Svg>;
export const IconDumbbell = (p: IconProps) => <Svg {...p}><path d="M6 8v8M4 10v4M18 8v8M20 10v4M6 12h12"/></Svg>;
export const IconBook = (p: IconProps) => <Svg {...p}><path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2V5z"/><path d="M6 3v16"/></Svg>;
export const IconDroplet = (p: IconProps) => <Svg {...p}><path d="M12 3c4 6 7 9 7 12a7 7 0 1 1-14 0c0-3 3-6 7-12z"/></Svg>;
export const IconMoon = (p: IconProps) => <Svg {...p}><path d="M20 14a8 8 0 1 1-9.5-10A7 7 0 0 0 20 14z"/></Svg>;
export const IconBrain = (p: IconProps) => <Svg {...p}><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-1 5.5A3 3 0 0 0 9 19V4zM15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 1 5.5A3 3 0 0 1 15 19V4z"/></Svg>;
export const IconHeart = (p: IconProps) => <Svg {...p}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></Svg>;
export const IconPalette = (p: IconProps) => <Svg {...p}><path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2 0-1.5 1-2 2-2h2a3 3 0 0 0 3-3 9 9 0 0 0-9-11z"/><circle cx="7.5" cy="10" r="1"/><circle cx="11" cy="6.5" r="1"/><circle cx="16" cy="8" r="1"/></Svg>;
export const IconSun = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2"/></Svg>;
export const IconEye = (p: IconProps) => <Svg {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></Svg>;
export const IconGrip = (p: IconProps) => <Svg {...p}><circle cx="9" cy="6" r=".9" fill="currentColor"/><circle cx="15" cy="6" r=".9" fill="currentColor"/><circle cx="9" cy="12" r=".9" fill="currentColor"/><circle cx="15" cy="12" r=".9" fill="currentColor"/><circle cx="9" cy="18" r=".9" fill="currentColor"/><circle cx="15" cy="18" r=".9" fill="currentColor"/></Svg>;

export const ICON_MAP: Record<string, React.FC<IconProps>> = {
  Home: IconHome, Calendar: IconCalendar, Chart: IconChart, User: IconUser,
  Plus: IconPlus, Check: IconCheck, CheckSm: IconCheckSm, Flame: IconFlame,
  Snowflake: IconSnowflake, Leaf: IconLeaf, Sparkle: IconSparkle, Trophy: IconTrophy,
  Bell: IconBell, Settings: IconSettings, Arrow: IconArrow, ArrowL: IconArrowL,
  ChevronR: IconChevronR, ChevronL: IconChevronL, ChevronD: IconChevronD,
  Close: IconClose, More: IconMore, Edit: IconEdit, Clock: IconClock,
  Target: IconTarget, Share: IconShare, Repeat: IconRepeat, Trending: IconTrending,
  Dumbbell: IconDumbbell, Book: IconBook, Droplet: IconDroplet, Moon: IconMoon,
  Brain: IconBrain, Heart: IconHeart, Palette: IconPalette, Sun: IconSun,
  Eye: IconEye, Grip: IconGrip,
};

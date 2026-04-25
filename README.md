# Streakly (Hearth)

A mobile-first habit tracking web app built with React, TypeScript, and Tailwind CSS. Supports offline use via localStorage and optional cloud sync through Supabase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 5.9 (strict) |
| Styling | Tailwind CSS v4, custom CSS variables |
| Build | Vite 7 |
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| Deployment | Vercel (SPA routing via rewrites) |
| PWA | Service worker + manifest.json |

**Key libraries:** `uuid`, `canvas-confetti`, `@supabase/supabase-js`

---

## Features

### Habit Management

- **Add / edit / delete** habits with a name and emoji
- **Two habit types:**
  - *Checkbox* — simple one-tap completion
  - *Quantitative* — tap-to-increment with a numeric target (e.g. "8 glasses of water")
- **Categories:** General, Health, Fitness, Mindfulness, Learning, Productivity, Self-care, Social
- **Weekly schedule** — set which days of the week each habit is active
- **Habit templates** — pre-configured starter habits to choose from
- **Custom glyphs** — choose from 8 shapes (disc, ring, square, diamond, triangle, hex, arc, bar) and 8 colors for visual distinction
- **Drag-and-drop reordering** on the dashboard

### Streak Tracking

- **Current streak** and **longest streak** calculated per habit
- **Skip days** — mark a scheduled day as a rest day without breaking the streak
- **Streak freeze** *(premium)* — automatically bridges a missed day so the streak survives; 2 freezes refilled per week
- **Streak loss detection** — overnight job detects missed scheduled days and triggers animations
- **Badge milestones** at 3, 7, 14, 30, 60, and 100 consecutive days
- **Streak freeze banner** and **streak loss overlay** for in-app feedback

### Dashboard

- **5-day date selector** — tap any recent day to log completions retroactively
- **Category filter** tabs
- **Circular progress ring** in the top bar (today's overall completion ratio)
- **Undo toast** — undo the last toggle or delete within a 5-second window
- **Completion animations** with confetti at milestone streaks

### Calendar View

- Monthly calendar with per-day completion ratio heatmap
- Monthly statistics: overall completion rate and number of perfect days
- Tap any day to see that day's completion state per habit

### Habit Detail View

- Full completion history for a single habit
- Inline analytics (30-day sparkline, completion rate, best streak)
- Reflection / journal entry per habit per day
- Toggle skip days and reminder time directly from this view

### Stats Dashboard

- Aggregate 30-day completion trend (bar chart)
- Active streaks count, best streak across all habits
- Total completions counter
- GitHub-style heatmap of completion activity

### Weekly Review

- Weekly summary screen prompting reflection on the past 7 days

### Notifications (Browser Push)

- **Per-habit reminders** — set a specific time (HH:MM) for each habit
- **End-of-day nudge** — fires at 21:00 if any scheduled habits are still unchecked
- Notification engine polls every 60 seconds; prevents duplicate notifications

### User Profile

- Custom display name, tagline, and avatar (base64 upload with cropping)
- Optional personal details: age and sex
- Join date recorded at first launch

### Achievements / Milestones

| Milestone | Unlock condition |
|---|---|
| First Step | 1 completion |
| Week Warrior | 7-day streak |
| Consistent | 14-day streak |
| Month Master | 30-day streak |
| Centurion | 100 total completions |
| Collector | 5 active habits |
| Reflective | 10 journal reflections |

### Authentication & Cloud Sync

- Email / password sign-up and sign-in via Supabase Auth
- All habit data (habits, profile, reflections, milestones) synced to Supabase on sign-in
- **Offline-first** — everything works without an account; sync is optional
- Data uploaded with a 2-second debounce to reduce server load
- Sync runs on sign-in to pull the latest cloud state

### Premium Tier

| Feature | Free | Premium |
|---|---|---|
| Active habits | 3 | Unlimited |
| Weekly streak freezes | 0 | 2 per week |

Premium status is managed server-side; clients cannot self-grant it.

### Data Management

- **Export** all data as a JSON file
- **Import** from a previously exported JSON file
- **Auto-migration** for data saved by older app versions
- **Error boundary** with a "Reset App Data" option that clears localStorage

### UI / UX

- **Dark / light theme** toggle, persisted to localStorage
- **Mobile-first** layout; a desktop blocker redirects non-mobile visitors
- **PWA** — installable, offline-capable via service worker
- **Install banner** prompts eligible browsers
- **Onboarding flow** for first-time users
- **Interactive tutorial overlay** for new users

---

## Data Model (key fields)

```ts
interface Habit {
  id: string;                        // UUID
  name: string;
  emoji: string;
  category: string;
  schedule: number[];                // 0=Sun … 6=Sat
  completionDates: string[];         // "YYYY-MM-DD"
  currentStreak: number;
  longestStreak: number;
  isCompletedToday: boolean;
  targetCount: number | null;        // null = checkbox habit
  progressByDate: Record<string, number>;
  reminderTime: string | null;       // "HH:MM"
  skipDates: string[];
  freezeDates: string[];             // streak freeze days applied
  color: string | null;
  glyphShape: GlyphShape;
  glyphColor: string;
}
```

---

## Database (Supabase)

Single table `user_data` with JSONB columns for habits, profile, reflections, and milestones. Row Level Security ensures users can only access their own rows. A `protect_premium_columns_trigger` prevents clients from modifying `is_premium`, `freeze_count`, or `last_freeze_reset`.

**RPC functions:**
- `get_freeze_status()` — returns premium status and remaining freezes; auto-refills if 7+ days since last reset
- `consume_freeze()` — atomically decrements freeze count
- `grant_premium(target uuid)` — admin-only, service role required

---

## Local Development

```bash
cp .env.example .env          # add Supabase URL + anon key (optional)
npm install
npm run dev
```

Supabase is optional — the app runs fully offline without it.

```bash
npm run build    # production build → dist/
npm run lint     # ESLint
npm run preview  # preview production build locally
```

---

## Navigation Views

| View | Route key | Description |
|---|---|---|
| Welcome | `welcome` | Onboarding / splash |
| Home | `home` | Habit dashboard (default) |
| Calendar | `calendar` | Monthly heatmap |
| Habit Detail | `habit-detail` | Per-habit analytics & reflections |
| Stats | `stats` | Global statistics |
| Profile | `profile` | User profile & account |
| Weekly Review | `weekly-review` | 7-day summary |

Navigation is handled entirely via React Context (`currentView` state) — no client-side router.

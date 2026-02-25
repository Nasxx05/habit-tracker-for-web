-- ============================================================
-- Streakly — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create the user_data table
create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  habits jsonb default '[]'::jsonb,
  profile jsonb default '{}'::jsonb,
  reflections jsonb default '[]'::jsonb,
  milestones jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table public.user_data enable row level security;

-- 3. RLS Policies — users can only access their own data
create policy "Users can read own data"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy "Users can insert own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own data"
  on public.user_data for update
  using (auth.uid() = user_id);

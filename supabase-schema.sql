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
drop policy if exists "Users can read own data" on public.user_data;
create policy "Users can read own data"
  on public.user_data for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own data" on public.user_data;
create policy "Users can insert own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own data" on public.user_data;
create policy "Users can update own data"
  on public.user_data for update
  using (auth.uid() = user_id);

-- 4. Premium tier flag — adds is_premium column for free vs paid tiers
alter table public.user_data
  add column if not exists is_premium boolean not null default false;

-- 5. Streak Freeze (premium feature) — weekly pool of freezes per user
alter table public.user_data
  add column if not exists freeze_count integer not null default 2;
alter table public.user_data
  add column if not exists last_freeze_reset date;

-- ============================================================
-- 6. SECURITY: protect server-controlled columns from client tampering
-- The "Users can update own data" policy is intentionally permissive so the
-- client can sync habits/profile, but premium and freeze columns must NEVER
-- be settable from the client. This trigger blocks any client UPDATE that
-- changes them. Trusted server code (Edge Functions, RPC functions) sets
-- the session-local flag `app.bypass_protect` to bypass this trigger.
-- ============================================================
create or replace function public.protect_premium_columns()
returns trigger
language plpgsql
as $$
begin
  -- Trusted server-side callers (RPCs below, service_role) set this flag.
  if current_setting('app.bypass_protect', true) = 'true' then
    return new;
  end if;
  if new.is_premium is distinct from old.is_premium then
    raise exception 'is_premium can only be modified server-side';
  end if;
  if new.freeze_count is distinct from old.freeze_count then
    raise exception 'freeze_count can only be modified server-side';
  end if;
  if new.last_freeze_reset is distinct from old.last_freeze_reset then
    raise exception 'last_freeze_reset can only be modified server-side';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_premium_columns_trigger on public.user_data;
create trigger protect_premium_columns_trigger
  before update on public.user_data
  for each row execute function public.protect_premium_columns();

-- ============================================================
-- 7. RPC: get_freeze_status() — reads the user's tier and (atomically)
-- refills their freeze pool if last_freeze_reset is null or >= 7 days old.
-- Free users always see freeze_count = 0.
-- ============================================================
create or replace function public.get_freeze_status()
returns table(is_premium boolean, freeze_count integer, last_freeze_reset date)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := current_date;
  v_premium boolean;
  v_last_reset date;
begin
  if v_user_id is null then
    return;
  end if;

  select ud.is_premium, ud.last_freeze_reset
    into v_premium, v_last_reset
    from public.user_data ud
    where ud.user_id = v_user_id;

  -- No row yet (new user) — return defaults.
  if v_premium is null then
    return query select false::boolean, 0::integer, null::date;
    return;
  end if;

  -- Auto-refill weekly for premium users.
  if v_premium and (v_last_reset is null or (v_today - v_last_reset) >= 7) then
    perform set_config('app.bypass_protect', 'true', true);
    update public.user_data
      set freeze_count = 2, last_freeze_reset = v_today
      where user_data.user_id = v_user_id;
  end if;

  return query
    select ud.is_premium,
           case when ud.is_premium then ud.freeze_count else 0 end as freeze_count,
           ud.last_freeze_reset
    from public.user_data ud
    where ud.user_id = v_user_id;
end;
$$;

revoke all on function public.get_freeze_status() from public;
grant execute on function public.get_freeze_status() to authenticated;

-- ============================================================
-- 8. RPC: consume_freeze() — atomically decrements the freeze pool by 1.
-- Returns the new count, or -1 if the user is not premium / has none left.
-- Performs the same auto-refill check as get_freeze_status().
-- ============================================================
create or replace function public.consume_freeze()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := current_date;
  v_premium boolean;
  v_count integer;
  v_last_reset date;
begin
  if v_user_id is null then
    return -1;
  end if;

  select ud.is_premium, ud.freeze_count, ud.last_freeze_reset
    into v_premium, v_count, v_last_reset
    from public.user_data ud
    where ud.user_id = v_user_id
    for update;

  if not coalesce(v_premium, false) then
    return -1;
  end if;

  if v_last_reset is null or (v_today - v_last_reset) >= 7 then
    v_count := 2;
    perform set_config('app.bypass_protect', 'true', true);
    update public.user_data
      set freeze_count = 2, last_freeze_reset = v_today
      where user_data.user_id = v_user_id;
  end if;

  if v_count <= 0 then
    return 0;
  end if;

  perform set_config('app.bypass_protect', 'true', true);
  update public.user_data
    set freeze_count = freeze_count - 1
    where user_data.user_id = v_user_id;

  return v_count - 1;
end;
$$;

revoke all on function public.consume_freeze() from public;
grant execute on function public.consume_freeze() to authenticated;

-- ============================================================
-- 9. ADMIN HELPER: grant_premium(target uuid)
-- Use this from the SQL Editor (you are service_role there) to flip a user
-- to premium for testing. A real payment webhook would do the same thing.
-- ============================================================
create or replace function public.grant_premium(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.bypass_protect', 'true', true);
  update public.user_data
    set is_premium = true, freeze_count = 2, last_freeze_reset = current_date
    where user_id = target;
end;
$$;

revoke all on function public.grant_premium(uuid) from public;
-- intentionally NOT granted to authenticated — only callable by service_role.

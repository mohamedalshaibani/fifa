-- ====================================================================
-- MANUAL MIGRATION: Add Slug and Pairings Table
-- Run this in Supabase SQL Editor if 'supabase db push' fails
-- ====================================================================

-- Step 1: Add slug column to tournaments (safe with if not exists)
alter table public.tournaments
  add column if not exists slug text;

-- Step 2: Backfill slug for existing tournaments
-- Only updates rows where slug is null
update public.tournaments
set slug = lower(trim(both '-' from regexp_replace(replace(name, ' ', '-'), '[^[:alnum:]\-]+', '-', 'g')))
    || '-' || substring(id::text, 1, 6)
where slug is null;

-- Step 3: Make slug not null (only if not already set)
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'tournaments' 
    and column_name = 'slug' 
    and is_nullable = 'NO'
  ) then
    alter table public.tournaments alter column slug set not null;
  end if;
end $$;

-- Step 4: Create unique index (safe with if not exists)
create unique index if not exists tournaments_slug_key on public.tournaments (slug);

-- Step 5: Create pairings table (safe with if not exists)
create table if not exists public.tournament_pairings (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  home_participant_id uuid not null references public.participants (id) on delete cascade,
  away_participant_id uuid references public.participants (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Step 6: Create index (safe with if not exists)
create index if not exists tournament_pairings_tournament_id_idx on public.tournament_pairings (tournament_id);

-- Step 7: Enable RLS on pairings table
alter table public.tournament_pairings enable row level security;

-- Step 8: Add RLS policies for pairings
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'tournament_pairings' 
    and policyname = 'Public read pairings'
  ) then
    create policy "Public read pairings" on tournament_pairings
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'tournament_pairings' 
    and policyname = 'Admins manage pairings'
  ) then
    create policy "Admins manage pairings" on tournament_pairings
      for all using (
        exists (
          select 1 from public.admins
          where admins.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- ====================================================================
-- Verification: Check if migration was successful
-- ====================================================================
select 
  'tournaments.slug column exists' as check_name,
  exists(
    select 1 from information_schema.columns 
    where table_name = 'tournaments' and column_name = 'slug'
  ) as passed;

select 
  'tournament_pairings table exists' as check_name,
  exists(
    select 1 from information_schema.tables 
    where table_name = 'tournament_pairings'
  ) as passed;

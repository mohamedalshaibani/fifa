-- Add slug to tournaments
alter table public.tournaments
  add column if not exists slug text;

-- Backfill slug for existing rows using name + short suffix
update public.tournaments
set slug = coalesce(
  slug,
  lower(trim(both '-' from regexp_replace(replace(name, ' ', '-'), '[^[:alnum:]\-]+', '-', 'g')))
    || '-' || substring(id::text, 1, 6)
)
where slug is null;

-- Ensure slug is not null and unique
alter table public.tournaments
  alter column slug set not null;

create unique index if not exists tournaments_slug_key on public.tournaments (slug);

-- Pairings table for preview/confirmation step
create table if not exists public.tournament_pairings (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  home_participant_id uuid not null references public.participants (id) on delete cascade,
  away_participant_id uuid references public.participants (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists tournament_pairings_tournament_id_idx on public.tournament_pairings (tournament_id);

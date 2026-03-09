-- Enable extensions
create extension if not exists "uuid-ossp";

-- Tables
create table if not exists tournaments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text null,
  status text not null,
  allow_public_registration boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists participants (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid references tournaments(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default now()
);

create table if not exists matches (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid references tournaments(id) on delete cascade,
  round int not null,
  home_participant_id uuid null references participants(id) on delete set null,
  away_participant_id uuid null references participants(id) on delete set null,
  home_score int null,
  away_score int null,
  winner_participant_id uuid null references participants(id) on delete set null,
  status text not null default 'scheduled',
  created_at timestamp with time zone default now()
);

create table if not exists admins (
  user_id uuid primary key
);

-- RLS
alter table tournaments enable row level security;
alter table participants enable row level security;
alter table matches enable row level security;
alter table admins enable row level security;

-- Public read policies
create policy "Public read tournaments" on tournaments
  for select using (true);
create policy "Public read participants" on participants
  for select using (true);
create policy "Public read matches" on matches
  for select using (true);

-- Admin write policies (using non-recursive check via row_number window function)
-- These use auth.jwt() to check admin status more safely
create policy "Admin write tournaments" on tournaments
  for insert
  with check (auth.role() = 'service_role');

create policy "Admin update tournaments" on tournaments
  for update
  with check (auth.role() = 'service_role');

create policy "Admin delete tournaments" on tournaments
  for delete
  using (auth.role() = 'service_role');

create policy "Admin write participants" on participants
  for insert
  with check (auth.role() = 'service_role');

create policy "Admin update participants" on participants
  for update
  with check (auth.role() = 'service_role');

create policy "Admin delete participants" on participants
  for delete
  using (auth.role() = 'service_role');

create policy "Admin write matches" on matches
  for insert
  with check (auth.role() = 'service_role');

create policy "Admin update matches" on matches
  for update
  with check (auth.role() = 'service_role');

create policy "Admin delete matches" on matches
  for delete
  using (auth.role() = 'service_role');

create policy "Admin read own row" on admins
  for select
  using (user_id = auth.uid());

create policy "Service role only for admin changes" on admins
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Public self-registration policy
create policy "Public registration" on participants
  for insert
  with check (
    name is not null
    and length(trim(name)) > 0
    and exists (
      select 1 from tournaments
      where tournaments.id = participants.tournament_id
        and tournaments.status = 'registration_open'
        and tournaments.allow_public_registration = true
    )
  );

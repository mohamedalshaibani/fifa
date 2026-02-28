alter table participants
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists notes text,
  add column if not exists status text not null default 'approved',
  add column if not exists approved_at timestamp with time zone;

update participants
  set status = 'approved'
  where status is null;

update participants
  set approved_at = created_at
  where approved_at is null and status = 'approved';

create index if not exists idx_participants_tournament_status
  on participants(tournament_id, status);

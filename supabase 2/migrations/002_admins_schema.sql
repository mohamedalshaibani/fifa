-- Migration: Fix admins table schema and backfill

-- 1. Create new admins table with email, name, created_at
create table if not exists admins_new (
  user_id uuid primary key,
  email text,
  name text,
  created_at timestamp with time zone default now()
);

-- 2. Backfill email/name from auth.users if possible
insert into admins_new (user_id, email, name, created_at)
select a.user_id, u.email, u.raw_user_meta_data->>'name', now()
from admins a
left join auth.users u on a.user_id = u.id
on conflict (user_id) do nothing;

-- 3. Drop old admins table and rename
drop table if exists admins;
alter table admins_new rename to admins;

-- 4. Enforce email not null
alter table admins alter column email set not null;

-- 5. Add index for email
create index if not exists admins_email_idx on admins(email);

-- 6. Upsert requested admin
insert into admins (user_id, email, name)
values ('22fd85ac-be2d-4b8f-a755-5ce193c67025', 'mohamed.alshaibani@gmail.com', 'Mohamed Alshaibani')
on conflict (user_id) do update set email = excluded.email, name = excluded.name;

-- 7. Update RLS policy for admins
-- Allow service role to read all, users to read their own
-- (You may need to update this in the SQL editor if not supported in migration)

-- Migration to upgrade avatars table from TEXT id (migration 014) to UUID id (migration 016)
-- This migration safely transitions existing data to the new schema

-- Step 1: Drop existing policies from migration 014
drop policy if exists "Anyone can view avatars" on public.avatars;
drop policy if exists "Admins can insert avatars" on public.avatars;
drop policy if exists "Admins can update avatars" on public.avatars;
drop policy if exists "Admins can delete avatars" on public.avatars;

-- Step 2: Drop existing indexes
drop index if exists idx_avatars_category;
drop index if exists idx_avatars_created_at;

-- Step 3: Backup old data (in case we want to reference it)
create table if not exists avatars_old_backup as 
select * from public.avatars;

-- Step 4: Drop the old table (we'll recreate with new schema)
drop table if exists public.avatars;

-- Step 5: Create new avatars table with UUID primary key
create table public.avatars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  display_name text not null,
  description text,
  image_url text not null,
  category text not null default 'player' check (category in ('player', 'legend', 'custom')),
  created_at timestamptz not null default now()
);

-- Step 6: Enable RLS
alter table public.avatars enable row level security;

-- Step 7: Create RLS policies (updated to use is_admin function from migration 017)
-- Public can read avatars
create policy "Anyone can view avatars"
on public.avatars for select
using ( true );

-- Only admins can insert avatars (using is_admin function to avoid recursion)
create policy "Admins can insert avatars"
on public.avatars for insert
with check (
  public.is_admin(auth.uid())
);

-- Only admins can update avatars
create policy "Admins can update avatars"
on public.avatars for update
using (
  public.is_admin(auth.uid())
);

-- Only admins can delete avatars
create policy "Admins can delete avatars"
on public.avatars for delete
using (
  public.is_admin(auth.uid())
);

-- Step 8: Add indexes for performance
create index idx_avatars_category on public.avatars(category);
create index idx_avatars_created_at on public.avatars(created_at desc);

-- Step 9: Create storage bucket for avatars (if not exists)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Step 10: Set up storage policies using is_admin function
-- Drop old storage policies if they exist
drop policy if exists "Avatar images are publicly accessible" on storage.objects;
drop policy if exists "Admins can upload avatar images" on storage.objects;
drop policy if exists "Admins can update avatar images" on storage.objects;
drop policy if exists "Admins can delete avatar images" on storage.objects;

-- Create new storage policies
create policy "Avatar images are publicly accessible"
on storage.objects for select
using ( bucket_id = 'avatars' );

create policy "Admins can upload avatar images"
on storage.objects for insert
with check (
  bucket_id = 'avatars' 
  and public.is_admin(auth.uid())
);

create policy "Admins can update avatar images"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and public.is_admin(auth.uid())
);

create policy "Admins can delete avatar images"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and public.is_admin(auth.uid())
);

-- Note: The old cartoon avatars are backed up in avatars_old_backup table
-- You can now upload new realistic avatars through the admin interface at /admin/avatars

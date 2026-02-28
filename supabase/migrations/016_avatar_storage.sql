-- Create storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set up storage policies for avatars bucket
create policy "Avatar images are publicly accessible"
on storage.objects for select
using ( bucket_id = 'avatars' );

create policy "Admins can upload avatar images"
on storage.objects for insert
with check (
  bucket_id = 'avatars' 
  and auth.uid() in (select user_id from public.admins)
);

create policy "Admins can update avatar images"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.uid() in (select user_id from public.admins)
);

create policy "Admins can delete avatar images"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and auth.uid() in (select user_id from public.admins)
);

-- Ensure avatars table exists with proper structure
-- (This table may already exist from migration 014)
create table if not exists public.avatars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  display_name text not null,
  description text,
  image_url text not null,
  category text not null default 'player' check (category in ('player', 'legend')),
  created_at timestamptz not null default now()
);

-- Enable RLS on avatars table
alter table public.avatars enable row level security;

-- Public can read avatars
create policy "Anyone can view avatars"
on public.avatars for select
using ( true );

-- Only admins can insert avatars
create policy "Admins can insert avatars"
on public.avatars for insert
with check (
  auth.uid() in (select user_id from public.admins)
);

-- Only admins can update avatars
create policy "Admins can update avatars"
on public.avatars for update
using (
  auth.uid() in (select user_id from public.admins)
);

-- Only admins can delete avatars
create policy "Admins can delete avatars"
on public.avatars for delete
using (
  auth.uid() in (select user_id from public.admins)
);

-- Add index for faster queries
create index if not exists idx_avatars_category on public.avatars(category);
create index if not exists idx_avatars_created_at on public.avatars(created_at desc);

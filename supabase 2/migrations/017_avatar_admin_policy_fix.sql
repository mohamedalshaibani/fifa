-- Fix 42P17 recursion by using a SECURITY DEFINER admin check
-- and update avatar/storage policies to use it.

-- 1) Admin check function (bypasses RLS on admins)
create or replace function public.is_admin(check_uid uuid)
returns boolean
language sql
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.admins
    where user_id = check_uid
  );
$$;

-- 2) Update avatars category constraint to include custom
alter table public.avatars drop constraint if exists avatars_category_check;
alter table public.avatars
  add constraint avatars_category_check
  check (category in ('player', 'legend', 'custom'));

-- 3) Update avatars table policies to use is_admin()
drop policy if exists "Admins can insert avatars" on public.avatars;
drop policy if exists "Admins can update avatars" on public.avatars;
drop policy if exists "Admins can delete avatars" on public.avatars;

create policy "Admins can insert avatars" on public.avatars
  for insert
  with check (public.is_admin(auth.uid()));

create policy "Admins can update avatars" on public.avatars
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Admins can delete avatars" on public.avatars
  for delete
  using (public.is_admin(auth.uid()));

-- 4) Update storage policies for avatars bucket
drop policy if exists "Admins can upload avatar images" on storage.objects;
drop policy if exists "Admins can update avatar images" on storage.objects;
drop policy if exists "Admins can delete avatar images" on storage.objects;

create policy "Admins can upload avatar images" on storage.objects
  for insert
  with check (
    bucket_id = 'avatars'
    and public.is_admin(auth.uid())
  );

create policy "Admins can update avatar images" on storage.objects
  for update
  using (
    bucket_id = 'avatars'
    and public.is_admin(auth.uid())
  );

create policy "Admins can delete avatar images" on storage.objects
  for delete
  using (
    bucket_id = 'avatars'
    and public.is_admin(auth.uid())
  );

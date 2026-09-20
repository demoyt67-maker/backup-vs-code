-- Standalone Ustad profiles table (no Google auth dependency)
-- Run this in Supabase SQL Editor

create table if not exists public.ustad_profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  age integer not null,
  photo_url text,
  status text not null default 'pending',
  rejection_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ustad_profiles enable row level security;

create or replace function public.current_user_is_super_admin()
returns boolean as $$
begin
  return exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
  );
end;
$$ language plpgsql security definer
  set search_path = public;

revoke execute on function public.current_user_is_super_admin() from public;
revoke execute on function public.current_user_is_super_admin() from anon;
grant execute on function public.current_user_is_super_admin() to authenticated;

-- Allow anonymous registration insert, but only as pending
create policy "Allow ustad registration insert"
  on public.ustad_profiles for insert
  with check (
    auth.role() = 'anon'
    and status = 'pending'
  );

-- Allow viewing own profile or super admin access
create policy "Allow ustad profile select"
  on public.ustad_profiles for select
  using (
    public.current_user_is_super_admin()
    or
    email = coalesce(
      auth.jwt() ->> 'email',
      current_setting('request.jwt.claims', true)::json ->> 'email',
      ''
    )
  );

-- Only Super Admin can update ustad profiles
create policy "Allow admin to update ustad profiles"
  on public.ustad_profiles for update
  using (public.current_user_is_super_admin());

-- Allow deleting pending profiles by owner or super admin
create policy "Allow delete pending ustad profile"
  on public.ustad_profiles for delete
  using (
    status = 'pending'
    and (
      public.current_user_is_super_admin()
      or
      email = coalesce(
        auth.jwt() ->> 'email',
        current_setting('request.jwt.claims', true)::json ->> 'email',
        ''
      )
    )
  );

-- Storage bucket for ustad photos
insert into storage.buckets (id, name, public)
values ('ustad-photos', 'ustad-photos', false)
on conflict (id) do nothing;

-- Remove any existing ustad-photos INSERT policies to avoid conflicts
drop policy if exists "Allow ustad photo upload" on storage.objects;
drop policy if exists "Anyone can upload ustad photo" on storage.objects;

-- Allow anonymous uploads to ustad-photos only, scoped to the user's folder
create policy "Allow ustad photo upload"
  on storage.objects for insert
  with check (
    bucket_id = 'ustad-photos'
    and (storage.foldername(name))[1] = 'ustad'
  );

-- Allow viewing photos
create policy "Allow ustad photo view"
  on storage.objects for select
  using (bucket_id = 'ustad-photos');

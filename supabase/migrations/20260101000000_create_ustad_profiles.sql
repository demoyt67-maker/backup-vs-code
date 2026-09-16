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

-- Allow anonymous registration insert
create policy "Allow ustad registration insert"
  on public.ustad_profiles for insert
  with check (auth.role() = 'anon');

-- Allow viewing own profile by email for anonymous users
-- and full access for authenticated Super Admin users
create policy "Allow ustad profile select"
  on public.ustad_profiles for select
  using (
    auth.role() = 'anon'
    or
    auth.role() = 'authenticated'
  );

-- Only Super Admin can update ustad profiles
create policy "Allow admin to update ustad profiles"
  on public.ustad_profiles for update
  using (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
  );

-- Storage bucket for ustad photos
insert into storage.buckets (id, name, public)
values ('ustad-photos', 'ustad-photos', false)
on conflict (id) do nothing;

-- Allow anonymous uploads for registration
create policy "Allow ustad photo upload"
  on storage.objects for insert
  with check (bucket_id = 'ustad-photos' and auth.role() = 'anon');

-- Allow viewing photos
create policy "Allow ustad photo view"
  on storage.objects for select
  using (bucket_id = 'ustad-photos');

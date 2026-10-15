-- Profiles table for Google OAuth users (role-based access control).
-- Required by:
--   - src/hooks/useAuth.ts  (select role by auth.uid() to detect super_admin)
--   - src/lib/supabaseClient.ts getAllProfiles() (id, role)
--   - src/views/SuperAdminStudentsView.tsx (lists registered users + roles)
--   - the current_user_is_super_admin() helper used by every other table's RLS
--
-- Idempotent: safe to run against an existing database.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'ustad', 'super_admin')),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- Keep updated_at fresh.
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create a default 'student' profile when a new auth user signs in.
create or replace function public.handle_new_user_profile()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'student')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer
set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- Helper used by RLS policies across the app to check super-admin status
-- without exposing the profiles table to direct RLS subqueries.
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

-- RPC used by the admin UI to verify the caller's admin status.
create or replace function public.check_my_admin_status()
returns boolean as $$
begin
  return public.current_user_is_super_admin();
end;
$$ language plpgsql security definer
set search_path = public;

revoke execute on function public.check_my_admin_status() from public;
revoke execute on function public.check_my_admin_status() from anon;
grant execute on function public.check_my_admin_status() to authenticated;

alter table public.profiles enable row level security;

-- Users can read their own profile.
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

-- Only the service_role / security-definer triggers may insert rows;
-- authenticated users cannot self-assign roles.
revoke insert on public.profiles from authenticated;
revoke insert on public.profiles from anon;

-- Only a super admin may update roles.
create policy "Super Admin can update profiles"
  on public.profiles for update
  using (public.current_user_is_super_admin());

-- Only a super admin may view other profiles (student list).
create policy "Super Admin can view all profiles"
  on public.profiles for select
  using (public.current_user_is_super_admin());
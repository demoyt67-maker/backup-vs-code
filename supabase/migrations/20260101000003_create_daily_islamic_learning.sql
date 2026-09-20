-- Daily Islamic Learning submissions
-- Run this in Supabase SQL Editor

create table if not exists public.daily_islamic_learning (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('ayah', 'dua', 'good_message')),
  title text not null,
  arabic_content text,
  malayalam_content text not null,
  english_content text not null,
  scheduled_date date not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reviewed_by text,
  reviewed_at timestamp with time zone
);

create index if not exists idx_daily_islamic_learning_status on public.daily_islamic_learning (status);
create index if not exists idx_daily_islamic_learning_scheduled_date on public.daily_islamic_learning (scheduled_date);
create index if not exists idx_daily_islamic_learning_created_by on public.daily_islamic_learning (created_by);

-- Helper to check super-admin status without exposing profiles to RLS subqueries
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

alter table public.daily_islamic_learning enable row level security;

-- Public read access for approved and scheduled content
create policy "Public can view approved daily Islamic learning"
  on public.daily_islamic_learning for select
  using (status = 'approved' and scheduled_date <= timezone('utc'::text, now())::date);

-- Super Admin can view all submissions
create policy "Super Admin can view all daily Islamic learning"
  on public.daily_islamic_learning for select
  using (public.current_user_is_super_admin());

-- Super Admin can insert
create policy "Super Admin can insert daily Islamic learning"
  on public.daily_islamic_learning for insert
  with check (public.current_user_is_super_admin());

-- Ustads can insert their own submissions
create policy "Ustads can insert daily Islamic learning"
  on public.daily_islamic_learning for insert
  with check (auth.uid() IS NOT NULL);

-- Ustads can view their own submissions
create policy "Ustads can view own daily Islamic learning"
  on public.daily_islamic_learning for select
  using (
    created_by = (
      select coalesce(auth.jwt() ->> 'email', '')
    )
    or created_by = (
      select coalesce(current_setting('request.jwt.claims', true)::json ->> 'email', '')
    )
  );

-- Super Admin can update submissions
create policy "Super Admin can update daily Islamic learning"
  on public.daily_islamic_learning for update
  using (public.current_user_is_super_admin());

-- Super Admin can delete submissions
create policy "Super Admin can delete daily Islamic learning"
  on public.daily_islamic_learning for delete
  using (public.current_user_is_super_admin());

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_daily_islamic_learning_updated_at on public.daily_islamic_learning;
create trigger handle_daily_islamic_learning_updated_at
  before update on public.daily_islamic_learning
  for each row execute function public.handle_updated_at();

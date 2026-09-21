-- Reports & Corrections table
-- Run this in Supabase SQL Editor

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null,
  reporter_email text not null,
  reporter_role text not null check (reporter_role in ('student', 'ustad', 'super_admin')),
  report_type text not null check (report_type in ('learning_content', 'learning_bug', 'app_bug')),
  description text not null,
  related_content_type text,
  related_content_id text,
  status text not null default 'open' check (status in ('open', 'in_review', 'resolved', 'rejected')),
  admin_response text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_reports_reporter_id on public.reports (reporter_id);
create index if not exists idx_reports_status on public.reports (status);
create index if not exists idx_reports_report_type on public.reports (report_type);
create index if not exists idx_reports_created_at on public.reports (created_at);

alter table public.reports enable row level security;

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

-- Students and Ustads can insert their own reports
create policy "Users can insert own reports"
  on public.reports for insert
  with check (
    reporter_id = auth.uid()
    and reporter_email = coalesce(
      auth.jwt() ->> 'email',
      current_setting('request.jwt.claims', true)::json ->> 'email',
      ''
    )
  );

-- Students and Ustads can view only their own reports
create policy "Users can view own reports"
  on public.reports for select
  using (
    reporter_id = auth.uid()
    and reporter_email = coalesce(
      auth.jwt() ->> 'email',
      current_setting('request.jwt.claims', true)::json ->> 'email',
      ''
    )
  );

-- Super Admin can view all reports
create policy "Super Admin can view all reports"
  on public.reports for select
  using (public.current_user_is_super_admin());

-- Super Admin can update all reports (status, admin_response)
create policy "Super Admin can update reports"
  on public.reports for update
  using (public.current_user_is_super_admin());

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_reports_updated_at on public.reports;
create trigger handle_reports_updated_at
  before update on public.reports
  for each row execute function public.handle_updated_at();

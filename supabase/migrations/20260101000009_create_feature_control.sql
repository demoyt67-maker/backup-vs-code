-- Global feature toggle table.
-- Required by:
--   - src/hooks/useFeatureControl.ts
--       loadFromSupabase(): select * from feature_control where id = 'global'
--       toggleFeature():      update feature_control set <key> = ? where id = 'global'
--
-- The TypeScript code reads/writes exactly one row (id = 'global') with four
-- boolean columns: learning, quiz, writing, harakat.
--
-- Idempotent: safe to run against an existing database.

create table if not exists public.feature_control (
  id text primary key default 'global' check (id = 'global'),
  learning boolean not null default true,
  quiz boolean not null default true,
  writing boolean not null default true,
  harakat boolean not null default true,
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

drop trigger if exists handle_feature_control_updated_at on public.feature_control;
create trigger handle_feature_control_updated_at
  before update on public.feature_control
  for each row execute function public.handle_updated_at();

alter table public.feature_control enable row level security;

-- Public read: students need the toggles to know which features to render.
create policy "Public can view feature control"
  on public.feature_control for select
  using (true);

-- Only Super Admin may toggle features.
create policy "Super Admin can update feature control"
  on public.feature_control for update
  using (public.current_user_is_super_admin());

-- Ensure a default global row exists so the app always has a source of truth.
insert into public.feature_control (id, learning, quiz, writing, harakat)
values ('global', true, true, true, true)
on conflict (id) do nothing;
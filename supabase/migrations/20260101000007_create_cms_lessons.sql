-- CMS lessons (curriculum units) for Class 1 and Class 2.
-- Required by:
--   - src/hooks/useCMSClass1Data.ts  (select cms_lessons where class_level = 1)
--   - src/hooks/useCMSClass2Data.ts  (select cms_lessons where class_level = 2)
--   - src/views/CMSView.tsx Class1ContentManagement / Class2ContentManagement
--       (upsert + delete cms_lessons)
--
-- Columns are derived from the exact fields the TypeScript code reads and writes:
--   id, class_level, lesson_key, title, description, sort_order, is_active
--
-- Idempotent: safe to run against an existing database.

create table if not exists public.cms_lessons (
  id uuid primary key default gen_random_uuid(),
  class_level integer not null check (class_level in (1, 2, 3)),
  lesson_key text not null,
  title text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  unique (class_level, lesson_key)
);

create index if not exists idx_cms_lessons_class_level on public.cms_lessons (class_level);
create index if not exists idx_cms_lessons_lesson_key on public.cms_lessons (lesson_key);
create index if not exists idx_cms_lessons_is_active on public.cms_lessons (is_active);

drop trigger if exists handle_cms_lessons_updated_at on public.cms_lessons;
create trigger handle_cms_lessons_updated_at
  before update on public.cms_lessons
  for each row execute function public.handle_updated_at();

alter table public.cms_lessons enable row level security;

-- Public read: students see active lessons to build their curriculum.
create policy "Public can view active cms lessons"
  on public.cms_lessons for select
  using (is_active = true);

-- Only Super Admin may manage lessons.
create policy "Super Admin can insert cms lessons"
  on public.cms_lessons for insert
  with check (public.current_user_is_super_admin());

create policy "Super Admin can update cms lessons"
  on public.cms_lessons for update
  using (public.current_user_is_super_admin());

create policy "Super Admin can delete cms lessons"
  on public.cms_lessons for delete
  using (public.current_user_is_super_admin());
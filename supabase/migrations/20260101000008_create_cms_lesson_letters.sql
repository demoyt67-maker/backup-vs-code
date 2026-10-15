-- Letters / words attached to a CMS lesson.
-- Required by:
--   - src/hooks/useCMSClass1Data.ts  (select cms_lesson_letters by lesson_id)
--   - src/hooks/useCMSClass2Data.ts  (select cms_lesson_letters by lesson_id)
--   - src/views/CMSView.tsx LetterManagement + WordManagement
--       (select / insert / update / delete cms_lesson_letters)
--
-- Columns are derived from the exact fields the TypeScript code reads and writes:
--   id, lesson_id, position, arabic, english
--
-- Idempotent: safe to run against an existing database.

create table if not exists public.cms_lesson_letters (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.cms_lessons (id) on delete cascade,
  position integer not null check (position > 0),
  arabic text not null,
  english text not null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_cms_lesson_letters_lesson_id on public.cms_lesson_letters (lesson_id);
create index if not exists idx_cms_lesson_letters_position on public.cms_lesson_letters (lesson_id, position);

drop trigger if exists handle_cms_lesson_letters_updated_at on public.cms_lesson_letters;
create trigger handle_cms_lesson_letters_updated_at
  before update on public.cms_lesson_letters
  for each row execute function public.handle_updated_at();

alter table public.cms_lesson_letters enable row level security;

-- Public read: students see letters for active lessons (joined via cms_lessons).
create policy "Public can view cms lesson letters"
  on public.cms_lesson_letters for select
  using (
    exists (
      select 1 from public.cms_lessons
      where cms_lessons.id = cms_lesson_letters.lesson_id
        and cms_lessons.is_active = true
    )
  );

-- Only Super Admin may manage lesson letters.
create policy "Super Admin can insert cms lesson letters"
  on public.cms_lesson_letters for insert
  with check (public.current_user_is_super_admin());

create policy "Super Admin can update cms lesson letters"
  on public.cms_lesson_letters for update
  using (public.current_user_is_super_admin());

create policy "Super Admin can delete cms lesson letters"
  on public.cms_lesson_letters for delete
  using (public.current_user_is_super_admin());
-- Quiz questions table for Ustad management
-- Run this in Supabase SQL Editor

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  class_level integer not null check (class_level in (1, 2, 3)),
  set_id text not null,
  question_text text not null,
  malayalam_text text not null,
  english_transliteration text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null check (correct_option in ('A', 'B', 'C', 'D')),
  created_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_deleted boolean not null default false,
  deleted_at timestamp with time zone,
  deleted_by text,
  deletion_reason text
);

create index if not exists idx_quiz_questions_class_level on public.quiz_questions (class_level);
create index if not exists idx_quiz_questions_set_id on public.quiz_questions (set_id);
create index if not exists idx_quiz_questions_is_deleted on public.quiz_questions (is_deleted);

alter table public.quiz_questions enable row level security;

-- Public read access for students
create policy "Public can view quiz questions"
  on public.quiz_questions for select
  using (is_deleted = false);

-- Super Admin full access
create policy "Super Admin can insert quiz questions"
  on public.quiz_questions for insert
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
  );

create policy "Super Admin can update quiz questions"
  on public.quiz_questions for update
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
  );

create policy "Super Admin can delete quiz questions"
  on public.quiz_questions for delete
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
  );

-- Ustad access: allow anon role to manage questions
-- Ustad access control is enforced at the application level
create policy "Ustads can insert quiz questions"
  on public.quiz_questions for insert
  with check (auth.role() = 'anon' or auth.role() = 'authenticated');

create policy "Ustads can update quiz questions"
  on public.quiz_questions for update
  using (auth.role() = 'anon' or auth.role() = 'authenticated');

create policy "Ustads can delete quiz questions"
  on public.quiz_questions for delete
  using (auth.role() = 'anon' or auth.role() = 'authenticated');

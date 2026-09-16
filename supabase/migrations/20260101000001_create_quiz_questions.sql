-- Quiz questions table for Ustad management
-- Run this in Supabase SQL Editor

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  class_level integer not null check (class_level in (1, 2, 3)),
  level integer not null,
  question text not null,
  options jsonb not null,
  correct_index integer not null check (correct_index between 0 and 3),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.quiz_questions enable row level security;

create policy "Anyone can view quiz questions"
  on public.quiz_questions for select
  using (true);

create policy "Anyone can insert quiz questions"
  on public.quiz_questions for insert
  with check (true);

create policy "Anyone can update quiz questions"
  on public.quiz_questions for update
  using (true);

create policy "Anyone can delete quiz questions"
  on public.quiz_questions for delete
  using (true);

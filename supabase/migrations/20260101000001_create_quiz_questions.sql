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

-- Public read access for students
create policy "Public can view quiz questions"
  on public.quiz_questions for select
  using (is_deleted = false);

-- Super Admin full access
create policy "Super Admin can insert quiz questions"
  on public.quiz_questions for insert
  with check (public.current_user_is_super_admin());

create policy "Super Admin can update quiz questions"
  on public.quiz_questions for update
  using (public.current_user_is_super_admin());

create policy "Super Admin can delete quiz questions"
  on public.quiz_questions for delete
  using (public.current_user_is_super_admin());

-- Ustads can insert questions
create policy "Ustads can insert quiz questions"
  on public.quiz_questions for insert
  with check (auth.uid() IS NOT NULL);

-- Ustads can update their own questions
create policy "Ustads can update own quiz questions"
  on public.quiz_questions for update
  using (
    created_by = coalesce(auth.jwt() ->> 'email', current_setting('request.jwt.claims', true)::json ->> 'email', '')
  );

-- Ustads can delete their own questions
create policy "Ustads can delete own quiz questions"
  on public.quiz_questions for delete
  using (
    created_by = coalesce(auth.jwt() ->> 'email', current_setting('request.jwt.claims', true)::json ->> 'email', '')
  );

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_quiz_questions_updated_at on public.quiz_questions;
create trigger handle_quiz_questions_updated_at
  before update on public.quiz_questions
  for each row execute function public.handle_updated_at();

-- Soft delete RPC
create or replace function public.soft_delete_quiz_question(
  p_id uuid,
  p_reason text
)
returns uuid as $$
declare
  v_deleted_by text;
begin
  select coalesce(
    auth.jwt() ->> 'email',
    current_setting('request.jwt.claims', true)::json ->> 'email',
    ''
  ) into v_deleted_by;

  update public.quiz_questions
  set
    is_deleted = true,
    deleted_at = timezone('utc'::text, now()),
    deleted_by = v_deleted_by,
    deletion_reason = p_reason
  where id = p_id;

  if not found then
    raise exception 'Question not found';
  end if;

  return p_id;
end;
$$ language plpgsql security definer
  set search_path = public;

revoke execute on function public.soft_delete_quiz_question from public;
revoke execute on function public.soft_delete_quiz_question from anon;
grant execute on function public.soft_delete_quiz_question to authenticated;

-- Restore RPC
create or replace function public.restore_quiz_question(
  p_id uuid
)
returns uuid as $$
begin
  update public.quiz_questions
  set
    is_deleted = false,
    deleted_at = null,
    deleted_by = null,
    deletion_reason = null
  where id = p_id;

  if not found then
    raise exception 'Question not found';
  end if;

  return p_id;
end;
$$ language plpgsql security definer
  set search_path = public;

revoke execute on function public.restore_quiz_question from public;
revoke execute on function public.restore_quiz_question from anon;
grant execute on function public.restore_quiz_question to authenticated;

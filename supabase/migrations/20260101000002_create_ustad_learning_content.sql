-- Ustad Learning Content table
-- Run this in Supabase SQL Editor

create table if not exists public.ustad_learning_content (
  id uuid primary key default gen_random_uuid(),
  class_level integer not null check (class_level in (1, 2, 3)),
  set_id text not null,
  content_type text not null,
  title text not null,
  malayalam_content text not null,
  english_content text not null,
  arabic_content text,
  image_url text,
  audio_url text,
  created_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_deleted boolean not null default false,
  deleted_at timestamp with time zone,
  deleted_by text,
  deletion_reason text
);

create index if not exists idx_ustad_learning_content_class_level on public.ustad_learning_content (class_level);
create index if not exists idx_ustad_learning_content_set_id on public.ustad_learning_content (set_id);
create index if not exists idx_ustad_learning_content_content_type on public.ustad_learning_content (content_type);
create index if not exists idx_ustad_learning_content_is_deleted on public.ustad_learning_content (is_deleted);

alter table public.ustad_learning_content enable row level security;

-- Super Admin full access
create policy "Super Admin can insert learning content"
  on public.ustad_learning_content for insert
  with check (public.current_user_is_super_admin());

create policy "Super Admin can update learning content"
  on public.ustad_learning_content for update
  using (public.current_user_is_super_admin());

create policy "Super Admin can delete learning content"
  on public.ustad_learning_content for delete
  using (public.current_user_is_super_admin());

-- Ustads can insert content
create policy "Ustads can insert learning content"
  on public.ustad_learning_content for insert
  with check (auth.uid() IS NOT NULL);

-- Ustads can update their own content
create policy "Ustads can update own learning content"
  on public.ustad_learning_content for update
  using (
    created_by = coalesce(auth.jwt() ->> 'email', current_setting('request.jwt.claims', true)::json ->> 'email', '')
  );

-- Ustads can delete their own content
create policy "Ustads can delete own learning content"
  on public.ustad_learning_content for delete
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

drop trigger if exists handle_ustad_learning_content_updated_at on public.ustad_learning_content;
create trigger handle_ustad_learning_content_updated_at
  before update on public.ustad_learning_content
  for each row execute function public.handle_updated_at();

-- Soft delete RPC
create or replace function public.soft_delete_ustad_learning_content(
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

  update public.ustad_learning_content
  set
    is_deleted = true,
    deleted_at = timezone('utc'::text, now()),
    deleted_by = v_deleted_by,
    deletion_reason = p_reason
  where id = p_id;

  if not found then
    raise exception 'Content not found';
  end if;

  return p_id;
end;
$$ language plpgsql security definer
  set search_path = public;

revoke execute on function public.soft_delete_ustad_learning_content from public;
revoke execute on function public.soft_delete_ustad_learning_content from anon;
grant execute on function public.soft_delete_ustad_learning_content to authenticated;

-- Restore RPC
create or replace function public.restore_ustad_learning_content(
  p_id uuid
)
returns uuid as $$
begin
  update public.ustad_learning_content
  set
    is_deleted = false,
    deleted_at = null,
    deleted_by = null,
    deletion_reason = null
  where id = p_id;

  if not found then
    raise exception 'Content not found';
  end if;

  return p_id;
end;
$$ language plpgsql security definer
  set search_path = public;

revoke execute on function public.restore_ustad_learning_content from public;
revoke execute on function public.restore_ustad_learning_content from anon;
grant execute on function public.restore_ustad_learning_content to authenticated;

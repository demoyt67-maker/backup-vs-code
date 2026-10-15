-- Announcements shown on the Home screen carousel.
-- Required by:
--   - src/views/HomeView.tsx loadAnnouncements()
--       select id, title, message, announcement_type, image_url, aspect_ratio,
--              is_active, expires_at, created_at
--       where is_active = true and (expires_at is null or expires_at > now)
--   - src/views/AnnouncementManagementView.tsx
--       select / insert / update / delete announcements
--       upload cropped images to the `announcement-images` storage bucket
--
-- Columns are derived from the exact fields the TypeScript code reads and writes:
--   id, title, message, announcement_type, image_url, aspect_ratio,
--   is_active, expires_at, created_at, updated_at
--
-- Idempotent: safe to run against an existing database.

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  message text not null default '',
  announcement_type text not null check (announcement_type in ('text', 'image')),
  image_url text,
  aspect_ratio text,
  is_active boolean not null default true,
  expires_at timestamp with time zone,
  created_by text,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_announcements_is_active on public.announcements (is_active);
create index if not exists idx_announcements_expires_at on public.announcements (expires_at);
create index if not exists idx_announcements_created_at on public.announcements (created_at desc);

drop trigger if exists handle_announcements_updated_at on public.announcements;
create trigger handle_announcements_updated_at
  before update on public.announcements
  for each row execute function public.handle_updated_at();

alter table public.announcements enable row level security;

-- Public read: students see active, non-expired announcements for the carousel.
create policy "Public can view active announcements"
  on public.announcements for select
  using (
    is_active = true
    and (expires_at is null or expires_at > timezone('utc'::text, now()))
  );

-- Only Super Admin may manage announcements.
create policy "Super Admin can insert announcements"
  on public.announcements for insert
  with check (public.current_user_is_super_admin());

create policy "Super Admin can update announcements"
  on public.announcements for update
  using (public.current_user_is_super_admin());

create policy "Super Admin can delete announcements"
  on public.announcements for delete
  using (public.current_user_is_super_admin());
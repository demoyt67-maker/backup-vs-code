git status-- Announcement image storage bucket + policies.
-- Required by:
--   - src/views/AnnouncementManagementView.tsx
--       const STORAGE_BUCKET = 'announcement-images';
--       supabase.storage.from(STORAGE_BUCKET).upload(path, file, ...)
--       supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
--
-- Images are stored under:
--   announcements/<timestamp>-<random>.jpg   (new uploads)
--   <announcementId>/<timestamp>.jpg          (replacements)
--
-- Idempotent: safe to run against an existing database.

-- Create the bucket as private; public access is granted via the SELECT policy.
insert into storage.buckets (id, name, public)
values ('announcement-images', 'announcement-images', false)
on conflict (id) do nothing;

-- Remove any pre-existing policies with these names to keep the migration idempotent.
drop policy if exists "Announcement images public read" on storage.objects;
drop policy if exists "Super Admin can upload announcement images" on storage.objects;
drop policy if exists "Super Admin can update announcement images" on storage.objects;
drop policy if exists "Super Admin can delete announcement images" on storage.objects;

-- Students read announcement images anonymously (the Home carousel renders them).
create policy "Announcement images public read"
  on storage.objects for select
  using (bucket_id = 'announcement-images');

-- Only Super Admin may upload announcement images.
create policy "Super Admin can upload announcement images"
  on storage.objects for insert
  with check (
    bucket_id = 'announcement-images'
    and public.current_user_is_super_admin()
  );

-- Only Super Admin may replace/delete announcement images.
create policy "Super Admin can update announcement images"
  on storage.objects for update
  using (
    bucket_id = 'announcement-images'
    and public.current_user_is_super_admin()
  );

create policy "Super Admin can delete announcement images"
  on storage.objects for delete
  using (
    bucket_id = 'announcement-images'
    and public.current_user_is_super_admin()
  );
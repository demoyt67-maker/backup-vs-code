import { useState, useEffect, useRef } from 'react';
import type { View } from '@/types';
import { CLASS_THEMES } from '@/theme';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

type AnnouncementType = 'text' | 'image';

interface Announcement {
  id: string;
  title: string;
  message: string;
  announcement_type: AnnouncementType;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type AnnouncementRow = {
  id: string;
  title: string;
  message: string;
  announcement_type: AnnouncementType;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const ANNOUNCEMENT_TYPES: { value: AnnouncementType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
];

const STORAGE_BUCKET = 'announcement-images';

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
}

export function AnnouncementManagementView({ onNavigate, theme }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>('text');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSuperAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements((data ?? []) as AnnouncementRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnnouncements();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc('check_my_admin_status');
      if (!cancelled) {
        console.log('[ADMIN TEST]', { data, error });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { upsert: true, cacheControl: '3600' });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setAnnouncementType('text');
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (announcementType === 'text' && (!title.trim() || !message.trim())) return;
    if (announcementType === 'image' && !imageFile) return;

    setError(null);
    setUploading(true);
    try {
      const trimmedTitle = title.trim();
      const trimmedMessage = message.trim();

      if (editingId) {
        const updatePayload: Record<string, unknown> = {
          announcement_type: announcementType,
          updated_at: new Date().toISOString(),
        };

        if (announcementType === 'text') {
          updatePayload.title = trimmedTitle;
          updatePayload.message = trimmedMessage;
          updatePayload.image_url = null;
        } else if (imageFile) {
          updatePayload.title = '';
          updatePayload.message = '';
          const ext = imageFile.name.split('.').pop() || 'bin';
          const fileName = `${editingId}-${Date.now()}.${ext}`;
          const filePath = `${editingId}/${fileName}`;
          console.log('[Announcement] STORAGE UPLOAD start:', { filePath, bucket: STORAGE_BUCKET });
          const uploadedUrl = await uploadImage(imageFile, filePath);
          console.log('[Announcement] STORAGE UPLOAD done:', uploadedUrl);
          updatePayload.image_url = uploadedUrl;
        } else if (imagePreview) {
          updatePayload.title = '';
          updatePayload.message = '';
          updatePayload.image_url = imagePreview;
        } else {
          updatePayload.title = '';
          updatePayload.message = '';
          updatePayload.image_url = null;
        }

        console.log('[Announcement] DATABASE UPDATE payload:', JSON.stringify(updatePayload));
        const { data: updateData, error } = await supabase
          .from('announcements')
          .update(updatePayload)
          .eq('id', editingId)
          .select('id');

        console.log('[Announcement] DATABASE UPDATE result:', { updateData, error });
        if (error) throw error;
        await loadAnnouncements();
      } else {
        let imageUrl: string | null = null;

        if (announcementType === 'image' && imageFile) {
          const ext = imageFile.name.split('.').pop() || 'bin';
          const fileName = `announcements/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          console.log('[Announcement] STORAGE UPLOAD start:', { fileName, bucket: STORAGE_BUCKET });
          imageUrl = await uploadImage(imageFile, fileName);
          console.log('[Announcement] STORAGE UPLOAD done:', imageUrl);
        }

        const insertPayload: Record<string, unknown> = {
          announcement_type: announcementType,
          is_active: true,
          title: announcementType === 'text' ? trimmedTitle : '',
          message: announcementType === 'text' ? trimmedMessage : '',
          image_url: announcementType === 'image' ? imageUrl : null,
        };

        console.log('[Announcement] DATABASE INSERT payload:', JSON.stringify(insertPayload));
        const { data, error } = await supabase
          .from('announcements')
          .insert(insertPayload)
          .select('id')
          .single();

        console.log('[Announcement] DATABASE INSERT result:', { data, error });
        if (error) throw error;
        await loadAnnouncements();
      }

      resetForm();
    } catch (err) {
      console.error('[Announcement] Save failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to save announcement');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setTitle(announcement.title);
    setMessage(announcement.message);
    setAnnouncementType(announcement.announcement_type);
    setImageFile(null);
    setImagePreview(announcement.image_url);
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      await loadAnnouncements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete announcement');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="screen-shell mx-auto max-w-5xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary-900 md:text-4xl">Announcement Management</h1>
        <p className="mt-2 text-sm text-primary-700">
          Create and manage announcements for users across the app.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-[1.4rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {!showForm ? (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="liquid-button-primary interactive-card inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
          >
            Create Announcement
          </button>
        </div>
      ) : (
        <div className="liquid-panel rounded-[1.4rem] border p-5 shadow-sm md:p-6" style={{ borderColor: theme.border, background: theme.surface }}>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-primary-900">{editingId ? 'Edit Announcement' : 'New Announcement'}</h2>
            <p className="mt-1 text-xs text-primary-700">{editingId ? 'Update the announcement details below.' : 'Fill in the details below.'}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-primary-700">Type</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {ANNOUNCEMENT_TYPES.map(({ value, label }) => {
                  const active = announcementType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAnnouncementType(value)}
                      className={`liquid-button rounded-xl border px-3.5 py-2 text-xs font-bold transition-all active:scale-95 ${
                        active ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-transparent bg-white/60 text-primary-700 hover:bg-primary-50'
                      }`}
                      style={active ? { boxShadow: `0 0 0 1px ${theme.primary}33` } : undefined}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {announcementType === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-primary-700">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Announcement title"
                    className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-primary-900 outline-none transition-all focus:ring-2 focus:ring-primary-500"
                    style={{ borderColor: theme.border, background: theme.surfaceStrong, color: theme.text }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-primary-700">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Announcement message"
                    rows={4}
                    className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-primary-900 outline-none transition-all focus:ring-2 focus:ring-primary-500"
                    style={{ borderColor: theme.border, background: theme.surfaceStrong, color: theme.text }}
                  />
                </div>
              </div>
            )}

            {announcementType === 'image' && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-primary-700">Image</label>
                <div className="mt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="h-40 w-auto rounded-xl border object-cover" style={{ borderColor: theme.border }} />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="liquid-button inline-flex items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-xs font-bold text-primary-700 transition-all hover:border-primary-400 hover:bg-primary-50"
                      style={{ borderColor: theme.border }}
                    >
                      + Upload Image
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={resetForm}
              className="liquid-button interactive-card inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-primary-700 shadow-sm ring-1 ring-primary-100 transition-all hover:bg-primary-50 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={
                (announcementType === 'text' && (!title.trim() || !message.trim())) ||
                (announcementType === 'image' && !imageFile) ||
                uploading
              }
              className="liquid-button-primary interactive-card inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? 'Saving...' : editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="rounded-[1.4rem] border border-primary-100 bg-primary-50/50 p-8 text-center">
            <p className="text-sm font-semibold text-primary-700">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="rounded-[1.4rem] border border-primary-100 bg-primary-50/50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-3xl">
              📢
            </div>
            <h2 className="text-xl font-bold text-primary-900">No announcements yet</h2>
            <p className="mt-2 text-sm text-primary-700">
              There are no announcements at the moment. Use the button above to create one.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="liquid-panel rounded-[1.4rem] border p-5 shadow-sm"
                style={{ borderColor: theme.border, background: theme.surface }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    {announcement.announcement_type === 'text' ? (
                      <>
                        <h3 className="text-base font-bold text-primary-900">{announcement.title}</h3>
                        <p className="mt-1 text-sm text-primary-700 whitespace-pre-wrap">{announcement.message}</p>
                      </>
                    ) : (
                      announcement.image_url && (
                        <img src={announcement.image_url} alt="" className="h-40 w-auto rounded-xl border object-cover" style={{ borderColor: theme.border }} />
                      )
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-primary-600 whitespace-nowrap">
                    {new Date(announcement.created_at).toLocaleString()}
                  </span>
                </div>

                {isSuperAdmin && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="liquid-button interactive-card inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-primary-700 shadow-sm ring-1 ring-primary-100 transition-all hover:bg-primary-50 active:scale-95"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="liquid-button interactive-card inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-red-700 shadow-sm ring-1 ring-red-100 transition-all hover:bg-red-50 active:scale-95"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

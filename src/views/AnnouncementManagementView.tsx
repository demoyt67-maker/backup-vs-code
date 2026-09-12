import { useState, useEffect } from 'react';
import type { View } from '@/types';
import { CLASS_THEMES } from '@/theme';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type AnnouncementRow = {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export function AnnouncementManagementView({ onNavigate, theme }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSuperAdmin } = useAuth();

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

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !message.trim()) return;

    setError(null);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('announcements')
          .update({ title: title.trim(), message: message.trim(), updated_at: new Date().toISOString() })
          .eq('id', editingId);

        if (error) throw error;
        await loadAnnouncements();
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert({ title: title.trim(), message: message.trim() });

        if (error) throw error;
        await loadAnnouncements();
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save announcement');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setTitle(announcement.title);
    setMessage(announcement.message);
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

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={resetForm}
              className="liquid-button interactive-card inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-primary-700 shadow-sm ring-1 ring-primary-100 transition-all hover:bg-primary-50 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || !message.trim()}
              className="liquid-button-primary interactive-card inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editingId ? 'Update' : 'Save'}
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
                    <h3 className="text-base font-bold text-primary-900">{announcement.title}</h3>
                    <p className="mt-1 text-sm text-primary-700 whitespace-pre-wrap">{announcement.message}</p>
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

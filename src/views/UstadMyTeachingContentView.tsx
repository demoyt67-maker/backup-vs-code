import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Check, Search, RotateCcw, Eye } from 'lucide-react';
import { BackHeader } from '@/components/BackHeader';
import { CLASS_THEMES } from '@/theme';
import {
  getTeachingContents,
  createTeachingContent,
  updateTeachingContent,
  deleteTeachingContent,
  restoreTeachingContent,
  getStoredUstadEmail,
  type TeachingContent,
  type TeachingContentCreate,
  TEACHING_CONTENT_TYPE_OPTIONS,
  TEACHING_CONTENT_STATUS_OPTIONS,
} from '@/lib/supabaseClient';
import type { View } from '@/types';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
}

type ClassLevel = 1 | 2 | 3;

const CLASS_LEVELS: ClassLevel[] = [1, 2, 3];

const CONTENT_TYPES = TEACHING_CONTENT_TYPE_OPTIONS;
const STATUS_OPTIONS = TEACHING_CONTENT_STATUS_OPTIONS;

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-yellow-100 text-yellow-700',
};

export function UstadMyTeachingContentView({ onNavigate, theme }: Props) {
  const [contents, setContents] = useState<TeachingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<ClassLevel | ''>('');
  const [setFilter, setSetFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formClass, setFormClass] = useState<ClassLevel>(1);
  const [formSetId, setFormSetId] = useState('1');
  const [formContentType, setFormContentType] = useState('lesson');
  const [formDescription, setFormDescription] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formStatus, setFormStatus] = useState<'draft' | 'published' | 'archived'>('draft');

  const [deleteReason, setDeleteReason] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lastDeleted, setLastDeleted] = useState<TeachingContent | null>(null);

  const [viewingItem, setViewingItem] = useState<TeachingContent | null>(null);

  const ustadEmail = getStoredUstadEmail();

  const loadContents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await getTeachingContents(
        ustadEmail ?? undefined,
        classFilter || undefined,
        setFilter || undefined,
        statusFilter || undefined
      );
      if (error) throw error;
      let filtered = data ?? [];
      if (typeFilter) {
        filtered = filtered.filter((c) => c.content_type === typeFilter);
      }
      const term = search.trim().toLowerCase();
      if (term) {
        filtered = filtered.filter(
          (c) =>
            c.title.toLowerCase().includes(term) ||
            c.description?.toLowerCase().includes(term) ||
            c.content.toLowerCase().includes(term)
        );
      }
      setContents(filtered);
    } catch (err: any) {
      console.error('[TeachingContent] load error:', err);
      setError(err?.message || 'Failed to load teaching content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadContents();
  }, [classFilter, setFilter, typeFilter, statusFilter, search]);

  const resetForm = () => {
    setFormTitle('');
    setFormClass(classFilter === '' ? 1 : classFilter);
    setFormSetId(setFilter || '1');
    setFormContentType('lesson');
    setFormDescription('');
    setFormContent('');
    setFormStatus('draft');
    setEditingId(null);
    setShowForm(false);
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (item: TeachingContent) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormClass(item.class_level as ClassLevel);
    setFormSetId(item.set_id);
    setFormContentType(item.content_type);
    setFormDescription(item.description ?? '');
    setFormContent(item.content);
    setFormStatus(item.status as 'draft' | 'published' | 'archived');
    setShowForm(true);
  };

  const confirmDelete = (id: string) => {
    const item = contents.find((c) => c.id === id) ?? null;
    setDeletingId(id);
    setDeleteReason('');
    setError(null);
    setLastDeleted(item);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      setError('Title is required');
      return;
    }
    if (!formSetId.trim()) {
      setError('Set is required');
      return;
    }
    if (!formContent.trim()) {
      setError('Content is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: TeachingContentCreate = {
        class_level: formClass,
        set_id: formSetId.trim(),
        content_type: formContentType,
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        content: formContent.trim(),
        status: formStatus,
        created_by: ustadEmail ?? undefined,
      };

      if (editingId) {
        const { error } = await updateTeachingContent(editingId, payload);
        if (error) throw error;
      } else {
        const { error } = await createTeachingContent(payload);
        if (error) throw error;
      }

      setShowForm(false);
      await loadContents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    if (!deleteReason.trim()) {
      setError('Deletion reason is required');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const { error } = await deleteTeachingContent(deletingId, deleteReason.trim());
      if (error) throw error;
      setDeletingId(null);
      setDeleteReason('');
      await loadContents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete content');
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async () => {
    if (!lastDeleted) return;

    setSaving(true);
    setError(null);
    try {
      const { error } = await restoreTeachingContent(lastDeleted.id);
      if (error) throw error;
      setLastDeleted(null);
      await loadContents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore content');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
    setDeleteReason('');
    setLastDeleted(null);
  };

  return (
    <div className="screen-shell mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="My Teaching Content" onBack={() => onNavigate('ustadPanel')} theme={theme} />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search content..."
            className="w-full rounded-xl border border-primary-200 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value === '' ? '' : Number(e.target.value) as ClassLevel)}
          className="rounded-xl border border-primary-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        >
          <option value="">All Classes</option>
          {CLASS_LEVELS.map((l) => (
            <option key={l} value={l}>Class {l}</option>
          ))}
        </select>
        <select
          value={setFilter}
          onChange={(e) => setSetFilter(e.target.value)}
          className="rounded-xl border border-primary-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        >
          <option value="">All Sets</option>
          <option value="1">Set 1</option>
          <option value="2">Set 2</option>
          <option value="3">Set 3</option>
          <option value="4">Set 4</option>
          <option value="5">Set 5</option>
          <option value="6">Set 6</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-primary-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        >
          <option value="">All Types</option>
          {CONTENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-primary-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-primary-700"
        >
          <Plus size={16} />
          Add Content
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary-700" />
        </div>
      ) : contents.length === 0 ? (
        <div className="rounded-[1.4rem] border border-primary-100 bg-white p-6 text-center text-sm text-primary-700 shadow-sm">
          No teaching content found.
        </div>
      ) : (
        <div className="space-y-4">
          {contents.map((item) => {
            const contentLabel = CONTENT_TYPES.find((t) => t.value === item.content_type)?.label ?? item.content_type;
            const statusLabel = STATUS_OPTIONS.find((s) => s.value === item.status)?.label ?? item.status;
            return (
              <div key={item.id} className="rounded-[1.4rem] border border-primary-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-700">
                        Class {item.class_level}
                      </span>
                      <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-600">
                        Set {item.set_id}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        {contentLabel}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[item.status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-bold text-primary-900">{item.title}</h3>
                    {item.description && (
                      <p className="mt-1 text-xs text-primary-700 line-clamp-2">{item.description}</p>
                    )}
                    <p className="mt-1 text-xs text-primary-600 line-clamp-1">{item.content}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-primary-600">
                      <span>By {item.created_by ?? 'Unknown'}</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setViewingItem(item)}
                      className="inline-flex items-center gap-1 rounded-xl border border-primary-200 bg-white px-3 py-2 text-xs font-bold text-primary-900 transition-all hover:bg-primary-50"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="inline-flex items-center gap-1 rounded-xl border border-primary-200 bg-white px-3 py-2 text-xs font-bold text-primary-900 transition-all hover:bg-primary-50"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(item.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 transition-all hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20">
          <div className="w-full max-w-lg max-h-[calc(100vh-6rem)] overflow-y-auto rounded-[1.4rem] border border-primary-100 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary-900">{editingId ? 'Edit Content' : 'Add Content'}</h3>
              <button onClick={resetForm} className="rounded-full p-1 text-primary-600 hover:bg-primary-50">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  placeholder="Content title"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Class Level</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(Number(e.target.value) as ClassLevel)}
                    className="w-full rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  >
                    {CLASS_LEVELS.map((l) => (
                      <option key={l} value={l}>Class {l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Set / Lesson</label>
                  <input
                    type="text"
                    value={formSetId}
                    onChange={(e) => setFormSetId(e.target.value)}
                    className="w-full rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    placeholder="e.g. set1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Content Type</label>
                  <select
                    value={formContentType}
                    onChange={(e) => setFormContentType(e.target.value)}
                    className="w-full rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  >
                    {CONTENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Description (optional)</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  placeholder="Brief description"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Content</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  placeholder="Enter your teaching content"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={resetForm}
                  className="rounded-xl border border-primary-200 px-4 py-2 text-xs font-bold text-primary-900 transition-all hover:bg-primary-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-primary-700 disabled:opacity-70"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {editingId ? 'Save Changes' : 'Add Content'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[1.4rem] border border-primary-100 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-primary-900">Delete Content</h3>
            <p className="mt-2 text-sm text-primary-700">Please provide a reason for deleting this content.</p>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={3}
              className="mt-3 w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="Deletion reason"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleCancelDelete}
                disabled={saving}
                className="rounded-xl border border-primary-200 px-4 py-2 text-xs font-bold text-primary-900 transition-all hover:bg-primary-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-red-700 disabled:opacity-70"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-[1.4rem] border border-primary-100 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary-900">Content Details</h3>
              <button onClick={() => setViewingItem(null)} className="rounded-full p-1 text-primary-600 hover:bg-primary-50">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[viewingItem.status] || 'bg-gray-100 text-gray-700'}`}>
                  {viewingItem.status}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-primary-800">Title</p>
                <p className="text-sm text-primary-900">{viewingItem.title}</p>
              </div>
              {viewingItem.description && (
                <div>
                  <p className="text-xs font-semibold text-primary-800">Description</p>
                  <p className="text-sm text-primary-900">{viewingItem.description}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-primary-800">Content</p>
                <p className="text-sm text-primary-900 whitespace-pre-wrap">{viewingItem.content}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-primary-600">
                <span>Class {viewingItem.class_level}</span>
                <span>Set {viewingItem.set_id}</span>
                <span>{viewingItem.content_type}</span>
                <span>By {viewingItem.created_by ?? 'Unknown'}</span>
                <span>{new Date(viewingItem.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {lastDeleted && !deletingId && (
        <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:w-96">
          <div className="flex items-center justify-between rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 shadow-lg">
            <span className="text-xs font-semibold text-yellow-900">Content deleted.</span>
            <button
              onClick={handleRestore}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-yellow-700 disabled:opacity-70"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
              Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
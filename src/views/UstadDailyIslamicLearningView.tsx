import { useState, useEffect } from 'react';
import { Plus, Loader2, X, Check, Calendar, BookOpen, Eye } from 'lucide-react';
import { BackHeader } from '@/components/BackHeader';
import { CLASS_THEMES } from '@/theme';
import {
  getMyDailyIslamicLearning,
  createDailyIslamicLearning,
  getStoredUstadEmail,
  type DailyIslamicLearning,
  DAILY_ISLAMIC_CONTENT_TYPES,
} from '@/lib/supabaseClient';
import type { View } from '@/types';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export function UstadDailyIslamicLearningView({ onNavigate, theme }: Props) {
  const [submissions, setSubmissions] = useState<DailyIslamicLearning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formType, setFormType] = useState<'ayah' | 'dua' | 'good_message'>('ayah');
  const [formTitle, setFormTitle] = useState('');
  const [formArabic, setFormArabic] = useState('');
  const [formMalayalam, setFormMalayalam] = useState('');
  const [formEnglish, setFormEnglish] = useState('');
  const [formScheduledDate, setFormScheduledDate] = useState('');

  const [viewingSubmission, setViewingSubmission] = useState<DailyIslamicLearning | null>(null);

  const ustadEmail = getStoredUstadEmail();

  const loadSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!ustadEmail) {
        setError('Ustad email not found. Please log in again.');
        setLoading(false);
        return;
      }
      const { data, error } = await getMyDailyIslamicLearning(ustadEmail);
      if (error) throw error;
      setSubmissions(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSubmissions();
  }, []);

  const resetForm = () => {
    setFormType('ayah');
    setFormTitle('');
    setFormArabic('');
    setFormMalayalam('');
    setFormEnglish('');
    setFormScheduledDate('');
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formTitle.trim()) {
      setError('Title is required');
      return;
    }
    if (!formMalayalam.trim() || !formEnglish.trim()) {
      setError('Malayalam and English content are required');
      return;
    }
    if (!formScheduledDate) {
      setError('Scheduled date is required');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (formScheduledDate < today) {
      setError('Scheduled date must be today or a future date');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const { error } = await createDailyIslamicLearning({
        content_type: formType,
        title: formTitle.trim(),
        arabic_content: formArabic.trim() || null,
        malayalam_content: formMalayalam.trim(),
        english_content: formEnglish.trim(),
        scheduled_date: formScheduledDate,
        created_by: ustadEmail ?? undefined,
      });
      if (error) throw error;
      setShowForm(false);
      await loadSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create submission');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  };

  return (
    <div className="screen-shell mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Daily Islamic Learning" onBack={() => onNavigate('ustadPanel')} theme={theme} />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-primary-900">My Submissions</h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-primary-700"
        >
          <Plus size={16} />
          New Submission
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary-700" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="rounded-[1.4rem] border border-primary-100 bg-white p-6 text-center text-sm text-primary-700 shadow-sm">
          No submissions yet. Click "New Submission" to add your first daily Islamic learning content.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="rounded-[1.4rem] border border-primary-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    STATUS_STYLES[submission.status] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {submission.status}
                </span>
                <span className="text-[10px] text-primary-600">Scheduled: {formatDate(submission.scheduled_date)}</span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-primary-900">{submission.title}</h3>
              <p className="mt-1 text-xs text-primary-700 line-clamp-2">{submission.malayalam_content}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-primary-600">{submission.content_type}</span>
                <button
                  onClick={() => setViewingSubmission(submission)}
                  className="inline-flex items-center gap-1 rounded-xl border border-primary-200 bg-white px-3 py-1.5 text-xs font-bold text-primary-900 transition-all hover:bg-primary-50"
                >
                  <Eye size={14} />
                  View
                </button>
              </div>
              {submission.status === 'rejected' && submission.rejection_reason && (
                <p className="mt-2 text-xs text-red-700">Reason: {submission.rejection_reason}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20">
          <div className="w-full max-w-lg max-h-[calc(100vh-6rem)] overflow-y-auto rounded-[1.4rem] border border-primary-100 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary-900">New Submission</h3>
              <button onClick={resetForm} className="rounded-full p-1 text-primary-600 hover:bg-primary-50">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Content Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                >
                  {DAILY_ISLAMIC_CONTENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  placeholder="Enter title"
                />
              </div>

              {formType === 'ayah' && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Arabic Content</label>
                  <textarea
                    value={formArabic}
                    onChange={(e) => setFormArabic(e.target.value)}
                    rows={3}
                    dir="rtl"
                    className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    placeholder="أدخل المحتوى العربي"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Malayalam Content</label>
                <textarea
                  value={formMalayalam}
                  onChange={(e) => setFormMalayalam(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  placeholder="Enter Malayalam content"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">English Content</label>
                <textarea
                  value={formEnglish}
                  onChange={(e) => setFormEnglish(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  placeholder="Enter English content"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Scheduled Date</label>
                <input
                  type="date"
                  value={formScheduledDate}
                  onChange={(e) => setFormScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
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
                  onClick={handleSubmit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-primary-700 disabled:opacity-70"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-[1.4rem] border border-primary-100 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary-900">Submission Details</h3>
              <button
                onClick={() => setViewingSubmission(null)}
                className="rounded-full p-1 text-primary-600 hover:bg-primary-50"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    STATUS_STYLES[viewingSubmission.status] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {viewingSubmission.status}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-primary-800">Title</p>
                <p className="text-sm text-primary-900">{viewingSubmission.title}</p>
              </div>
              {viewingSubmission.arabic_content && (
                <div>
                  <p className="text-xs font-semibold text-primary-800">Arabic Content</p>
                  <p className="text-sm text-primary-900" dir="rtl">{viewingSubmission.arabic_content}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-primary-800">Malayalam Content</p>
                <p className="text-sm text-primary-900">{viewingSubmission.malayalam_content}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-primary-800">English Content</p>
                <p className="text-sm text-primary-900">{viewingSubmission.english_content}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-primary-800">Scheduled Date</p>
                <p className="text-sm text-primary-900">{formatDate(viewingSubmission.scheduled_date)}</p>
              </div>
              {viewingSubmission.status === 'rejected' && viewingSubmission.rejection_reason && (
                <div>
                  <p className="text-xs font-semibold text-red-700">Rejection Reason</p>
                  <p className="text-sm text-red-700">{viewingSubmission.rejection_reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
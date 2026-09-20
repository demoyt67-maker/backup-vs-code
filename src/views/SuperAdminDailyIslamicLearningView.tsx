import { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Loader2, Eye, Search } from 'lucide-react';
import { BackHeader } from '@/components/BackHeader';
import { CLASS_THEMES } from '@/theme';
import { supabase } from '@/lib/supabaseClient';
import type { View } from '@/types';
import type { DailyIslamicLearning } from '@/lib/supabaseClient';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export function SuperAdminDailyIslamicLearningView({ onNavigate, theme }: Props) {
  const [submissions, setSubmissions] = useState<DailyIslamicLearning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<DailyIslamicLearning | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('daily_islamic_learning')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions((data ?? []) as DailyIslamicLearning[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load daily Islamic learning submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSubmissions();
  }, []);

  const handleApprove = async (id: string) => {
    setActionId(id);
    setError(null);
    const { data: { session } } = await supabase.auth.getSession();
    const reviewerEmail = session?.user?.email ?? 'unknown';
    const { error } = await supabase
      .from('daily_islamic_learning')
      .update({
        status: 'approved',
        reviewed_by: reviewerEmail,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      setError(error.message || 'Failed to approve submission');
      setActionId(null);
      return;
    }
    await loadSubmissions();
    setViewingSubmission(null);
    setActionId(null);
  };

  const openReject = (id: string) => {
    setRejectingId(id);
    setRejectReason('');
    setError(null);
  };

  const confirmReject = async () => {
    if (!rejectingId) return;
    if (!rejectReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    setActionId(rejectingId);
    setError(null);
    const { data: { session } } = await supabase.auth.getSession();
    const reviewerEmail = session?.user?.email ?? 'unknown';
    const { error } = await supabase
      .from('daily_islamic_learning')
      .update({
        status: 'rejected',
        rejection_reason: rejectReason.trim(),
        reviewed_by: reviewerEmail,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', rejectingId);

    if (error) {
      setError(error.message || 'Failed to reject submission');
      setActionId(null);
      return;
    }
    setRejectingId(null);
    setRejectReason('');
    await loadSubmissions();
    setViewingSubmission(null);
    setActionId(null);
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterStatus !== 'all' && sub.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        sub.title.toLowerCase().includes(term) ||
        sub.malayalam_content.toLowerCase().includes(term) ||
        sub.english_content.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const pendingSubmissions = filteredSubmissions.filter((s) => s.status === 'pending');
  const reviewedSubmissions = filteredSubmissions.filter((s) => s.status !== 'pending');

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="screen-shell mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Daily Islamic Learning" onBack={() => onNavigate('superAdmin')} theme={theme} />

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search submissions..."
            className="w-full rounded-xl border border-primary-200 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          className="rounded-xl border border-primary-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary-700" />
        </div>
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-lg font-bold text-primary-900">Pending Review</h2>
            {pendingSubmissions.length === 0 ? (
              <div className="rounded-[1.4rem] border border-primary-100 bg-white p-6 text-sm text-primary-700 shadow-sm">
                No pending submissions.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pendingSubmissions.map((sub) => (
                  <div key={sub.id} className="rounded-[1.4rem] border border-primary-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-700">
                        {sub.status}
                      </span>
                      <span className="text-[10px] text-primary-600">Scheduled: {sub.scheduled_date}</span>
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-primary-900">{sub.title}</h3>
                    <p className="mt-1 text-xs text-primary-700 line-clamp-2">{sub.malayalam_content}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-primary-600">{sub.content_type}</span>
                      <button
                        onClick={() => setViewingSubmission(sub)}
                        className="inline-flex items-center gap-1 rounded-xl border border-primary-200 bg-white px-3 py-1.5 text-xs font-bold text-primary-900 transition-all hover:bg-primary-50"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-primary-900">Reviewed</h2>
            {reviewedSubmissions.length === 0 ? (
              <div className="rounded-[1.4rem] border border-primary-100 bg-white p-6 text-sm text-primary-700 shadow-sm">
                No reviewed submissions yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {reviewedSubmissions.map((sub) => (
                  <div key={sub.id} className="rounded-[1.4rem] border border-primary-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          STATUS_STYLES[sub.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {sub.status}
                      </span>
                      <span className="text-[10px] text-primary-600">Scheduled: {sub.scheduled_date}</span>
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-primary-900">{sub.title}</h3>
                    <p className="mt-1 text-xs text-primary-700 line-clamp-2">{sub.malayalam_content}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-primary-600">{sub.content_type}</span>
                      <button
                        onClick={() => setViewingSubmission(sub)}
                        className="inline-flex items-center gap-1 rounded-xl border border-primary-200 bg-white px-3 py-1.5 text-xs font-bold text-primary-900 transition-all hover:bg-primary-50"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {viewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-[1.4rem] border border-primary-100 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary-900">Submission Details</h3>
              <button
                onClick={() => { setViewingSubmission(null); setRejectingId(null); setRejectReason(''); }}
                className="rounded-full p-1 text-primary-600 hover:bg-primary-50"
                disabled={actionId === viewingSubmission.id}
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
                <p className="text-sm text-primary-900">{viewingSubmission.scheduled_date}</p>
              </div>
              {viewingSubmission.status === 'pending' && (
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  {rejectingId === viewingSubmission.id ? (
                    <div className="w-full rounded-xl border border-primary-100 bg-primary-50/50 p-4">
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">
                        Rejection Reason
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        style={{ color: theme.text }}
                      />
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={() => { setRejectingId(null); setRejectReason(''); }}
                          className="rounded-xl border border-primary-200 px-4 py-2 text-xs font-bold text-primary-900 transition-all hover:bg-primary-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmReject}
                          disabled={actionId === viewingSubmission.id}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-red-700 disabled:opacity-70"
                        >
                          {actionId === viewingSubmission.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : null}
                          Confirm Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApprove(viewingSubmission.id)}
                        disabled={actionId === viewingSubmission.id}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-green-700 disabled:opacity-70"
                      >
                        {actionId === viewingSubmission.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => openReject(viewingSubmission.id)}
                        disabled={actionId === viewingSubmission.id}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-red-700 disabled:opacity-70"
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              )}
              {viewingSubmission.status !== 'pending' && (
                <div className="mt-4 rounded-xl border border-primary-100 bg-primary-50/50 p-4">
                  <p className="text-xs font-semibold text-primary-800">Status</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                      STATUS_STYLES[viewingSubmission.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {viewingSubmission.status}
                  </span>
                  {viewingSubmission.rejection_reason && (
                    <p className="mt-2 text-xs text-red-700">Reason: {viewingSubmission.rejection_reason}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
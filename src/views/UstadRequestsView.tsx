import { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import { BackHeader } from '@/components/BackHeader';
import { CLASS_THEMES } from '@/theme';
import { supabase, updateUstadProfileStatus } from '@/lib/supabaseClient';
import type { View } from '@/types';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface UstadRequest {
  id: string;
  email: string;
  full_name: string;
  age: number;
  photo_url: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
}

export function UstadRequestsView({ onNavigate, theme }: Props) {
  const [requests, setRequests] = useState<UstadRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('ustad_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data ?? []) as UstadRequest[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Ustad requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const handleApprove = async (id: string) => {
    setActionId(id);
    setError(null);
    const { error } = await updateUstadProfileStatus(id, 'approved');
    if (error) {
      setError(error.message || 'Failed to approve request');
      setActionId(null);
      return;
    }
    await loadRequests();
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
    const { error } = await updateUstadProfileStatus(rejectingId, 'rejected', rejectReason.trim());
    if (error) {
      setError(error.message || 'Failed to reject request');
      setActionId(null);
      return;
    }
    setRejectingId(null);
    setRejectReason('');
    await loadRequests();
    setActionId(null);
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const reviewedRequests = requests.filter((r) => r.status !== 'pending');

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  return (
    <div className="screen-shell mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Ustad Requests" onBack={() => onNavigate('superAdmin')} theme={theme} />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary-700" />
        </div>
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-lg font-bold text-primary-900">Pending Requests</h2>
            {pendingRequests.length === 0 ? (
              <div className="rounded-[1.4rem] border border-primary-100 bg-white p-6 text-sm text-primary-700 shadow-sm">
                No pending Ustad requests.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="rounded-[1.4rem] border border-primary-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary-100 bg-primary-50"
                          style={{ color: theme.muted }}
                        >
                          {req.photo_url ? (
                            <img src={req.photo_url} alt={req.full_name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-semibold text-primary-700">No photo</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold text-primary-900">{req.full_name}</h3>
                          <p className="truncate text-xs text-primary-700">{req.email}</p>
                          <p className="mt-1 text-xs text-primary-600">Age: {req.age}</p>
                          <p className="mt-1 text-[11px] text-primary-500">Submitted: {formatDate(req.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => handleApprove(req.id)}
                          disabled={actionId === req.id}
                          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-green-700 disabled:opacity-70"
                        >
                          {actionId === req.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => openReject(req.id)}
                          disabled={actionId === req.id}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-red-700 disabled:opacity-70"
                        >
                          <X size={14} />
                          Reject
                        </button>
                      </div>
                    </div>

                    {rejectingId === req.id && (
                      <div className="mt-4 rounded-xl border border-primary-100 bg-primary-50/50 p-4">
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
                            disabled={actionId === req.id}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-red-700 disabled:opacity-70"
                          >
                            {actionId === req.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : null}
                            Confirm Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-primary-900">Reviewed Requests</h2>
            {reviewedRequests.length === 0 ? (
              <div className="rounded-[1.4rem] border border-primary-100 bg-white p-6 text-sm text-primary-700 shadow-sm">
                No reviewed requests yet.
              </div>
            ) : (
              <div className="space-y-4">
                {reviewedRequests.map((req) => (
                  <div key={req.id} className="rounded-[1.4rem] border border-primary-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary-100 bg-primary-50"
                          style={{ color: theme.muted }}
                        >
                          {req.photo_url ? (
                            <img src={req.photo_url} alt={req.full_name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-semibold text-primary-700">No photo</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold text-primary-900">{req.full_name}</h3>
                          <p className="truncate text-xs text-primary-700">{req.email}</p>
                          <p className="mt-1 text-xs text-primary-600">Age: {req.age}</p>
                          <p className="mt-1 text-[11px] text-primary-500">Submitted: {formatDate(req.created_at)}</p>
                          {req.rejection_reason && (
                            <p className="mt-1 text-[11px] text-red-600">Reason: {req.rejection_reason}</p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                          req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

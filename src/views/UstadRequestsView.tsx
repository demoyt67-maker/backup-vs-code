import { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Loader2, Eye } from 'lucide-react';
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
  const [viewingRequest, setViewingRequest] = useState<UstadRequest | null>(null);

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
    setViewingRequest(null);
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
    setViewingRequest(null);
    setActionId(null);
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const reviewedRequests = requests.filter((r) => r.status === 'approved' || r.status === 'rejected');

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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="rounded-[1.4rem] border border-primary-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary-100 bg-primary-50"
                        style={{ color: theme.muted }}
                      >
                        {req.photo_url ? (
                          <img src={req.photo_url} alt={req.full_name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-semibold text-primary-700">No photo</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-primary-900">{req.full_name}</h3>
                      </div>
                      <button
                        onClick={() => setViewingRequest(req)}
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
            <h2 className="mb-3 text-lg font-bold text-primary-900">Reviewed Requests</h2>
            {reviewedRequests.length === 0 ? (
              <div className="rounded-[1.4rem] border border-primary-100 bg-white p-6 text-sm text-primary-700 shadow-sm">
                No reviewed requests yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {reviewedRequests.map((req) => (
                  <div key={req.id} className="rounded-[1.4rem] border border-primary-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary-100 bg-primary-50"
                        style={{ color: theme.muted }}
                      >
                        {req.photo_url ? (
                          <img src={req.photo_url} alt={req.full_name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-semibold text-primary-700">No photo</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-primary-900">{req.full_name}</h3>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <button
                        onClick={() => setViewingRequest(req)}
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

      {viewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-[1.4rem] border border-primary-100 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary-900">Request Details</h3>
              <button
                onClick={() => { setViewingRequest(null); setRejectingId(null); setRejectReason(''); }}
                className="rounded-full p-1 text-primary-600 hover:bg-primary-50"
                disabled={actionId === viewingRequest.id}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary-100 bg-primary-50"
                style={{ color: theme.muted }}
              >
                {viewingRequest.photo_url ? (
                  <img src={viewingRequest.photo_url} alt={viewingRequest.full_name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-primary-700">No photo</span>
                )}
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold text-primary-900">{viewingRequest.full_name}</h4>
                <p className="mt-1 text-xs text-primary-700">{viewingRequest.email}</p>
                <p className="mt-1 text-xs text-primary-600">Age: {viewingRequest.age}</p>
                <p className="mt-1 text-[11px] text-primary-500">Submitted: {formatDate(viewingRequest.created_at)}</p>
              </div>
            </div>

            {viewingRequest.status === 'pending' && (
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                {rejectingId === viewingRequest.id ? (
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
                        disabled={actionId === viewingRequest.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-red-700 disabled:opacity-70"
                      >
                        {actionId === viewingRequest.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : null}
                        Confirm Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleApprove(viewingRequest.id)}
                      disabled={actionId === viewingRequest.id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-green-700 disabled:opacity-70"
                    >
                      {actionId === viewingRequest.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => openReject(viewingRequest.id)}
                      disabled={actionId === viewingRequest.id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-red-700 disabled:opacity-70"
                    >
                      <X size={14} />
                      Reject
                    </button>
                  </>
                )}
              </div>
            )}

            {viewingRequest.status !== 'pending' && (
              <div className="mt-4 rounded-xl border border-primary-100 bg-primary-50/50 p-4">
                <p className="text-xs font-semibold text-primary-800">Status</p>
                <span
                  className={`mt-1 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                    viewingRequest.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {viewingRequest.status}
                </span>
                {viewingRequest.rejection_reason && (
                  <p className="mt-2 text-xs text-red-700">Reason: {viewingRequest.rejection_reason}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

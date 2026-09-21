import { useState, useMemo } from 'react';
import type { View } from '@/types';
import { CLASS_THEMES } from '@/theme';
import { BackHeader } from '@/components/BackHeader';
import { getAllReports, updateReport, type ReportRecord, type ReportType } from '@/lib/supabaseClient';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
}

type ReportStatus = ReportRecord['status'];
type Screen = 'list' | 'detail';

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  learning_content: 'Learning / Study Content',
  learning_bug: 'Bug in Learning',
  app_bug: 'Bug in App',
};

const REPORT_TYPE_EMOJIS: Record<ReportType, string> = {
  learning_content: '📚',
  learning_bug: '🐞',
  app_bug: '⚙️',
};

const STATUS_OPTIONS: { value: ReportStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_BADGES: Record<ReportStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200' },
  in_review: { label: 'In Review', className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  resolved: { label: 'Resolved', className: 'bg-green-50 text-green-700 ring-1 ring-green-200' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
};

const ROLE_FILTERS = [
  { value: '', label: 'All Roles' },
  { value: 'student', label: 'Student' },
  { value: 'ustad', label: 'Ustad' },
];

const TYPE_FILTERS = [
  { value: '', label: 'All Types' },
  { value: 'learning_content', label: 'Learning / Study Content' },
  { value: 'learning_bug', label: 'Bug in Learning' },
  { value: 'app_bug', label: 'Bug in App' },
];

const STATUS_FILTERS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function SuperAdminReportsView({ onNavigate, theme }: Props) {
  const [screen, setScreen] = useState<Screen>('list');
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editStatus, setEditStatus] = useState<ReportStatus>('open');
  const [editAdminResponse, setEditAdminResponse] = useState('');

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getAllReports();
    if (error) {
      setError(error.message || 'Failed to load reports.');
    } else {
      setReports(data ?? []);
    }
    setLoading(false);
  };

  useState(() => {
    loadReports();
  });

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery = !query ||
        report.reporter_email.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query) ||
        (report.reporter_role || '').toLowerCase().includes(query);

      const matchesRole = !roleFilter || report.reporter_role === roleFilter;
      const matchesType = !typeFilter || report.report_type === typeFilter;
      const matchesStatus = !statusFilter || report.status === statusFilter;

      return matchesQuery && matchesRole && matchesType && matchesStatus;
    });
  }, [reports, searchQuery, roleFilter, typeFilter, statusFilter]);

  const openDetail = (report: ReportRecord) => {
    setSelectedReport(report);
    setEditStatus(report.status);
    setEditAdminResponse(report.admin_response || '');
    setSaveError(null);
    setSaveSuccess(false);
    setScreen('detail');
  };

  const handleSave = async () => {
    if (!selectedReport) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const { error } = await updateReport(selectedReport.id, {
      status: editStatus,
      admin_response: editAdminResponse.trim() || null,
    });

    if (error) {
      setSaveError(error.message || 'Failed to save changes.');
      setSaving(false);
      return;
    }

    setSaveSuccess(true);
    await loadReports();
    setSelectedReport((prev) => prev ? { ...prev, status: editStatus, admin_response: editAdminResponse.trim() || null } : null);
    setSaving(false);
  };

  if (screen === 'detail' && selectedReport) {
    const statusBadge = STATUS_BADGES[editStatus];
    return (
      <div className="screen-shell mx-auto max-w-2xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
        <BackHeader title="Report Details" onBack={() => setScreen('list')} />
        <div className="screen-panel liquid-panel relative z-10 rounded-[2rem] bg-[#fffdf8] p-6 shadow-sm ring-1 ring-primary-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{REPORT_TYPE_EMOJIS[selectedReport.report_type]}</span>
              <div>
                <p className="text-sm font-bold text-primary-900">{REPORT_TYPE_LABELS[selectedReport.report_type]}</p>
                <p className="mt-0.5 text-[10px] text-primary-700">{formatDate(selectedReport.created_at)}</p>
              </div>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          </div>

          <div className="mt-6">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-800">Reporter</p>
            <p className="mt-2 text-sm text-primary-900">{selectedReport.reporter_email}</p>
            <p className="text-xs text-primary-700 capitalize">{selectedReport.reporter_role}</p>
          </div>

          <div className="mt-6">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-800">Description</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-primary-900">{selectedReport.description}</p>
          </div>

          {(selectedReport.related_content_type || selectedReport.related_content_id) && (
            <div className="mt-6">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-800">Related Content</p>
              <p className="mt-2 text-sm text-primary-900">
                {selectedReport.related_content_type || '—'}
                {selectedReport.related_content_id ? `: ${selectedReport.related_content_id}` : ''}
              </p>
            </div>
          )}

          <div className="mt-6">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as ReportStatus)}
              className="liquid-button w-full rounded-[1.4rem] border border-primary-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            >
              {STATUS_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Admin Response</label>
            <textarea
              value={editAdminResponse}
              onChange={(e) => setEditAdminResponse(e.target.value)}
              placeholder="Add a response for the reporter..."
              rows={4}
              className="liquid-button w-full rounded-[1.4rem] border border-primary-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
          </div>

          {saveError && (
            <div className="mt-4 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {saveError}
            </div>
          )}

          {saveSuccess && (
            <div className="mt-4 rounded-[1rem] border border-green-200 bg-green-50 px-4 py-3 text-xs font-semibold text-green-700">
              Changes saved successfully.
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button
              onClick={() => setScreen('list')}
              className="liquid-button interactive-card flex flex-1 items-center justify-center gap-2 rounded-2xl border border-primary-100 bg-white px-4 py-3 font-bold text-primary-700 transition-all hover:bg-primary-50 active:scale-95"
            >
              ← Back to Reports
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`interactive-card flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 font-bold transition-all active:scale-95 ${
                saving
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-shell mx-auto max-w-5xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Reports & Corrections" onBack={() => onNavigate('superAdmin')} />

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="liquid-panel rounded-[1.4rem] p-4 shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary-800">Filters</p>

            <div className="mb-4">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-primary-700">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Email or description..."
                className="liquid-button w-full rounded-[1rem] border border-primary-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-primary-700">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="liquid-button w-full rounded-[1rem] border border-primary-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                {ROLE_FILTERS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-primary-700">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="liquid-button w-full rounded-[1rem] border border-primary-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                {TYPE_FILTERS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-primary-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="liquid-button w-full rounded-[1rem] border border-primary-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                {STATUS_FILTERS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('');
                setTypeFilter('');
                setStatusFilter('');
              }}
              className="liquid-button w-full rounded-[1rem] border border-primary-100 bg-white px-3 py-2 text-xs font-bold text-primary-700 transition-all hover:bg-primary-50 active:scale-95"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="md:col-span-3">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-700" />
            </div>
          )}

          {error && (
            <div className="screen-panel liquid-panel rounded-[1.4rem] bg-red-50 p-6 text-center text-sm font-semibold text-red-700 ring-1 ring-red-200">
              {error}
              <button onClick={loadReports} className="ml-3 font-bold underline">Retry</button>
            </div>
          )}

          {!loading && !error && filteredReports.length === 0 && (
            <div className="screen-panel liquid-panel rounded-[2rem] bg-[#fffdf8] p-8 text-center shadow-sm ring-1 ring-primary-100">
              <p className="text-base font-bold text-primary-900">No reports found</p>
              <p className="mt-1 text-sm text-primary-700">Try adjusting your filters or search query.</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {filteredReports.map((report) => {
              const badge = STATUS_BADGES[report.status];
              const preview = report.description.length > 120 ? `${report.description.slice(0, 120)}...` : report.description;
              return (
                <button
                  key={report.id}
                  onClick={() => openDetail(report)}
                  className="liquid-button interactive-card w-full rounded-[1.4rem] border border-primary-100 bg-white/90 px-4 py-4 text-left transition-all hover:bg-primary-50 active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{REPORT_TYPE_EMOJIS[report.report_type]}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-primary-900">{REPORT_TYPE_LABELS[report.report_type]}</p>
                        <p className="mt-0.5 text-xs text-primary-700">{preview}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-primary-700">
                          <span>{report.reporter_email}</span>
                          <span className="capitalize">{report.reporter_role}</span>
                          <span>{formatDate(report.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

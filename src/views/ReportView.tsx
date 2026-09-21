import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BackHeader } from '@/components/BackHeader';
import { createReport, getReports, getReportById, getUstadProfileByEmail, type ReportRecord } from '@/lib/supabaseClient';

interface Props {
  onBack: () => void;
}

type ReportTypeLocal = 'learning_content' | 'learning_bug' | 'app_bug';
type Screen = 'select' | 'form' | 'my-reports' | 'detail';

const REPORT_OPTIONS: { type: ReportTypeLocal; title: string; emoji: string; description: string }[] = [
  { type: 'learning_content', title: 'Learning / Study Content', emoji: '📚', description: 'Issues with Arabic letters, lessons, or study material.' },
  { type: 'learning_bug', title: 'Bug in Learning', emoji: '🐞', description: 'Something is not working in the Learning screen.' },
  { type: 'app_bug', title: 'Bug in App', emoji: '⚙️', description: 'General app issues, crashes, or UI problems.' },
];

const MAX_DESCRIPTION_LENGTH = 1000;

const RELATED_CONTENT_TYPES = [
  { value: 'quiz_question', label: 'Quiz Question' },
  { value: 'lesson', label: 'Lesson' },
  { value: 'learning_content', label: 'Learning Content' },
  { value: 'teaching_content', label: 'Teaching Content' },
];

function shouldShowRelatedContent(selectedType: ReportTypeLocal | null, isUstad: boolean): boolean {
  if (!selectedType || !isUstad) return false;
  return selectedType === 'learning_content' || selectedType === 'learning_bug';
}

const REPORT_TYPE_LABELS: Record<ReportTypeLocal, string> = {
  learning_content: 'Learning / Study Content',
  learning_bug: 'Bug in Learning',
  app_bug: 'Bug in App',
};

const REPORT_TYPE_EMOJIS: Record<ReportTypeLocal, string> = {
  learning_content: '📚',
  learning_bug: '🐞',
  app_bug: '⚙️',
};

const STATUS_LABELS: Record<ReportRecord['status'], { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200' },
  in_review: { label: 'In Review', className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  resolved: { label: 'Resolved', className: 'bg-green-50 text-green-700 ring-1 ring-green-200' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
};

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

export function ReportView({ onBack }: Props) {
  const { user, role } = useAuth();
  const [screen, setScreen] = useState<Screen>('select');
  const [selectedType, setSelectedType] = useState<ReportTypeLocal | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [relatedContentType, setRelatedContentType] = useState<string>('');
  const [relatedContentId, setRelatedContentId] = useState<string>('');
  const [directUstadProfile, setDirectUstadProfile] = useState<{ status: string } | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setDirectUstadProfile(null);
      return;
    }
    let cancelled = false;
    getUstadProfileByEmail(user.email).then(({ data }) => {
      if (!cancelled) {
        setDirectUstadProfile(data ? { status: data.status } : null);
      }
    });
    return () => { cancelled = true; };
  }, [user?.email]);

  const isUstadUser = (() => {
    const normalized = (role ?? '').trim().toLowerCase();
    if (normalized === 'ustad') return true;
    if (directUstadProfile?.status === 'approved') return true;
    return false;
  })();

  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);

  const loadMyReports = async () => {
    if (!user) return;
    setReportsLoading(true);
    setReportsError(null);
    const { data, error } = await getReports(user.id);
    if (error) {
      setReportsError(error.message || 'Failed to load reports.');
    } else {
      setReports(data ?? []);
    }
    setReportsLoading(false);
  };

  const handleOpenMyReports = async () => {
    setScreen('my-reports');
    setSelectedReport(null);
    await loadMyReports();
  };

  const handleSelectReport = async (report: ReportRecord) => {
    setReportsLoading(true);
    setReportsError(null);
    const { data, error } = await getReportById(report.id);
    if (error) {
      setReportsError(error.message || 'Failed to load report details.');
    } else if (data) {
      setSelectedReport(data);
      setScreen('detail');
    }
    setReportsLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedType || !description.trim() || !user) return;

    setLoading(true);
    setError(null);

    const reporterEmail = user.email ?? '';
    const reporterRole = (() => {
      const normalized = (role ?? '').trim().toLowerCase();
      if (normalized === 'ustad') return 'ustad';
      if (normalized === 'super_admin') return 'super_admin';
      if (isUstadUser) return 'ustad';
      return 'student';
    })();

    console.log('[REPORT DEBUG] auth role:', role);
    console.log('[REPORT DEBUG] direct ustad status:', directUstadProfile?.status);
    console.log('[REPORT DEBUG] calculated reporterRole:', reporterRole);

    const { error: submitError } = await createReport({
      reporterId: user.id,
      reporterEmail,
      reporterRole,
      reportType: selectedType,
      description: description.trim(),
      relatedContentType: shouldShowRelatedContent(selectedType, isUstadUser) ? relatedContentType || null : null,
      relatedContentId: shouldShowRelatedContent(selectedType, isUstadUser) && relatedContentType ? relatedContentId || null : null,
    });

    console.log('[REPORT DEBUG] insert payload:', {
      reporterId: user.id,
      reporterEmail,
      reporterRole,
      reportType: selectedType,
    });

    if (submitError) {
      setError(submitError.message || 'Failed to submit report. Please try again.');
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="screen-shell mx-auto max-w-2xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
        <BackHeader title="Report a Problem" onBack={onBack} />
        <div className="screen-panel liquid-panel relative z-10 rounded-[2rem] bg-[#fffdf8] p-8 text-center shadow-sm ring-1 ring-primary-100">
          <p className="text-lg font-bold text-primary-900">Report submitted successfully.</p>
          <p className="mt-2 text-sm text-primary-700">Thank you for helping us improve the app.</p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button
              onClick={() => {
                setSubmitted(false);
                setSelectedType(null);
                setDescription('');
                setError(null);
                setScreen('select');
                setRelatedContentType('');
                setRelatedContentId('');
              }}
              className="interactive-card flex flex-1 items-center justify-center gap-2 rounded-2xl border border-primary-100 bg-white px-4 py-3 font-bold text-primary-700 transition-all hover:bg-primary-50 active:scale-95"
            >
              Submit Another Report
            </button>
            <button
              onClick={onBack}
              className="interactive-card flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
            >
              Back to Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'detail' && selectedReport) {
    const statusInfo = STATUS_LABELS[selectedReport.status];
    return (
      <div className="screen-shell mx-auto max-w-2xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
        <BackHeader title="Report Details" onBack={() => setScreen('my-reports')} />
        <div className="screen-panel liquid-panel relative z-10 rounded-[2rem] bg-[#fffdf8] p-6 shadow-sm ring-1 ring-primary-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{REPORT_TYPE_EMOJIS[selectedReport.report_type]}</span>
              <div>
                <p className="text-sm font-bold text-primary-900">{REPORT_TYPE_LABELS[selectedReport.report_type]}</p>
          <p className="mt-0.5 text-[10px] text-primary-700">{formatDate(selectedReport.created_at)}</p>
          </div>
          {selectedReport.related_content_type && (
            <span className="text-[10px] font-medium text-primary-700">
              {selectedReport.related_content_type}
              {selectedReport.related_content_id ? `: ${selectedReport.related_content_id}` : ''}
            </span>
          )}
        </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="mt-6">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-800">Description</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-primary-900">{selectedReport.description}</p>
          </div>

          {selectedReport.admin_response && (
            <div className="mt-6 rounded-[1rem] border border-primary-100 bg-primary-50/50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-800">Admin Response</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-primary-900">{selectedReport.admin_response}</p>
            </div>
          )}

          <button
            onClick={() => setScreen('my-reports')}
            className="mt-6 w-full rounded-2xl border border-primary-100 bg-white px-4 py-3 text-sm font-bold text-primary-700 transition-all hover:bg-primary-50 active:scale-95"
          >
            ← Back to My Reports
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'my-reports') {
    return (
      <div className="screen-shell mx-auto max-w-2xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
        <BackHeader title="My Reports" onBack={() => setScreen('select')} />
        <div className="mt-4">
          <button
            onClick={() => {
              setScreen('select');
              setSelectedType(null);
              setDescription('');
              setError(null);
              setRelatedContentType('');
              setRelatedContentId('');
            }}
            className="liquid-button interactive-card w-full rounded-[1rem] border border-primary-100 bg-white/90 px-4 py-3 text-left text-sm font-bold text-primary-700 transition-all hover:bg-primary-50 active:scale-95"
          >
            + New Report
          </button>
        </div>

        {reportsLoading && (
          <div className="mt-6 flex items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700" />
          </div>
        )}

        {reportsError && (
          <div className="mt-4 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            {reportsError}
            <button onClick={loadMyReports} className="ml-2 font-bold underline">
              Retry
            </button>
          </div>
        )}

        {!reportsLoading && !reportsError && reports.length === 0 && (
          <div className="screen-panel liquid-panel relative z-10 mt-6 rounded-[2rem] bg-[#fffdf8] p-8 text-center shadow-sm ring-1 ring-primary-100">
            <p className="text-base font-bold text-primary-900">No reports yet</p>
            <p className="mt-1 text-sm text-primary-700">You have not submitted any reports.</p>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3">
          {reports.map((report) => {
            const statusInfo = STATUS_LABELS[report.status];
            const preview = report.description.length > 120 ? `${report.description.slice(0, 120)}...` : report.description;
            return (
              <button
                key={report.id}
                onClick={() => handleSelectReport(report)}
                className="liquid-button interactive-card w-full rounded-[1.4rem] border border-primary-100 bg-white/90 px-4 py-4 text-left transition-all hover:bg-primary-50 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{REPORT_TYPE_EMOJIS[report.report_type]}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-primary-900">{REPORT_TYPE_LABELS[report.report_type]}</p>
                      <p className="mt-0.5 text-xs text-primary-700">{preview}</p>
                      <p className="mt-1 text-[10px] text-primary-700">{formatDate(report.created_at)}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (screen === 'form' && selectedType) {
    const selectedOption = REPORT_OPTIONS.find((option) => option.type === selectedType);
    const showRelated = shouldShowRelatedContent(selectedType, isUstadUser);
    const isDescriptionValid = description.trim().length > 0;
    const remainingChars = MAX_DESCRIPTION_LENGTH - description.length;

    return (
      <div className="screen-shell mx-auto max-w-2xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
        <BackHeader title="Report a Problem" onBack={() => setScreen('select')} />
        <div className="mt-6">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-800">Selected Category</p>
          <div className="mt-2 flex items-center gap-3 rounded-[1.4rem] border border-primary-100 bg-white/90 p-4">
            <span className="text-2xl">{selectedOption?.emoji}</span>
            <span className="text-sm font-bold text-primary-900">{selectedOption?.title}</span>
          </div>
        </div>

        {showRelated && (
          <div className="mt-6">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-primary-800">Related Content (optional)</p>
            <select
              value={relatedContentType}
              onChange={(e) => {
                setRelatedContentType(e.target.value);
                setRelatedContentId('');
              }}
              className="liquid-button mb-2 w-full rounded-[1.4rem] border border-primary-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            >
              <option value="">Select related content...</option>
              {RELATED_CONTENT_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {relatedContentType && (
              <input
                type="text"
                value={relatedContentId}
                onChange={(e) => setRelatedContentId(e.target.value)}
                placeholder="Content ID (e.g., question-123)"
                className="liquid-button w-full rounded-[1.4rem] border border-primary-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            )}
          </div>
        )}

        <div className="mt-6">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">
            Describe the problem <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
            placeholder="Please describe the issue in detail..."
            rows={6}
            className="liquid-button w-full rounded-[1.4rem] border border-primary-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[10px] text-primary-700">Required</span>
            <span className={`text-[10px] font-bold ${remainingChars < 0 ? 'text-red-500' : 'text-primary-700'}`}>
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            onClick={() => {
              setSelectedType(null);
              setError(null);
              setRelatedContentType('');
              setRelatedContentId('');
            }}
            disabled={loading}
            className="liquid-button interactive-card flex flex-1 items-center justify-center gap-2 rounded-2xl border border-primary-100 bg-white px-4 py-3 font-bold text-primary-700 transition-all hover:bg-primary-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Change Category
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isDescriptionValid || loading}
            className={`interactive-card flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 font-bold transition-all active:scale-95 ${
              isDescriptionValid && !loading
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md hover:shadow-lg'
                : 'cursor-not-allowed bg-gray-100 text-gray-400'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-shell mx-auto max-w-2xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Report a Problem" onBack={onBack} />
      <div className="mt-6">
        <h2 className="text-center text-lg font-bold text-primary-900">What would you like to report?</h2>
        <p className="mt-1 text-center text-sm text-primary-700">Choose the category that best describes your issue.</p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {REPORT_OPTIONS.map(({ type, title, emoji, description }) => {
          const isActive = selectedType === type;
          return (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setScreen('form');
                }}
                className="liquid-button interactive-card flex items-center gap-4 rounded-[1.4rem] border px-4 py-4 text-left transition-all active:scale-[0.98]"
                style={{
                  borderColor: isActive ? '#0c6453' : undefined,
                  background: isActive ? '#eef9f4' : undefined,
                  boxShadow: isActive ? '0 12px 24px rgba(12,100,83,0.14)' : undefined,
                }}
              >
              <span className="text-2xl">{emoji}</span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-primary-900">{title}</span>
                <span className="block mt-0.5 text-xs text-primary-700">{description}</span>
              </span>
              {isActive && (
                <span className="text-primary-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <button
          onClick={handleOpenMyReports}
          className="liquid-button interactive-card w-full rounded-[1.4rem] border border-primary-100 bg-white/90 px-4 py-4 text-left transition-all hover:bg-primary-50 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <span className="text-sm font-bold text-primary-900">My Reports</span>
          </div>
          <p className="mt-1 text-xs text-primary-700">View your submitted reports and their status.</p>
        </button>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { BackHeader } from '@/components/BackHeader';
import { GraduationCap, LogOut, Shield, FileText, LayoutDashboard } from 'lucide-react';
import { CLASS_THEMES } from '@/theme';
import { useUstadAuth } from '@/hooks/useUstadAuth';
import { clearStoredUstadEmail } from '@/lib/supabaseClient';
import type { View } from '@/types';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  theme: Theme;
  onBack: () => void | Promise<void>;
  onNavigate: (v: View) => void;
}

export function UstadDashboard({ theme, onBack, onNavigate }: Props) {
  const { profile } = useUstadAuth();
  const initials = useMemo(() => {
    const name = profile?.full_name || 'Ustad';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [profile]);

  const handleLogout = async () => {
    clearStoredUstadEmail();
    await onBack();
  };

  return (
    <div className="screen-shell mx-auto max-w-lg px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Ustad Dashboard" onBack={onBack} theme={theme} />

      <div className="rounded-[1.4rem] border border-primary-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryStrong} 100%)` }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-primary-900">
              {profile?.full_name || 'Ustad'}
            </h2>
            <p className="truncate text-xs text-primary-600">{profile?.email}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-primary-100 bg-primary-50/50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary-800">
            <Shield size={16} />
            Approved Ustad
          </div>
          <p className="mt-1 text-xs text-primary-700">
            You have full access to the Ustad dashboard.
          </p>
        </div>

        <button
          onClick={() => onNavigate('ustadPanel')}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary-200 bg-white px-6 py-3 text-sm font-bold text-primary-900 transition-all hover:bg-primary-50 active:scale-[0.98]"
        >
          <LayoutDashboard size={18} />
          Ustad Panel
        </button>

        <button
          onClick={() => onNavigate('ustadQuiz')}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary-200 bg-white px-6 py-3 text-sm font-bold text-primary-900 transition-all hover:bg-primary-50 active:scale-[0.98]"
        >
          <FileText size={18} />
          Quiz Questions
        </button>

        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary-200 bg-white px-6 py-3 text-sm font-bold text-primary-900 transition-all hover:bg-primary-50 active:scale-[0.98]"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
}

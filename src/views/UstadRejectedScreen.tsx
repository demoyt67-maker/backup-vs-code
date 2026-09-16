import { BackHeader } from '@/components/BackHeader';
import { XCircle } from 'lucide-react';
import { CLASS_THEMES } from '@/theme';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];
import type { UstadProfile } from '@/hooks/useUstadAuth';

interface Props {
  theme: Theme;
  profile: UstadProfile | null;
  onBack: () => void | Promise<void>;
}

export function UstadRejectedScreen({ theme, profile, onBack }: Props) {
  return (
    <div className="screen-shell mx-auto max-w-lg px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Request Rejected" onBack={onBack} theme={theme} />

      <div className="rounded-[1.4rem] border border-primary-100 bg-white p-8 text-center shadow-sm">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: `${theme.accentSoft}` }}
        >
          <XCircle size={32} style={{ color: theme.primary }} />
        </div>
        <h2 className="text-xl font-bold text-primary-900">Your Ustad request was rejected</h2>
        <p className="mt-3 text-sm text-primary-700">
          {profile?.rejection_reason || 'Super Admin rejected your request. Please contact support for more information.'}
        </p>
      </div>
    </div>
  );
}

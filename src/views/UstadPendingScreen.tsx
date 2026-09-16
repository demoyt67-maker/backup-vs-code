import { BackHeader } from '@/components/BackHeader';
import { Clock3 } from 'lucide-react';
import { CLASS_THEMES } from '@/theme';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  theme: Theme;
  onBack: () => void | Promise<void>;
}

export function UstadPendingScreen({ theme, onBack }: Props) {
  return (
    <div className="screen-shell mx-auto max-w-lg px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Request Pending" onBack={onBack} theme={theme} />

      <div className="rounded-[1.4rem] border border-primary-100 bg-white p-8 text-center shadow-sm">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: `${theme.accentSoft}` }}
        >
          <Clock3 size={32} style={{ color: theme.primary }} />
        </div>
        <h2 className="text-xl font-bold text-primary-900">Your Ustad request is pending</h2>
        <p className="mt-3 text-sm text-primary-700">
          Super Admin approval വരുന്നത് വരെ കാത്തിരിക്കുക.
        </p>
        <p className="mt-2 text-xs text-primary-600">
          You will get access once your request is approved.
        </p>
      </div>
    </div>
  );
}

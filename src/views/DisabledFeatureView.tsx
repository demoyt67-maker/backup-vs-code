import type { View } from '@/types';
import { CLASS_THEMES } from '@/theme';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
  featureName?: string;
}

export function DisabledFeatureView({ onNavigate, theme }: Props) {
  return (
    <div className="screen-shell mx-auto max-w-5xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <div className="rounded-[1.4rem] border border-primary-100 bg-primary-50/50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-3xl">
          🚧
        </div>
        <h2 className="text-xl font-bold text-primary-900">This feature is temporarily unavailable.</h2>
        <button
          onClick={() => onNavigate('home')}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

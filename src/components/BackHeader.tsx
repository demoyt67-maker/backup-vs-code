import { ChevronLeft } from 'lucide-react';

interface Props {
  title: string;
  onBack: () => void;
  subtitle?: string;
  theme?: {
    primary: string;
    primaryStrong: string;
    accent: string;
    accentSoft: string;
    text: string;
    muted: string;
    border: string;
    surface: string;
  };
}

export function BackHeader({ title, onBack, subtitle, theme }: Props) {
  return (
    <div className="relative z-10 mb-6 flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-all hover:-translate-x-0.5 hover:shadow-md active:scale-90"
        aria-label="Back"
        style={{ borderColor: theme?.border ?? 'rgba(11,66,57,0.12)', background: theme?.surface ?? '#fffdf8', color: theme?.primaryStrong ?? '#0b6453' }}
      >
        <ChevronLeft size={22} />
      </button>
      <div className="min-w-0">
        <h2 className="truncate text-xl font-bold tracking-tight" style={{ color: theme?.text ?? '#0b4239' }}>{title}</h2>
        {subtitle && <p className="truncate text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: theme?.muted ?? '#566f67' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

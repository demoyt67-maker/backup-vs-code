import { ChevronLeft } from 'lucide-react';

interface Props {
  title: string;
  onBack: () => void;
  subtitle?: string;
}

export function BackHeader({ title, onBack, subtitle }: Props) {
  return (
    <div className="relative z-10 mb-6 flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#e4dcc9] bg-[#fffdf8] text-primary-700 shadow-sm transition-all hover:-translate-x-0.5 hover:bg-white hover:shadow-md active:scale-90"
        aria-label="Back"
      >
        <ChevronLeft size={22} />
      </button>
      <div className="min-w-0">
        <h2 className="truncate text-xl font-bold tracking-tight text-primary-900">{title}</h2>
        {subtitle && <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-primary-600/60">{subtitle}</p>}
      </div>
    </div>
  );
}

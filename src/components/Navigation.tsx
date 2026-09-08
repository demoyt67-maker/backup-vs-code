import { Home, BookOpen, PenTool, BarChart3, GraduationCap } from 'lucide-react';
import type { View } from '@/types';

interface NavItem {
  view: View;
  label: string;
  icon: typeof Home;
}

const items: NavItem[] = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'learn', label: 'Learn', icon: BookOpen },
  { view: 'writing', label: 'Writing', icon: PenTool },
  { view: 'score', label: 'Score', icon: BarChart3 },
];

interface Props {
  current: View;
  onNavigate: (v: View) => void;
}

export function BottomNav({ current, onNavigate }: Props) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-[#ded8c8] bg-[#fffdf8]/90 shadow-[0_-8px_24px_rgba(11,66,57,0.08)] backdrop-blur-xl md:hidden">
      <div className="flex items-stretch justify-around px-1 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
        {items.map(({ view, label, icon: Icon }) => {
          const active = current === view;
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 transition-all active:scale-95"
              aria-label={label}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  active
                    ? 'bg-gradient-to-br from-primary-600 to-teal-700 text-white shadow-md shadow-primary-600/25'
                    : 'text-primary-700/60'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  active ? 'text-primary-700' : 'text-primary-700/50'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

interface TopNavProps extends Props {}

export function TopNav({ current, onNavigate }: TopNavProps) {
  const topItems: NavItem[] = [...items, { view: 'teacher', label: 'Teacher', icon: GraduationCap }];
  return (
    <header className="fixed top-0 inset-x-0 z-40 hidden border-b border-[#ded8c8] bg-[#fffdf8]/90 shadow-[0_8px_24px_rgba(11,66,57,0.05)] backdrop-blur-xl md:block">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-teal-700 font-arabic text-2xl font-bold text-gold-300 shadow-md shadow-primary-700/25">
            م
          </span>
          <span className="flex flex-col leading-tight text-left">
            <span className="font-arabic text-lg font-bold text-primary-800">مدرسة العربية</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-primary-600/70">
              Madrasa Quiz
            </span>
          </span>
        </button>
        <nav className="flex items-center gap-1">
          {topItems.map(({ view, label, icon: Icon }) => {
            const active = current === view || (view === 'home' && current === 'quiz');
            return (
              <button
                key={view}
                onClick={() => onNavigate(view)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all active:scale-95 ${
                  active
                    ? 'bg-gradient-to-r from-primary-600 to-teal-700 text-white shadow-md shadow-primary-600/25'
                    : 'text-primary-700/70 hover:bg-primary-50 hover:text-primary-800'
                }`}
              >
                <Icon size={16} strokeWidth={2.25} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

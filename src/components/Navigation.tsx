import { Home, BookOpen, PenTool, BarChart3 } from 'lucide-react';
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

const topItems: NavItem[] = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'learn', label: 'Learn', icon: BookOpen },
  { view: 'score', label: 'Score', icon: BarChart3 },
];

interface Props {
  current: View;
  onNavigate: (v: View) => void;
  theme?: {
    primary: string;
    primaryStrong: string;
    accent: string;
    accentSoft: string;
    text: string;
    muted: string;
    border: string;
    surface: string;
    hero: string;
  };
  selectedClass?: 1 | 2 | 3;
}

export function BottomNav({ current, onNavigate, theme, selectedClass = 1 }: Props) {
  const visibleItems: NavItem[] = selectedClass === 1 ? items : items.filter((item) => item.view !== 'writing');

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/80 px-2 py-2 backdrop-blur-xl md:hidden"
      style={{ borderColor: theme?.border ?? 'rgba(11,66,57,0.12)', boxShadow: '0 -10px 24px rgba(15, 58, 49, 0.08)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-1 rounded-[1.4rem] border border-white/50 bg-white/70 p-1.5 shadow-inner">
        {visibleItems.map(({ view, label, icon: Icon }) => {
          const active = current === view;
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className="flex flex-1 flex-col items-center justify-center rounded-[1rem] px-1 py-1.5 transition-all active:scale-95"
              aria-label={label}
              style={
                active
                  ? {
                      background: `linear-gradient(135deg, ${theme?.primary ?? '#0d7c66'} 0%, ${theme?.primaryStrong ?? '#0b6453'} 100%)`,
                      boxShadow: `0 10px 18px ${theme?.primary ?? '#0d7c66'}33`,
                    }
                  : { background: 'transparent' }
              }
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl transition-all"
                style={
                  active
                    ? { color: '#fff' }
                    : { color: theme?.text ? `${theme.text}aa` : '#0b4239' }
                }
              >
                <Icon size={19} strokeWidth={active ? 2.5 : 2.1} />
              </span>
              <span
                className="mt-0.5 text-[10px] font-bold"
                style={{ color: active ? '#ffffff' : (theme?.muted ?? '#566f67') }}
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

type TopNavProps = Props;

export function TopNav({ current, onNavigate, theme, selectedClass = 1 }: TopNavProps) {
  const visibleItems: NavItem[] = topItems;
  return (
    <header
      className="fixed inset-x-0 top-0 z-40 hidden border-b border-white/30 bg-white/70 backdrop-blur-xl md:block"
      style={{ borderColor: theme?.border ?? 'rgba(11,66,57,0.12)' }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl font-arabic text-2xl font-bold shadow-md"
            style={{
              background: `linear-gradient(135deg, ${theme?.primary ?? '#0d7c66'} 0%, ${theme?.primaryStrong ?? '#0b6453'} 100%)`,
              color: theme?.accent ?? '#f8d772',
              boxShadow: `0 10px 18px ${theme?.primary ?? '#0d7c66'}33`,
            }}
          >
            م
          </span>
          <span className="flex flex-col leading-tight text-left">
            <span className="font-arabic text-lg font-bold" style={{ color: theme?.text ?? '#0b4239' }}>مدرسة العربية</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: theme?.muted ?? '#566f67' }}>
              Madrasa Quiz
            </span>
          </span>
        </button>
        <nav className="flex items-center gap-1.5 rounded-full border border-white/50 bg-white/70 p-1.5 shadow-sm backdrop-blur-md" style={{ borderColor: theme?.border ?? 'rgba(11,66,57,0.12)' }}>
          {visibleItems.map(({ view, label, icon: Icon }) => {
            const active = current === view || (view === 'home' && current === 'quiz');
            return (
              <button
                key={view}
                onClick={() => onNavigate(view)}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-all active:scale-95"
                style={
                  active
                    ? {
                        background: `linear-gradient(135deg, ${theme?.primary ?? '#0d7c66'} 0%, ${theme?.primaryStrong ?? '#0b6453'} 100%)`,
                        color: '#fff',
                        boxShadow: `0 10px 18px ${theme?.primary ?? '#0d7c66'}33`,
                      }
                    : { color: theme?.muted ?? '#566f67' }
                }
              >
                <Icon size={15} strokeWidth={2.25} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

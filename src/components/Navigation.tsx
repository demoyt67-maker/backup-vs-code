import { Home, BookOpen, PenTool, BarChart3, Settings, Shield, LogOut } from 'lucide-react';
import type { View } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  view: View;
  label: string;
  icon: typeof Home;
}

const baseItems: NavItem[] = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'learn', label: 'Learn', icon: BookOpen },
  { view: 'writing', label: 'Writing', icon: PenTool },
  { view: 'score', label: 'Score', icon: BarChart3 },
  { view: 'settings', label: 'Settings', icon: Settings },
];

const baseTopItems: NavItem[] = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'learn', label: 'Learn', icon: BookOpen },
  { view: 'score', label: 'Score', icon: BarChart3 },
  { view: 'settings', label: 'Settings', icon: Settings },
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
  isSuperAdminMode?: boolean;
  enabledViews?: View[];
  user?: User | null;
  loading?: boolean;
  isSuperAdmin?: boolean;
  onLogout?: () => void;
}

export function BottomNav({ current, onNavigate, theme, selectedClass = 1, isSuperAdminMode = false, enabledViews, user, loading, isSuperAdmin, onLogout }: Props) {
  const adminItem: NavItem = { view: 'superAdmin', label: 'Admin', icon: Shield };
  const items: NavItem[] = isSuperAdmin && isSuperAdminMode ? [...baseItems, adminItem] : baseItems;
  const visibleItems: NavItem[] = selectedClass === 1 ? items : items.filter((item) => item.view !== 'writing');
  const filteredItems = enabledViews ? visibleItems.filter((item) => enabledViews.includes(item.view)) : visibleItems;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/80 px-2 py-2 backdrop-blur-xl md:hidden"
      style={{ borderColor: theme?.border ?? 'rgba(11,66,57,0.12)', boxShadow: '0 -10px 24px rgba(15, 58, 49, 0.08)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-1 rounded-[1.4rem] border border-white/50 bg-white/70 p-1.5 shadow-inner">
        {filteredItems.map(({ view, label, icon: Icon }) => {
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
      {user && (
        <div className="mx-auto mt-2 flex max-w-md items-center justify-between rounded-[1.4rem] border border-white/50 bg-white/70 px-3 py-2 shadow-sm">
          <span className="truncate text-xs font-semibold text-primary-900">{user.user_metadata?.full_name || user.email || 'User'}</span>
          <button
            onClick={onLogout}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      )}
    </nav>
  );
}

type TopNavProps = Props;

export function TopNav({ current, onNavigate, theme, selectedClass = 1, isSuperAdminMode = false, enabledViews, user, loading, isSuperAdmin, onLogout }: TopNavProps) {
  const adminItem: NavItem = { view: 'superAdmin', label: 'Admin', icon: Shield };
  const topItems: NavItem[] = isSuperAdmin && isSuperAdminMode ? [...baseTopItems, adminItem] : baseTopItems;
  const filteredItems = enabledViews ? topItems.filter((item) => enabledViews.includes(item.view)) : topItems;

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
          {filteredItems.map(({ view, label, icon: Icon }) => {
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
        <div className="flex items-center">
          {loading ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
            </div>
          ) : user ? (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-white/30 bg-white/70 px-3 py-1.5 text-sm font-medium md:flex" style={{ color: theme?.text ?? '#0b4239' }}>
                <span className="max-w-[100px] truncate">{user.user_metadata?.full_name || user.email || 'User'}</span>
                <button
                  onClick={onLogout}
                  className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
              <button
                onClick={onLogout}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

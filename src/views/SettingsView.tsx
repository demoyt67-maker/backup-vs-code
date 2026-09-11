import type { View } from '@/types';
import { CLASS_THEMES } from '@/theme';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
  isSuperAdmin: boolean;
  isSuperAdminMode: boolean;
  onToggleSuperAdminMode: () => void;
  appearanceMode: 'light' | 'dark' | 'system';
  onChangeAppearanceMode: (mode: 'light' | 'dark' | 'system') => void;
}

export function SettingsView({ onNavigate, theme, isSuperAdmin, isSuperAdminMode, onToggleSuperAdminMode, appearanceMode, onChangeAppearanceMode }: Props) {
  const appearanceOptions: { mode: 'light' | 'dark' | 'system'; label: string; description: string }[] = [
    { mode: 'light', label: 'Light', description: 'Always light' },
    { mode: 'dark', label: 'Dark', description: 'Always dark' },
    { mode: 'system', label: 'System', description: 'Match device' },
  ];

  return (
    <div className="screen-shell mx-auto max-w-5xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-primary-900">Settings</h1>
        <p className="mt-1 text-sm text-primary-700">Manage your app preferences and account settings.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="liquid-panel rounded-[1.4rem] p-4 shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: theme.primaryStrong }}>Appearance</p>
              <h3 className="mt-1 text-base font-bold" style={{ color: theme.text }}>Theme Mode</h3>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {appearanceOptions.map(({ mode, label, description }) => {
              const isActive = mode === appearanceMode;
              return (
                <button
                  key={mode}
                  onClick={() => onChangeAppearanceMode(mode)}
                  className="liquid-button rounded-[1rem] border px-2 py-2.5 text-left transition-all active:scale-[0.98]"
                  style={{
                    borderColor: isActive ? theme.primary : theme.border,
                    background: isActive ? theme.accentSoft : theme.surfaceStrong,
                    boxShadow: isActive ? `0 12px 24px ${theme.primary}22` : 'none',
                    color: isActive ? theme.primaryStrong : theme.text,
                  }}
                >
                  <div className="text-sm font-black">{label}</div>
                  <div className="mt-1 text-[10px] font-medium opacity-85" style={{ color: isActive ? theme.primaryStrong : theme.muted }}>
                    {description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Super Admin Mode Control Center - ONLY for super_admin users */}
        {isSuperAdmin && (
          <div className="liquid-panel rounded-[1.4rem] p-4 shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: theme.primaryStrong }}>Administration</p>
                <h3 className="mt-1 text-base font-bold" style={{ color: theme.text }}>Super Admin Mode</h3>
              </div>
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: theme.accentSoft, color: theme.primaryStrong }}>
                {isSuperAdminMode ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-xs text-primary-700 mb-3">
              Super Admin Mode gives you access to administrative controls and management features.
            </p>
            <button
              onClick={onToggleSuperAdminMode}
              className={`w-full rounded-[1rem] border px-4 py-3 text-left text-sm font-bold transition-all active:scale-[0.98] ${
                isSuperAdminMode
                  ? 'border-yellow-300 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-900'
                  : 'border-primary-100 bg-white/90 text-primary-900'
              }`}
              style={{
                borderColor: isSuperAdminMode ? '#facc15' : theme.border,
                background: isSuperAdminMode ? 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)' : theme.surface,
                color: theme.text,
              }}
            >
              {isSuperAdminMode ? 'Super Admin Mode is ON' : 'Enable Super Admin Mode'}
            </button>
            {isSuperAdminMode && (
              <div className="mt-4 rounded-[1rem] border border-yellow-200 bg-yellow-50/50 p-4">
                <p className="text-sm font-bold text-yellow-900">Super Admin Control Center</p>
                <p className="mt-1 text-xs text-yellow-800">Admin controls will be added here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

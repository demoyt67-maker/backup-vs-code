import type { View } from '@/types';
import { CLASS_THEMES } from '@/theme';
import { LogOut, Bug, Pencil, Check, X } from 'lucide-react';
import { useState } from 'react';
import { validateStudentName } from '@/lib/studentNameValidation';
import type { User } from '@supabase/supabase-js';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
  isSuperAdmin: boolean;
  isSuperAdminMode: boolean;
  onToggleSuperAdminMode: () => void;
  appearanceMode: 'light' | 'dark' | 'system';
  onChangeAppearanceMode: (mode: 'light' | 'dark' | 'system') => void;
  user?: User | null;
  onLogout?: () => void;
  studentName?: string | null;
  onUpdateStudentName?: (name: string) => void;
}

export function SettingsView({ onNavigate, theme, isSuperAdmin, isSuperAdminMode, onToggleSuperAdminMode, appearanceMode, onChangeAppearanceMode, user, onLogout, studentName, onUpdateStudentName }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(studentName ?? '');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const result = validateStudentName(draft);
    if (!result.ok) {
      setError(result.error ?? 'Please enter your real name.');
      return;
    }
    const trimmed = draft.trim();
    onUpdateStudentName?.(trimmed);
    setEditing(false);
    setError(null);
  };

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

      {user && (
        <div className="liquid-panel mb-4 rounded-[1.4rem] p-4 shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: theme.primaryStrong }}>Account</p>
              <h3 className="mt-1 text-base font-bold" style={{ color: theme.text }}>{user.user_metadata?.full_name || user.email || 'User'}</h3>
              <p className="mt-1 text-xs text-primary-700">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="liquid-button interactive-card inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-primary-700 shadow-sm ring-1 ring-primary-100 transition-all hover:bg-primary-50 active:scale-95"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}

      <div className="liquid-panel mb-4 rounded-[1.4rem] p-4 shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: theme.primaryStrong }}>Student Name</p>
            {editing ? (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button onClick={handleSave} className="rounded-xl bg-primary-700 px-3 py-2 text-white"><Check size={16} /></button>
                <button onClick={() => { setEditing(false); setDraft(studentName ?? ''); setError(null); }} className="rounded-xl bg-slate-200 px-3 py-2 text-slate-700"><X size={16} /></button>
              </div>
            ) : (
              <h3 className="mt-1 text-base font-bold" style={{ color: theme.text }}>{studentName || 'Not set'}</h3>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          {!editing && (
            <button
              onClick={() => { setDraft(studentName ?? ''); setEditing(true); setError(null); }}
              className="liquid-button interactive-card inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-primary-700 shadow-sm ring-1 ring-primary-100 transition-all hover:bg-primary-50 active:scale-95"
            >
              <Pencil size={16} />
              Edit
            </button>
          )}
        </div>
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

        <div className="liquid-panel rounded-[1.4rem] p-4 shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: theme.primaryStrong }}>Support</p>
              <h3 className="mt-1 text-base font-bold" style={{ color: theme.text }}>Report a Problem</h3>
            </div>
            <Bug size={18} style={{ color: theme.primaryStrong }} />
          </div>
          <p className="text-xs text-primary-700 mb-3">
            Found an issue with learning content, a bug in the app, or something else? Let us know.
          </p>
          <button
            onClick={() => onNavigate('report')}
            className="liquid-button interactive-card w-full rounded-[1rem] border border-primary-100 bg-white/90 px-4 py-3 text-left text-sm font-bold text-primary-700 transition-all hover:bg-primary-50 active:scale-[0.98]"
          >
            Report a Problem
          </button>
        </div>
      </div>
    </div>
  );
}

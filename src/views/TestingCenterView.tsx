import { useState } from 'react';
import { BackHeader } from '@/components/BackHeader';
import { CLASS_THEMES } from '@/theme';
import { User, Shield, Clock3, XCircle, GraduationCap, Monitor } from 'lucide-react';
import type { View } from '@/types';
import { useTestMode, type TestRole } from '@/contexts/TestModeContext';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
}

type TestRoleKey = TestRole;

interface RoleOption {
  key: TestRoleKey;
  title: string;
  description: string;
  icon: typeof User;
}

const ROLES: RoleOption[] = [
  {
    key: 'student',
    title: 'Student',
    description: 'Normal student interface with home, learn, quiz, writing, score, settings.',
    icon: User,
  },
  {
    key: 'ustad-approved',
    title: 'Approved Ustad',
    description: 'Normal student interface + Ustad Panel access.',
    icon: GraduationCap,
  },
  {
    key: 'ustad-pending',
    title: 'Pending Ustad',
    description: 'Restricted access: pending approval screen only.',
    icon: Clock3,
  },
  {
    key: 'ustad-rejected',
    title: 'Rejected Ustad',
    description: 'Restricted access: rejected screen with reason.',
    icon: XCircle,
  },
  {
    key: 'super-admin',
    title: 'Super Admin',
    description: 'Full Admin Panel access with all management features.',
    icon: Shield,
  },
];

export function TestingCenterView({ onNavigate, theme }: Props) {
  const { testRole, setTestRole, clearTestRole } = useTestMode();

  const handleSelectRole = (role: TestRole) => {
    setTestRole(role);
    onNavigate('home');
  };
  return (
    <div className="screen-shell mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Testing Center" onBack={() => onNavigate('superAdmin')} theme={theme} />

      {testRole && (
        <div className="mb-6 rounded-[1.4rem] border border-yellow-200 bg-yellow-50/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor size={18} className="text-yellow-700" />
              <p className="text-sm font-bold text-yellow-900">TEST MODE ACTIVE</p>
            </div>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-800">
              {ROLES.find((r) => r.key === testRole)?.title || testRole}
            </span>
          </div>
          <p className="mt-2 text-xs text-yellow-800">
            You are previewing the app as a different role. This does not affect real accounts or data.
          </p>
          <button
            onClick={clearTestRole}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-yellow-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-yellow-700"
          >
            Exit Test Mode
          </button>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-bold text-primary-900">Select Test Role</h2>
        <p className="mt-1 text-xs text-primary-700">
          Choose a role to preview the app experience. Test mode does not modify real data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isActive = testRole === role.key;
          return (
            <button
              key={role.key}
              onClick={() => handleSelectRole(role.key)}
              className={`liquid-panel rounded-[1.4rem] p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isActive ? 'ring-2 ring-yellow-400' : ''
              }`}
              style={{
                border: `1px solid ${theme.border}`,
                background: theme.surface,
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: theme.accentSoft }}
                >
                  <Icon size={24} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-primary-900">{role.title}</h3>
                    {isActive && (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-800">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-primary-700">{role.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 rounded-[1.4rem] border border-blue-200 bg-blue-50/50 p-4">
        <p className="text-sm font-bold text-blue-900">ℹ️ About Test Mode</p>
        <p className="mt-1 text-xs text-blue-800">
          Test Mode allows Super Admins to preview the app as different roles without modifying real accounts,
          roles, or Supabase data. All actions in Test Mode are isolated and do not affect production data.
        </p>
      </div>
    </div>
  );
}

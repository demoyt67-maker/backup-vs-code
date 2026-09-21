import { useState, useEffect } from 'react';
import { BackHeader } from '@/components/BackHeader';
import { CLASS_THEMES } from '@/theme';
import { getAllProfiles, type ProfileRecord } from '@/lib/supabaseClient';
import type { View } from '@/types';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
}

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  super_admin: { bg: 'bg-purple-100', text: 'text-purple-700' },
  ustad: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  student: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

function formatRole(role: string | null): string {
  if (!role) return 'student';
  return role;
}

export function SuperAdminStudentsView({ onNavigate, theme }: Props) {
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await getAllProfiles();
      if (error) throw error;
      setProfiles(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load student profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfiles();
  }, []);

  return (
    <div className="screen-shell mx-auto max-w-5xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Students" subtitle={`${profiles.length} registered user${profiles.length === 1 ? '' : 's'}`} onBack={() => onNavigate('superAdmin')} theme={theme} />

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-700" />
        </div>
      )}

      {error && (
        <div className="rounded-[1.4rem] border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && profiles.length === 0 && (
        <div className="rounded-[1.4rem] border border-primary-100 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-semibold text-primary-700">No registered users yet.</p>
        </div>
      )}

      {!loading && !error && profiles.length > 0 && (
        <div className="overflow-hidden rounded-[1.4rem] border border-primary-100 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-4 border-b border-primary-100 bg-primary-50/50 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-primary-800">
            <div className="col-span-6 md:col-span-8">User ID</div>
            <div className="col-span-6 md:col-span-4">Role</div>
          </div>
          <div className="divide-y divide-primary-100">
            {profiles.map((profile) => {
              const role = formatRole(profile.role);
              const roleStyle = ROLE_STYLES[role] ?? ROLE_STYLES.student;
              return (
                <div key={profile.id} className="grid grid-cols-12 gap-4 px-5 py-3.5 text-sm text-primary-900 transition-colors hover:bg-primary-50/50">
                  <div className="col-span-6 md:col-span-8 font-mono text-xs break-all">
                    {profile.id}
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${roleStyle.bg} ${roleStyle.text}`}>
                      {role}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

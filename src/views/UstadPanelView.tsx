import { BackHeader } from '@/components/BackHeader';
import { CLASS_THEMES } from '@/theme';
import { FileText, BookOpen, Moon, BarChart3, GraduationCap, FileWarning, Bell, User } from 'lucide-react';
import type { View } from '@/types';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  theme: Theme;
  onNavigate: (v: View) => void;
}

const SECTIONS = [
  { key: 'quiz', title: 'Quiz Questions', description: 'Manage quiz questions for classes.', icon: FileText, comingSoon: false },
  { key: 'learning', title: 'Learning Content', description: 'Browse Arabic learning content by class, set, and level.', icon: BookOpen, comingSoon: false },
  { key: 'dailyIslamic', title: 'Daily Islamic Learning', description: 'Submit ayah, dua, and good messages for daily learning.', icon: Moon, comingSoon: false },
  { key: 'teaching', title: 'My Teaching Content', description: 'Organize your own teaching materials.', icon: GraduationCap, comingSoon: false },
  { key: 'reports', title: 'Reports & Corrections', description: 'Review reports and correct mistakes.', icon: FileWarning, comingSoon: true },
  { key: 'notifications', title: 'Notifications', description: 'Send and manage announcements.', icon: Bell, comingSoon: true },
  { key: 'profile', title: 'My Ustad Profile', description: 'Update your profile and photo.', icon: User, comingSoon: true },
] as const;

export function UstadPanelView({ theme, onNavigate }: Props) {
  return (
    <div className="screen-shell mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Ustad Panel" onBack={() => onNavigate('home')} theme={theme} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SECTIONS.map((section, index) => {
          const Icon = section.icon;
          return (
              <button
                key={section.key}
                onClick={() => {
                  if (section.comingSoon) return;
                  if (section.key === 'learning') {
                    onNavigate('ustadLearning');
                  } else if (section.key === 'dailyIslamic') {
                    onNavigate('ustadDailyIslamic');
                  } else if (section.key === 'teaching') {
                    onNavigate('ustadTeaching');
                  } else {
                    onNavigate('ustadQuiz');
                  }
                }}
                disabled={section.comingSoon}
              className={`liquid-panel overflow-hidden rounded-[1.4rem] text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${section.comingSoon ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
              style={{
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                animationDelay: `${index * 80}ms`,
              }}
            >
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: theme.accentSoft }}
                  >
                    <Icon size={24} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-primary-900">{section.title}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${section.comingSoon ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                      {section.comingSoon ? 'Coming Soon' : 'Open'}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-primary-700">{section.description}</p>
              </div>
              <div
                className="border-t px-5 py-3 text-xs font-semibold text-primary-600"
                style={{ borderColor: theme.border, background: theme.accentSoft }}
              >
                {section.comingSoon ? 'Coming soon.' : 'Click to manage.'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

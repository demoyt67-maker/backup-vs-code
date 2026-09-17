import type { View } from '@/types';
import { CLASS_THEMES } from '@/theme';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
}

type AdminSection = {
  title: string;
  description: string;
  icon: string;
  view?: View;
  status: 'Open' | 'Coming Soon';
  onClick?: () => void;
};

const GENERAL: AdminSection[] = [
  {
    title: 'Dashboard',
    description: 'Overview of app health, registrations, and activity.',
    icon: '📊',
    view: 'superAdmin',
    status: 'Open',
    onClick: undefined,
  },
  {
    title: 'Reports',
    description: 'View learning progress, quiz results, and usage statistics.',
    icon: '📑',
    status: 'Coming Soon',
  },
  {
    title: 'Settings',
    description: 'Configure global app settings, themes, and preferences.',
    icon: '⚙️',
    status: 'Coming Soon',
  },
];

const USERS: AdminSection[] = [
  {
    title: 'Students',
    description: 'View and manage student accounts and progress.',
    icon: '🎓',
    status: 'Coming Soon',
  },
  {
    title: 'Ustads',
    description: 'Review and manage Ustad accounts and requests.',
    icon: '👨‍🏫',
    view: 'ustadRequests',
    status: 'Open',
  },
  {
    title: 'Admin Management',
    description: 'Manage Super Admin accounts and roles.',
    icon: '🛡️',
    status: 'Coming Soon',
  },
  {
    title: 'Permissions',
    description: 'Control access permissions and role policies.',
    icon: '🔐',
    status: 'Coming Soon',
  },
];

const CONTENT: AdminSection[] = [
  {
    title: 'Curriculum / Learning CMS',
    description: 'Manage Arabic learning content, letters, and lessons.',
    icon: '📚',
    view: 'cms',
    status: 'Open',
  },
  {
    title: 'Activities',
    description: 'Manage learning activities and practice exercises.',
    icon: '🧩',
    status: 'Coming Soon',
  },
  {
    title: 'Quiz Management',
    description: 'Create, edit, and organize quiz questions across classes.',
    icon: '❓',
    status: 'Coming Soon',
  },
  {
    title: 'Daily Islamic Learning',
    description: 'Manage daily Islamic learning materials and content.',
    icon: '🌙',
    status: 'Coming Soon',
  },
  {
    title: 'Home Management',
    description: 'Customize home screen layout and featured content.',
    icon: '🏠',
    status: 'Coming Soon',
  },
  {
    title: 'Content Calendar',
    description: 'Schedule and plan content releases and updates.',
    icon: '📅',
    status: 'Coming Soon',
  },
  {
    title: 'Content Review',
    description: 'Review and approve pending content submissions.',
    icon: '✅',
    status: 'Coming Soon',
  },
];

const MEDIA: AdminSection[] = [
  {
    title: 'Communication / Announcements',
    description: 'Create and manage announcements for users.',
    icon: '📢',
    view: 'announcementManagement',
    status: 'Open',
  },
  {
    title: 'Media Manager',
    description: 'Upload, organize, and manage images and videos.',
    icon: '🖼️',
    status: 'Coming Soon',
  },
  {
    title: 'Audio Manager',
    description: 'Manage audio recordings and pronunciation files.',
    icon: '🎵',
    status: 'Coming Soon',
  },
];

const INSIGHTS: AdminSection[] = [
  {
    title: 'Analytics',
    description: 'View detailed analytics and usage insights.',
    icon: '📈',
    status: 'Coming Soon',
  },
  {
    title: 'Gamification',
    description: 'Manage points, badges, streaks, and rewards.',
    icon: '🏆',
    status: 'Coming Soon',
  },
  {
    title: 'Activity / Audit Logs',
    description: 'Track user actions and system events.',
    icon: '📋',
    status: 'Coming Soon',
  },
];

const SYSTEM: AdminSection[] = [
  {
    title: 'Security Center',
    description: 'Monitor security events and manage access controls.',
    icon: '🔒',
    status: 'Coming Soon',
  },
  {
    title: 'Issues / Bug Center',
    description: 'Track and manage reported bugs and issues.',
    icon: '🐛',
    status: 'Coming Soon',
  },
  {
    title: 'Testing Center',
    description: 'Preview the app as different roles safely.',
    icon: '🧪',
    view: 'testingCenter',
    status: 'Open',
  },
  {
    title: 'Trash & Recovery',
    description: 'Restore deleted content and manage trash.',
    icon: '🗑️',
    status: 'Coming Soon',
  },
  {
    title: 'Backup & Data',
    description: 'Manage database backups and data exports.',
    icon: '💾',
    status: 'Coming Soon',
  },
  {
    title: 'Import / Export',
    description: 'Import or export content and configuration.',
    icon: '📥',
    status: 'Coming Soon',
  },
  {
    title: 'Feature Flags',
    description: 'Toggle app features and roll out experiments.',
    icon: '🚩',
    view: 'featureControl',
    status: 'Open',
  },
  {
    title: 'Maintenance',
    description: 'Schedule maintenance and manage downtime.',
    icon: '🔧',
    status: 'Coming Soon',
  },
  {
    title: 'Release Management',
    description: 'Manage app releases and version deployments.',
    icon: '🚀',
    status: 'Coming Soon',
  },
];

const PLATFORM: AdminSection[] = [
  {
    title: 'App Customization',
    description: 'Customize app branding, themes, and UI.',
    icon: '🎨',
    status: 'Coming Soon',
  },
  {
    title: 'AI Center',
    description: 'Manage AI features, prompts, and integrations.',
    icon: '🤖',
    status: 'Coming Soon',
  },
  {
    title: 'Language Management',
    description: 'Manage supported languages and translations.',
    icon: '🌐',
    status: 'Coming Soon',
  },
];

const CATEGORIES = [
  { title: 'General', sections: GENERAL },
  { title: 'Users & Access', sections: USERS },
  { title: 'Content', sections: CONTENT },
  { title: 'Media & Communication', sections: MEDIA },
  { title: 'Insights', sections: INSIGHTS },
  { title: 'System', sections: SYSTEM },
  { title: 'Platform', sections: PLATFORM },
];

export function SuperAdminView({ onNavigate, theme }: Props) {
  const navigateTo = (view?: View) => {
    if (view) onNavigate(view);
  };

  const sections = CATEGORIES.map((category) => ({
    ...category,
    sections: category.sections.map((section) => ({
      ...section,
      onClick: section.view ? () => navigateTo(section.view) : undefined,
    })),
  }));

  return (
    <div className="screen-shell mx-auto max-w-5xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary-900 md:text-4xl">Super Admin Control Center</h1>
        <p className="mt-2 text-sm text-primary-700">
          Manage users, content, and system settings from one place.
        </p>
      </div>

      <div className="space-y-8">
        {sections.map((category) => (
          <section key={category.title}>
            <h2 className="mb-4 text-lg font-bold text-primary-900">{category.title}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {category.sections.map((section, index) => {
                const isClickable = typeof section.onClick === 'function';
                return (
                  <div
                    key={section.title}
                    onClick={section.onClick}
                    className={`liquid-panel rounded-[1.4rem] p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${isClickable ? 'cursor-pointer' : ''}`}
                    style={{
                      border: `1px solid ${theme.border}`,
                      background: theme.surface,
                      animationDelay: `${index * 60}ms`,
                    }}
                    role={isClickable ? 'button' : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') section.onClick?.(); } : undefined}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: theme.accentSoft }}>
                          {section.icon}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-primary-900">{section.title}</h3>
                          <p className="mt-1 text-xs text-primary-700">{section.description}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${isClickable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {section.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 rounded-[1.4rem] border border-yellow-200 bg-yellow-50/50 p-4">
        <p className="text-sm font-bold text-yellow-900">⚠️ Restricted Access</p>
        <p className="mt-1 text-xs text-yellow-800">
          This area is only accessible to authenticated Super Admins. All actions are logged and monitored.
        </p>
      </div>
    </div>
  );
}

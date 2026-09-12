import type { View } from '@/types';
import { CLASS_THEMES } from '@/theme';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
}

export function SuperAdminView({ onNavigate, theme }: Props) {
  const handleContentManagement = () => {
    onNavigate('cms');
  };

  const handleFeatureControl = () => {
    onNavigate('featureControl');
  };

  const handleAnnouncementManagement = () => {
    onNavigate('announcementManagement');
  };

  const cards = [
    {
      title: 'Feature Control',
      description: 'Enable or disable app features for different classes and roles.',
      icon: '🎛️',
      status: 'Open',
      onClick: handleFeatureControl,
    },
    {
      title: 'Announcement Management',
      description: 'Create and manage announcements for users.',
      icon: '📢',
      status: 'Open',
      onClick: handleAnnouncementManagement,
    },
    {
      title: 'User Management',
      description: 'View and manage user accounts, roles, and permissions.',
      icon: '👥',
      status: 'Coming Soon',
      onClick: undefined as (() => void) | undefined,
    },
    {
      title: 'Content Management',
      description: 'Manage Arabic letters, words, images, and learning content.',
      icon: '📚',
      status: 'Open CMS',
      onClick: handleContentManagement,
    },
    {
      title: 'Analytics & Reports',
      description: 'View learning progress, quiz results, and app usage statistics.',
      icon: '📊',
      status: 'Coming Soon',
      onClick: undefined as (() => void) | undefined,
    },
    {
      title: 'System Settings',
      description: 'Configure app settings, themes, and global preferences.',
      icon: '⚙️',
      status: 'Coming Soon',
      onClick: undefined as (() => void) | undefined,
    },
  ];

  return (
    <div className="screen-shell mx-auto max-w-5xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary-900 md:text-4xl">Super Admin Control Center</h1>
        <p className="mt-2 text-sm text-primary-700">
          Welcome to the administrative dashboard. Manage users, content, and system settings from here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map((card, index) => {
          const isClickable = typeof card.onClick === 'function';
          return (
            <div
              key={card.title}
              onClick={card.onClick}
              className={`liquid-panel rounded-[1.4rem] p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${isClickable ? 'cursor-pointer' : ''}`}
              style={{
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                animationDelay: `${index * 80}ms`,
              }}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') card.onClick?.(); } : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: theme.accentSoft }}>
                    {card.icon}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-primary-900">{card.title}</h3>
                    <p className="mt-1 text-xs text-primary-700">{card.description}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${isClickable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {card.status}
                </span>
              </div>
            </div>
          );
        })}
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

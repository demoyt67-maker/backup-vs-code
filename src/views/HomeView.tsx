import { PenTool, BookOpen, BarChart3, PlayCircle, GraduationCap, Sparkles } from 'lucide-react';
import type { View } from '@/types';
import type { ScoreData } from '@/hooks/useScoreStore';
import { CLASS_THEMES } from '@/theme';

type AppearanceMode = 'light' | 'dark' | 'system';

interface Props {
  onNavigate: (v: View) => void;
  score: ScoreData;
  selectedClass: 1 | 2 | 3;
  onSelectClass: (level: 1 | 2 | 3) => void;
  theme: (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];
  appearanceMode: AppearanceMode;
  onChangeAppearanceMode: (mode: AppearanceMode) => void;
  isSuperAdminMode: boolean;
  onToggleSuperAdminMode: () => void;
}

const CLASS_OPTIONS: { level: 1 | 2 | 3; title: string; subtitle: string; accent: string; badge: string }[] = [
  { level: 1, title: 'Class 1', subtitle: 'Beginner friendly • simple letters & tracing', accent: 'linear-gradient(135deg, #ffb8c9 0%, #ffd678 50%, #7adbc4 100%)', badge: 'bg-white/15' },
  { level: 2, title: 'Class 2', subtitle: 'Growing skills • letters, harakat, and practice', accent: 'linear-gradient(135deg, #90b5ff 0%, #5e77ef 48%, #ffc57a 100%)', badge: 'bg-white/15' },
  { level: 3, title: 'Class 3', subtitle: 'Advanced • full practice, quizzes, and word activities', accent: 'linear-gradient(135deg, #c9b9ff 0%, #756ae7 48%, #f7bf6d 100%)', badge: 'bg-white/15' },
];

export function HomeView({
  onNavigate,
  score,
  selectedClass,
  onSelectClass,
  theme,
  appearanceMode,
  onChangeAppearanceMode,
  isSuperAdminMode,
  onToggleSuperAdminMode,
}: Props) {
  const classLabel = `Class ${selectedClass}`;
  const classDescription =
    selectedClass === 1
      ? 'Simple beginner practice for young learners.'
      : selectedClass === 2
        ? 'Steady progress with letters, harakat, and guided practice.'
        : 'Full advanced pathway with all learning sets and activities.';

  const cardStyles = [theme.card1, theme.card2, theme.card3, theme.card1];
  const appearanceOptions: { mode: AppearanceMode; label: string; description: string }[] = [
    { mode: 'light', label: 'Light', description: 'Always light' },
    { mode: 'dark', label: 'Dark', description: 'Always dark' },
    { mode: 'system', label: 'System', description: 'Match device' },
  ];

  const cards: {
    view: View;
    label: string;
    desc: string;
    icon: typeof PlayCircle;
    featured?: boolean;
  }[] =
    selectedClass === 1
      ? [
          {
            view: 'quiz',
            label: 'Start Quiz',
            desc: 'Test your Arabic letters',
            icon: PlayCircle,
            featured: true,
          },
          {
            view: 'learn',
            label: 'Learn Arabic',
            desc: 'Explore all 28 letters',
            icon: BookOpen,
          },
          {
            view: 'writing',
            label: 'Writing Practice',
            desc: 'Trace Arabic letters',
            icon: PenTool,
          },
          {
            view: 'score',
            label: 'My Score',
            desc: 'See your progress',
            icon: BarChart3,
          },
        ]
      : [
          {
            view: 'learn',
            label: `Learn Class ${selectedClass}`,
            desc: 'Explore the new level content',
            icon: BookOpen,
            featured: true,
          },
          {
            view: 'score',
            label: 'My Score',
            desc: 'See your progress',
            icon: BarChart3,
          },
        ];

  return (
    <div className="home-shell mx-auto max-w-5xl animate-fade-in px-4 pb-28 pt-5 md:pb-12 md:pt-24">
      <div className="home-reveal liquid-panel mb-5 rounded-[1.8rem] p-3 md:p-4" style={{ borderColor: theme.border, background: theme.surface }}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: theme.primaryStrong }}>Welcome</p>
            <h2 className="mt-1 text-lg font-black leading-tight md:text-xl" style={{ color: theme.text }}>
              Current: Class {selectedClass}
            </h2>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg" style={{ background: theme.hero, boxShadow: `0 16px 28px ${theme.primary}44`, color: '#fff' }}>
            <GraduationCap size={18} />
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {CLASS_OPTIONS.map(({ level, title, accent }, index) => {
            const isSelected = selectedClass === level;
            return (
              <button
                key={level}
                onClick={() => onSelectClass(level)}
                className={`group relative flex items-center gap-2 rounded-[1rem] px-3 py-2 text-left transition-all active:scale-[0.98] ${isSelected ? 'ring-2 ring-white/90 shadow-lg' : 'ring-1 ring-white/40 hover:-translate-y-0.5'}`}
                style={{
                  background: isSelected ? accent : 'rgba(255,255,255,0.36)',
                  borderColor: isSelected ? 'rgba(255,255,255,0.7)' : theme.border,
                  color: isSelected ? '#fff' : theme.text,
                  animationDelay: `${index * 80}ms`,
                  boxShadow: isSelected ? `0 16px 28px ${theme.primary}35` : '0 10px 24px rgba(11, 66, 57, 0.06)',
                  transform: isSelected ? 'translateY(-1px)' : undefined,
                }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black" style={{ background: isSelected ? 'rgba(255,255,255,0.18)' : theme.accentSoft, color: isSelected ? '#fff' : theme.primaryStrong }}>
                  {level}
                </span>
                <span className="text-sm font-black">{title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero */}
      <div className="home-hero home-reveal relative overflow-hidden rounded-[2rem] px-5 py-6 text-white shadow-2xl shadow-primary-900/15 sm:px-8 sm:py-8 md:px-12 md:py-10" style={{ background: theme.hero }}>
        <div className="home-hero-lines pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative grid items-center gap-8 md:grid-cols-[1.15fr_0.85fr] md:gap-10">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90" style={{ background: theme.accentSoft }}>
              <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />
              Your Arabic learning space
            </span>
            <h1 className="mt-5 font-arabic text-5xl font-bold leading-none drop-shadow-sm sm:text-6xl md:text-7xl" style={{ color: theme.accent }}>
              مدرسة العربية
            </h1>
            <p className="mt-3 text-lg font-semibold tracking-tight text-white sm:text-xl">Madrasa Arabic Quiz</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#c4dfd5] md:text-base">{classDescription}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-left">
              <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90 ring-1 ring-white/15" style={{ background: theme.accentSoft }}>
                {classLabel}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2.5 text-left sm:flex sm:flex-wrap">
              <div className="rounded-2xl border border-white/10 bg-white/[0.08] px-3.5 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a9d9c8]">
                  <Sparkles size={13} className="text-gold-300" /> Best quiz
                </div>
                <p className="mt-1 text-lg font-bold text-white">{score.bestQuizScore}<span className="text-sm font-medium text-white/50">/{score.quizTotal}</span></p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.08] px-3.5 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a9d9c8]">
                  <PenTool size={13} className="text-[#78e5d0]" /> Writing
                </div>
                <p className="mt-1 text-lg font-bold text-white">{score.writingCompleted}<span className="text-sm font-medium text-white/50">/28 letters</span></p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-xs justify-center md:justify-end">
            <div className="home-emblem relative flex aspect-square w-48 items-center justify-center rounded-[2.25rem] border border-white/15 bg-[#1b5549] shadow-2xl shadow-black/20 sm:w-56">
              <div className="absolute inset-4 rounded-[1.75rem] border border-gold-300/25" />
              <div className="absolute inset-8 rounded-full border border-white/10" />
              <span className="relative font-arabic text-[8rem] font-bold leading-none text-gold-300 animate-float sm:text-[9rem]">م</span>
              <span className="absolute bottom-5 text-[10px] font-bold uppercase tracking-[0.28em] text-[#b8d9cd]">Learn · Practice</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:mt-7 md:grid-cols-3 md:gap-4">
        {cards.map(({ view, label, desc, icon: Icon, featured }, index) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={`home-reveal liquid-card interactive-card group relative min-h-[148px] overflow-hidden rounded-[1.4rem] p-4 text-left shadow-lg shadow-primary-900/10 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] sm:p-5 md:min-h-[170px] md:p-6 ${featured ? 'col-span-2 md:col-span-2' : ''} ${view === 'score' ? 'col-span-2 md:col-span-2' : ''}`}
            style={{ animationDelay: `${120 + index * 70}ms`, background: cardStyles[index] }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-20 transition-opacity group-hover:opacity-35" style={{ backgroundImage: 'linear-gradient(135deg, transparent 55%, rgba(255,255,255,0.3) 55%, transparent 56%)', backgroundSize: '18px 18px' }} />
            <div className="relative mb-5 flex h-11 w-11 items-center justify-center rounded-2xl shadow-inner backdrop-blur-sm transition-transform group-hover:scale-105 sm:h-12 sm:w-12" style={{ background: theme.accentSoft }}>
              <Icon size={26} className="text-white" strokeWidth={2.2} />
            </div>
            <div className="relative flex items-end justify-between gap-2">
              <div>
                <h3 className="text-base font-bold tracking-tight text-white md:text-lg">{label}</h3>
                <p className="mt-0.5 text-xs text-white/75 md:text-sm">{desc}</p>
              </div>
              {featured && <span className="hidden rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90 sm:inline">Begin here</span>}
            </div>
          </button>
        ))}
      </div>

      <div className="home-reveal mt-3 flex flex-col gap-3 md:mt-4">
        <div className="liquid-panel rounded-[1.4rem] p-3 shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: theme.primaryStrong }}>Appearance</p>
              <h3 className="mt-1 text-base font-bold" style={{ color: theme.text }}>Theme Mode</h3>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {appearanceOptions.map(({ mode, label, description }) => {
              const isActive = appearanceMode === mode;

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

        <button
          onClick={onToggleSuperAdminMode}
          className={`flex items-center justify-between gap-3 rounded-[1.4rem] p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] ${
            isSuperAdminMode
              ? 'border border-yellow-300 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-900'
              : 'border border-primary-100 bg-white/90 text-primary-900'
          }`}
          style={{ borderColor: isSuperAdminMode ? '#facc15' : theme.border, background: isSuperAdminMode ? 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)' : theme.surface, color: theme.text }}
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-lg shadow-sm">
              👑
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span className="text-base font-bold">{isSuperAdminMode ? 'Super Admin Test Mode Active' : 'Super Admin Test Mode'}</span>
              <span className="text-xs" style={{ color: isSuperAdminMode ? '#78350f' : theme.muted }}>
                {isSuperAdminMode ? 'Temporary developer mode is enabled' : 'Enable temporary testing access'}
              </span>
            </span>
          </span>
          <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ background: isSuperAdminMode ? '#facc15' : theme.accentSoft, color: isSuperAdminMode ? '#78350f' : theme.primaryStrong }}>
            {isSuperAdminMode ? 'ON' : 'OFF'}
          </span>
        </button>

        <button
          onClick={() => onNavigate('teacher')}
          className="interactive-card flex w-full items-center justify-between gap-3 rounded-[1.4rem] p-4 text-primary-900 shadow-sm hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] md:px-5"
          style={{ borderColor: theme.border, background: theme.surface, color: theme.text, animationDelay: '420ms' }}
        >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: theme.accentSoft, color: theme.primaryStrong }}>
            <GraduationCap size={22} />
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-base font-bold">Teacher Mode</span>
            <span className="text-xs" style={{ color: theme.muted }}>View student progress</span>
          </span>
        </span>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.primaryStrong }}>For educators</span>
        </button>
      </div>

      {/* Footer */}
      <p className="mt-7 text-center text-xs font-medium md:mt-9" style={{ color: theme.muted }}>
        Designed &amp; Developed By{' '}
        <span className="font-semibold text-primary-700/80">Ameen Ashraf</span>
      </p>
    </div>
  );
}

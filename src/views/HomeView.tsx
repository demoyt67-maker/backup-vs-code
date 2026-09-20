import { useState, useEffect, useRef } from 'react';
import { PenTool, BookOpen, BarChart3, PlayCircle, GraduationCap, Sparkles, Volume2 } from 'lucide-react';
import type { View } from '@/types';
import type { ScoreData } from '@/hooks/useScoreStore';
import { CLASS_THEMES } from '@/theme';
import { useFeatureControl } from '@/hooks/useFeatureControl';
import { supabase } from '@/lib/supabaseClient';

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

interface Announcement {
  id: string;
  title: string;
  message: string;
  announcement_type: 'text' | 'image';
  image_url: string | null;
  aspect_ratio: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface CarouselProps {
  items: Announcement[];
  theme: (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];
}

function Carousel({ items, theme }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoPlayTimer = useRef<ReturnType<typeof setTimeout>>();

  const goTo = (index: number) => {
    if (isTransitioning || items.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((index + items.length) % items.length);
    if (autoPlayTimer.current) {
      clearTimeout(autoPlayTimer.current);
    }
    autoPlayTimer.current = setTimeout(() => setIsTransitioning(false), 400);
  };

  const goNext = () => {
    if (items.length <= 1) return;
    goTo(currentIndex + 1);
  };

  const goPrev = () => {
    if (items.length <= 1) return;
    goTo(currentIndex - 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  useEffect(() => {
    if (items.length <= 1) return;
    autoPlayTimer.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
    };
  }, [items.length]);

  const resetAutoPlay = () => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
    }
    if (items.length > 1) {
      autoPlayTimer.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, 5000);
    }
  };

  const handleManualNav = (index: number) => {
    goTo(index);
    resetAutoPlay();
  };

  const renderItem = (announcement: Announcement) => {
    if (announcement.announcement_type === 'image' && announcement.image_url) {
      return (
        <div className="w-full">
          <div className="w-full overflow-hidden rounded-lg" style={{ aspectRatio: '5/1' }}>
            <img
              src={announcement.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      );
    }

    const displayTitle = !announcement.title.trim() ? 'Announcement' : announcement.title;

    return (
      <div className="flex items-center gap-3 p-3 md:p-4">
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <Volume2 size={16} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-primary-900 truncate">{displayTitle}</p>
          {announcement.message && (
            <p className="text-xs text-primary-700 truncate">{announcement.message}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="home-reveal relative overflow-hidden rounded-[1.4rem] border shadow-md" style={{ borderColor: theme.border, background: theme.surface }}>
      <div
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((announcement) => (
          <div key={announcement.id} className="w-full flex-shrink-0">
            {renderItem(announcement)}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button
            onClick={() => {
              goPrev();
              resetAutoPlay();
            }}
            className="absolute left-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary-700 shadow-md ring-1 ring-primary-100 transition-all hover:bg-white hover:scale-105 active:scale-95"
            aria-label="Previous announcement"
          >
            ‹
          </button>
          <button
            onClick={() => {
              goNext();
              resetAutoPlay();
            }}
            className="absolute right-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary-700 shadow-md ring-1 ring-primary-100 transition-all hover:bg-white hover:scale-105 active:scale-95"
            aria-label="Next announcement"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleManualNav(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-4 bg-primary-600' : 'w-1.5 bg-primary-300 hover:bg-primary-400'
                }`}
                aria-label={`Go to announcement ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
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
  const { isEnabled } = useFeatureControl();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementError, setAnnouncementError] = useState<string | null>(null);

  const classLabel = `Class ${selectedClass}`;
  const classDescription =
    selectedClass === 1
      ? 'Simple beginner practice for young learners.'
      : selectedClass === 2
        ? 'Steady progress with letters, harakat, and guided practice.'
        : 'Full advanced pathway with all learning sets and activities.';

  const cardStyles = [theme.card1, theme.card2, theme.card3, theme.card1];
  const dashboardCards = [
    {
      title: 'Continue Learning',
      value: selectedClass === 1 ? 'Letters, Harakat & Symbols' : selectedClass === 2 ? 'Tanween & Words' : 'No content yet',
      detail: selectedClass === 1 ? 'Beginner to intermediate Arabic practice.' : selectedClass === 2 ? 'Advanced practice with words and double vowels.' : 'Content coming soon.',
      tint: theme.card1,
    },
    {
      title: 'Learning Progress',
      value: `${Math.min(100, Math.round((score.writingCompleted / Math.max(score.quizTotal, 1)) * 100))}%`,
      detail: `${score.writingCompleted} of ${score.quizTotal} letters explored`,
      tint: theme.card2,
    },
    {
      title: 'Completed Activities',
      value: `${score.bestQuizScore}/${score.quizTotal}`,
      detail: 'Best quiz score saved so far',
      tint: theme.card3,
    },
    {
      title: 'Current Set',
      value: selectedClass === 1 ? 'Set 1' : selectedClass === 2 ? 'Set 5' : '—',
      detail: selectedClass === 1 ? 'Letters, harakat, and sukoon' : selectedClass === 2 ? 'Tanween and word activities' : 'No active content',
      tint: 'linear-gradient(135deg, rgba(255,255,255,0.24), rgba(255,255,255,0.14))',
    },
  ];
  const appearanceOptions: { mode: AppearanceMode; label: string; description: string }[] = [
    { mode: 'light', label: 'Light', description: 'Always light' },
    { mode: 'dark', label: 'Dark', description: 'Always dark' },
    { mode: 'system', label: 'System', description: 'Match device' },
  ];

  const viewToFeatureKey = (view: View): 'learning' | 'quiz' | 'writing' | 'harakat' | null => {
    if (view === 'learn') return 'learning';
    if (view === 'quiz') return 'quiz';
    if (view === 'writing') return 'writing';
    return null;
  };

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

  const visibleCards = cards.filter((card) => {
    const featureKey = viewToFeatureKey(card.view);
    return featureKey === null || isEnabled(featureKey);
  });

  useEffect(() => {
    let cancelled = false;

    async function loadAnnouncements() {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('id, title, message, announcement_type, image_url, aspect_ratio, is_active, expires_at, created_at')
          .eq('is_active', true)
          .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
          .order('created_at', { ascending: false });

        if (!cancelled) {
          if (error) {
            setAnnouncementError(error.message);
          } else if (data && data.length > 0) {
            setAnnouncements(data as Announcement[]);
          }
        }
      } catch {
        if (!cancelled) {
          setAnnouncementError('Failed to load announcements');
        }
      }
    }

    loadAnnouncements();

    return () => {
      cancelled = true;
    };
  }, []);

  const textAnnouncements = announcements.filter((a) => a.announcement_type === 'text');
  const imageAnnouncements = announcements.filter((a) => a.announcement_type === 'image');

  return (
    <div className="home-shell mx-auto max-w-5xl animate-fade-in px-4 pb-28 pt-5 md:pb-12 md:pt-24">
      {textAnnouncements.length > 0 && (
        <div className="mb-4">
          <Carousel items={textAnnouncements} theme={theme} />
        </div>
      )}

      {imageAnnouncements.length > 0 && (
        <div className="mb-5">
          <Carousel items={imageAnnouncements} theme={theme} />
        </div>
      )}

      {announcementError && (
        <div className="mb-4 rounded-[1.4rem] border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {announcementError}
        </div>
      )}

      <div className="home-reveal liquid-panel mb-5 rounded-[1.4rem] p-4 md:p-5" style={{ borderColor: theme.border, background: theme.surface }}>
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

      <div className="mt-5 grid gap-3 md:grid-cols-4 md:gap-4">
        {dashboardCards.map(({ title, value, detail, tint }, index) => (
          <div
            key={title}
            className="home-reveal rounded-[1.4rem] p-4 shadow-md shadow-primary-900/10 ring-1 ring-white/40"
            style={{ background: tint, animationDelay: `${140 + index * 70}ms` }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/80">{title}</p>
            <p className="mt-3 text-2xl font-black text-white">{value}</p>
            <p className="mt-1 text-xs text-white/80">{detail}</p>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:mt-7 md:grid-cols-3 md:gap-4">
        {visibleCards.map(({ view, label, desc, icon: Icon, featured }, index) => (
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

      <div className="mt-5 flex flex-col gap-3 md:mt-7">
        <div className="liquid-panel rounded-[1.4rem] p-4 md:p-5 shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
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
      </div>

      {/* Footer */}
      <p className="mt-7 text-center text-xs font-medium md:mt-9" style={{ color: theme.muted }}>
        Designed &amp; Developed By{' '}
        <span className="font-semibold text-primary-700/80">Ameen Ashraf</span>
      </p>
    </div>
  );
}

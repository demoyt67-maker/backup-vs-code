import { PenTool, BookOpen, BarChart3, PlayCircle, GraduationCap, Sparkles } from 'lucide-react';
import type { View } from '@/types';
import type { ScoreData } from '@/hooks/useScoreStore';

interface Props {
  onNavigate: (v: View) => void;
  score: ScoreData;
}

export function HomeView({ onNavigate, score }: Props) {
  const cards: {
    view: View;
    label: string;
    desc: string;
    icon: typeof PlayCircle;
    gradient: string;
    iconBg: string;
    featured?: boolean;
  }[] = [
    {
      view: 'quiz',
      label: 'Start Quiz',
      desc: 'Test your Arabic letters',
      icon: PlayCircle,
      gradient: 'from-[#0d6958] via-[#0c806c] to-[#159b7d]',
      iconBg: 'bg-white/20',
      featured: true,
    },
    {
      view: 'learn',
      label: 'Learn Arabic',
      desc: 'Explore all 28 letters',
      icon: BookOpen,
      gradient: 'from-[#0e7776] to-[#0e9f91]',
      iconBg: 'bg-white/20',
    },
    {
      view: 'writing',
      label: 'Writing Practice',
      desc: 'Trace Arabic letters',
      icon: PenTool,
      gradient: 'from-[#b77a27] to-[#d5a344]',
      iconBg: 'bg-white/20',
    },
    {
      view: 'score',
      label: 'My Score',
      desc: 'See your progress',
      icon: BarChart3,
      gradient: 'from-[#3c6173] to-[#287e7a]',
      iconBg: 'bg-white/20',
    },
  ];

  return (
    <div className="home-shell mx-auto max-w-5xl animate-fade-in px-4 pb-28 pt-5 md:pb-12 md:pt-24">
      {/* Hero */}
      <div className="home-hero home-reveal relative overflow-hidden rounded-[2rem] bg-[#123f38] px-5 py-6 text-white shadow-2xl shadow-primary-900/15 sm:px-8 sm:py-8 md:px-12 md:py-10">
        <div className="home-hero-lines pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative grid items-center gap-8 md:grid-cols-[1.15fr_0.85fr] md:gap-10">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-300/30 bg-gold-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gold-200">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />
              Your Arabic learning space
            </span>
            <h1 className="mt-5 font-arabic text-5xl font-bold leading-none text-[#f6d98b] drop-shadow-sm sm:text-6xl md:text-7xl">
              مدرسة العربية
            </h1>
            <p className="mt-3 text-lg font-semibold tracking-tight text-white sm:text-xl">Madrasa Arabic Quiz</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#c4dfd5] md:text-base">
              Learn the letters, practice your writing, and build confidence one step at a time.
            </p>

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
        {cards.map(({ view, label, desc, icon: Icon, gradient, iconBg, featured }, index) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            style={{ animationDelay: `${120 + index * 70}ms` }}
            className={`home-reveal group relative min-h-[148px] overflow-hidden rounded-[1.4rem] bg-gradient-to-br ${gradient} p-4 text-left shadow-lg shadow-primary-900/10 transition-all hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] sm:p-5 md:min-h-[170px] md:p-6 ${featured ? 'col-span-2 md:col-span-2' : ''} ${view === 'score' ? 'col-span-2 md:col-span-2' : ''}`}
          >
            <div className="pointer-events-none absolute inset-0 opacity-20 transition-opacity group-hover:opacity-35" style={{ backgroundImage: 'linear-gradient(135deg, transparent 55%, rgba(255,255,255,0.3) 55%, transparent 56%)', backgroundSize: '18px 18px' }} />
            <div className={`relative mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${iconBg} shadow-inner backdrop-blur-sm transition-transform group-hover:scale-105 sm:h-12 sm:w-12`}>
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

      {/* Teacher Mode */}
      <button
        onClick={() => onNavigate('teacher')}
        className="home-reveal mt-3 flex w-full items-center justify-between gap-3 rounded-[1.4rem] border border-[#dfd8c5] bg-[#fffdf8] p-4 text-primary-800 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] md:mt-4 md:px-5"
        style={{ animationDelay: '420ms' }}
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4e6bc] text-gold-700">
            <GraduationCap size={22} />
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-base font-bold">Teacher Mode</span>
            <span className="text-xs text-primary-600/70">View student progress</span>
          </span>
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-gold-700">For educators</span>
      </button>

      {/* Footer */}
      <p className="mt-7 text-center text-xs font-medium text-primary-700/50 md:mt-9">
        Designed &amp; Developed By{' '}
        <span className="font-semibold text-primary-700/80">Ameen Ashraf</span>
      </p>
    </div>
  );
}

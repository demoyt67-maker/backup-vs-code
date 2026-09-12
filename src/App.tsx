import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { TopNav, BottomNav } from '@/components/Navigation';
import { CLASS_THEMES } from '@/theme';
import { HomeView } from '@/views/HomeView';
import { QuizView } from '@/views/QuizView';
import { LearnView } from '@/views/LearnView';
import { WritingView } from '@/views/WritingView';
import { ScoreView } from '@/views/ScoreView';
import { SettingsView } from '@/views/SettingsView';
import { SuperAdminView } from '@/views/SuperAdminView';
import { FeatureControlView } from '@/views/FeatureControlView';
import { AnnouncementManagementView } from '@/views/AnnouncementManagementView';
import { DisabledFeatureView } from '@/views/DisabledFeatureView';
import { CMSView } from '@/views/CMSView';
import { useScoreStore } from '@/hooks/useScoreStore';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureControl } from '@/hooks/useFeatureControl';
import type { View } from '@/types';

export type ClassLevel = 1 | 2 | 3;
type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];
type AppearanceMode = 'light' | 'dark' | 'system';
type EffectiveAppearance = 'light' | 'dark';

const SELECTED_CLASS_KEY = 'madrasa-selected-class';
const SUPER_ADMIN_MODE_KEY = 'madrasa-super-admin-test-mode';
const APPEARANCE_MODE_KEY = 'madrasa-appearance-mode';

const CLASS_OPTIONS: { level: ClassLevel; title: string; subtitle: string; accent: string; badge: string }[] = [
  { level: 1, title: 'Class 1', subtitle: 'Beginner friendly • simple letters & tracing', accent: 'linear-gradient(135deg, #ffb8c9 0%, #ffd678 50%, #7adbc4 100%)', badge: 'bg-white/15' },
  { level: 2, title: 'Class 2', subtitle: 'Growing skills • letters, harakat, and practice', accent: 'linear-gradient(135deg, #90b5ff 0%, #5e77ef 48%, #ffc57a 100%)', badge: 'bg-white/15' },
  { level: 3, title: 'Class 3', subtitle: 'Advanced • full practice, quizzes, and word activities', accent: 'linear-gradient(135deg, #c9b9ff 0%, #756ae7 48%, #f7bf6d 100%)', badge: 'bg-white/15' },
];

function loadSelectedClass(): ClassLevel | null {
  try {
    const raw = localStorage.getItem(SELECTED_CLASS_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    if (parsed === 1 || parsed === 2 || parsed === 3) return parsed as ClassLevel;
  } catch {
    // ignore
  }
  return null;
}

function saveSelectedClass(level: ClassLevel) {
  try {
    localStorage.setItem(SELECTED_CLASS_KEY, String(level));
  } catch {
    // ignore
  }
}

function loadSuperAdminMode(): boolean {
  try {
    const raw = localStorage.getItem(SUPER_ADMIN_MODE_KEY);
    return raw === 'true';
  } catch {
    return false;
  }
}

function saveSuperAdminMode(enabled: boolean) {
  try {
    localStorage.setItem(SUPER_ADMIN_MODE_KEY, String(enabled));
  } catch {
    // ignore
  }
}

function loadAppearanceMode(): AppearanceMode {
  try {
    const raw = localStorage.getItem(APPEARANCE_MODE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      return raw;
    }
  } catch {
    // ignore
  }
  return 'system';
}

function saveAppearanceMode(mode: AppearanceMode) {
  try {
    localStorage.setItem(APPEARANCE_MODE_KEY, mode);
  } catch {
    // ignore
  }
}

function getEffectiveAppearance(mode: AppearanceMode, prefersDark: boolean): EffectiveAppearance {
  return mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
}

function applyAppearanceMode(theme: Theme, appearance: EffectiveAppearance): Theme {
  const isDark = appearance === 'dark';

  return {
    ...theme,
    surface: isDark ? '#111827' : theme.surface,
    surfaceStrong: isDark ? '#1f2937' : theme.surfaceStrong,
    background: isDark ? '#0b1220' : theme.background,
    text: isDark ? '#f3f7ff' : theme.text,
    muted: isDark ? '#cbd5e1' : theme.muted,
    border: isDark ? 'rgba(255,255,255,0.12)' : theme.border,
    heroGlow: isDark
      ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.22), rgba(255,255,255,0.06) 42%, rgba(148,163,184,0.18))'
      : theme.heroGlow,
    styleVars: {
      ...theme.styleVars,
      '--theme-surface': isDark ? '#111827' : theme.styleVars['--theme-surface'],
      '--theme-surface-strong': isDark ? '#1f2937' : theme.styleVars['--theme-surface-strong'],
      '--theme-background': isDark ? '#0b1220' : theme.styleVars['--theme-background'],
      '--theme-text': isDark ? '#f3f7ff' : theme.styleVars['--theme-text'],
      '--theme-muted': isDark ? '#cbd5e1' : theme.styleVars['--theme-muted'],
      '--theme-border': isDark ? 'rgba(255,255,255,0.12)' : theme.styleVars['--theme-border'],
      '--theme-hero-glow': isDark
        ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.22), rgba(255,255,255,0.06) 42%, rgba(148,163,184,0.18))'
        : theme.styleVars['--theme-hero-glow'],
    },
  };
}

function ClassSelectionScreen({ onSelect, currentClass }: { onSelect: (level: ClassLevel) => void; currentClass: ClassLevel | null }) {
  return (
    <div className="screen-shell mx-auto max-w-5xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <div className="mb-6 text-center">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-800">Welcome</p>
        <h1 className="mt-2 font-arabic text-4xl font-bold text-primary-900 md:text-5xl">مدرسة العربية</h1>
        <p className="mt-2 text-sm font-medium text-primary-700 md:text-base">
          Choose your class to begin your Arabic learning journey.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {CLASS_OPTIONS.map(({ level, title, subtitle, accent, badge }, index) => {
          const isSelected = currentClass === level;
          return (
            <button
              key={level}
              onClick={() => onSelect(level)}
              className={`group animate-pop-in overflow-hidden rounded-[2rem] p-5 text-left text-white shadow-xl shadow-primary-900/10 transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98] ${isSelected ? 'ring-4 ring-white/90 shadow-2xl' : 'ring-1 ring-white/20'}`}
              style={{ background: accent, animationDelay: `${index * 120}ms`, transform: isSelected ? 'translateY(-2px)' : undefined }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl backdrop-blur-sm ${badge}`}>
                  <span className="text-xl font-black">{level}</span>
                </div>
                {isSelected && (
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                    Selected
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black">{title}</h2>
              <p className="mt-2 text-sm text-white/85">{subtitle}</p>
              <div className="mt-5 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white/90">
                {isSelected ? 'Currently active' : 'Start learning'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const theme = CLASS_THEMES[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: theme.background }}>
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="mb-6 flex justify-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-3xl font-arabic text-4xl font-bold text-white shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryStrong} 100%)`,
              boxShadow: `0 20px 40px ${theme.primary}44`,
            }}
          >
            م
          </div>
        </div>
        <h1 className="font-arabic text-4xl font-bold text-primary-900 md:text-5xl">مدرسة العربية</h1>
        <p className="mt-3 text-lg font-semibold text-primary-700">Madrasa Arabic Quiz</p>
        <p className="mt-2 text-sm text-primary-600">
          Learn Arabic letters, words, and pronunciation the fun way.
        </p>
        <button
          onClick={onLogin}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-primary-900 shadow-lg ring-1 ring-primary-100 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  const theme = CLASS_THEMES[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: theme.background }}>
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-700"></div>
        <p className="text-sm font-medium text-primary-700">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState<View>('home');
  const [selectedClass, setSelectedClass] = useState<ClassLevel | null>(() => loadSelectedClass());
  const [isSuperAdminMode, setIsSuperAdminMode] = useState<boolean>(() => loadSuperAdminMode());
  const [appearanceMode, setAppearanceMode] = useState<AppearanceMode>(() => loadAppearanceMode());
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const { user, loading, initialized, login, logout, isSuperAdmin } = useAuth();
  const { isEnabled, features } = useFeatureControl();

  useEffect(() => {
    if (isSuperAdmin && !isSuperAdminMode) {
      setIsSuperAdminMode(true);
      saveSuperAdminMode(true);
    }
  }, [isSuperAdmin, isSuperAdminMode]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches);

    setSystemPrefersDark(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const path = window.location.pathname;

    if (path !== '/auth/callback') return;

    if (!initialized || loading) {
      return;
    }

    if (user) {
      window.history.replaceState(null, '', '/');
      setView('home');
    } else {
      window.history.replaceState(null, '', '/');
    }
  }, [initialized, loading, user]);

  const currentClassOnSelection = selectedClass ?? loadSelectedClass();
  const effectiveAppearance = getEffectiveAppearance(appearanceMode, systemPrefersDark);
  const selectedTheme: Theme = useMemo(
    () => applyAppearanceMode(CLASS_THEMES[currentClassOnSelection ?? 1], effectiveAppearance),
    [currentClassOnSelection, effectiveAppearance]
  );

  const { data, recordQuizResult, recordWritingProgress, resetAll } = useScoreStore(selectedClass ?? 1);
  const {
    learned, toggleLetter,
    harakatLearned, toggleHarakat, markHarakat,
    readingPracticeLearned, markReadingPractice,
    interactiveHarakatPracticeLearned, markInteractiveHarakatPractice,
    sukoonLearned, toggleSukoon,
    tanweenLearned, toggleTanween,
    wordsLearned, toggleWord, markWord,
    resetLearning,
  } = useLearningProgress(selectedClass ?? 1);
  const navigate = useCallback((v: View) => {
    if (v === 'featureControl') {
      if (!isSuperAdmin || !isSuperAdminMode) return;
    } else if (v !== 'home' && v !== 'settings' && v !== 'superAdmin' && v !== 'cms' && !isEnabled(v as 'learning' | 'quiz' | 'writing' | 'harakat')) {
      return;
    }
    setView(v);
  }, [isEnabled, isSuperAdmin, isSuperAdminMode]);
  const goHome = useCallback(() => setView('home'), []);
  const handleSelectClass = useCallback((level: ClassLevel) => {
    saveSelectedClass(level);
    setSelectedClass(level);
    setView('home');
  }, []);
  const toggleSuperAdminMode = useCallback(() => {
    setIsSuperAdminMode((prev) => {
      const next = !prev;
      saveSuperAdminMode(next);
      return next;
    });
  }, []);

  const updateAppearanceMode = useCallback((mode: AppearanceMode) => {
    setAppearanceMode(mode);
    saveAppearanceMode(mode);
  }, []);
  const resetEverything = useCallback(() => {
    resetAll();
    resetLearning();
  }, [resetAll, resetLearning]);

  const enabledViews = useMemo<View[]>(() => {
    const views: View[] = ['home', 'score', 'settings'];
    if (isEnabled('learning')) views.push('learn');
    if (isEnabled('quiz')) views.push('quiz');
    if (isEnabled('writing')) views.push('writing');
    if (isSuperAdmin && isSuperAdminMode) {
      views.push('superAdmin');
      views.push('cms');
      views.push('featureControl');
    }
    return views;
  }, [isEnabled, isSuperAdmin, isSuperAdminMode]);

  if (!initialized || loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <div
      className="islamic-pattern min-h-screen"
      style={{
        ...(selectedTheme.styleVars as CSSProperties),
        colorScheme: effectiveAppearance,
        transition: 'background-color 500ms ease, color 500ms ease, border-color 500ms ease, box-shadow 500ms ease, background 500ms ease',
      }}
    >
      <TopNav current={view} onNavigate={navigate} theme={selectedTheme} selectedClass={selectedClass ?? 1} isSuperAdminMode={isSuperAdminMode} enabledViews={enabledViews} user={user} loading={loading} isSuperAdmin={isSuperAdmin} onLogout={logout} />
      <main className="md:pt-0">
        {!selectedClass && <ClassSelectionScreen onSelect={handleSelectClass} currentClass={currentClassOnSelection} />}
        {selectedClass && view === 'home' && (
          <HomeView
            onNavigate={navigate}
            score={data}
            selectedClass={selectedClass}
            onSelectClass={handleSelectClass}
            theme={selectedTheme}
            appearanceMode={appearanceMode}
            onChangeAppearanceMode={updateAppearanceMode}
            isSuperAdminMode={isSuperAdminMode}
            onToggleSuperAdminMode={toggleSuperAdminMode}
          />
        )}
        {selectedClass && selectedClass === 1 && view === 'quiz' && isEnabled('quiz') && (
          <QuizView
            onHome={goHome}
            onFinish={recordQuizResult}
            selectedClass={selectedClass}
            learned={learned}
          />
        )}
        {selectedClass && selectedClass === 1 && view === 'quiz' && !isEnabled('quiz') && (
          <DisabledFeatureView onNavigate={navigate} theme={selectedTheme} featureName="Quiz" />
        )}
        {selectedClass && view === 'learn' && isEnabled('learning') && (
          <LearnView
            onHome={goHome}
            learned={learned}
            onToggleLetter={toggleLetter}
            harakatLearned={harakatLearned}
            onToggleHarakat={toggleHarakat}
            onMarkHarakat={markHarakat}
            readingPracticeLearned={readingPracticeLearned}
            onMarkReadingPractice={markReadingPractice}
            interactiveHarakatPracticeLearned={interactiveHarakatPracticeLearned}
            onMarkInteractiveHarakatPractice={markInteractiveHarakatPractice}
            sukoonLearned={sukoonLearned}
            onToggleSukoon={toggleSukoon}
            tanweenLearned={tanweenLearned}
            onToggleTanween={toggleTanween}
            wordsLearned={wordsLearned}
            onToggleWord={toggleWord}
            onMarkWord={markWord}
            onResetLearning={resetLearning}
            selectedClass={selectedClass}
            isSuperAdminMode={isSuperAdminMode}
          />
        )}
        {selectedClass && view === 'learn' && !isEnabled('learning') && (
          <DisabledFeatureView onNavigate={navigate} theme={selectedTheme} featureName="Learning" />
        )}
        {selectedClass && selectedClass === 1 && view === 'writing' && isEnabled('writing') && (
          <WritingView
            onHome={goHome}
            startLetter={data.writingUnlocked}
            onProgress={recordWritingProgress}
            selectedClass={selectedClass}
          />
        )}
        {selectedClass && selectedClass === 1 && view === 'writing' && !isEnabled('writing') && (
          <DisabledFeatureView onNavigate={navigate} theme={selectedTheme} featureName="Writing Practice" />
        )}
        {selectedClass && view === 'score' && <ScoreView onHome={goHome} score={data} onReset={resetEverything} />}
        {selectedClass && view === 'settings' && (
          <SettingsView
            onNavigate={navigate}
            theme={selectedTheme}
            isSuperAdmin={isSuperAdmin}
            isSuperAdminMode={isSuperAdminMode}
            onToggleSuperAdminMode={toggleSuperAdminMode}
            appearanceMode={appearanceMode}
            onChangeAppearanceMode={updateAppearanceMode}
            user={user}
            onLogout={logout}
          />
        )}
        {selectedClass && view === 'superAdmin' && isSuperAdmin && isSuperAdminMode && (
          <SuperAdminView
            onNavigate={navigate}
            theme={selectedTheme}
          />
        )}
        {selectedClass && view === 'featureControl' && isSuperAdmin && isSuperAdminMode && (
          <FeatureControlView
            onNavigate={navigate}
            theme={selectedTheme}
          />
        )}
        {selectedClass && view === 'featureControl' && !(isSuperAdmin && isSuperAdminMode) && (
          <DisabledFeatureView onNavigate={navigate} theme={selectedTheme} />
        )}
        {selectedClass && view === 'announcementManagement' && isSuperAdmin && isSuperAdminMode && (
          <AnnouncementManagementView
            onNavigate={navigate}
            theme={selectedTheme}
          />
        )}
        {selectedClass && view === 'cms' && isSuperAdmin && isSuperAdminMode && (
          <CMSView
            onNavigate={navigate}
            theme={selectedTheme}
          />
        )}
      </main>
      {selectedClass && view !== 'home' && view !== 'settings' && view !== 'superAdmin' && view !== 'featureControl' && view !== 'announcementManagement' && view !== 'cms' && (
        <BottomNav current={view} onNavigate={navigate} theme={selectedTheme} selectedClass={selectedClass ?? 1} isSuperAdminMode={isSuperAdminMode} enabledViews={enabledViews} user={user} loading={loading} isSuperAdmin={isSuperAdmin} onLogout={logout} />
      )}
    </div>
  );
}

export default App;

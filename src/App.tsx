import { useCallback, useState, type CSSProperties } from 'react';
import { TopNav, BottomNav } from '@/components/Navigation';
import { CLASS_THEMES } from '@/theme';
import { HomeView } from '@/views/HomeView';
import { QuizView } from '@/views/QuizView';
import { LearnView } from '@/views/LearnView';
import { WritingView } from '@/views/WritingView';
import { ScoreView } from '@/views/ScoreView';
import { TeacherView } from '@/views/TeacherView';
import { useScoreStore } from '@/hooks/useScoreStore';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useTeacherAuth } from '@/hooks/useTeacherAuth';
import { useTeacherCurriculum } from '@/hooks/useTeacherCurriculum';
import type { View } from '@/types';

export type ClassLevel = 1 | 2 | 3;
type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

const SELECTED_CLASS_KEY = 'madrasa-selected-class';

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

function App() {
  const [view, setView] = useState<View>('home');
  const [selectedClass, setSelectedClass] = useState<ClassLevel | null>(() => loadSelectedClass());
  const currentClassOnSelection = selectedClass ?? loadSelectedClass();
  const selectedTheme: Theme = CLASS_THEMES[currentClassOnSelection ?? 1];
  const { data, recordQuizResult, recordWritingProgress, resetAll } = useScoreStore(selectedClass ?? 1);
  const {
    learned, toggleLetter,
    harakatLearned, toggleHarakat, markHarakat,
    letterSoundPracticeLearned, markLetterSoundPractice,
    sukoonLearned, toggleSukoon,
    tanweenLearned, toggleTanween,
    wordsLearned, toggleWord, markWord,
    resetLearning,
  } = useLearningProgress(selectedClass ?? 1);
  const { isLoggedIn, hasAccount, username, login, logout, createAccount, updateCredentials } = useTeacherAuth();
  const curriculum = useTeacherCurriculum();

  const navigate = useCallback((v: View) => setView(v), []);
  const goHome = useCallback(() => setView('home'), []);
  const handleSelectClass = useCallback((level: ClassLevel) => {
    saveSelectedClass(level);
    setSelectedClass(level);
    setView('home');
  }, []);
  const resetEverything = useCallback(() => {
    resetAll();
    resetLearning();
  }, [resetAll, resetLearning]);

  return (
    <div
      className="islamic-pattern min-h-screen"
      style={{
        ...(selectedTheme.styleVars as CSSProperties),
        transition: 'background-color 500ms ease, color 500ms ease, border-color 500ms ease, box-shadow 500ms ease, background 500ms ease',
      }}
    >
      <TopNav current={view} onNavigate={navigate} theme={selectedTheme} selectedClass={selectedClass ?? 1} />
      <main className="md:pt-0">
        {!selectedClass && <ClassSelectionScreen onSelect={handleSelectClass} currentClass={currentClassOnSelection} />}
        {selectedClass && view === 'home' && (
          <HomeView
            onNavigate={navigate}
            score={data}
            selectedClass={selectedClass}
            onSelectClass={handleSelectClass}
            theme={selectedTheme}
          />
        )}
        {selectedClass && selectedClass === 1 && view === 'quiz' && (
          <QuizView
            onHome={goHome}
            onFinish={recordQuizResult}
            selectedClass={selectedClass}
            learned={learned}
          />
        )}
        {selectedClass && view === 'learn' && (
          <LearnView
            onHome={goHome}
            learned={learned}
            onToggleLetter={toggleLetter}
            harakatLearned={harakatLearned}
            onToggleHarakat={toggleHarakat}
            onMarkHarakat={markHarakat}
            letterSoundPracticeLearned={letterSoundPracticeLearned}
            onMarkLetterSoundPractice={markLetterSoundPractice}
            sukoonLearned={sukoonLearned}
            onToggleSukoon={toggleSukoon}
            tanweenLearned={tanweenLearned}
            onToggleTanween={toggleTanween}
            wordsLearned={wordsLearned}
            onToggleWord={toggleWord}
            onMarkWord={markWord}
            onResetLearning={resetLearning}
            selectedClass={selectedClass}
          />
        )}
        {selectedClass && selectedClass === 1 && view === 'writing' && (
          <WritingView
            onHome={goHome}
            startLetter={data.writingUnlocked}
            onProgress={recordWritingProgress}
            selectedClass={selectedClass}
          />
        )}
        {selectedClass && view === 'score' && <ScoreView onHome={goHome} score={data} onReset={resetEverything} />}
        {selectedClass && view === 'teacher' && (
          <TeacherView
            onHome={goHome}
            score={data}
            onReset={resetEverything}
            isLoggedIn={isLoggedIn}
            hasAccount={hasAccount}
            username={username}
            onLogin={login}
            onLogout={logout}
            onCreateAccount={createAccount}
            onUpdateCredentials={updateCredentials}
            curriculum={curriculum}
            learningProgress={{ learned, harakatLearned, sukoonLearned, tanweenLearned, wordsLearned }}
          />
        )}
      </main>
      <BottomNav current={view} onNavigate={navigate} theme={selectedTheme} selectedClass={selectedClass ?? 1} />
    </div>
  );
}

export default App;

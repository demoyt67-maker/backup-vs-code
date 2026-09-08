import { useCallback, useState } from 'react';
import { TopNav, BottomNav } from '@/components/Navigation';
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

function App() {
  const [view, setView] = useState<View>('home');
  const { data, recordQuizResult, recordWritingProgress, resetAll } = useScoreStore();
  const {
    learned, toggleLetter,
    harakatLearned, toggleHarakat, markHarakat,
    sukoonLearned, toggleSukoon, markSukoon,
    tanweenLearned, toggleTanween, markTanween,
    wordsLearned, toggleWord, markWord,
    resetLearning,
  } = useLearningProgress();
  const { isLoggedIn, hasAccount, username, login, logout, createAccount, updateCredentials } = useTeacherAuth();
  const curriculum = useTeacherCurriculum();

  const navigate = useCallback((v: View) => setView(v), []);
  const goHome = useCallback(() => setView('home'), []);
  const resetEverything = useCallback(() => {
    resetAll();
    resetLearning();
  }, [resetAll, resetLearning]);

  return (
    <div className="islamic-pattern min-h-screen">
      <TopNav current={view} onNavigate={navigate} />
      <main className="md:pt-0">
        {view === 'home' && <HomeView onNavigate={navigate} score={data} />}
        {view === 'quiz' && <QuizView onHome={goHome} onFinish={recordQuizResult} />}
        {view === 'learn' && (
          <LearnView
            onHome={goHome}
            learned={learned}
            onToggleLetter={toggleLetter}
            harakatLearned={harakatLearned}
            onToggleHarakat={toggleHarakat}
            onMarkHarakat={markHarakat}
            sukoonLearned={sukoonLearned}
            onToggleSukoon={toggleSukoon}
            onMarkSukoon={markSukoon}
            tanweenLearned={tanweenLearned}
            onToggleTanween={toggleTanween}
            onMarkTanween={markTanween}
            wordsLearned={wordsLearned}
            onToggleWord={toggleWord}
            onMarkWord={markWord}
            onResetLearning={resetLearning}
          />
        )}
        {view === 'writing' && (
          <WritingView
            onHome={goHome}
            startLetter={data.writingUnlocked}
            onProgress={recordWritingProgress}
          />
        )}
        {view === 'score' && <ScoreView onHome={goHome} score={data} onReset={resetEverything} />}
        {view === 'teacher' && (
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
      <BottomNav current={view} onNavigate={navigate} />
    </div>
  );
}

export default App;

import { useCallback, useMemo, useState, useEffect } from 'react';
import { Check, X, RotateCcw, Home, ArrowRight, Trophy, Loader2 } from 'lucide-react';
import { BackHeader } from '@/components/BackHeader';
import { getQuizQuestions, getQuizSetIds, type QuizQuestion } from '@/lib/supabaseClient';
import { ARABIC_LETTERS } from '@/data/letters';

interface Props {
  onHome: () => void;
  onFinish: (score: number) => void;
  selectedClass: 1 | 2 | 3;
  learned?: Set<number>;
  isSuperAdminMode?: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateLetterQuizQuestions(classLevel: number): QuizQuestion[] {
  const letters = ARABIC_LETTERS;
  const questions: QuizQuestion[] = [];

  for (const letter of letters) {
    const wrongOptions = ARABIC_LETTERS.filter((l) => l.index !== letter.index);
    const shuffledWrong = shuffle(wrongOptions);
    const options = shuffle([letter, ...shuffledWrong.slice(0, 3)]);

    const correctIndex = options.findIndex((o) => o.index === letter.index);
    const correctOption = ['A', 'B', 'C', 'D'][correctIndex] as 'A' | 'B' | 'C' | 'D';

    questions.push({
      id: `letter-quiz-${classLevel}-${letter.index}`,
      class_level: classLevel,
      set_id: 'letter-quiz',
      question_text: 'What is this Arabic letter?',
      malayalam_text: letter.malayalam,
      english_transliteration: letter.english,
      option_a: options[0].arabic,
      option_b: options[1].arabic,
      option_c: options[2].arabic,
      option_d: options[3].arabic,
      correct_option: correctOption,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
      deletion_reason: null,
    });
  }

  return questions;
}

export function QuizView({ onHome, onFinish, selectedClass, isSuperAdminMode }: Props) {
  const [setId, setSetId] = useState<string>('');
  const [availableSets, setAvailableSets] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [adminCompleted, setAdminCompleted] = useState(false);
  const [showNextSetConfirm, setShowNextSetConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setQuestions([]);
    setQIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedOption(null);
    setFinished(false);
    setAdminCompleted(false);
    setShowNextSetConfirm(false);

    getQuizSetIds(selectedClass).then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        setError('Failed to load quiz sets');
        setLoading(false);
        return;
      }

      let sets = [...data];
      if (selectedClass === 1) {
        sets = ['letter-quiz', ...sets];
      }

      setAvailableSets(sets);
      if (sets.length > 0) {
        setSetId(sets[0]);
      } else {
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [selectedClass]);

  useEffect(() => {
    if (!setId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setQuestions([]);
    setQIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedOption(null);
    setFinished(false);
    setAdminCompleted(false);
    setShowNextSetConfirm(false);

    if (setId === 'letter-quiz') {
      const generated = generateLetterQuizQuestions(selectedClass);
      if (!cancelled) {
        setQuestions(generated);
        setLoading(false);
      }
    } else {
      getQuizQuestions(selectedClass, setId).then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setError('Failed to load quiz questions');
          setLoading(false);
          return;
        }
        setQuestions(data ?? []);
        setLoading(false);
      });
    }

    return () => { cancelled = true; };
  }, [selectedClass, setId]);

  const current = questions[qIndex];

  const choices = useMemo(() => {
    if (!current) return [];
    const opts = [
      { key: 'A', text: current.option_a },
      { key: 'B', text: current.option_b },
      { key: 'C', text: current.option_c },
      { key: 'D', text: current.option_d },
    ];
    return shuffle(opts);
  }, [current]);

  const isCorrectPick = answered && selectedOption ? current?.correct_option === selectedOption : false;

  const handleSelect = useCallback(
    (optionKey: string) => {
      if (answered || !current) return;
      setSelectedOption(optionKey);
      setAnswered(true);
      if (optionKey === current.correct_option) {
        setScore((s) => s + 1);
      }
    },
    [answered, current]
  );

  const handleNext = useCallback(() => {
    if (!answered) return;
    if (qIndex + 1 >= questions.length) {
      const finalScore = score;
      setFinished(true);
      onFinish(finalScore);
      return;
    }
    setQIndex(qIndex + 1);
    setAnswered(false);
    setSelectedOption(null);
  }, [answered, onFinish, qIndex, questions.length, score]);

  const handleRetry = useCallback(() => {
    setQIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedOption(null);
    setFinished(false);
  }, []);

  const handleSetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSetId(e.target.value);
  }, []);

  const handleCompleteSet = useCallback(() => {
    if (!setId || !isSuperAdminMode || questions.length === 0) return;
    const lastIndex = questions.length - 1;
    const lastQuestion = questions[lastIndex];
    setQIndex(lastIndex);
    setScore(questions.length);
    setAnswered(true);
    setSelectedOption(lastQuestion.correct_option);
    setAdminCompleted(true);
  }, [setId, isSuperAdminMode, questions]);

  const handleSeeResult = useCallback(() => {
    if (!isSuperAdminMode) return;
    setFinished(true);
    onFinish(score);
  }, [isSuperAdminMode, onFinish, score]);

  const handleNextSet = useCallback(() => {
    if (!isSuperAdminMode) return;
    const currentIndex = availableSets.indexOf(setId);
    if (currentIndex >= 0 && currentIndex < availableSets.length - 1) {
      setShowNextSetConfirm(true);
    }
  }, [isSuperAdminMode, setId, availableSets]);

  const handleConfirmNextSet = useCallback(() => {
    if (!isSuperAdminMode) return;
    setShowNextSetConfirm(false);
    setAdminCompleted(false);
    const currentIndex = availableSets.indexOf(setId);
    if (currentIndex >= 0 && currentIndex < availableSets.length - 1) {
      setSetId(availableSets[currentIndex + 1]);
    }
  }, [isSuperAdminMode, setId, availableSets]);

  const handleCancelNextSet = useCallback(() => {
    setShowNextSetConfirm(false);
  }, []);

  if (loading) {
    return (
      <div className="screen-shell mx-auto max-w-2xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
        <BackHeader title="Arabic Quiz" onBack={onHome} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary-700" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="screen-shell mx-auto max-w-2xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
        <BackHeader title="Arabic Quiz" onBack={onHome} />
        <div className="rounded-[1.4rem] border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (availableSets.length === 0 || questions.length === 0) {
    return (
      <div className="screen-shell mx-auto max-w-2xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
        <BackHeader title="Arabic Quiz" onBack={onHome} />
        <div className="screen-panel liquid-panel relative z-10 rounded-[2rem] bg-[#fffdf8] p-8 text-center shadow-sm ring-1 ring-primary-100">
          <p className="text-lg font-bold text-primary-900">No quiz questions available yet.</p>
          <p className="mt-2 text-sm text-primary-700">Please try again later or contact your teacher.</p>
          <button
            onClick={onHome}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-3 font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
          >
            <Home size={18} /> Home
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const message =
      pct >= 90
        ? 'MashaAllah! Excellent work!'
        : pct >= 70
          ? 'Great job! Keep practicing!'
          : pct >= 50
            ? 'Good effort! Try again to improve.'
            : 'Keep practicing, you will get there!';
    return (
      <div className="screen-shell mx-auto max-w-2xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
        <BackHeader title="Quiz Complete" onBack={onHome} />
        <div className="screen-panel-dark relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#123f38] to-[#082b25] p-6 text-center shadow-2xl sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/15 blur-2xl" />
          <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg">
            <Trophy size={40} className="text-white" />
          </div>
          <h2 className="font-arabic text-3xl font-bold text-white">أحسنت!</h2>
          <p className="mt-1 text-sm text-gold-300">Well done!</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat label="Score" value={`${score}`} />
            <Stat label="Correct" value={`${score}/${questions.length}`} />
            <Stat label="Percentage" value={`${pct}%`} />
          </div>

          <p className="mt-6 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/15">
            {message}
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button
              onClick={handleRetry}
              className="interactive-card flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-bold text-primary-700 shadow-md hover:shadow-lg active:scale-95"
            >
              <RotateCcw size={18} /> Retry Quiz
            </button>
            <button
              onClick={onHome}
              className="interactive-card flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/15 px-4 py-3 font-bold text-white ring-1 ring-white/20 hover:bg-white/25 active:scale-95"
            >
              <Home size={18} /> Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-shell mx-auto max-w-2xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Arabic Quiz" onBack={onHome} subtitle={`Question ${qIndex + 1} of ${questions.length}`} />

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Set</label>
        <select
          value={setId}
          onChange={handleSetChange}
          className="w-full rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        >
          {availableSets.map((s) => (
            <option key={s} value={s}>
              {s === 'letter-quiz' ? 'Letter Quiz' : `Set ${s}`}
            </option>
          ))}
        </select>
      </div>

      {isSuperAdminMode && setId && (
        <div className="mb-4">
          <button
            onClick={handleCompleteSet}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 ring-1 ring-primary-100 transition-all hover:bg-primary-100 active:scale-95"
          >
            <Check size={14} />
            Complete Set
          </button>
        </div>
      )}

      {/* progress bar */}
      <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-primary-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-teal-500 transition-all duration-300"
          style={{ width: `${((qIndex + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* score badge */}
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
          Score: {score}
        </span>
        <span className="rounded-full bg-gold-50 px-3 py-1 text-xs font-bold text-gold-700">
          {qIndex + 1} / {questions.length}
        </span>
      </div>

      {/* question card */}
      <div className="screen-panel liquid-panel relative z-10 rounded-[2rem] bg-[#fffdf8] p-5 md:p-8">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-primary-700">
          Quiz Question
        </p>

        <div className="mt-4 rounded-[1.5rem] border border-primary-100/70 bg-gradient-to-br from-[#eef9f4] to-[#e7f7f2] p-5 text-center shadow-inner">
          <p className="font-malayalam text-2xl font-bold text-primary-900">{current.malayalam_text}</p>
          <p className="mt-1 text-base font-semibold text-primary-600/80">{current.english_transliteration}</p>
        </div>

        {/* 2x2 answer grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {choices.map((choice) => {
            const isCorrect = choice.key === current.correct_option;
            const isPicked = choice.key === selectedOption;
            let cls =
              'bg-white ring-1 ring-primary-100 hover:-translate-y-0.5 hover:bg-primary-50 active:scale-95 text-primary-900 shadow-sm';
            if (answered) {
              if (isCorrect) cls = 'bg-green-50 ring-2 ring-green-500 text-green-700';
              else if (isPicked) cls = 'bg-red-50 ring-2 ring-red-400 text-red-600';
              else cls = 'bg-white ring-1 ring-gray-100 text-gray-400';
            }
            return (
              <button
                key={choice.key}
                disabled={answered}
                onClick={() => handleSelect(choice.key)}
                className={`interactive-card relative flex aspect-[4/3] items-center justify-center rounded-2xl text-base font-bold md:text-lg ${cls}`}
              >
                {choice.text}
                {answered && isCorrect && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
                {answered && isPicked && !isCorrect && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
                    <X size={14} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* feedback */}
        {answered && (
          <div
            className={`mt-4 rounded-2xl px-4 py-3 text-center text-sm font-bold ${
              isCorrectPick ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {isCorrectPick ? 'Correct! Well done.' : 'Not quite — the correct answer is highlighted above.'}
          </div>
        )}

        {/* next */}
        {adminCompleted && qIndex + 1 >= questions.length ? (
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <button
              onClick={handleSeeResult}
              className="interactive-card flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3.5 font-bold text-white shadow-md hover:shadow-lg active:scale-95"
            >
              See Result <Trophy size={18} />
            </button>
            {availableSets.indexOf(setId) >= availableSets.length - 1 ? (
              <div className="flex flex-1 items-center justify-center rounded-2xl bg-gray-50 px-4 py-3.5 text-center text-xs font-bold text-gray-500 ring-1 ring-gray-100">
                No more sets available
              </div>
            ) : (
              <button
                onClick={handleNextSet}
                className="interactive-card flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 font-bold text-primary-700 ring-1 ring-primary-100 hover:bg-primary-50 active:scale-95"
              >
                Next Set <ArrowRight size={18} />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleNext}
            disabled={!answered}
            className={`interactive-card mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-bold active:scale-95 ${
              answered
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md hover:shadow-lg'
                : 'cursor-not-allowed bg-gray-100 text-gray-400'
            }`}
          >
            {qIndex + 1 >= questions.length ? (
              <>
                See Results <Trophy size={18} />
              </>
            ) : (
              <>
                Next <ArrowRight size={18} />
              </>
            )}
          </button>
        )}
      </div>

      {showNextSetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="screen-panel liquid-panel w-full max-w-sm rounded-[1.75rem] bg-white p-5 shadow-xl ring-1 ring-primary-100">
            <p className="text-center text-sm font-bold text-primary-900">Do you want to go to the next set?</p>
            <p className="mt-1 text-center text-xs text-primary-700">
              Current set: {availableSets[availableSets.indexOf(setId)]}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleConfirmNextSet}
                className="interactive-card flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 font-bold text-white shadow-md hover:shadow-lg active:scale-95"
              >
                Yes, Next Set
              </button>
              <button
                onClick={handleCancelNextSet}
                className="interactive-card flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-bold text-primary-700 ring-1 ring-primary-100 hover:bg-primary-50 active:scale-95"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-2 py-3 ring-1 ring-white/15">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-white/60">{label}</p>
    </div>
  );
}

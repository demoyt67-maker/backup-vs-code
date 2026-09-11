import { useCallback, useMemo, useState } from 'react';
import { Check, X, RotateCcw, Home, ArrowRight, Trophy } from 'lucide-react';
import { ARABIC_LETTERS, TOTAL_LETTERS, type ArabicLetter } from '@/data/letters';
import { BackHeader } from '@/components/BackHeader';
import { useCMSClass1Data } from '@/hooks/useCMSClass1Data';

interface Props {
  onHome: () => void;
  onFinish: (score: number) => void;
  selectedClass: 1 | 2 | 3;
  learned?: Set<number>;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildChoices(correct: ArabicLetter, pool: ArabicLetter[]): ArabicLetter[] {
  const others = pool.filter((l) => l.arabic !== correct.arabic);
  const distractors = shuffle(others).slice(0, 3);
  return shuffle([correct, ...distractors]);
}

const QUESTION_LIMITS: Record<1 | 2 | 3, number> = {
  1: TOTAL_LETTERS,
  2: 16,
  3: TOTAL_LETTERS,
};

export function QuizView({ onHome, onFinish, selectedClass }: Props) {
  const cms = useCMSClass1Data();
  const class1Letters = selectedClass === 1 && cms.usingCMS ? cms.letters : ARABIC_LETTERS;
  const class1Limit = selectedClass === 1 && cms.usingCMS ? class1Letters.length : QUESTION_LIMITS[selectedClass];
  const questionPool = useMemo(() => class1Letters.slice(0, class1Limit), [selectedClass, class1Letters, class1Limit]);
  const questions = useMemo(() => shuffle(questionPool), [questionPool]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [choices, setChoices] = useState<ArabicLetter[]>(() => buildChoices(questions[0], questionPool));
  const [finished, setFinished] = useState(false);

  const current = questions[qIndex];
  const isCorrectPick = selected === current.arabic;

  const handleSelect = useCallback(
    (letter: string) => {
      if (answered) return;
      setSelected(letter);
      setAnswered(true);
      if (letter === current.arabic) {
        setScore((s) => s + 1);
      }
    },
    [answered, current],
  );

  const handleNext = useCallback(() => {
    if (!answered) return;
    if (qIndex + 1 >= questions.length) {
      const finalScore = score;
      setFinished(true);
      onFinish(finalScore);
      return;
    }
    const next = qIndex + 1;
    setQIndex(next);
    setChoices(buildChoices(questions[next], questionPool));
    setAnswered(false);
    setSelected(null);
  }, [answered, qIndex, questions, questionPool, score, onFinish]);

  const handleRetry = useCallback(() => {
    setQIndex(0);
    setScore(0);
    setAnswered(false);
    setSelected(null);
    setChoices(buildChoices(questions[0], questionPool));
    setFinished(false);
  }, [questionPool, questions]);

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
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
          Identify this letter
        </p>

        <div className="mt-4 rounded-[1.5rem] border border-primary-100/70 bg-gradient-to-br from-[#eef9f4] to-[#e7f7f2] p-5 text-center shadow-inner">
          <p className="font-malayalam text-3xl font-bold text-primary-900">{current.malayalam}</p>
          <p className="mt-1 text-lg font-semibold text-primary-600/80">{current.english}</p>
        </div>

        <p className="mt-4 text-center font-malayalam text-sm font-medium text-primary-900">
          ശരിയായ ഉത്തരം തിരഞ്ഞെടുക്കുക
        </p>

        {/* 2x2 answer grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {choices.map((choice) => {
            const isCorrect = choice.arabic === current.arabic;
            const isPicked = choice.arabic === selected;
            let cls =
                'bg-white ring-1 ring-primary-100 hover:-translate-y-0.5 hover:bg-primary-50 active:scale-95 text-primary-900 shadow-sm';
            if (answered) {
              if (isCorrect) cls = 'bg-green-50 ring-2 ring-green-500 text-green-700';
              else if (isPicked) cls = 'bg-red-50 ring-2 ring-red-400 text-red-600';
              else cls = 'bg-white ring-1 ring-gray-100 text-gray-400';
            }
            return (
              <button
                key={choice.arabic}
                disabled={answered}
                onClick={() => handleSelect(choice.arabic)}
                className={`interactive-card relative flex aspect-[4/3] items-center justify-center rounded-2xl font-arabic text-5xl font-bold md:text-6xl ${cls}`}
              >
                {choice.arabic}
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
              isCorrectPick
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {isCorrectPick ? 'Correct! Well done.' : `Not quite — the answer is ${current.arabic}`}
          </div>
        )}

        {/* next */}
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
      </div>
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

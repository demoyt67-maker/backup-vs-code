import { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles, Star } from 'lucide-react';
import { INTERACTIVE_HARAKAT_PRACTICE_DEFINITIONS } from '@/data/interactiveHarakatPractice';
import { HARAKAT, type HarakaType } from '@/data/learningSets';

interface Question {
  id: string;
  baseLetter: string;
  promptHaraka: HarakaType;
  options: HarakaType[];
}

interface Props {
  completedKeys: Set<string>;
  onMarkQuestion: (key: string) => void;
}

const HARAKAT_KEYS: HarakaType[] = ['fatha', 'kasra', 'damma'];

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

const QUESTIONS: Question[] = INTERACTIVE_HARAKAT_PRACTICE_DEFINITIONS.map((question) => ({
  ...question,
  options: shuffle(HARAKAT_KEYS),
}));

export function InteractiveHarakatPractice({ completedKeys, onMarkQuestion }: Props) {
  const currentQuestion = QUESTIONS.find((question) => !completedKeys.has(question.id)) ?? null;
  const [selectedHaraka, setSelectedHaraka] = useState<HarakaType | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  useEffect(() => {
    setSelectedHaraka(null);
    setFeedbackState('idle');
  }, [currentQuestion?.id]);

  const completedCount = completedKeys.size;
  const progressPct = Math.min(100, (completedCount / QUESTIONS.length) * 100);

  const handleSelect = (haraka: HarakaType) => {
    if (!currentQuestion || feedbackState === 'correct') {
      return;
    }

    setSelectedHaraka(haraka);

    if (haraka === currentQuestion.promptHaraka) {
      setFeedbackState('correct');
      onMarkQuestion(currentQuestion.id);
      return;
    }

    setFeedbackState('wrong');
  };

  if (!currentQuestion) {
    return (
      <div className="rounded-[1.75rem] bg-gradient-to-br from-green-50 to-primary-50 p-5 text-center shadow-sm ring-1 ring-green-200">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-green-500 shadow-sm">
          <Star size={30} className="fill-green-500 text-green-500" />
        </div>
        <h5 className="text-lg font-black text-primary-900">Practice complete!</h5>
        <p className="mt-2 text-sm text-primary-700">
          You finished all {QUESTIONS.length} interactive Harakat questions.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] bg-white/80 p-4 shadow-sm ring-1 ring-primary-100">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h5 className="font-black text-primary-900">Interactive Harakat Practice</h5>
          <p className="text-xs text-primary-700">
            {completedCount}/{QUESTIONS.length} questions finished
          </p>
        </div>
        <span className="rounded-full bg-primary-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-primary-700">
          Class 2 only
        </span>
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded-full bg-primary-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-400 to-primary-600 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div
        key={currentQuestion.id}
        className={`rounded-[1.5rem] bg-gradient-to-br from-primary-50 to-gold-50 p-4 text-center shadow-sm ring-1 ring-primary-100 transition-all ${
          feedbackState === 'correct' ? 'success-burst' : ''
        }`}
      >
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-700">
          Choose the correct Harakat
        </p>

        <div className="mt-3 flex items-center justify-center rounded-[1.25rem] bg-white/80 px-4 py-5 shadow-sm ring-1 ring-primary-100">
          <span className="font-arabic text-7xl font-bold text-primary-900">
            {currentQuestion.baseLetter}
          </span>
        </div>

        <p className="mt-3 text-sm font-bold text-primary-800">
          Add <span className="text-primary-900">{HARAKAT[currentQuestion.promptHaraka].name}</span>
        </p>

        <div className={`mt-4 grid gap-2.5 ${currentQuestion.options.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {currentQuestion.options.map((haraka) => {
            const isCorrect = haraka === currentQuestion.promptHaraka;
            const isPicked = haraka === selectedHaraka;
            const hi = HARAKAT[haraka];

            let buttonClass =
              'bg-white text-primary-900 ring-1 ring-primary-100 hover:bg-primary-50 active:scale-95';

            if (feedbackState === 'correct' && isCorrect) {
              buttonClass = 'bg-green-50 text-green-700 ring-2 ring-green-500';
            } else if (feedbackState === 'wrong') {
              if (isCorrect) {
                buttonClass = 'bg-green-50 text-green-700 ring-2 ring-green-500';
              } else if (isPicked) {
                buttonClass = 'bg-red-50 text-red-600 ring-2 ring-red-400';
              } else {
                buttonClass = 'bg-white text-gray-400 ring-1 ring-gray-200';
              }
            }

            return (
              <button
                key={haraka}
                type="button"
                onClick={() => handleSelect(haraka)}
                className={`relative flex flex-col items-center gap-1 rounded-2xl p-3 font-bold transition-all ${buttonClass}`}
              >
                <span className="font-arabic text-3xl">{hi.symbol}</span>
                <span className="text-xs">{hi.name}</span>
                {feedbackState === 'correct' && isCorrect && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                    <CheckCircle2 size={12} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {feedbackState !== 'idle' && (
          <div
            className={`mt-4 rounded-xl px-3 py-2 text-sm font-bold ${
              feedbackState === 'correct'
                ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                : 'bg-red-50 text-red-600 ring-1 ring-red-200'
            }`}
          >
            {feedbackState === 'correct' ? (
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={16} className="text-green-500" />
                Great job! {currentQuestion.baseLetter}
                <span className="font-arabic text-xl">{HARAKAT[currentQuestion.promptHaraka].mark}</span>
                {' '}is correct.
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={16} className="text-red-500" />
                Nice try! Try again.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

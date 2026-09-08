import { useMemo, useState } from 'react';
import { Check, X, RotateCcw } from 'lucide-react';
import {
  HARAKAT,
  applyHaraka,
  harakatItemKey,
  type HarakatLevel,
  type HarakaType,
} from '@/data/learningSets';

interface Props {
  level: HarakatLevel;
  onMark: (key: string) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Question {
  promptHaraka: HarakaType;
  baseLetter: string;
  options: HarakaType[];
  key: string;
}

function buildQuestion(level: HarakatLevel): Question {
  const { harakat, items } = level;
  const item = items[Math.floor(Math.random() * items.length)];
  const promptHaraka = item.haraka;
  const baseLetter = item.letter.arabic;
  const key = harakatItemKey(item.letter.index, promptHaraka);
  // Options = all harakat in this level, shuffled (so combos have >1 option)
  const options = harakat.length > 1 ? shuffle(harakat) : harakat.slice();
  return { promptHaraka, baseLetter, options, key };
}

export function HarakatPractice({ level, onMark }: Props) {
  const [question, setQuestion] = useState<Question>(() => buildQuestion(level));
  const [selected, setSelected] = useState<HarakaType | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const info = HARAKAT[question.promptHaraka];

  const next = useMemo(() => buildQuestion(level), [level]);

  const handleSelect = (h: HarakaType) => {
    if (answered) return;
    setSelected(h);
    setAnswered(true);
    setAttempts((a) => a + 1);
    if (h === question.promptHaraka) {
      setScore((s) => s + 1);
      onMark(question.key);
    }
  };

  const handleNext = () => {
    setQuestion(next);
    setSelected(null);
    setAnswered(false);
  };

  const handleRetry = () => {
    setScore(0);
    setAttempts(0);
    setQuestion(buildQuestion(level));
    setSelected(null);
    setAnswered(false);
  };

  return (
    <div className="mt-4 rounded-2xl bg-gradient-to-br from-teal-50 to-primary-50 p-4 ring-1 ring-primary-100">
      <div className="mb-3 flex items-center justify-between">
        <h5 className="text-sm font-bold text-primary-900">Practice</h5>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-primary-700 shadow-sm">
          {score} correct
        </span>
      </div>

      {/* Prompt */}
      <div className="rounded-xl bg-white p-4 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
          Which haraka is on this letter?
        </p>
        <p className="mt-2 font-arabic text-6xl font-bold text-primary-900">
          {applyHaraka(question.baseLetter, question.promptHaraka)}
        </p>
        <p className="mt-2 text-xs text-primary-700">
          Base letter: <span className="font-arabic text-lg font-bold text-primary-700">{question.baseLetter}</span>
        </p>
      </div>

      {/* Options */}
      <div className={`mt-3 grid gap-2.5 ${question.options.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {question.options.map((h) => {
          const isCorrect = h === question.promptHaraka;
          const isPicked = h === selected;
          let cls = 'bg-white ring-1 ring-primary-100 hover:bg-primary-50 active:scale-95 text-primary-900';
          if (answered) {
            if (isCorrect) cls = 'bg-green-50 ring-2 ring-green-500 text-green-700';
            else if (isPicked) cls = 'bg-red-50 ring-2 ring-red-400 text-red-600';
            else cls = 'bg-white ring-1 ring-gray-100 text-gray-400';
          }
          const hi = HARAKAT[h];
          return (
            <button
              key={h}
              disabled={answered}
              onClick={() => handleSelect(h)}
              className={`relative flex flex-col items-center gap-1 rounded-xl p-3 font-bold transition-all ${cls}`}
            >
              <span className="font-arabic text-3xl">{hi.symbol}</span>
              <span className="text-xs">{hi.name}</span>
              {answered && isCorrect && (
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                  <Check size={11} strokeWidth={3} />
                </span>
              )}
              {answered && isPicked && !isCorrect && (
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
                  <X size={11} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* feedback */}
      {answered && (
        <div
          className={`mt-3 rounded-xl px-3 py-2 text-center text-sm font-bold ${
            selected === question.promptHaraka
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {selected === question.promptHaraka
            ? `Correct! That is ${info.name} (${info.malayalam})`
            : `Not quite — that is ${info.name} (${info.malayalam})`}
        </div>
      )}

      {/* actions */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleNext}
          disabled={!answered}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold transition-all active:scale-95 ${
            answered
              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
              : 'cursor-not-allowed bg-gray-100 text-gray-400'
          }`}
        >
          Next Question
        </button>
        <button
          onClick={handleRetry}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-primary-700 ring-1 ring-primary-100 transition-all hover:bg-primary-50 active:scale-95"
        >
          <RotateCcw size={15} /> Reset
        </button>
      </div>

      {attempts > 0 && (
        <p className="mt-2 text-center text-xs text-primary-700">
          {score} / {attempts} correct so far
        </p>
      )}
    </div>
  );
}

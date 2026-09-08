import { useCallback, useMemo, useState } from 'react';
import { Check, X, RotateCcw } from 'lucide-react';

interface PracticeOption {
  symbol: string;
  name: string;
  malayalam: string;
}

interface PracticeItem {
  arabic: string;     // rendered form shown as the prompt
  baseLetter: string; // base letter without the mark
  correctId: string;  // id of the correct option
  label: string;      // English label
  key: string;        // progress key
}

interface Props {
  items: PracticeItem[];
  options: PracticeOption[];
  promptText: string;
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

export function GenericPractice({ items, options, promptText, onMark }: Props) {
  const buildQuestion = useCallback((): PracticeItem & { shuffledOptions: PracticeOption[] } => {
    const item = items[Math.floor(Math.random() * items.length)];
    const shuffledOptions = options.length > 1 ? shuffle(options) : options.slice();
    return { ...item, shuffledOptions };
  }, [items, options]);

  const [question, setQuestion] = useState(() => buildQuestion());
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const next = useMemo(() => buildQuestion(), [buildQuestion]);

  const handleSelect = (id: string) => {
    if (answered) return;
    setSelected(id);
    setAnswered(true);
    setAttempts((a) => a + 1);
    if (id === question.correctId) {
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
    setQuestion(buildQuestion());
    setSelected(null);
    setAnswered(false);
  };

  const correctOpt = options.find((o) => o.name === question.label?.split(' + ').pop()) || options.find((o) => o.symbol === question.arabic.slice(-1));

  return (
    <div className="mt-4 rounded-2xl bg-gradient-to-br from-teal-50 to-primary-50 p-4 ring-1 ring-primary-100">
      <div className="mb-3 flex items-center justify-between">
        <h5 className="text-sm font-bold text-primary-900">Practice</h5>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-primary-700 shadow-sm">
          {score} correct
        </span>
      </div>

      <div className="rounded-xl bg-white p-4 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">{promptText}</p>
        <p className="mt-2 font-arabic text-6xl font-bold text-primary-900">{question.arabic}</p>
        <p className="mt-2 text-xs text-primary-700">
          Base letter: <span className="font-arabic text-lg font-bold text-primary-700">{question.baseLetter}</span>
        </p>
      </div>

      <div className={`mt-3 grid gap-2.5 ${question.shuffledOptions.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {question.shuffledOptions.map((opt) => {
          const isCorrect = opt.name === correctOpt?.name;
          const isPicked = opt.name === selected;
          let cls = 'bg-white ring-1 ring-primary-100 hover:bg-primary-50 active:scale-95 text-primary-900';
          if (answered) {
            if (isCorrect) cls = 'bg-green-50 ring-2 ring-green-500 text-green-700';
            else if (isPicked) cls = 'bg-red-50 ring-2 ring-red-400 text-red-600';
            else cls = 'bg-white ring-1 ring-gray-100 text-gray-400';
          }
          return (
            <button
              key={opt.name}
              disabled={answered}
              onClick={() => handleSelect(opt.name)}
              className={`relative flex flex-col items-center gap-1 rounded-xl p-3 font-bold transition-all ${cls}`}
            >
              <span className="font-arabic text-3xl">{opt.symbol}</span>
              <span className="text-xs">{opt.name}</span>
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

      {answered && (
        <div
          className={`mt-3 rounded-xl px-3 py-2 text-center text-sm font-bold ${
            selected === correctOpt?.name ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}
        >
          {selected === correctOpt?.name
            ? `Correct! That is ${correctOpt?.name} (${correctOpt?.malayalam})`
            : `Not quite — that is ${correctOpt?.name} (${correctOpt?.malayalam})`}
        </div>
      )}

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

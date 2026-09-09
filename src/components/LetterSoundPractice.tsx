import { useRef, useState } from 'react';
import { Check, RotateCcw, Sparkles, X } from 'lucide-react';
import { LETTER_SOUND_PRACTICE_ITEMS, type LetterSoundPracticeItem } from '@/data/letterSoundPractice';

const SOUND_OPTIONS = [
  { id: 'a', label: 'a sound', hint: 'like apple' },
  { id: 'ee', label: 'ee sound', hint: 'like keep' },
  { id: 'oo', label: 'oo sound', hint: 'like moon' },
] as const;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface Question {
  item: LetterSoundPracticeItem;
  options: Array<(typeof SOUND_OPTIONS)[number]>;
}

function buildQuestion(item: LetterSoundPracticeItem): Question {
  return {
    item,
    options: shuffle([...SOUND_OPTIONS]),
  };
}

interface Props {
  onMark: (key: string) => void;
}

export function LetterSoundPractice({ onMark }: Props) {
  const initialOrderRef = useRef<LetterSoundPracticeItem[]>(shuffle([...LETTER_SOUND_PRACTICE_ITEMS]));
  const [questionOrder, setQuestionOrder] = useState<LetterSoundPracticeItem[]>(initialOrderRef.current);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<Question>(() => buildQuestion(initialOrderRef.current[0]));
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const handleSelect = (soundId: string) => {
    if (answered) return;
    setSelected(soundId);
    setAnswered(true);
    setAttempts((prev) => prev + 1);

    if (soundId === question.item.soundId) {
      setScore((prev) => prev + 1);
      onMark(question.item.id);
    }
  };

  const handleNext = () => {
    const nextIndex = questionIndex + 1;
    let nextOrder = questionOrder;
    let nextPosition = nextIndex;

    if (nextPosition >= nextOrder.length) {
      nextOrder = shuffle([...LETTER_SOUND_PRACTICE_ITEMS]);
      nextPosition = 0;
    }

    setQuestionOrder(nextOrder);
    setQuestionIndex(nextPosition);
    setQuestion(buildQuestion(nextOrder[nextPosition]));
    setSelected(null);
    setAnswered(false);
  };

  const handleReset = () => {
    const freshOrder = shuffle([...LETTER_SOUND_PRACTICE_ITEMS]);
    setQuestionOrder(freshOrder);
    setQuestionIndex(0);
    setQuestion(buildQuestion(freshOrder[0]));
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setAttempts(0);
  };

  return (
    <div className="mt-4 rounded-[1.75rem] bg-gradient-to-br from-gold-50 via-primary-50 to-teal-50 p-4 ring-1 ring-gold-100">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-700 shadow-sm ring-1 ring-primary-100">
            <Sparkles size={18} />
          </span>
          <div>
            <h5 className="text-sm font-black text-primary-900">Letter Pattern Practice</h5>
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary-700">Match the pattern • pick the right sound</p>
          </div>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-primary-700 shadow-sm ring-1 ring-primary-100">
          {score} correct
        </span>
      </div>

      <div className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-primary-100">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary-700">Practice card</p>
            <p className="mt-1 text-xs text-primary-700">{question.item.letterName} + {question.item.harakaName}</p>
          </div>
          <span className="rounded-full bg-gold-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-700">
            {question.item.harakaName}
          </span>
        </div>

        <div className="mt-4 flex flex-col items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-gold-50 to-primary-50 p-5 text-center">
          <div className="mb-1 flex items-center gap-2 text-primary-700">
            <Sparkles size={15} />
            <span className="text-[10px] font-black uppercase tracking-[0.18em]">Pronunciation</span>
          </div>
          <p className="font-arabic text-6xl font-bold text-primary-900">{question.item.display}</p>
          <p className="mt-2 text-lg font-black text-primary-900">{question.item.soundGuide}</p>
          <p className="mt-1 text-xs text-primary-700">{question.item.pronunciationTip}</p>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          {question.options.map((option) => {
            const isPicked = selected === option.id;
            const isCorrect = option.id === question.item.soundId;
            let cls = 'bg-white ring-1 ring-primary-100 text-primary-900 hover:bg-primary-50';

            if (answered) {
              if (isCorrect) cls = 'bg-green-50 ring-2 ring-green-500 text-green-700';
              else if (isPicked) cls = 'bg-red-50 ring-2 ring-red-400 text-red-600';
              else cls = 'bg-white ring-1 ring-gray-100 text-gray-400';
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={answered}
                className={`rounded-2xl p-3 text-left transition-all active:scale-95 ${cls}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-black">{option.label}</span>
                  {answered && isCorrect && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                  {answered && isPicked && !isCorrect && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
                      <X size={11} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-current/80">{option.hint}</p>
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            className={`mt-4 rounded-2xl px-3 py-2 text-center text-sm font-bold ${
              selected === question.item.soundId ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {selected === question.item.soundId
              ? `Correct! ${question.item.harakaName} gives the ${question.item.soundId === 'a' ? 'a' : question.item.soundId === 'ee' ? 'ee' : 'oo'} sound.`
              : `Not quite — ${question.item.harakaName} gives the ${question.item.soundId === 'a' ? 'a' : question.item.soundId === 'ee' ? 'ee' : 'oo'} sound.`}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleNext}
            disabled={!answered}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-black transition-all active:scale-95 ${
              answered
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                : 'cursor-not-allowed bg-gray-100 text-gray-400'
            }`}
          >
            Next sound
          </button>
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-sm font-black text-primary-700 ring-1 ring-primary-100 transition-all hover:bg-primary-50 active:scale-95"
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>

        {attempts > 0 && (
          <p className="mt-3 text-center text-[11px] font-bold text-primary-700">
            {score} / {attempts} correct so far
          </p>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Check, RotateCcw, Sparkles, X } from 'lucide-react';
import type { HarakaType } from '@/data/learningSets';

export interface ReadingPracticeItem {
  id: string;
  display: string;
  reading: string;
  guidance: string;
  haraka: HarakaType;
}

export const SIMPLE_READING_PRACTICE_ITEMS: ReadingPracticeItem[] = [
  { id: 'reading-b-fatha', display: 'بَ', reading: 'ba', guidance: 'Fatha makes the a sound.', haraka: 'fatha' },
  { id: 'reading-b-kasra', display: 'بِ', reading: 'bi', guidance: 'Kasra makes the i sound.', haraka: 'kasra' },
  { id: 'reading-b-damma', display: 'بُ', reading: 'bu', guidance: 'Damma makes the u sound.', haraka: 'damma' },
  { id: 'reading-t-fatha', display: 'تَ', reading: 'ta', guidance: 'Fatha makes the a sound.', haraka: 'fatha' },
  { id: 'reading-j-kasra', display: 'جِ', reading: 'ji', guidance: 'Kasra makes the i sound.', haraka: 'kasra' },
  { id: 'reading-d-damma', display: 'دُ', reading: 'du', guidance: 'Damma makes the u sound.', haraka: 'damma' },
  { id: 'reading-m-fatha', display: 'مَ', reading: 'ma', guidance: 'Fatha makes the a sound.', haraka: 'fatha' },
  { id: 'reading-s-kasra', display: 'سِ', reading: 'si', guidance: 'Kasra makes the i sound.', haraka: 'kasra' },
  { id: 'reading-k-damma', display: 'كُ', reading: 'ku', guidance: 'Damma makes the u sound.', haraka: 'damma' },
];

interface Question {
  item: ReadingPracticeItem;
  options: string[];
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildQuestions(): Question[] {
  return shuffle(SIMPLE_READING_PRACTICE_ITEMS).map((item) => {
    const distractorReadings = shuffle(
      SIMPLE_READING_PRACTICE_ITEMS.filter((candidate) => candidate.id !== item.id).map((candidate) => candidate.reading),
    );

    const options = shuffle([...new Set([item.reading, ...distractorReadings.slice(0, 3)])]);

    return {
      item,
      options,
    };
  });
}

interface Props {
  onMark: (key: string) => void;
}

export function SimpleArabicReadingPractice({ onMark }: Props) {
  const [questions, setQuestions] = useState<Question[]>(() => buildQuestions());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[questionIndex];
  const easyPracticeItems = SIMPLE_READING_PRACTICE_ITEMS.slice(0, 3);
  const isLastQuestion = questionIndex >= questions.length - 1;

  const handleSelect = (reading: string) => {
    if (answered || !currentQuestion) return;

    setSelected(reading);
    setAnswered(true);
    setAttempts((prev) => prev + 1);

    if (reading === currentQuestion.item.reading) {
      setScore((prev) => prev + 1);
      onMark(currentQuestion.item.id);
    }
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    if (isLastQuestion) {
      setCompleted(true);
      return;
    }

    setQuestionIndex((prev) => prev + 1);
    setSelected(null);
    setAnswered(false);
  };

  const handleReset = () => {
    setQuestions(buildQuestions());
    setQuestionIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setAttempts(0);
    setCompleted(false);
  };

  if (completed || !currentQuestion) {
    return (
      <div className="mt-4 rounded-[1.75rem] bg-gradient-to-br from-green-50 via-primary-50 to-teal-50 p-4 ring-1 ring-green-100">
        <div className="rounded-[1.5rem] bg-white p-4 text-center shadow-sm ring-1 ring-primary-100">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-sm">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <h5 className="mt-3 text-lg font-black text-primary-900">Reading Practice Complete!</h5>
          <p className="mt-1 text-sm text-primary-700">You finished the simple Arabic reading practice with confidence.</p>
          <div className="mt-4 rounded-2xl bg-gradient-to-r from-green-50 to-primary-50 p-3 text-sm font-bold text-primary-900">
            {score} / {questions.length} correct
          </div>
          <button
            onClick={handleReset}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-2.5 text-sm font-black text-white shadow-md transition-all hover:shadow-lg active:scale-95"
          >
            <RotateCcw size={16} /> Practice again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-[1.75rem] bg-gradient-to-br from-primary-50 via-gold-50 to-teal-50 p-4 ring-1 ring-primary-100">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-700 shadow-sm ring-1 ring-primary-100">
            <Sparkles size={18} />
          </span>
          <div>
            <h5 className="text-sm font-black text-primary-900">Simple Arabic Reading Practice</h5>
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary-700">Easy • guided • playful</p>
          </div>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-primary-700 shadow-sm ring-1 ring-primary-100">
          {score} correct
        </span>
      </div>

      <div className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-primary-100">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-700">Easy practice</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {easyPracticeItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-gradient-to-br from-primary-50 to-teal-50 p-3 text-center ring-1 ring-primary-100"
            >
              <p className="font-arabic text-4xl font-bold text-primary-900">{item.display}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-primary-700">{item.reading}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-primary-700">Read each one slowly before answering. Then choose the correct reading.</p>
      </div>

      <div className="mt-4 rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-primary-100">
        <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-primary-700">
          <span>Question {Math.min(questionIndex + 1, questions.length)} / {questions.length}</span>
          <span>{currentQuestion.item.guidance}</span>
        </div>

        <div className="mt-4 flex flex-col items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-primary-50 to-gold-50 p-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-700">Read and select</p>
          <p className="mt-2 font-arabic text-7xl font-bold text-primary-900">{currentQuestion.item.display}</p>
          <p className="mt-2 text-sm font-bold text-primary-800">Choose the correct reading.</p>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {currentQuestion.options.map((option) => {
            const isPicked = selected === option;
            const isCorrect = option === currentQuestion.item.reading;

            let cls = 'bg-white ring-1 ring-primary-100 text-primary-900 hover:bg-primary-50';

            if (answered) {
              if (isCorrect) cls = 'bg-green-50 ring-2 ring-green-500 text-green-700';
              else if (isPicked) cls = 'bg-red-50 ring-2 ring-red-400 text-red-600';
              else cls = 'bg-white ring-1 ring-gray-100 text-gray-400';
            }

            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={answered}
                className={`rounded-2xl p-3 text-left text-sm font-black transition-all active:scale-95 ${cls}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{option}</span>
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
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            className={`mt-4 rounded-2xl px-3 py-2 text-center text-sm font-bold ${
              selected === currentQuestion.item.reading ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {selected === currentQuestion.item.reading
              ? `Correct! ${currentQuestion.item.display} is read as ${currentQuestion.item.reading}.`
              : `Not quite — ${currentQuestion.item.display} is read as ${currentQuestion.item.reading}.`}
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
            {isLastQuestion ? 'Finish' : 'Next question'}
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

import { useState } from 'react';
import { BookOpen, Check, RotateCcw, Sparkles, Target, X } from 'lucide-react';
import { HARAKAT, type HarakaType } from '@/data/learningSets';

export interface ReadingPracticeItem {
  id: string;
  display: string;
  reading: string;
  guidance: string;
  haraka: HarakaType;
  level: 1 | 2 | 3;
}

export const SIMPLE_READING_PRACTICE_ITEMS: ReadingPracticeItem[] = [
  { id: 'reading-b-fatha', display: 'بَ', reading: 'ba', guidance: 'Fatha makes the a sound.', haraka: 'fatha', level: 1 },
  { id: 'reading-b-kasra', display: 'بِ', reading: 'bi', guidance: 'Kasra makes the i sound.', haraka: 'kasra', level: 1 },
  { id: 'reading-b-damma', display: 'بُ', reading: 'bu', guidance: 'Damma makes the u sound.', haraka: 'damma', level: 1 },
  { id: 'reading-t-fatha', display: 'تَ', reading: 'ta', guidance: 'Fatha makes the a sound.', haraka: 'fatha', level: 1 },
  { id: 'reading-t-kasra', display: 'تِ', reading: 'ti', guidance: 'Kasra makes the i sound.', haraka: 'kasra', level: 1 },
  { id: 'reading-t-damma', display: 'تُ', reading: 'tu', guidance: 'Damma makes the u sound.', haraka: 'damma', level: 1 },
  { id: 'reading-m-fatha', display: 'مَ', reading: 'ma', guidance: 'Fatha makes the a sound.', haraka: 'fatha', level: 1 },
  { id: 'reading-m-kasra', display: 'مِ', reading: 'mi', guidance: 'Kasra makes the i sound.', haraka: 'kasra', level: 1 },
  { id: 'reading-m-damma', display: 'مُ', reading: 'mu', guidance: 'Damma makes the u sound.', haraka: 'damma', level: 1 },

  { id: 'reading-s-fatha', display: 'سَ', reading: 'sa', guidance: 'Fatha makes the a sound.', haraka: 'fatha', level: 2 },
  { id: 'reading-s-kasra', display: 'سِ', reading: 'si', guidance: 'Kasra makes the i sound.', haraka: 'kasra', level: 2 },
  { id: 'reading-s-damma', display: 'سُ', reading: 'su', guidance: 'Damma makes the u sound.', haraka: 'damma', level: 2 },
  { id: 'reading-r-fatha', display: 'رَ', reading: 'ra', guidance: 'Fatha makes the a sound.', haraka: 'fatha', level: 2 },
  { id: 'reading-r-kasra', display: 'رِ', reading: 'ri', guidance: 'Kasra makes the i sound.', haraka: 'kasra', level: 2 },
  { id: 'reading-r-damma', display: 'رُ', reading: 'ru', guidance: 'Damma makes the u sound.', haraka: 'damma', level: 2 },
  { id: 'reading-d-fatha', display: 'دَ', reading: 'da', guidance: 'Fatha makes the a sound.', haraka: 'fatha', level: 2 },
  { id: 'reading-d-kasra', display: 'دِ', reading: 'di', guidance: 'Kasra makes the i sound.', haraka: 'kasra', level: 2 },
  { id: 'reading-d-damma', display: 'دُ', reading: 'du', guidance: 'Damma makes the u sound.', haraka: 'damma', level: 2 },

  { id: 'reading-j-fatha', display: 'جَ', reading: 'ja', guidance: 'Fatha makes the a sound.', haraka: 'fatha', level: 3 },
  { id: 'reading-j-kasra', display: 'جِ', reading: 'ji', guidance: 'Kasra makes the i sound.', haraka: 'kasra', level: 3 },
  { id: 'reading-j-damma', display: 'جُ', reading: 'ju', guidance: 'Damma makes the u sound.', haraka: 'damma', level: 3 },
  { id: 'reading-l-fatha', display: 'لَ', reading: 'la', guidance: 'Fatha makes the a sound.', haraka: 'fatha', level: 3 },
  { id: 'reading-l-kasra', display: 'لِ', reading: 'li', guidance: 'Kasra makes the i sound.', haraka: 'kasra', level: 3 },
  { id: 'reading-l-damma', display: 'لُ', reading: 'lu', guidance: 'Damma makes the u sound.', haraka: 'damma', level: 3 },
  { id: 'reading-n-fatha', display: 'نَ', reading: 'na', guidance: 'Fatha makes the a sound.', haraka: 'fatha', level: 3 },
  { id: 'reading-n-kasra', display: 'نِ', reading: 'ni', guidance: 'Kasra makes the i sound.', haraka: 'kasra', level: 3 },
  { id: 'reading-n-damma', display: 'نُ', reading: 'nu', guidance: 'Damma makes the u sound.', haraka: 'damma', level: 3 },
];

type QuestionType = 'read' | 'choose-combination' | 'find-haraka';

interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

interface Question {
  item: ReadingPracticeItem;
  type: QuestionType;
  prompt: string;
  options: QuestionOption[];
  correctValue: string;
}

const QUESTION_TYPES: QuestionType[] = ['read', 'choose-combination', 'find-haraka'];

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getBaseLetter(display: string): string {
  return display.replace(/[َُِ]/g, '');
}

function buildQuestion(item: ReadingPracticeItem, type: QuestionType, items: ReadingPracticeItem[]): Question {
  if (type === 'read') {
    const distractorReadings = shuffle(
      items.filter((candidate) => candidate.id !== item.id).map((candidate) => candidate.reading),
    );

    const options = shuffle([...new Set([item.reading, ...distractorReadings.slice(0, 3)])]);

    return {
      item,
      type,
      prompt: 'Read this carefully.',
      correctValue: item.reading,
      options: options.map((reading) => ({ id: reading, label: reading, value: reading })),
    };
  }

  if (type === 'choose-combination') {
    const baseLetter = getBaseLetter(item.display);
    const sameLetterItems = items.filter(
      (candidate) => candidate.id !== item.id && getBaseLetter(candidate.display) === baseLetter,
    );

    const optionDisplays = shuffle([
      item.display,
      ...sameLetterItems.slice(0, 2).map((candidate) => candidate.display),
    ]);

    return {
      item,
      type,
      prompt: `Choose the Arabic form for “${item.reading}”.`,
      correctValue: item.display,
      options: optionDisplays.map((display) => ({
        id: display,
        label: display,
        value: display,
      })),
    };
  }

  const harakaOptions = shuffle(['fatha', 'kasra', 'damma'] as HarakaType[]);

  return {
    item,
    type,
    prompt: 'Which Harakat is on this form?',
    correctValue: item.haraka,
    options: harakaOptions.map((haraka) => ({
      id: haraka,
      label: HARAKAT[haraka].name,
      value: haraka,
    })),
  };
}

function buildQuestions(items: ReadingPracticeItem[]): Question[] {
  const shuffledItems = shuffle(items);

  return shuffledItems.map((item, index) => {
    const type = QUESTION_TYPES[index % QUESTION_TYPES.length];
    return buildQuestion(item, type, shuffledItems);
  });
}

interface Props {
  onMark: (key: string) => void;
}

export function SimpleArabicReadingPractice({ onMark }: Props) {
  const [questions, setQuestions] = useState<Question[]>(() => buildQuestions(SIMPLE_READING_PRACTICE_ITEMS));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[questionIndex];
  const levelCounts = {
    1: SIMPLE_READING_PRACTICE_ITEMS.filter((item) => item.level === 1).length,
    2: SIMPLE_READING_PRACTICE_ITEMS.filter((item) => item.level === 2).length,
    3: SIMPLE_READING_PRACTICE_ITEMS.filter((item) => item.level === 3).length,
  };

  const handleSelect = (option: QuestionOption) => {
    if (!currentQuestion || status === 'correct') return;

    setSelected(option.value);
    setAttempts((prev) => prev + 1);

    if (option.value === currentQuestion.correctValue) {
      setStatus('correct');
      setScore((prev) => prev + 1);
      onMark(currentQuestion.item.id);
      return;
    }

    setStatus('wrong');
  };

  const handleNext = () => {
    if (!currentQuestion || status !== 'correct') return;

    if (questionIndex >= questions.length - 1) {
      setCompleted(true);
      return;
    }

    setQuestionIndex((prev) => prev + 1);
    setSelected(null);
    setStatus('idle');
  };

  const handleReset = () => {
    setQuestions(buildQuestions(SIMPLE_READING_PRACTICE_ITEMS));
    setQuestionIndex(0);
    setSelected(null);
    setStatus('idle');
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
          <p className="mt-1 text-sm text-primary-700">You finished all {SIMPLE_READING_PRACTICE_ITEMS.length} simple Arabic reading challenges.</p>
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

  const showTypeLabel =
    currentQuestion.type === 'read'
      ? 'Read this'
      : currentQuestion.type === 'choose-combination'
        ? 'Choose the correct combination'
        : 'Find the correct Harakat';

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

      <div className="mb-4 grid grid-cols-3 gap-2">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className="rounded-2xl bg-white/80 p-2.5 text-center shadow-sm ring-1 ring-primary-100"
          >
            <p className="text-[10px] font-black uppercase tracking-wide text-primary-700">Level {level}</p>
            <p className="mt-1 text-xs font-bold text-primary-900">{levelCounts[level as 1 | 2 | 3]} items</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-primary-100">
        <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-primary-700">
          <span>
            Question {Math.min(questionIndex + 1, questions.length)} / {questions.length}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-1 text-[10px] font-black text-primary-700">
            <BookOpen size={11} /> {currentQuestion.item.level}
          </span>
        </div>

        <div
          className={`mt-4 flex flex-col items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-primary-50 to-gold-50 p-6 text-center transition-all ${
            status === 'correct' ? 'success-burst' : ''
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-700">{showTypeLabel}</p>

          {currentQuestion.type === 'choose-combination' ? (
            <div className="mt-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-primary-100">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">Reading prompt</p>
              <p className="mt-2 text-3xl font-black text-primary-900">{currentQuestion.item.reading}</p>
            </div>
          ) : (
            <p className="mt-3 font-arabic text-7xl font-bold text-primary-900">{currentQuestion.item.display}</p>
          )}

          <p className="mt-3 text-sm font-bold text-primary-800">{currentQuestion.prompt}</p>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {currentQuestion.options.map((option) => {
            const isPicked = selected === option.value;
            const isCorrect = option.value === currentQuestion.correctValue;

            let cls = 'bg-white ring-1 ring-primary-100 text-primary-900 hover:bg-primary-50';

            if (status === 'correct') {
              if (isCorrect) cls = 'bg-green-50 ring-2 ring-green-500 text-green-700';
              else cls = 'bg-white ring-1 ring-gray-100 text-gray-400';
            } else if (status === 'wrong') {
              if (isCorrect) cls = 'bg-green-50 ring-2 ring-green-500 text-green-700';
              else if (isPicked) cls = 'bg-red-50 ring-2 ring-red-400 text-red-600';
              else cls = 'bg-white ring-1 ring-gray-100 text-gray-400';
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                className={`rounded-2xl p-3 text-left text-sm font-black transition-all active:scale-95 ${cls}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={currentQuestion.type === 'choose-combination' || currentQuestion.type === 'read' ? 'font-arabic text-3xl' : ''}
                  >
                    {currentQuestion.type === 'read' ? option.label : currentQuestion.type === 'choose-combination' ? option.label : option.label}
                  </span>
                  {status !== 'idle' && isCorrect && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                  {status === 'wrong' && isPicked && !isCorrect && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
                      <X size={11} strokeWidth={3} />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {status !== 'idle' && (
          <div
            className={`mt-4 rounded-2xl px-3 py-2 text-center text-sm font-bold ${
              status === 'correct' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {status === 'correct'
              ? `Correct! ${currentQuestion.item.display} is read as ${currentQuestion.item.reading}.`
              : `Nice try! ${currentQuestion.item.display} is read as ${currentQuestion.item.reading}.`}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleNext}
            disabled={status !== 'correct'}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-black transition-all active:scale-95 ${
              status === 'correct'
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                : 'cursor-not-allowed bg-gray-100 text-gray-400'
            }`}
          >
            {questionIndex >= questions.length - 1 ? 'Finish' : 'Next question'}
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

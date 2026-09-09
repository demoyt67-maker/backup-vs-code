import { useState } from 'react';
import { Lock, CheckCircle2, ChevronRight, Star, RotateCcw, BookOpen, Sparkles, Moon, Wind, Languages } from 'lucide-react';
import { BackHeader } from '@/components/BackHeader';
import { HarakatPractice } from '@/components/HarakatPractice';
import { InteractiveHarakatPractice } from '@/components/InteractiveHarakatPractice';
import { SimpleArabicReadingPractice, SIMPLE_READING_PRACTICE_ITEMS } from '@/components/SimpleReadingPractice';
import { INTERACTIVE_HARAKAT_PRACTICE_COUNT } from '@/data/interactiveHarakatPractice';
import { getLetterIllustrationMeta, getLetterIllustrationUrl } from '@/data/letterIllustrations';
import { WordLearnLevel, WordMatchingLevel, WordMultipleChoiceLevel, WordMemoryLevel, WordMixedChallengeLevel } from '@/components/WordActivities';
import {
  SET1_LEVELS,
  SET1_TITLE,
  SET1_TOTAL_LEVELS,
  SET2_LEVELS,
  SET2_TITLE,
  SET2_TOTAL_LEVELS,
  SET4_LEVELS,
  SET4_TITLE,
  SET4_TOTAL_LEVELS,
  SET5_LEVELS,
  SET5_TITLE,
  SET5_TOTAL_LEVELS,
  SET6_LEVELS,
  SET6_TITLE,
  SET6_TOTAL_LEVELS,
  HARAKAT,
  TANWEEN,
  SUKOON_SYMBOL,
  applyHaraka,
  applyTanween,
  harakatItemKey,
  tanweenItemKey,
  type HarakatLevel,
  type SetId,
} from '@/data/learningSets';
import { TOTAL_LETTERS, type ArabicLetter } from '@/data/letters';

interface Props {
  onHome: () => void;
  selectedClass: 1 | 2 | 3;
  isSuperAdminMode: boolean;
  learned: Set<number>;
  onToggleLetter: (letterIndex: number) => void;
  harakatLearned: Set<string>;
  onToggleHarakat: (key: string) => void;
  onMarkHarakat: (key: string) => void;
  readingPracticeLearned: Set<string>;
  onMarkReadingPractice: (key: string) => void;
  interactiveHarakatPracticeLearned: Set<string>;
  onMarkInteractiveHarakatPractice: (key: string) => void;
  sukoonLearned: Set<string>;
  onToggleSukoon: (key: string) => void;
  tanweenLearned: Set<string>;
  onToggleTanween: (key: string) => void;
  wordsLearned: Set<string>;
  onToggleWord: (key: string) => void;
  onMarkWord: (key: string) => void;
  onResetLearning: () => void;
}

// Exact required activity keys for unlock/progress checks
const SET2_REQUIRED_KEYS = SET2_LEVELS.flatMap((lvl) =>
  lvl.items.map((item) => harakatItemKey(item.letter.index, item.haraka)),
);
const SET4_REQUIRED_KEYS = SET4_LEVELS.flatMap((lvl) =>
  lvl.items.map((_, index) => `s4-${lvl.level}-${index}`),
);
const SET5_REQUIRED_KEYS = SET5_LEVELS.flatMap((lvl) => [
  ...lvl.items.map((item) => tanweenItemKey(item.letter.index, item.tanween)),
  ...(lvl.readingItems ?? []).map((_, index) => `s5-read-${lvl.level}-${index}`),
]);
const SET6_REQUIRED_KEYS = SET6_LEVELS.map((lvl) => `s6-l${lvl.level}`);

const SET2_TOTAL_ITEMS = SET2_REQUIRED_KEYS.length;
const SET4_TOTAL_ITEMS = SET4_REQUIRED_KEYS.length;
const SET5_TOTAL_ITEMS = SET5_REQUIRED_KEYS.length;
const SET6_TOTAL_ITEMS = SET6_REQUIRED_KEYS.length;

const AVAILABLE_SETS_BY_CLASS: Record<1 | 2 | 3, SetId[]> = {
  1: ['set1'],
  2: ['set2', 'set4'],
  3: ['set5', 'set6'],
};

export function LearnView({
  onHome,
  selectedClass,
  learned,
  onToggleLetter,
  harakatLearned,
  onToggleHarakat,
  onMarkHarakat,
  readingPracticeLearned,
  onMarkReadingPractice,
  interactiveHarakatPracticeLearned,
  onMarkInteractiveHarakatPractice,
  sukoonLearned,
  onToggleSukoon,
  tanweenLearned,
  onToggleTanween,
  wordsLearned,
  onToggleWord,
  onMarkWord,
  onResetLearning,
  isSuperAdminMode,
}: Props) {
  const availableSets = AVAILABLE_SETS_BY_CLASS[selectedClass];
  const [openSet, setOpenSet] = useState<SetId>(availableSets[0]);
  const [openLevel, setOpenLevel] = useState<number | null>(1);
  const [set1LetterIndexesByLevel, setSet1LetterIndexesByLevel] = useState<Record<number, number>>({});

  // ----- Completion checks -----
  const set1Complete = learned.size >= TOTAL_LETTERS;
  const set2Complete = SET2_REQUIRED_KEYS.every((key) => harakatLearned.has(key));
  const readingPracticeCompletedCount = SIMPLE_READING_PRACTICE_ITEMS.filter((item) => readingPracticeLearned.has(item.id)).length;
  const interactiveHarakatPracticeCompletedCount = interactiveHarakatPracticeLearned.size;
  const set4Complete = SET4_REQUIRED_KEYS.every((key) => sukoonLearned.has(key));
  const set5Complete = SET5_REQUIRED_KEYS.every((key) => tanweenLearned.has(key));
  const set6Complete = SET6_REQUIRED_KEYS.every((key) => wordsLearned.has(key));

  const set2CompletedCount = SET2_REQUIRED_KEYS.filter((key) => harakatLearned.has(key)).length;
  const set4CompletedCount = SET4_REQUIRED_KEYS.filter((key) => sukoonLearned.has(key)).length;
  const set5CompletedCount = SET5_REQUIRED_KEYS.filter((key) => tanweenLearned.has(key)).length;
  const set6CompletedCount = SET6_REQUIRED_KEYS.filter((key) => wordsLearned.has(key)).length;

  // ----- Unlock chain: 1 → 2 → 4 → 5 → 6 -----
  const set2Unlocked = isSuperAdminMode ? true : selectedClass >= 2;
  const set4Unlocked = isSuperAdminMode ? true : selectedClass === 2 ? set2Complete : selectedClass === 3;
  const set5Unlocked = isSuperAdminMode ? true : selectedClass === 3;
  const set6Unlocked = isSuperAdminMode ? true : selectedClass === 3 ? set5Complete : false;

  // ----- Set 1 helpers -----
  const isSet1LevelUnlocked = (level: number): boolean => {
    if (isSuperAdminMode) return true;
    if (level === 1) return true;
    const prev = SET1_LEVELS[level - 2];
    return prev.letters.every((l) => learned.has(l.index));
  };

  const set1LevelCompletedCount = (letters: ArabicLetter[]): number =>
    letters.filter((l) => learned.has(l.index)).length;

  // ----- Set 2 helpers -----
  const isSet2LevelUnlocked = (level: number): boolean => {
    if (isSuperAdminMode) return true;
    if (!set2Unlocked) return false;
    if (level === 1) return true;
    const prev = SET2_LEVELS[level - 2];
    return prev.items.every((item) => harakatLearned.has(harakatItemKey(item.letter.index, item.haraka)));
  };

  const set2LevelCompletedCount = (level: HarakatLevel): number =>
    level.items.filter((item) => harakatLearned.has(harakatItemKey(item.letter.index, item.haraka))).length;

  // ----- Set 4 helpers -----
  const isSet4LevelUnlocked = (level: number): boolean => {
    if (isSuperAdminMode) return true;
    if (!set4Unlocked) return false;
    if (level === 1) return true;
    const prev = SET4_LEVELS[level - 2];
    return prev.items.every((_, i) => sukoonLearned.has(`s4-${prev.level}-${i}`));
  };

  const set4LevelCompletedCount = (level: number): number => {
    const lvl = SET4_LEVELS[level - 1];
    return lvl.items.filter((_, i) => sukoonLearned.has(`s4-${lvl.level}-${i}`)).length;
  };

  // ----- Set 5 helpers -----
  const isSet5LevelUnlocked = (level: number): boolean => {
    if (isSuperAdminMode) return true;
    if (!set5Unlocked) return false;
    if (level === 1) return true;
    const prev = SET5_LEVELS[level - 2];
    const prevKeys = prev.items.map((item) => tanweenItemKey(item.letter.index, item.tanween));
    return prevKeys.every((k) => tanweenLearned.has(k));
  };

  const set5LevelCompletedCount = (level: number): number => {
    const lvl = SET5_LEVELS[level - 1];
    const itemKeys = lvl.items.map((item) => tanweenItemKey(item.letter.index, item.tanween));
    const readingKeys = (lvl.readingItems ?? []).map((_, index) => `s5-read-${lvl.level}-${index}`);
    return [...itemKeys, ...readingKeys].filter((key) => tanweenLearned.has(key)).length;
  };

  const set5LevelRequiredCount = (level: number): number => {
    const lvl = SET5_LEVELS[level - 1];
    return lvl.items.length + (lvl.readingItems?.length ?? 0);
  };

  // ----- Common -----
  const handleSetClick = (set: SetId) => {
    const unlockedMap: Record<SetId, boolean> = {
      set1: isSuperAdminMode ? true : selectedClass === 1,
      set2: isSuperAdminMode ? true : selectedClass >= 2,
      set4: isSuperAdminMode ? true : selectedClass === 2 ? set2Complete : selectedClass === 3,
      set5: isSuperAdminMode ? true : selectedClass === 3,
      set6: isSuperAdminMode ? true : selectedClass === 3 ? set5Complete : false,
    };
    if (!unlockedMap[set]) return;
    setOpenSet(set);
    setOpenLevel(1);
  };

  const handleLevelClick = (level: number, isUnlocked: boolean) => {
    if (!isUnlocked) return;
    setOpenLevel(level);
  };

  // ----- Set metadata for selector -----
  type SetButton = {
    id: SetId;
    title: string;
    subtitle: string;
    icon: typeof BookOpen;
    unlocked: boolean;
    complete: boolean;
    activeCls: string;
    inactiveUnlockedCls: string;
    iconActiveCls: string;
    iconInactiveCls: string;
  };

  const setButtons: SetButton[] = [
    {
      id: 'set1',
      title: SET1_TITLE,
      subtitle: `${SET1_TOTAL_LEVELS} levels • ${learned.size}/28 letters`,
      icon: BookOpen,
      unlocked: true,
      complete: set1Complete,
      activeCls: 'from-primary-700 to-primary-950 text-white ring-primary-700',
      inactiveUnlockedCls: 'bg-white text-primary-900 ring-primary-50 hover:-translate-y-0.5',
      iconActiveCls: 'bg-white/15 text-white',
      iconInactiveCls: 'bg-gradient-to-br from-primary-600 to-primary-700 text-white',
    },
    {
      id: 'set2',
      title: SET2_TITLE,
      subtitle: set2Unlocked ? `${SET2_TOTAL_LEVELS} levels • ${set2CompletedCount}/${SET2_TOTAL_ITEMS} learned` : 'Complete Set 1 to unlock',
      icon: Sparkles,
      unlocked: set2Unlocked,
      complete: set2Complete,
      activeCls: 'from-gold-500 to-gold-700 text-white ring-gold-600',
      inactiveUnlockedCls: 'bg-white text-primary-900 ring-gold-100 hover:-translate-y-0.5',
      iconActiveCls: 'bg-white/20 text-white',
      iconInactiveCls: 'bg-gradient-to-br from-gold-400 to-gold-600 text-white',
    },
    {
      id: 'set4',
      title: SET4_TITLE,
      subtitle: set4Unlocked ? `${SET4_TOTAL_LEVELS} levels • ${set4CompletedCount}/${SET4_TOTAL_ITEMS} learned` : 'Complete Set 2 to unlock',
      icon: Moon,
      unlocked: set4Unlocked,
      complete: set4Complete,
      activeCls: 'from-teal-600 to-teal-800 text-white ring-teal-600',
      inactiveUnlockedCls: 'bg-white text-primary-900 ring-teal-100 hover:-translate-y-0.5',
      iconActiveCls: 'bg-white/20 text-white',
      iconInactiveCls: 'bg-gradient-to-br from-teal-500 to-teal-700 text-white',
    },
    {
      id: 'set5',
      title: SET5_TITLE,
      subtitle: set5Unlocked ? `${SET5_TOTAL_LEVELS} levels • ${set5CompletedCount}/${SET5_TOTAL_ITEMS} learned` : 'Complete Set 4 to unlock',
      icon: Wind,
      unlocked: set5Unlocked,
      complete: set5Complete,
      activeCls: 'from-primary-600 to-teal-700 text-white ring-primary-600',
      inactiveUnlockedCls: 'bg-white text-primary-900 ring-primary-100 hover:-translate-y-0.5',
      iconActiveCls: 'bg-white/20 text-white',
      iconInactiveCls: 'bg-gradient-to-br from-primary-500 to-teal-600 text-white',
    },
    {
      id: 'set6',
      title: SET6_TITLE,
      subtitle: set6Unlocked ? `${SET6_TOTAL_LEVELS} levels • ${set6CompletedCount}/${SET6_TOTAL_ITEMS} learned` : 'Complete Set 5 to unlock',
      icon: Languages,
      unlocked: set6Unlocked,
      complete: set6Complete,
      activeCls: 'from-gold-600 to-primary-800 text-white ring-gold-600',
      inactiveUnlockedCls: 'bg-white text-primary-900 ring-gold-100 hover:-translate-y-0.5',
      iconActiveCls: 'bg-white/20 text-white',
      iconInactiveCls: 'bg-gradient-to-br from-gold-500 to-primary-600 text-white',
    },
  ];

  const visibleSetButtons = setButtons.filter((set): set is SetButton => availableSets.includes(set.id));

  return (
    <div className="screen-shell mx-auto max-w-4xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Learn Arabic" onBack={onHome} subtitle="Learning Sets" />

      {/* Set selector */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visibleSetButtons.map((s) => {
          const isOpen = openSet === s.id;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => handleSetClick(s.id)}
              disabled={!s.unlocked}
              className={`screen-reveal liquid-card interactive-card flex items-center gap-3 rounded-[1.5rem] border p-4 text-left shadow-sm hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
                isOpen
                  ? `bg-gradient-to-br ${s.activeCls}`
                  : s.unlocked
                    ? s.inactiveUnlockedCls
                    : 'bg-white text-gray-400 ring-gray-100 opacity-70 cursor-not-allowed'
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-bold text-lg shadow-sm ${
                  isOpen ? s.iconActiveCls : s.unlocked ? s.iconInactiveCls : 'bg-gray-100 text-gray-400'
                }`}
              >
                {s.unlocked ? <Icon size={22} /> : <Lock size={20} />}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold leading-tight">{s.title}</h3>
                <p
                  className={`text-xs ${
                    isOpen ? 'text-white/70' : s.unlocked ? 'text-primary-700' : 'text-gray-400'
                  }`}
                >
                  {s.subtitle}
                </p>
              </div>
              {s.complete && (
                <CheckCircle2
                  size={20}
                  className={isOpen ? 'text-green-300' : 'text-green-500'}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ---------- SET 1 ---------- */}
      {openSet === 'set1' && (
        <>
          <SetSummaryHeader
            title={SET1_TITLE}
            subtitle={`${SET1_TOTAL_LEVELS} levels • 4 letters each`}
            count={`${learned.size}/28`}
            countLabel="Letters learned"
            gradient="from-primary-700 to-primary-950"
            barColor="from-gold-400 to-gold-500"
            pct={(learned.size / 28) * 100}
            icon={<BookOpen size={24} />}
            hint={!set1Complete ? `Complete all 28 letters to unlock ${SET2_TITLE}` : undefined}
          />
          <div className="space-y-3">
            {SET1_LEVELS.map(({ level, letters }) => {
              const unlocked = isSet1LevelUnlocked(level);
              const completed = set1LevelCompletedCount(letters);
              const allDone = completed === letters.length;
              const isOpen = openLevel === level && unlocked;
              const currentLetterIndex = set1LetterIndexesByLevel[level] ?? 0;
              const currentLetter = letters[currentLetterIndex] ?? letters[0];
              const currentVisual = getLetterIllustrationMeta(currentLetter);

              const moveLetter = (direction: number) => {
                setSet1LetterIndexesByLevel((prev) => {
                  const current = prev[level] ?? 0;
                  const nextIndex = Math.max(0, Math.min(letters.length - 1, current + direction));
                  return {
                    ...prev,
                    [level]: nextIndex,
                  };
                });
              };

              return (
                <LevelCard
                  key={level}
                  level={level}
                  title={`Level ${level}`}
                  unlocked={unlocked}
                  completed={completed}
                  total={letters.length}
                  isOpen={isOpen}
                  ringColor="ring-primary-50"
                  unlockedBar="from-primary-500 to-teal-500"
                  hoverColor="hover:bg-primary-50/50"
                  chevronColor="text-primary-600"
                  onClick={() => handleLevelClick(level, unlocked)}
                >
                  <div className="space-y-4">
                    <div className="rounded-[1.75rem] bg-gradient-to-br from-primary-50 via-white to-teal-50 p-4 ring-1 ring-primary-100">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-3 inline-flex items-center rounded-full bg-primary-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-primary-700">
                          Letter {currentLetter.index} of 28
                        </div>

                        <span className="font-arabic text-[7rem] leading-none text-primary-900 drop-shadow-[0_10px_24px_rgba(13,82,74,0.18)] sm:text-[8rem]">
                          {currentLetter.arabic}
                        </span>

                        <p className="mt-3 font-arabic text-[2.5rem] leading-tight text-primary-800 sm:text-[3rem]">
                          {currentVisual.arabicObjectName}
                        </p>

                        <p className="mt-1 text-lg font-bold text-primary-700">{currentVisual.label}</p>
                      </div>

                      <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-primary-50 to-white p-1.5 shadow-inner ring-1 ring-primary-100">
                        <img
                          src={getLetterIllustrationUrl(currentLetter)}
                          alt={`${currentVisual.label} illustration`}
                          className="mx-auto h-[180px] w-full max-w-[260px] rounded-[1.2rem] object-contain sm:h-[200px] sm:max-w-[280px]"
                        />
                      </div>

                      <div className="mt-4">
                        <p className="mb-3 text-center text-xs font-black uppercase tracking-wider text-primary-700">Letter with Harakat</p>
                        <div className="flex justify-center gap-2 sm:gap-3">
                          {Object.values(HARAKAT).map((haraka) => (
                            <div
                              key={haraka.id}
                              className="flex flex-col items-center rounded-[1.25rem] bg-white/80 p-3 shadow-sm ring-1 ring-primary-100 backdrop-blur-sm"
                            >
                              <span className="font-arabic text-4xl font-bold text-primary-900 sm:text-5xl">
                                {applyHaraka(currentLetter.arabic, haraka.id)}
                              </span>
                              <span className="mt-1 text-xs font-bold text-primary-700">{haraka.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveLetter(-1)}
                          disabled={currentLetterIndex === 0}
                          className={`rounded-full px-3 py-2 text-sm font-black transition-all active:scale-95 ${
                            currentLetterIndex === 0
                              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                              : 'bg-white text-primary-800 ring-1 ring-primary-100 hover:bg-primary-50'
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => moveLetter(1)}
                          disabled={currentLetterIndex === letters.length - 1}
                          className={`rounded-full px-3 py-2 text-sm font-black transition-all active:scale-95 ${
                            currentLetterIndex === letters.length - 1
                              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                              : 'bg-white text-primary-800 ring-1 ring-primary-100 hover:bg-primary-50'
                          }`}
                        >
                          Next
                        </button>
                      </div>

                      <button
                        onClick={() => onToggleLetter(currentLetter.index)}
                        className={`rounded-full px-4 py-2 text-sm font-black transition-all active:scale-95 ${
                          learned.has(currentLetter.index)
                            ? 'bg-green-500 text-white shadow-md hover:bg-green-600'
                            : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md hover:shadow-lg'
                        }`}
                      >
                        {learned.has(currentLetter.index) ? 'Mark as not learned' : 'Mark as learned'}
                      </button>
                    </div>

                    <div className="rounded-[1.25rem] bg-white p-3 shadow-sm ring-1 ring-primary-100">
                      <div className="flex flex-wrap justify-center gap-2">
                        {letters.map((letter, index) => {
                          const isSelected = currentLetterIndex === index;
                          const isLearned = learned.has(letter.index);

                          return (
                            <button
                              key={letter.index}
                              onClick={() => setSet1LetterIndexesByLevel((prev) => ({ ...prev, [level]: index }))}
                              className={`flex items-center gap-2 rounded-full px-2.5 py-2 text-left text-xs font-black transition-all active:scale-95 ${
                                isSelected
                                  ? 'bg-primary-700 text-white shadow-sm'
                                  : isLearned
                                    ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                                    : 'bg-primary-50 text-primary-700 ring-1 ring-primary-100'
                              }`}
                            >
                              <span className="font-arabic text-2xl">{letter.arabic}</span>
                              <span>{letter.english}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {!allDone && (
                    <p className="mt-3 text-center text-xs text-primary-700">
                      Complete all 4 letters to unlock Level {level + 1 <= SET1_TOTAL_LEVELS ? level + 1 : '—'}
                    </p>
                  )}
                </LevelCard>
              );
            })}
          </div>
        </>
      )}

      {/* ---------- SET 2 ---------- */}
      {openSet === 'set2' && set2Unlocked && (
        <>
          <SetSummaryHeader
            title={SET2_TITLE}
            subtitle={`${SET2_TOTAL_LEVELS} levels • vowel signs`}
            count={`${set2CompletedCount}/${SET2_TOTAL_ITEMS}`}
            countLabel="Combos learned"
            gradient="from-gold-500 to-gold-700"
            barColor="from-white to-white"
            pct={Math.min(100, (set2CompletedCount / SET2_TOTAL_ITEMS) * 100)}
            icon={<Sparkles size={24} />}
            barBg="bg-white/20"
          />
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {(Object.keys(HARAKAT) as Array<keyof typeof HARAKAT>).map((h) => {
              const hi = HARAKAT[h];
              return (
                <div key={h} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-gold-100">
                  <span className="font-arabic text-2xl font-bold text-primary-900">{hi.symbol}</span>
                  <span className="text-xs font-bold text-primary-700">{hi.name}</span>
                  <span className="font-malayalam text-xs text-gold-700">{hi.malayalam}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-gold-100">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-black text-primary-900">Interactive Harakat Practice</h4>
                <p className="text-xs text-primary-700">
                  {interactiveHarakatPracticeCompletedCount}/{INTERACTIVE_HARAKAT_PRACTICE_COUNT} practice questions completed
                </p>
              </div>
              <span className="rounded-full bg-gold-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-gold-700">
                Class 2 only
              </span>
            </div>
            <InteractiveHarakatPractice
              completedKeys={interactiveHarakatPracticeLearned}
              onMarkQuestion={onMarkInteractiveHarakatPractice}
            />
          </div>
          <div className="space-y-3">
            {SET2_LEVELS.map((lvl) => {
              const unlocked = isSet2LevelUnlocked(lvl.level);
              const completed = set2LevelCompletedCount(lvl);
              const allDone = completed === lvl.items.length;
              const isOpen = openLevel === lvl.level && unlocked;
              return (
                <LevelCard
                  key={lvl.level}
                  level={lvl.level}
                  title={`Level ${lvl.level}`}
                  subtitle={lvl.title}
                  unlocked={unlocked}
                  completed={completed}
                  total={lvl.items.length}
                  isOpen={isOpen}
                  ringColor="ring-gold-50"
                  unlockedBar="from-gold-400 to-gold-600"
                  hoverColor="hover:bg-gold-50/40"
                  chevronColor="text-gold-500"
                  barBg="bg-gold-100"
                  onClick={() => handleLevelClick(lvl.level, unlocked)}
                >
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {lvl.items.map((item) => {
                      const key = harakatItemKey(item.letter.index, item.haraka);
                      const isLearned = harakatLearned.has(key);
                      const hi = HARAKAT[item.haraka];
                      return (
                        <button
                          key={key}
                          onClick={() => onToggleHarakat(key)}
                          className={`group relative rounded-2xl p-3 text-center shadow-sm ring-1 transition-all active:scale-95 ${
                            isLearned ? 'bg-green-50 ring-2 ring-green-400' : 'bg-white ring-gold-50 hover:-translate-y-0.5 hover:shadow-md'
                          }`}
                        >
                          {isLearned && (
                            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow">
                              <CheckCircle2 size={12} strokeWidth={3} />
                            </span>
                          )}
                          <div className="mt-2 flex h-16 items-center justify-center rounded-xl bg-gradient-to-br from-gold-50 to-primary-50 transition-transform group-hover:scale-105">
                            <span className="font-arabic text-5xl font-bold text-primary-900">{applyHaraka(item.letter.arabic, item.haraka)}</span>
                          </div>
                          <p className="mt-2 text-xs font-bold text-primary-700">{hi.name}</p>
                          <p className="font-malayalam text-xs text-gold-700">{hi.malayalam}</p>
                          <p className="mt-1 text-[10px] font-medium text-primary-700">{item.letter.english} + {hi.name}</p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-gold-600">{isLearned ? 'Tap to undo' : 'Tap when learned'}</p>
                        </button>
                      );
                    })}
                  </div>
                  <HarakatPractice level={lvl} onMark={onMarkHarakat} />
                  {!allDone && (
                    <p className="mt-3 text-center text-xs text-gold-700/70">
                      Complete all {lvl.items.length} combos to unlock Level {lvl.level + 1 <= SET2_TOTAL_LEVELS ? lvl.level + 1 : '—'}
                    </p>
                  )}
                </LevelCard>
              );
            })}
          </div>

          <div className="mt-4 rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-primary-100">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-black text-primary-900">Simple Arabic Reading Practice</h4>
                <p className="text-xs text-primary-700">
                  {readingPracticeCompletedCount}/{SIMPLE_READING_PRACTICE_ITEMS.length} reading cards practiced
                </p>
              </div>
              <span className="rounded-full bg-primary-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-primary-700">
                Class 2 only
              </span>
            </div>
            <SimpleArabicReadingPractice onMark={onMarkReadingPractice} />
          </div>
        </>
      )}

      {/* ---------- SET 4: Sukoon ---------- */}
      {openSet === 'set4' && set4Unlocked && (
        <>
          <SetSummaryHeader
            title={SET4_TITLE}
            subtitle={`${SET4_TOTAL_LEVELS} levels • sukoon (ْ)`}
            count={`${set4CompletedCount}/${SET4_TOTAL_ITEMS}`}
            countLabel="Items learned"
            gradient="from-teal-600 to-teal-800"
            barColor="from-white to-white"
            pct={Math.min(100, (set4CompletedCount / SET4_TOTAL_ITEMS) * 100)}
            icon={<Moon size={24} />}
            barBg="bg-white/20"
          />
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-teal-100">
              <span className="font-arabic text-2xl font-bold text-primary-900">{SUKOON_SYMBOL}</span>
              <span className="text-xs font-bold text-primary-700">Sukoon</span>
              <span className="font-malayalam text-xs text-teal-700">സുകൂൻ</span>
            </div>
          </div>
          <div className="space-y-3">
            {SET4_LEVELS.map((lvl) => {
              const unlocked = isSet4LevelUnlocked(lvl.level);
              const completed = set4LevelCompletedCount(lvl.level);
              const allDone = completed === lvl.items.length;
              const isOpen = openLevel === lvl.level && unlocked;
              return (
                <LevelCard
                  key={lvl.level}
                  level={lvl.level}
                  title={`Level ${lvl.level}`}
                  subtitle={lvl.title}
                  unlocked={unlocked}
                  completed={completed}
                  total={lvl.items.length}
                  isOpen={isOpen}
                  ringColor="ring-teal-50"
                  unlockedBar="from-teal-400 to-teal-600"
                  hoverColor="hover:bg-teal-50/40"
                  chevronColor="text-teal-500"
                  barBg="bg-teal-100"
                  onClick={() => handleLevelClick(lvl.level, unlocked)}
                >
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {lvl.items.map((item, i) => {
                      const key = `s4-${lvl.level}-${i}`;
                      const isLearned = sukoonLearned.has(key);
                      return (
                        <button
                          key={key}
                          onClick={() => onToggleSukoon(key)}
                          className={`group relative rounded-2xl p-3 text-center shadow-sm ring-1 transition-all active:scale-95 ${
                            isLearned ? 'bg-green-50 ring-2 ring-green-400' : 'bg-white ring-teal-50 hover:-translate-y-0.5 hover:shadow-md'
                          }`}
                        >
                          {isLearned && (
                            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow">
                              <CheckCircle2 size={12} strokeWidth={3} />
                            </span>
                          )}
                          <div className="mt-2 flex h-16 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-primary-50 transition-transform group-hover:scale-105">
                            <span className="font-arabic text-5xl font-bold text-primary-900">{item.arabic}</span>
                          </div>
                          <p className="mt-2 text-xs font-bold text-primary-700">{item.label}</p>
                          {item.malayalam && <p className="font-malayalam text-xs text-teal-700">{item.malayalam}</p>}
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-teal-600">{isLearned ? 'Tap to undo' : 'Tap when learned'}</p>
                        </button>
                      );
                    })}
                  </div>
                  {!allDone && (
                    <p className="mt-3 text-center text-xs text-teal-700/70">
                      Complete all {lvl.items.length} items to unlock Level {lvl.level + 1 <= SET4_TOTAL_LEVELS ? lvl.level + 1 : '—'}
                    </p>
                  )}
                </LevelCard>
              );
            })}
          </div>
        </>
      )}

      {/* ---------- SET 5: Tanween ---------- */}
      {openSet === 'set5' && set5Unlocked && (
        <>
          <SetSummaryHeader
            title={SET5_TITLE}
            subtitle={`${SET5_TOTAL_LEVELS} levels • double vowels`}
            count={`${set5CompletedCount}/${SET5_TOTAL_ITEMS}`}
            countLabel="Items learned"
            gradient="from-primary-600 to-teal-700"
            barColor="from-white to-white"
            pct={Math.min(100, (set5CompletedCount / SET5_TOTAL_ITEMS) * 100)}
            icon={<Wind size={24} />}
            barBg="bg-white/20"
          />
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {(Object.keys(TANWEEN) as Array<keyof typeof TANWEEN>).map((t) => {
              const ti = TANWEEN[t];
              return (
                <div key={t} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-primary-100">
                  <span className="font-arabic text-2xl font-bold text-primary-900">{ti.symbol}</span>
                  <span className="text-xs font-bold text-primary-700">{ti.name}</span>
                  <span className="font-malayalam text-xs text-primary-600">{ti.malayalam}</span>
                </div>
              );
            })}
          </div>
          <div className="space-y-3">
            {SET5_LEVELS.map((lvl) => {
              const unlocked = isSet5LevelUnlocked(lvl.level);
              const completed = set5LevelCompletedCount(lvl.level);
              const totalRequired = set5LevelRequiredCount(lvl.level);
              const allDone = completed === totalRequired;
              const isOpen = openLevel === lvl.level && unlocked;
              return (
                <LevelCard
                  key={lvl.level}
                  level={lvl.level}
                  title={`Level ${lvl.level}`}
                  subtitle={lvl.title}
                  unlocked={unlocked}
                  completed={completed}
                  total={lvl.items.length}
                  isOpen={isOpen}
                  ringColor="ring-primary-50"
                  unlockedBar="from-primary-400 to-teal-500"
                  hoverColor="hover:bg-primary-50/40"
                  chevronColor="text-primary-600"
                  barBg="bg-primary-100"
                  onClick={() => handleLevelClick(lvl.level, unlocked)}
                >
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {lvl.items.map((item) => {
                      const key = tanweenItemKey(item.letter.index, item.tanween);
                      const isLearned = tanweenLearned.has(key);
                      const ti = TANWEEN[item.tanween];
                      return (
                        <button
                          key={key}
                          onClick={() => onToggleTanween(key)}
                          className={`group relative rounded-2xl p-3 text-center shadow-sm ring-1 transition-all active:scale-95 ${
                            isLearned ? 'bg-green-50 ring-2 ring-green-400' : 'bg-white ring-primary-50 hover:-translate-y-0.5 hover:shadow-md'
                          }`}
                        >
                          {isLearned && (
                            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow">
                              <CheckCircle2 size={12} strokeWidth={3} />
                            </span>
                          )}
                          <div className="mt-2 flex h-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-teal-50 transition-transform group-hover:scale-105">
                            <span className="font-arabic text-5xl font-bold text-primary-900">{applyTanween(item.letter.arabic, item.tanween)}</span>
                          </div>
                          <p className="mt-2 text-xs font-bold text-primary-700">{ti.name}</p>
                          <p className="font-malayalam text-xs text-primary-600">{ti.malayalam}</p>
                          <p className="mt-1 text-[10px] font-medium text-primary-700">{item.letter.english} + {ti.name}</p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-primary-700">{isLearned ? 'Tap to undo' : 'Tap when learned'}</p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Reading items for level 5 */}
                  {lvl.readingItems && lvl.readingItems.length > 0 && (
                    <div className="mt-3 border-t border-primary-50 pt-3">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-primary-700">Reading Practice</p>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                        {lvl.readingItems.map((item, i) => {
                          const key = `s5-read-${lvl.level}-${i}`;
                          const isLearned = tanweenLearned.has(key);
                          return (
                            <button
                              key={key}
                              onClick={() => onToggleTanween(key)}
                              className={`group relative rounded-2xl p-3 text-center shadow-sm ring-1 transition-all active:scale-95 ${
                                isLearned ? 'bg-green-50 ring-2 ring-green-400' : 'bg-white ring-primary-50 hover:-translate-y-0.5 hover:shadow-md'
                              }`}
                            >
                              {isLearned && (
                                <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow">
                                  <CheckCircle2 size={12} strokeWidth={3} />
                                </span>
                              )}
                              <div className="mt-2 flex h-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-teal-50 transition-transform group-hover:scale-105">
                                <span className="font-arabic text-4xl font-bold text-primary-900">{item.arabic}</span>
                              </div>
                              <p className="mt-2 text-xs font-bold text-primary-700">{item.label}</p>
                              <p className="font-malayalam text-xs text-primary-600">{item.malayalam}</p>
                              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-primary-700">{isLearned ? 'Tap to undo' : 'Tap when learned'}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!allDone && (
                    <p className="mt-3 text-center text-xs text-primary-700">
                      Complete all {totalRequired} required items to unlock Level {lvl.level + 1 <= SET5_TOTAL_LEVELS ? lvl.level + 1 : '—'}
                    </p>
                  )}
                </LevelCard>
              );
            })}
          </div>
        </>
      )}

      {/* ---------- SET 6: Arabic Words ---------- */}
      {openSet === 'set6' && set6Unlocked && (
        <>
          <SetSummaryHeader
            title={SET6_TITLE}
            subtitle={`${SET6_TOTAL_LEVELS} levels • words & fun activities`}
            count={`${set6CompletedCount}/${SET6_TOTAL_ITEMS}`}
            countLabel="Levels completed"
            gradient="from-gold-600 to-primary-800"
            barColor="from-white to-white"
            pct={Math.min(100, (set6CompletedCount / SET6_TOTAL_ITEMS) * 100)}
            icon={<Languages size={24} />}
            barBg="bg-white/20"
          />
          <div className="space-y-3">
            {SET6_LEVELS.map((lvl) => {
              const levelKey = `s6-l${lvl.level}`;
              const isLevelDone = wordsLearned.has(levelKey);
              const isLevel1Done = wordsLearned.has('s6-l1');
              const unlocked = lvl.level === 1 || (lvl.level === 2 && isLevel1Done) || (lvl.level === 3 && wordsLearned.has('s6-l2')) || (lvl.level === 4 && wordsLearned.has('s6-l3')) || (lvl.level === 5 && wordsLearned.has('s6-l4')) || (lvl.level === 6 && wordsLearned.has('s6-l5'));
              const isOpen = openLevel === lvl.level && unlocked;
              const completed = isLevelDone ? 1 : 0;
              return (
                <LevelCard
                  key={lvl.level}
                  level={lvl.level}
                  title={`Level ${lvl.level}`}
                  subtitle={lvl.title}
                  unlocked={unlocked}
                  completed={completed}
                  total={1}
                  isOpen={isOpen}
                  ringColor="ring-gold-50"
                  unlockedBar="from-gold-400 to-primary-500"
                  hoverColor="hover:bg-gold-50/40"
                  chevronColor="text-gold-500"
                  barBg="bg-gold-100"
                  onClick={() => handleLevelClick(lvl.level, unlocked)}
                >
                  {lvl.level === 1 && (
                    <WordLearnLevel wordsLearned={wordsLearned} onToggle={onToggleWord} onMark={onMarkWord} />
                  )}
                  {lvl.level === 2 && (
                    <WordMatchingLevel matchLang="malayalam" wordsLearned={wordsLearned} onComplete={onMarkWord} />
                  )}
                  {lvl.level === 3 && (
                    <WordMatchingLevel matchLang="english" wordsLearned={wordsLearned} onComplete={onMarkWord} />
                  )}
                  {lvl.level === 4 && (
                    <WordMultipleChoiceLevel wordsLearned={wordsLearned} onComplete={onMarkWord} />
                  )}
                  {lvl.level === 5 && (
                    <WordMemoryLevel wordsLearned={wordsLearned} onComplete={onMarkWord} />
                  )}
                  {lvl.level === 6 && (
                    <WordMixedChallengeLevel wordsLearned={wordsLearned} onComplete={onMarkWord} />
                  )}
                  {!isLevelDone && (
                    <p className="mt-3 text-center text-xs text-gold-700/70">
                      Complete this activity to unlock Level {lvl.level + 1 <= SET6_TOTAL_LEVELS ? lvl.level + 1 : '—'}
                    </p>
                  )}
                </LevelCard>
              );
            })}
          </div>
        </>
      )}

      {/* Locked set notice */}
      {(['set2', 'set4', 'set5', 'set6'] as const).includes(openSet as 'set2' | 'set4' | 'set5' | 'set6') &&
        openSet !== 'set1' &&
        !(
          (openSet === 'set2' && set2Unlocked) ||
          (openSet === 'set4' && set4Unlocked) ||
          (openSet === 'set5' && set5Unlocked) ||
          (openSet === 'set6' && set6Unlocked)
        ) && (
          <LockedNotice
            title={
              openSet === 'set2' ? SET2_TITLE : openSet === 'set4' ? SET4_TITLE : openSet === 'set5' ? SET5_TITLE : SET6_TITLE
            }
            message={
              openSet === 'set2'
                ? `Complete all 28 letters in ${SET1_TITLE} to unlock.`
                : openSet === 'set4'
                  ? `Complete all harakat in ${SET2_TITLE} to unlock.`
                  : openSet === 'set5'
                    ? `Complete all items in ${SET4_TITLE} to unlock.`
                    : `Complete all items in ${SET5_TITLE} to unlock.`
            }
            onGoToSet1={() => handleSetClick('set1')}
          />
        )}

      {/* Reset */}
      <button
        onClick={() => {
          if (confirm('Reset all learning progress? All levels and sets will lock again.')) onResetLearning();
        }}
        className="interactive-card mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-[#fffdf8] px-4 py-3 font-bold text-red-500 shadow-sm hover:bg-red-50 hover:shadow-md active:scale-95"
      >
        <RotateCcw size={18} /> Reset Learning Progress
      </button>
    </div>
  );
}

// ----- Shared sub-components -----

function SetSummaryHeader({
  title,
  subtitle,
  count,
  countLabel,
  gradient,
  barColor,
  pct,
  icon,
  hint,
  barBg = 'bg-white/15',
}: {
  title: string;
  subtitle: string;
  count: string;
  countLabel: string;
  gradient: string;
  barColor: string;
  pct: number;
  icon: React.ReactNode;
  hint?: string;
  barBg?: string;
}) {
  return (
    <div className={`screen-panel-dark relative mb-4 overflow-hidden rounded-[2rem] bg-gradient-to-br ${gradient} p-5 text-white shadow-xl sm:p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">{icon}</span>
          <div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-xs text-white/70">{subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{count}</p>
          <p className="text-[10px] uppercase tracking-wide text-white/60">{countLabel}</p>
        </div>
      </div>
      <div className={`mt-3 h-2 overflow-hidden rounded-full ${barBg}`}>
        <div className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      {hint && <p className="mt-3 text-center text-xs text-white/70">{hint}</p>}
    </div>
  );
}

function LevelCard({
  level,
  title,
  subtitle,
  unlocked,
  completed,
  total,
  isOpen,
  ringColor,
  unlockedBar,
  hoverColor,
  chevronColor,
  barBg = 'bg-primary-100',
  onClick,
  children,
}: {
  level: number;
  title: string;
  subtitle?: string;
  unlocked: boolean;
  completed: number;
  total: number;
  isOpen: boolean;
  ringColor: string;
  unlockedBar: string;
  hoverColor: string;
  chevronColor: string;
  barBg?: string;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  const allDone = completed === total;
  const pct = Math.round((completed / total) * 100);
  return (
    <div className={`screen-panel overflow-hidden rounded-[1.5rem] bg-[#fffdf8] transition-all ${unlocked ? ringColor : 'ring-gray-100 opacity-70'}`}>
      <button
        onClick={onClick}
        disabled={!unlocked}
        className={`flex w-full items-center gap-3 p-4 text-left transition-colors ${unlocked ? `${hoverColor} active:scale-[0.99]` : 'cursor-not-allowed'}`}
      >
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold text-lg shadow-sm ${
            allDone ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' : unlocked ? unlockedBar : 'bg-gray-100 text-gray-400'
          }`}
        >
          {allDone ? <CheckCircle2 size={24} /> : unlocked ? level : <Lock size={20} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-primary-900">{title}</h4>
            {subtitle && <span className="truncate text-xs font-semibold text-primary-700">{subtitle}</span>}
            {allDone && (
              <span className="flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                <Star size={10} className="fill-green-500 text-green-500" /> Complete
              </span>
            )}
            {!unlocked && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400">Locked</span>}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className={`h-1.5 flex-1 overflow-hidden rounded-full ${barBg}`}>
              <div className={`h-full rounded-full transition-all ${allDone ? 'bg-green-500' : `bg-gradient-to-r ${unlockedBar}`}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="shrink-0 text-xs font-bold text-primary-600">{completed}/{total}</span>
          </div>
        </div>
        {unlocked && <ChevronRight size={20} className={`shrink-0 ${chevronColor} transition-transform ${isOpen ? 'rotate-90' : ''}`} />}
      </button>
      {isOpen && <div className="animate-fade-in border-t border-[#ece5d5] bg-[#fbfaf4]/70 p-3">{children}</div>}
    </div>
  );
}

function LockedNotice({ title, message, onGoToSet1 }: { title: string; message: string; onGoToSet1: () => void }) {
  return (
    <div className="screen-panel rounded-[2rem] bg-[#fffdf8] p-8 text-center">
      <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Lock size={32} />
      </span>
      <h3 className="font-bold text-gray-600">{title} is locked</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      <button onClick={onGoToSet1} className="mt-4 rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-700 active:scale-95">
        Go to Set 1
      </button>
    </div>
  );
}

import { useState, useEffect, useMemo, useCallback } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Trophy, Eye, Shuffle, Star } from 'lucide-react';
import {
  ARABIC_WORDS,
  CATEGORY_LABELS,
  shuffle,
  pickRandom,
  type ArabicWord,
  type WordCategory,
} from '@/data/arabicWords';

// ============================================================
// Level 1 — Learn Simple Words (word cards with meanings)
// ============================================================

export function WordLearnLevel({
  wordsLearned,
  onToggle,
}: {
  wordsLearned: Set<string>;
  onToggle: (key: string) => void;
}) {
  const categories = Object.keys(CATEGORY_LABELS) as WordCategory[];

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const catWords = ARABIC_WORDS.filter((w) => w.category === cat);
        const catLabel = CATEGORY_LABELS[cat];
        return (
          <div key={cat}>
            <div className="mb-2 flex items-center gap-2">
              <h5 className="text-sm font-bold text-primary-800">{catLabel.english}</h5>
              <span className="font-malayalam text-xs text-primary-500/70">{catLabel.malayalam}</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {catWords.map((word) => {
                const key = `s6-l1-${word.id}`;
                const isLearned = wordsLearned.has(key);
                return (
                  <button
                    key={word.id}
                    onClick={() => onToggle(key)}
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
                      <span className="font-arabic text-4xl font-bold text-primary-800">{word.arabic}</span>
                    </div>
                    <p className="mt-2 font-malayalam text-sm font-semibold text-primary-700">{word.malayalam}</p>
                    <p className="text-xs font-medium text-primary-500/70">{word.english}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-primary-400">
                      {isLearned ? 'Tap to undo' : 'Tap when learned'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Level 2 & 3 — Word Matching (Arabic → Malayalam / English)
// ============================================================

export function WordMatchingLevel({
  matchLang,
  wordsLearned,
  onComplete,
}: {
  matchLang: 'malayalam' | 'english';
  wordsLearned: Set<string>;
  onComplete: (key: string) => void;
}) {
  const levelKey = matchLang === 'malayalam' ? 's6-l2' : 's6-l3';
  const isCompleted = wordsLearned.has(levelKey);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<string | null>(null);
  const [selectedArabic, setSelectedArabic] = useState<string | null>(null);
  const [roundDone, setRoundDone] = useState(false);

  const WORDS_PER_ROUND = 4;
  const TOTAL_ROUNDS = 3;

  const currentWords = useMemo(() => {
    return pickRandom(ARABIC_WORDS, WORDS_PER_ROUND);
  }, [round]);

  // Shuffled meanings for the current round
  const shuffledMeanings = useMemo(() => {
    return shuffle(currentWords);
  }, [currentWords]);

  const totalToMatch = currentWords.length;

  const handleArabicClick = (wordId: string) => {
    if (matched.has(wordId)) return;
    setSelectedArabic(wordId);
    setWrongPair(null);
  };

  const handleMeaningClick = (word: ArabicWord) => {
    if (matched.has(word.id) || !selectedArabic) return;
    if (selectedArabic === word.id) {
      const next = new Set(matched);
      next.add(word.id);
      setMatched(next);
      setScore(score + 1);
      setSelectedArabic(null);
      setWrongPair(null);
      if (next.size === totalToMatch) {
        setRoundDone(true);
      }
    } else {
      setWrongPair(word.id);
      setTimeout(() => setWrongPair(null), 800);
    }
  };

  const nextRound = () => {
    if (round + 1 >= TOTAL_ROUNDS) {
      onComplete(levelKey);
    } else {
      setRound(round + 1);
      setMatched(new Set());
      setSelectedArabic(null);
      setWrongPair(null);
      setRoundDone(false);
    }
  };

  const restart = () => {
    setRound(0);
    setScore(0);
    setMatched(new Set());
    setSelectedArabic(null);
    setWrongPair(null);
    setRoundDone(false);
  };

  const meaningText = (w: ArabicWord) => matchLang === 'malayalam' ? w.malayalam : w.english;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-teal-500 transition-all"
            style={{ width: `${(matched.size / totalToMatch) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-primary-600">
          Round {round + 1}/{TOTAL_ROUNDS} • {matched.size}/{totalToMatch}
        </span>
      </div>

      {isCompleted && (
        <div className="rounded-2xl bg-green-50 p-3 text-center text-sm font-bold text-green-700 ring-1 ring-green-200">
          <CheckCircle2 size={16} className="mr-1 inline" /> Level completed! Score: {score}
        </div>
      )}

      {!isCompleted && (
        <>
          <p className="text-center text-xs font-semibold text-primary-500/70">
            {matchLang === 'malayalam' ? 'Tap an Arabic word, then tap its Malayalam meaning' : 'Tap an Arabic word, then tap its English meaning'}
          </p>

          {/* Arabic words (left column) */}
          <div className="grid grid-cols-2 gap-2.5">
            {currentWords.map((word) => {
              const isMatched = matched.has(word.id);
              const isSelected = selectedArabic === word.id;
              return (
                <button
                  key={word.id}
                  onClick={() => handleArabicClick(word.id)}
                  disabled={isMatched}
                  className={`rounded-2xl p-3 text-center shadow-sm ring-1 transition-all active:scale-95 ${
                    isMatched
                      ? 'bg-green-50 ring-2 ring-green-400 opacity-60'
                      : isSelected
                        ? 'bg-primary-100 ring-2 ring-primary-500'
                        : 'bg-white ring-primary-50 hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                >
                  <span className="font-arabic text-3xl font-bold text-primary-800">{word.arabic}</span>
                  {isMatched && (
                    <CheckCircle2 size={14} className="mx-auto mt-1 text-green-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Meanings (right column) */}
          <div className="grid grid-cols-2 gap-2.5">
            {shuffledMeanings.map((word) => {
              const isMatched = matched.has(word.id);
              const isWrong = wrongPair === word.id;
              return (
                <button
                  key={word.id}
                  onClick={() => handleMeaningClick(word)}
                  disabled={isMatched}
                  className={`rounded-2xl p-3 text-center shadow-sm ring-1 transition-all active:scale-95 ${
                    isMatched
                      ? 'bg-green-50 ring-2 ring-green-400 opacity-60'
                      : isWrong
                        ? 'bg-red-50 ring-2 ring-red-400'
                        : 'bg-white ring-primary-50 hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                >
                  {matchLang === 'malayalam' ? (
                    <span className="font-malayalam text-base font-semibold text-primary-700">{word.malayalam}</span>
                  ) : (
                    <span className="text-base font-semibold text-primary-700">{word.english}</span>
                  )}
                  {isMatched && <CheckCircle2 size={14} className="mx-auto mt-1 text-green-500" />}
                  {isWrong && <XCircle size={14} className="mx-auto mt-1 text-red-500" />}
                </button>
              );
            })}
          </div>

          {/* Round complete */}
          {roundDone && (
            <div className="animate-fade-in rounded-2xl bg-gradient-to-br from-primary-600 to-teal-600 p-4 text-center text-white shadow-lg">
              <Trophy size={28} className="mx-auto mb-2" />
              <p className="font-bold">Round {round + 1} Complete!</p>
              <p className="text-sm text-white/80">Score: {score}</p>
              <button
                onClick={nextRound}
                className="mt-3 rounded-xl bg-white px-5 py-2 text-sm font-bold text-primary-700 shadow-md transition-all hover:bg-primary-50 active:scale-95"
              >
                {round + 1 >= TOTAL_ROUNDS ? 'Finish Level' : 'Next Round'}
              </button>
            </div>
          )}

          <button
            onClick={restart}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-primary-500 ring-1 ring-primary-100 transition-all hover:bg-primary-50 active:scale-95"
          >
            <RotateCcw size={14} /> Restart
          </button>
        </>
      )}
    </div>
  );
}

// ============================================================
// Level 4 — Find the Correct Word (multiple choice)
// ============================================================

export function WordMultipleChoiceLevel({
  wordsLearned,
  onComplete,
}: {
  wordsLearned: Set<string>;
  onComplete: (key: string) => void;
}) {
  const levelKey = 's6-l4';
  const isCompleted = wordsLearned.has(levelKey);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const TOTAL_ROUNDS = 5;

  const { target, options } = useMemo(() => {
    const targetWord = pickRandom(ARABIC_WORDS, 1)[0];
    const distractors = pickRandom(
      ARABIC_WORDS.filter((w) => w.id !== targetWord.id),
      3,
    );
    return { target: targetWord, options: shuffle([targetWord, ...distractors]) };
  }, [round]);

  const [useMalayalam] = useState(() => Math.random() > 0.5);

  const handleSelect = (wordId: string) => {
    if (showResult) return;
    setSelected(wordId);
    setShowResult(true);
    if (wordId === target.id) {
      setScore(score + 1);
    }
  };

  const nextRound = () => {
    if (round + 1 >= TOTAL_ROUNDS) {
      onComplete(levelKey);
    } else {
      setRound(round + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  const restart = () => {
    setRound(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-teal-500 transition-all"
            style={{ width: `${((round + (showResult ? 1 : 0)) / TOTAL_ROUNDS) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-primary-600">{round + 1}/{TOTAL_ROUNDS}</span>
      </div>

      {isCompleted ? (
        <div className="rounded-2xl bg-green-50 p-3 text-center text-sm font-bold text-green-700 ring-1 ring-green-200">
          <CheckCircle2 size={16} className="mr-1 inline" /> Level completed! Score: {score}
        </div>
      ) : (
        <>
          {/* Meaning prompt */}
          <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-teal-600 p-5 text-center text-white shadow-lg">
            <p className="text-xs uppercase tracking-wide text-white/60">Find the Arabic word for</p>
            <p className="mt-2 text-2xl font-bold">
              {useMalayalam ? (
                <span className="font-malayalam">{target.malayalam}</span>
              ) : (
                target.english
              )}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5">
            {options.map((word) => {
              const isCorrect = word.id === target.id;
              const isSelected = selected === word.id;
              return (
                <button
                  key={word.id}
                  onClick={() => handleSelect(word.id)}
                  disabled={showResult}
                  className={`rounded-2xl p-4 text-center shadow-sm ring-1 transition-all active:scale-95 ${
                    showResult && isCorrect
                      ? 'bg-green-50 ring-2 ring-green-400'
                      : showResult && isSelected && !isCorrect
                        ? 'bg-red-50 ring-2 ring-red-400'
                        : 'bg-white ring-primary-50 hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                >
                  <span className="font-arabic text-3xl font-bold text-primary-800">{word.arabic}</span>
                  {showResult && isCorrect && <CheckCircle2 size={16} className="mx-auto mt-1 text-green-500" />}
                  {showResult && isSelected && !isCorrect && <XCircle size={16} className="mx-auto mt-1 text-red-500" />}
                </button>
              );
            })}
          </div>

          {/* Result */}
          {showResult && (
            <div className={`rounded-2xl p-3 text-center text-sm font-bold ring-1 ${
              selected === target.id ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-red-50 text-red-700 ring-red-200'
            }`}>
              {selected === target.id ? (
                <><CheckCircle2 size={16} className="mr-1 inline" /> Correct! The answer is {target.arabic}</>
              ) : (
                <><XCircle size={16} className="mr-1 inline" /> Wrong! The correct answer is {target.arabic} ({target.english})</>
              )}
              <button
                onClick={nextRound}
                className="mt-2 block w-full rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-700 active:scale-95"
              >
                {round + 1 >= TOTAL_ROUNDS ? 'Finish Level' : 'Next Question'}
              </button>
            </div>
          )}

          <button
            onClick={restart}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-primary-500 ring-1 ring-primary-100 transition-all hover:bg-primary-50 active:scale-95"
          >
            <RotateCcw size={14} /> Restart
          </button>
        </>
      )}
    </div>
  );
}

// ============================================================
// Level 5 — Word Memory Game
// ============================================================

interface MemoryCard {
  id: string;
  wordId: string;
  text: string;
  isArabic: boolean;
  flipped: boolean;
  matched: boolean;
}

export function WordMemoryLevel({
  wordsLearned,
  onComplete,
}: {
  wordsLearned: Set<string>;
  onComplete: (key: string) => void;
}) {
  const levelKey = 's6-l5';
  const isCompleted = wordsLearned.has(levelKey);

  const [round, setRound] = useState(0);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [wrongFlip, setWrongFlip] = useState<string[]>([]);
  const [matches, setMatches] = useState(0);
  const [showAll, setShowAll] = useState(true);

  const PAIRS_PER_ROUND = 4;
  const TOTAL_ROUNDS = 2;

  const initRound = useCallback(() => {
    const roundWords = pickRandom(ARABIC_WORDS, PAIRS_PER_ROUND);
    const newCards: MemoryCard[] = [];
    roundWords.forEach((w) => {
      newCards.push({ id: `${w.id}-ar`, wordId: w.id, text: w.arabic, isArabic: true, flipped: false, matched: false });
      newCards.push({ id: `${w.id}-en`, wordId: w.id, text: w.english, isArabic: false, flipped: false, matched: false });
    });
    setCards(shuffle(newCards));
    setFlipped([]);
    setWrongFlip([]);
    setMatches(0);
    setShowAll(true);
    setTimeout(() => setShowAll(false), 3000);
  }, []);

  useEffect(() => {
    initRound();
  }, [round, initRound]);

  const totalPairs = PAIRS_PER_ROUND;

  const handleCardClick = (cardId: string) => {
    if (showAll) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.matched || card.flipped) return;
    if (flipped.length >= 2) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped.map((id) => cards.find((c) => c.id === id)!);
      if (first.wordId === second.wordId) {
        // Match!
        setTimeout(() => {
          setCards((prev) => prev.map((c) =>
            c.id === first.id || c.id === second.id ? { ...c, matched: true, flipped: true } : c,
          ));
          setMatches((m) => m + 1);
          setFlipped([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setWrongFlip(newFlipped);
          setTimeout(() => {
            setCards((prev) => prev.map((c) =>
              c.id === first.id || c.id === second.id ? { ...c, flipped: false } : c,
            ));
            setFlipped([]);
            setWrongFlip([]);
          }, 600);
        }, 500);
      }
    }
  };

  const allMatched = matches === totalPairs;

  const nextRound = () => {
    if (round + 1 >= TOTAL_ROUNDS) {
      onComplete(levelKey);
    } else {
      setRound(round + 1);
    }
  };

  const restart = () => {
    setRound(0);
    initRound();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-teal-500 transition-all"
            style={{ width: `${(matches / totalPairs) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-primary-600">
          Round {round + 1}/{TOTAL_ROUNDS} • {matches}/{totalPairs} pairs
        </span>
      </div>

      {isCompleted ? (
        <div className="rounded-2xl bg-green-50 p-3 text-center text-sm font-bold text-green-700 ring-1 ring-green-200">
          <CheckCircle2 size={16} className="mr-1 inline" /> Level completed!
        </div>
      ) : (
        <>
          {showAll ? (
            <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-teal-600 p-4 text-center text-white shadow-lg">
              <Eye size={24} className="mx-auto mb-2" />
              <p className="font-bold">Memorize the pairs!</p>
              <p className="text-sm text-white/80">Cards will flip in 3 seconds...</p>
            </div>
          ) : (
            <p className="text-center text-xs font-semibold text-primary-500/70">
              Tap two cards to find matching pairs
            </p>
          )}

          {/* Memory grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {cards.map((card) => {
              const isFlipped = card.flipped || card.matched || showAll;
              const isWrong = wrongFlip.includes(card.id);
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.matched || showAll || flipped.length >= 2}
                  className={`relative flex h-20 items-center justify-center rounded-2xl shadow-sm ring-1 transition-all active:scale-95 ${
                    card.matched
                      ? 'bg-green-50 ring-2 ring-green-400'
                      : isWrong
                        ? 'bg-red-50 ring-2 ring-red-400'
                        : isFlipped
                          ? 'bg-white ring-primary-200'
                          : 'bg-gradient-to-br from-primary-600 to-teal-600 ring-primary-600'
                  }`}
                >
                  {isFlipped ? (
                    <span className={card.isArabic ? 'font-arabic text-2xl font-bold text-primary-800' : 'text-sm font-bold text-primary-700'}>
                      {card.text}
                    </span>
                  ) : (
                    <span className="text-2xl text-white/40">?</span>
                  )}
                  {card.matched && <CheckCircle2 size={14} className="absolute right-1.5 top-1.5 text-green-500" />}
                </button>
              );
            })}
          </div>

          {allMatched && !showAll && (
            <div className="animate-fade-in rounded-2xl bg-gradient-to-br from-primary-600 to-teal-600 p-4 text-center text-white shadow-lg">
              <Trophy size={28} className="mx-auto mb-2" />
              <p className="font-bold">Round {round + 1} Complete!</p>
              <button
                onClick={nextRound}
                className="mt-3 rounded-xl bg-white px-5 py-2 text-sm font-bold text-primary-700 shadow-md transition-all hover:bg-primary-50 active:scale-95"
              >
                {round + 1 >= TOTAL_ROUNDS ? 'Finish Level' : 'Next Round'}
              </button>
            </div>
          )}

          <button
            onClick={restart}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-primary-500 ring-1 ring-primary-100 transition-all hover:bg-primary-50 active:scale-95"
          >
            <RotateCcw size={14} /> Restart
          </button>
        </>
      )}
    </div>
  );
}

// ============================================================
// Level 6 — Mixed Word Challenge
// ============================================================

type ChallengeType = 'match-malayalam' | 'match-english' | 'multiple-choice';

export function WordMixedChallengeLevel({
  wordsLearned,
  onComplete,
}: {
  wordsLearned: Set<string>;
  onComplete: (key: string) => void;
}) {
  const levelKey = 's6-l6';
  const isCompleted = wordsLearned.has(levelKey);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<string | null>(null);

  const TOTAL_ROUNDS = 6;

  const challengeType: ChallengeType = useMemo(() => {
    const types: ChallengeType[] = ['match-malayalam', 'match-english', 'multiple-choice'];
    return types[round % 3];
  }, [round]);

  const isMatching = challengeType === 'match-malayalam' || challengeType === 'match-english';

  const { currentWords, target, options } = useMemo(() => {
    if (isMatching) {
      return {
        currentWords: pickRandom(ARABIC_WORDS, 4),
        target: null,
        options: [],
      };
    } else {
      const targetWord = pickRandom(ARABIC_WORDS, 1)[0];
      const distractors = pickRandom(ARABIC_WORDS.filter((w) => w.id !== targetWord.id), 3);
      return {
        currentWords: [],
        target: targetWord,
        options: shuffle([targetWord, ...distractors]),
      };
    }
  }, [round]);

  const shuffledMeanings = useMemo(() => isMatching ? shuffle(currentWords) : [], [currentWords, isMatching]);

  // Matching handlers
  const handleArabicClick = (wordId: string) => {
    if (matched.has(wordId) || !isMatching) return;
    setSelected(wordId);
    setWrongPair(null);
  };

  const handleMeaningClick = (word: ArabicWord) => {
    if (matched.has(word.id) || !isMatching || !selected) return;
    if (selected === word.id) {
      const next = new Set(matched);
      next.add(word.id);
      setMatched(next);
      setScore(score + 1);
      setSelected(null);
      setWrongPair(null);
      if (next.size === currentWords.length) {
        setTimeout(() => {
          setShowResult(true);
        }, 500);
      }
    } else {
      setWrongPair(word.id);
      setTimeout(() => setWrongPair(null), 800);
    }
  };

  // Multiple choice handler
  const handleSelectMC = (wordId: string) => {
    if (showResult || isMatching) return;
    setSelected(wordId);
    setShowResult(true);
    if (wordId === target!.id) {
      setScore(score + 1);
    }
  };

  const nextRound = () => {
    if (round + 1 >= TOTAL_ROUNDS) {
      onComplete(levelKey);
    } else {
      setRound(round + 1);
      setSelected(null);
      setShowResult(false);
      setMatched(new Set());
      setWrongPair(null);
    }
  };

  const restart = () => {
    setRound(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setMatched(new Set());
    setWrongPair(null);
  };

  const meaningText = (w: ArabicWord) => challengeType === 'match-malayalam' ? w.malayalam : w.english;

  return (
    <div className="space-y-3">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-teal-500 transition-all"
            style={{ width: `${((round + (showResult ? 1 : 0)) / TOTAL_ROUNDS) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-primary-600">{round + 1}/{TOTAL_ROUNDS}</span>
      </div>

      {/* Score badge */}
      <div className="flex items-center justify-center gap-1.5 rounded-xl bg-gold-50 px-3 py-1.5 text-sm font-bold text-gold-700 ring-1 ring-gold-100">
        <Star size={14} className="fill-gold-500 text-gold-500" /> Score: {score}
      </div>

      {isCompleted ? (
        <div className="rounded-2xl bg-green-50 p-3 text-center text-sm font-bold text-green-700 ring-1 ring-green-200">
          <CheckCircle2 size={16} className="mr-1 inline" /> Challenge completed! Final score: {score}/{TOTAL_ROUNDS}
        </div>
      ) : isMatching ? (
        <>
          <p className="text-center text-xs font-semibold text-primary-500/70">
            {challengeType === 'match-malayalam' ? 'Match Arabic → Malayalam' : 'Match Arabic → English'}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {currentWords.map((word) => {
              const isMatched = matched.has(word.id);
              const isSelected = selected === word.id;
              return (
                <button
                  key={word.id}
                  onClick={() => handleArabicClick(word.id)}
                  disabled={isMatched}
                  className={`rounded-2xl p-3 text-center shadow-sm ring-1 transition-all active:scale-95 ${
                    isMatched ? 'bg-green-50 ring-2 ring-green-400 opacity-60'
                      : isSelected ? 'bg-primary-100 ring-2 ring-primary-500'
                      : 'bg-white ring-primary-50 hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                >
                  <span className="font-arabic text-3xl font-bold text-primary-800">{word.arabic}</span>
                  {isMatched && <CheckCircle2 size={14} className="mx-auto mt-1 text-green-500" />}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {shuffledMeanings.map((word) => {
              const isMatched = matched.has(word.id);
              const isWrong = wrongPair === word.id;
              return (
                <button
                  key={word.id}
                  onClick={() => handleMeaningClick(word)}
                  disabled={isMatched}
                  className={`rounded-2xl p-3 text-center shadow-sm ring-1 transition-all active:scale-95 ${
                    isMatched ? 'bg-green-50 ring-2 ring-green-400 opacity-60'
                      : isWrong ? 'bg-red-50 ring-2 ring-red-400'
                      : 'bg-white ring-primary-50 hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                >
                  {challengeType === 'match-malayalam' ? (
                    <span className="font-malayalam text-base font-semibold text-primary-700">{word.malayalam}</span>
                  ) : (
                    <span className="text-base font-semibold text-primary-700">{word.english}</span>
                  )}
                  {isMatched && <CheckCircle2 size={14} className="mx-auto mt-1 text-green-500" />}
                  {isWrong && <XCircle size={14} className="mx-auto mt-1 text-red-500" />}
                </button>
              );
            })}
          </div>
          {showResult && (
            <div className="animate-fade-in rounded-2xl bg-gradient-to-br from-primary-600 to-teal-600 p-4 text-center text-white shadow-lg">
              <Trophy size={24} className="mx-auto mb-1" />
              <p className="font-bold">Round {round + 1} Complete!</p>
              <button
                onClick={nextRound}
                className="mt-2 rounded-xl bg-white px-5 py-2 text-sm font-bold text-primary-700 shadow-md transition-all hover:bg-primary-50 active:scale-95"
              >
                {round + 1 >= TOTAL_ROUNDS ? 'Finish Challenge' : 'Next Round'}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Multiple choice */}
          <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-teal-600 p-5 text-center text-white shadow-lg">
            <p className="text-xs uppercase tracking-wide text-white/60">Choose the Arabic word for</p>
            <p className="mt-2 text-2xl font-bold">
              <span className="font-malayalam">{target!.malayalam}</span>
              <span className="mx-2 text-white/40">/</span>
              {target!.english}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {options.map((word) => {
              const isCorrect = word.id === target!.id;
              const isSelected = selected === word.id;
              return (
                <button
                  key={word.id}
                  onClick={() => handleSelectMC(word.id)}
                  disabled={showResult}
                  className={`rounded-2xl p-4 text-center shadow-sm ring-1 transition-all active:scale-95 ${
                    showResult && isCorrect ? 'bg-green-50 ring-2 ring-green-400'
                      : showResult && isSelected && !isCorrect ? 'bg-red-50 ring-2 ring-red-400'
                      : 'bg-white ring-primary-50 hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                >
                  <span className="font-arabic text-3xl font-bold text-primary-800">{word.arabic}</span>
                  {showResult && isCorrect && <CheckCircle2 size={16} className="mx-auto mt-1 text-green-500" />}
                  {showResult && isSelected && !isCorrect && <XCircle size={16} className="mx-auto mt-1 text-red-500" />}
                </button>
              );
            })}
          </div>
          {showResult && (
            <div className={`rounded-2xl p-3 text-center text-sm font-bold ring-1 ${
              selected === target!.id ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-red-50 text-red-700 ring-red-200'
            }`}>
              {selected === target!.id ? 'Correct!' : `Wrong! Answer: ${target!.arabic}`}
              <button
                onClick={nextRound}
                className="mt-2 block w-full rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-700 active:scale-95"
              >
                {round + 1 >= TOTAL_ROUNDS ? 'Finish Challenge' : 'Next Question'}
              </button>
            </div>
          )}
        </>
      )}

      <button
        onClick={restart}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-primary-500 ring-1 ring-primary-100 transition-all hover:bg-primary-50 active:scale-95"
      >
        <RotateCcw size={14} /> Restart
      </button>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { ARABIC_LETTERS } from '@/data/letters';
import type { ClassLevel } from '@/App';

function storageKey(prefix: string, selectedClass: ClassLevel, userId: string | null) {
  if (userId) {
    return `${prefix}-u${userId}-class-${selectedClass}`;
  }
  return `${prefix}-class-${selectedClass}`;
}

// ---------- Set 1: letter learning ----------

function loadSet<T>(key: string, validator: (v: unknown) => boolean): Set<T> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown[];
    return new Set(arr.filter((n): n is T => validator(n)) as T[]);
  } catch {
    return new Set();
  }
}

function saveSet<T>(key: string, set: Set<T>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    // ignore
  }
}

const isLetterIndex = (v: unknown): v is number => typeof v === 'number' && v >= 1 && v <= ARABIC_LETTERS.length;
const isString = (v: unknown): v is string => typeof v === 'string';

// ---------- Set 2: harakat learning ----------
export function useLearningProgress(selectedClass: ClassLevel, userId: string | null = null) {
  const loadedIdentityRef = useRef<string | null>(null);
  const identityKey = `${userId ?? 'anon'}:${selectedClass}`;
  const [learned, setLearned] = useState<Set<number>>(() => loadSet<number>(storageKey('madrasa-arabic-learn-progress', selectedClass, userId), isLetterIndex));
  const [harakatLearned, setHarakatLearned] = useState<Set<string>>(() => loadSet<string>(storageKey('madrasa-arabic-harakat-progress', selectedClass, userId), isString));
  const [readingPracticeLearned, setReadingPracticeLearned] = useState<Set<string>>(() => loadSet<string>(storageKey('madrasa-arabic-reading-practice-progress', selectedClass, userId), isString));
  const [interactiveHarakatPracticeLearned, setInteractiveHarakatPracticeLearned] = useState<Set<string>>(() => loadSet<string>(storageKey('madrasa-arabic-interactive-harakat-practice-progress', selectedClass, userId), isString));
  const [sukoonLearned, setSukoonLearned] = useState<Set<string>>(() => loadSet<string>(storageKey('madrasa-arabic-sukoon-progress', selectedClass, userId), isString));
  const [tanweenLearned, setTanweenLearned] = useState<Set<string>>(() => loadSet<string>(storageKey('madrasa-arabic-tanween-progress', selectedClass, userId), isString));
  const [wordsLearned, setWordsLearned] = useState<Set<string>>(() => loadSet<string>(storageKey('madrasa-arabic-words-progress', selectedClass, userId), isString));
  const [alphabetOrderLearned, setAlphabetOrderLearned] = useState<Set<string>>(() => loadSet<string>(storageKey('madrasa-arabic-alphabet-order-progress', selectedClass, userId), isString));

  useEffect(() => {
    loadedIdentityRef.current = identityKey;
    setLearned(loadSet<number>(storageKey('madrasa-arabic-learn-progress', selectedClass, userId), isLetterIndex));
    setHarakatLearned(loadSet<string>(storageKey('madrasa-arabic-harakat-progress', selectedClass, userId), isString));
    setReadingPracticeLearned(loadSet<string>(storageKey('madrasa-arabic-reading-practice-progress', selectedClass, userId), isString));
    setInteractiveHarakatPracticeLearned(loadSet<string>(storageKey('madrasa-arabic-interactive-harakat-practice-progress', selectedClass, userId), isString));
    setSukoonLearned(loadSet<string>(storageKey('madrasa-arabic-sukoon-progress', selectedClass, userId), isString));
    setTanweenLearned(loadSet<string>(storageKey('madrasa-arabic-tanween-progress', selectedClass, userId), isString));
    setWordsLearned(loadSet<string>(storageKey('madrasa-arabic-words-progress', selectedClass, userId), isString));
    setAlphabetOrderLearned(loadSet<string>(storageKey('madrasa-arabic-alphabet-order-progress', selectedClass, userId), isString));
  }, [selectedClass, userId, identityKey]);

  // --- Set 1 letter ops ---
  const toggleLetter = useCallback((letterIndex: number) => {
    setLearned((prev) => {
      const next = new Set(prev);
      if (next.has(letterIndex)) next.delete(letterIndex);
      else next.add(letterIndex);
      saveSet(storageKey('madrasa-arabic-learn-progress', selectedClass, userId), next);
      return next;
    });
  }, [selectedClass, userId]);

  const markLetter = useCallback((letterIndex: number) => {
    setLearned((prev) => {
      if (prev.has(letterIndex)) return prev;
      const next = new Set(prev);
      next.add(letterIndex);
      saveSet(storageKey('madrasa-arabic-learn-progress', selectedClass, userId), next);
      return next;
    });
  }, [selectedClass, userId]);

  // --- Set 2 harakat ops ---
  const toggleHarakat = useCallback((key: string) => {
    setHarakatLearned((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      saveSet(storageKey('madrasa-arabic-harakat-progress', selectedClass, userId), next);
      return next;
    });
  }, [selectedClass, userId]);

  const markHarakat = useCallback((key: string) => {
    setHarakatLearned((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      saveSet(storageKey('madrasa-arabic-harakat-progress', selectedClass, userId), next);
      return next;
    });
  }, [selectedClass, userId]);

  // --- Set 2 simple reading practice ops ---
  const markReadingPractice = useCallback((key: string) => {
    setReadingPracticeLearned((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      saveSet(storageKey('madrasa-arabic-reading-practice-progress', selectedClass, userId), next);
      return next;
    });
  }, [selectedClass, userId]);

  // --- Set 2 interactive harakat practice ops ---
  const markInteractiveHarakatPractice = useCallback((key: string) => {
    setInteractiveHarakatPracticeLearned((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      saveSet(storageKey('madrasa-arabic-interactive-harakat-practice-progress', selectedClass, userId), next);
      return next;
    });
  }, [selectedClass, userId]);

  // --- Set 4 sukoon ops ---
  const toggleSukoon = useCallback((key: string) => {
    setSukoonLearned((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      saveSet(storageKey('madrasa-arabic-sukoon-progress', selectedClass, userId), next);
      return next;
    });
  }, [selectedClass, userId]);

  const markSukoon = useCallback((key: string) => {
    setSukoonLearned((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      saveSet(storageKey('madrasa-arabic-sukoon-progress', selectedClass, userId), next);
      return next;
    });
  }, [selectedClass, userId]);

  // --- Set 5 tanween ops ---
  const toggleTanween = useCallback((key: string) => {
    setTanweenLearned((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      saveSet(storageKey('madrasa-arabic-tanween-progress', selectedClass, userId), next);
      return next;
    });
  }, [selectedClass, userId]);

  const markTanween = useCallback((key: string) => {
    setTanweenLearned((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      saveSet(storageKey('madrasa-arabic-tanween-progress', selectedClass, userId), next);
      return next;
    });
  }, [selectedClass, userId]);

  // --- Set 6 word ops ---
  const toggleWord = useCallback((key: string) => {
    setWordsLearned((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      saveSet(storageKey('madrasa-arabic-words-progress', selectedClass, userId), next);
      return next;
    });
  }, [selectedClass, userId]);

  const markWord = useCallback((key: string) => {
    setWordsLearned((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      saveSet(storageKey('madrasa-arabic-words-progress', selectedClass, userId), next);
      return next;
    });
  }, [selectedClass, userId]);

  // --- Set 3 alphabet order ops ---
  const toggleAlphabetOrder = useCallback((key: string) => {
    setAlphabetOrderLearned((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      saveSet(storageKey('madrasa-arabic-alphabet-order-progress', selectedClass, userId), next);
      return next;
    });
  }, [selectedClass, userId]);

  // --- Reset ---
  const resetLearning = useCallback(() => {
    if (loadedIdentityRef.current !== identityKey) return;
    const empty = new Set<number>();
    setLearned(empty);
    setHarakatLearned(new Set());
    setReadingPracticeLearned(new Set());
    setInteractiveHarakatPracticeLearned(new Set());
    setSukoonLearned(new Set());
    setTanweenLearned(new Set());
    setWordsLearned(new Set());
    setAlphabetOrderLearned(new Set());
    saveSet(storageKey('madrasa-arabic-learn-progress', selectedClass, userId), empty);
    saveSet(storageKey('madrasa-arabic-harakat-progress', selectedClass, userId), new Set());
    saveSet(storageKey('madrasa-arabic-reading-practice-progress', selectedClass, userId), new Set());
    saveSet(storageKey('madrasa-arabic-interactive-harakat-practice-progress', selectedClass, userId), new Set());
    saveSet(storageKey('madrasa-arabic-sukoon-progress', selectedClass, userId), new Set());
    saveSet(storageKey('madrasa-arabic-tanween-progress', selectedClass, userId), new Set());
    saveSet(storageKey('madrasa-arabic-words-progress', selectedClass, userId), new Set());
    saveSet(storageKey('madrasa-arabic-alphabet-order-progress', selectedClass, userId), new Set());
  }, [selectedClass, userId]);

  return {
    learned,
    toggleLetter,
    markLetter,
    harakatLearned,
    toggleHarakat,
    markHarakat,
    readingPracticeLearned,
    markReadingPractice,
    interactiveHarakatPracticeLearned,
    markInteractiveHarakatPractice,
    sukoonLearned,
    toggleSukoon,
    markSukoon,
    tanweenLearned,
    toggleTanween,
    markTanween,
    wordsLearned,
    toggleWord,
    markWord,
    alphabetOrderLearned,
    toggleAlphabetOrder,
    resetLearning,
  };
}

import { useCallback, useEffect, useState } from 'react';
import { ARABIC_LETTERS } from '@/data/letters';

// ---------- Set 1: letter learning ----------
const LETTERS_KEY = 'madrasa-arabic-learn-progress';

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
const HARAKAT_KEY = 'madrasa-arabic-harakat-progress';

// ---------- Set 4: sukoon learning ----------
const SUKOON_KEY = 'madrasa-arabic-sukoon-progress';

// ---------- Set 5: tanween learning ----------
const TANWEEN_KEY = 'madrasa-arabic-tanween-progress';

// ---------- Set 6: Arabic words learning ----------
const WORDS_KEY = 'madrasa-arabic-words-progress';

export function useLearningProgress() {
  const [learned, setLearned] = useState<Set<number>>(() => loadSet<number>(LETTERS_KEY, isLetterIndex));
  const [harakatLearned, setHarakatLearned] = useState<Set<string>>(() => loadSet<string>(HARAKAT_KEY, isString));
  const [sukoonLearned, setSukoonLearned] = useState<Set<string>>(() => loadSet<string>(SUKOON_KEY, isString));
  const [tanweenLearned, setTanweenLearned] = useState<Set<string>>(() => loadSet<string>(TANWEEN_KEY, isString));
  const [wordsLearned, setWordsLearned] = useState<Set<string>>(() => loadSet<string>(WORDS_KEY, isString));

  useEffect(() => saveSet(LETTERS_KEY, learned), [learned]);
  useEffect(() => saveSet(HARAKAT_KEY, harakatLearned), [harakatLearned]);
  useEffect(() => saveSet(SUKOON_KEY, sukoonLearned), [sukoonLearned]);
  useEffect(() => saveSet(TANWEEN_KEY, tanweenLearned), [tanweenLearned]);
  useEffect(() => saveSet(WORDS_KEY, wordsLearned), [wordsLearned]);

  // --- Set 1 letter ops ---
  const toggleLetter = useCallback((letterIndex: number) => {
    setLearned((prev) => {
      const next = new Set(prev);
      if (next.has(letterIndex)) next.delete(letterIndex);
      else next.add(letterIndex);
      return next;
    });
  }, []);

  const markLetter = useCallback((letterIndex: number) => {
    setLearned((prev) => {
      if (prev.has(letterIndex)) return prev;
      const next = new Set(prev);
      next.add(letterIndex);
      return next;
    });
  }, []);

  // --- Set 2 harakat ops ---
  const toggleHarakat = useCallback((key: string) => {
    setHarakatLearned((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const markHarakat = useCallback((key: string) => {
    setHarakatLearned((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  // --- Set 4 sukoon ops ---
  const toggleSukoon = useCallback((key: string) => {
    setSukoonLearned((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const markSukoon = useCallback((key: string) => {
    setSukoonLearned((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  // --- Set 5 tanween ops ---
  const toggleTanween = useCallback((key: string) => {
    setTanweenLearned((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const markTanween = useCallback((key: string) => {
    setTanweenLearned((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  // --- Set 6 word ops ---
  const toggleWord = useCallback((key: string) => {
    setWordsLearned((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const markWord = useCallback((key: string) => {
    setWordsLearned((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  // --- Reset ---
  const resetLearning = useCallback(() => {
    setLearned(new Set());
    setHarakatLearned(new Set());
    setSukoonLearned(new Set());
    setTanweenLearned(new Set());
    setWordsLearned(new Set());
  }, []);

  return {
    learned,
    toggleLetter,
    markLetter,
    harakatLearned,
    toggleHarakat,
    markHarakat,
    sukoonLearned,
    toggleSukoon,
    markSukoon,
    tanweenLearned,
    toggleTanween,
    markTanween,
    wordsLearned,
    toggleWord,
    markWord,
    resetLearning,
  };
}

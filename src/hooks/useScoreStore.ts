import { useCallback, useEffect, useRef, useState } from 'react';
import { TOTAL_LETTERS } from '@/data/letters';
import type { ClassLevel } from '@/App';

export interface ScoreData {
  bestQuizScore: number;
  quizTotal: number;
  quizCompletion: number; // 0..1
  lastQuizScore: number;
  writingCompleted: number; // count of letters completed in writing
  writingUnlocked: number; // index (1-based) of next letter to trace
}

function storageKey(selectedClass: ClassLevel, userId: string | null) {
  if (userId) {
    return `madrasa-arabic-quiz-progress-u${userId}-class-${selectedClass}`;
  }
  return `madrasa-arabic-quiz-progress-class-${selectedClass}`;
}

const DEFAULT_DATA: ScoreData = {
  bestQuizScore: 0,
  quizTotal: TOTAL_LETTERS,
  quizCompletion: 0,
  lastQuizScore: 0,
  writingCompleted: 0,
  writingUnlocked: 1,
};

function load(selectedClass: ClassLevel, userId: string | null): ScoreData {
  try {
    const raw = localStorage.getItem(storageKey(selectedClass, userId));
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<ScoreData>;
    return { ...DEFAULT_DATA, ...parsed, quizTotal: TOTAL_LETTERS };
  } catch {
    return DEFAULT_DATA;
  }
}

function save(selectedClass: ClassLevel, userId: string | null, data: ScoreData) {
  try {
    localStorage.setItem(storageKey(selectedClass, userId), JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function useScoreStore(selectedClass: ClassLevel, userId: string | null = null) {
  const loadedIdentityRef = useRef<string | null>(null);
  const identityKey = `${userId ?? 'anon'}:${selectedClass}`;

  const [data, setData] = useState<ScoreData>(() => load(selectedClass, userId));

  useEffect(() => {
    loadedIdentityRef.current = identityKey;
    setData(load(selectedClass, userId));
  }, [selectedClass, userId, identityKey]);

  useEffect(() => {
    if (loadedIdentityRef.current !== identityKey) return;
    save(selectedClass, userId, data);
  }, [data, selectedClass, userId, identityKey]);

  const recordQuizResult = useCallback((score: number) => {
    setData((prev) => {
      const next = {
        ...prev,
        lastQuizScore: score,
        bestQuizScore: Math.max(prev.bestQuizScore, score),
        quizCompletion: 1,
      };
      return next;
    });
  }, [selectedClass, userId]);

  const recordWritingProgress = useCallback((completedCount: number, unlockedIndex: number) => {
    setData((prev) => {
      const next = {
        ...prev,
        writingCompleted: Math.max(prev.writingCompleted, completedCount),
        writingUnlocked: unlockedIndex,
      };
      return next;
    });
  }, [selectedClass, userId]);

  const resetWriting = useCallback(() => {
    setData((prev) => {
      const next = { ...prev, writingCompleted: 0, writingUnlocked: 1 };
      return next;
    });
  }, [selectedClass, userId]);

  const resetAll = useCallback(() => {
    const next = DEFAULT_DATA;
    setData(next);
  }, [selectedClass, userId]);

  return { data, recordQuizResult, recordWritingProgress, resetWriting, resetAll };
}

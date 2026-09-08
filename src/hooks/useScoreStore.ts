import { useCallback, useEffect, useState } from 'react';
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

function storageKey(selectedClass: ClassLevel) {
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

function load(selectedClass: ClassLevel): ScoreData {
  try {
    const raw = localStorage.getItem(storageKey(selectedClass));
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<ScoreData>;
    return { ...DEFAULT_DATA, ...parsed, quizTotal: TOTAL_LETTERS };
  } catch {
    return DEFAULT_DATA;
  }
}

function save(selectedClass: ClassLevel, data: ScoreData) {
  try {
    localStorage.setItem(storageKey(selectedClass), JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function useScoreStore(selectedClass: ClassLevel) {
  const [data, setData] = useState<ScoreData>(() => load(selectedClass));

  useEffect(() => {
    setData(load(selectedClass));
  }, [selectedClass]);

  useEffect(() => {
    save(selectedClass, data);
  }, [data, selectedClass]);

  const recordQuizResult = useCallback((score: number) => {
    setData((prev) => {
      const next = {
        ...prev,
        lastQuizScore: score,
        bestQuizScore: Math.max(prev.bestQuizScore, score),
        quizCompletion: 1,
      };
      save(selectedClass, next);
      return next;
    });
  }, [selectedClass]);

  const recordWritingProgress = useCallback((completedCount: number, unlockedIndex: number) => {
    setData((prev) => {
      const next = {
        ...prev,
        writingCompleted: Math.max(prev.writingCompleted, completedCount),
        writingUnlocked: unlockedIndex,
      };
      save(selectedClass, next);
      return next;
    });
  }, [selectedClass]);

  const resetWriting = useCallback(() => {
    setData((prev) => {
      const next = { ...prev, writingCompleted: 0, writingUnlocked: 1 };
      save(selectedClass, next);
      return next;
    });
  }, [selectedClass]);

  const resetAll = useCallback(() => {
    const next = DEFAULT_DATA;
    setData(next);
    save(selectedClass, next);
  }, [selectedClass]);

  return { data, recordQuizResult, recordWritingProgress, resetWriting, resetAll };
}

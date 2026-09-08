import { useCallback, useEffect, useState } from 'react';
import { TOTAL_LETTERS } from '@/data/letters';

export interface ScoreData {
  bestQuizScore: number;
  quizTotal: number;
  quizCompletion: number; // 0..1
  lastQuizScore: number;
  writingCompleted: number; // count of letters completed in writing
  writingUnlocked: number; // index (1-based) of next letter to trace
}

const STORAGE_KEY = 'madrasa-arabic-quiz-progress';

const DEFAULT_DATA: ScoreData = {
  bestQuizScore: 0,
  quizTotal: TOTAL_LETTERS,
  quizCompletion: 0,
  lastQuizScore: 0,
  writingCompleted: 0,
  writingUnlocked: 1,
};

function load(): ScoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<ScoreData>;
    return { ...DEFAULT_DATA, ...parsed, quizTotal: TOTAL_LETTERS };
  } catch {
    return DEFAULT_DATA;
  }
}

function save(data: ScoreData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function useScoreStore() {
  const [data, setData] = useState<ScoreData>(() => load());

  useEffect(() => {
    save(data);
  }, [data]);

  const recordQuizResult = useCallback((score: number) => {
    setData((prev) => ({
      ...prev,
      lastQuizScore: score,
      bestQuizScore: Math.max(prev.bestQuizScore, score),
      quizCompletion: 1,
    }));
  }, []);

  const recordWritingProgress = useCallback((completedCount: number, unlockedIndex: number) => {
    setData((prev) => ({
      ...prev,
      writingCompleted: Math.max(prev.writingCompleted, completedCount),
      writingUnlocked: unlockedIndex,
    }));
  }, []);

  const resetWriting = useCallback(() => {
    setData((prev) => ({ ...prev, writingCompleted: 0, writingUnlocked: 1 }));
  }, []);

  const resetAll = useCallback(() => {
    setData(DEFAULT_DATA);
  }, []);

  return { data, recordQuizResult, recordWritingProgress, resetWriting, resetAll };
}

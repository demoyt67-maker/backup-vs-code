import { SET1_LEVELS, SET2_LEVELS, SET3_LEVELS, SET4_LEVELS, SET5_LEVELS, SET6_LEVELS, harakatItemKey, alphabetOrderKey, tanweenItemKey } from '@/data/learningSets';
import { ARABIC_LETTERS } from '@/data/letters';

export interface TestStudent {
  id: string;
  name: string;
  createdAt: number;
}

const STORAGE_KEY = 'madrasa-test-students';

export function loadTestStudents(): TestStudent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is TestStudent =>
      !!x && typeof x === 'object' &&
      typeof (x as TestStudent).id === 'string' &&
      typeof (x as TestStudent).name === 'string' &&
      typeof (x as TestStudent).createdAt === 'number'
    );
  } catch {
    return [];
  }
}

export function saveTestStudents(students: TestStudent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch {
    // ignore
  }
}

export function createTestStudent(name: string): TestStudent {
  return {
    id: `test-student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    createdAt: Date.now(),
  };
}

export function deleteTestStudentData(id: string) {
  const prefix = `madrasa-test-student-`;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(`${prefix}${id}`)) {
      keysToRemove.push(k);
    }
  }
  // also remove progress/quiz keys for this student
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.includes(`utest-student-${id}`)) {
      keysToRemove.push(k);
    }
  }
  for (const k of keysToRemove) {
    try { localStorage.removeItem(k); } catch { /* ignore */ }
  }
}

function progressKey(area: string, id: string, cls: number) {
  return `madrasa-arabic-${area}-progress-utest-student-${id}-class-${cls}`;
}

export function simulateLessonCompletion(id: string) {
  for (const cls of [1, 2, 3]) {
    try {
      // Set 1
      localStorage.setItem(progressKey('learn', id, cls), JSON.stringify(Array.from({ length: 28 }, (_, i) => i + 1)));
      // Set 2
      const s2 = SET2_LEVELS.flatMap((lvl) => lvl.items.map((item) => harakatItemKey(item.letter.index, item.haraka)));
      localStorage.setItem(progressKey('harakat', id, cls), JSON.stringify(s2));
      // Set 3
      const s3 = SET3_LEVELS.flatMap((lvl) => lvl.items.map((item) => alphabetOrderKey(item.position)));
      localStorage.setItem(progressKey('alphabet-order', id, cls), JSON.stringify(s3));
      // Set 4
      const s4: string[] = [];
      SET4_LEVELS.forEach((lvl) => lvl.items.forEach((_, i) => s4.push(`s4-${lvl.level}-${i}`)));
      localStorage.setItem(progressKey('sukoon', id, cls), JSON.stringify(s4));
      // Set 5
      const s5: string[] = [];
      SET5_LEVELS.forEach((lvl) => {
        lvl.items.forEach((item) => s5.push(tanweenItemKey(item.letter.index, item.tanween)));
        (lvl.readingItems ?? []).forEach((_, i) => s5.push(`s5-read-${lvl.level}-${i}`));
      });
      localStorage.setItem(progressKey('tanween', id, cls), JSON.stringify(s5));
      // Set 6
      const s6 = SET6_LEVELS.map((lvl) => `s6-l${lvl.level}`);
      localStorage.setItem(progressKey('words', id, cls), JSON.stringify(s6));
      // interactive harakat practice + reading practice
      localStorage.setItem(`madrasa-arabic-interactive-harakat-practice-progress-utest-student-${id}-class-${cls}`, JSON.stringify(s2));
      localStorage.setItem(`madrasa-arabic-reading-practice-progress-utest-student-${id}-class-${cls}`, JSON.stringify(s2));
    } catch {
      // ignore
    }
  }
}

export function setSampleQuizResult(id: string) {
  for (const cls of [1, 2, 3]) {
    try {
      const scoreData = {
        bestQuizScore: 24,
        quizTotal: 28,
        quizCompletion: 1,
        lastQuizScore: 24,
        writingCompleted: 28,
        writingUnlocked: 28,
      };
      localStorage.setItem(`madrasa-arabic-quiz-progress-utest-student-${id}-class-${cls}`, JSON.stringify(scoreData));
    } catch {
      // ignore
    }
  }
}

export function resetTestStudent(id: string) {
  deleteTestStudentData(id);
  // remove name/welcomed
  try {
    localStorage.removeItem(`madrasa-test-student-name-${id}`);
    localStorage.removeItem(`madrasa-test-student-welcomed-${id}`);
    localStorage.removeItem(`madrasa-test-student-class-${id}`);
  } catch {
    // ignore
  }
}

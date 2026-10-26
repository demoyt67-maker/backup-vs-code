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
  for (const k of keysToRemove) {
    try { localStorage.removeItem(k); } catch { /* ignore */ }
  }
}

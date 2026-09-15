import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { SET1_LEVELS, SET2_LEVELS, SET3_LEVELS, SET4_LEVELS, type HarakatLevel, type HarakatItem, type HarakaType, type AlphabetOrderLevel, type SukoonLevel } from '@/data/learningSets';
import { ARABIC_LETTERS } from '@/data/letters';
import type { ArabicLetter, LetterLevel } from '@/data/learningSets';

const CACHE_KEY = 'cms-class1-cache';
const CACHE_TTL_MS = 30_000;

interface CachedCMSData {
  lessons: Lesson[];
  letters: ArabicLetter[];
  harakatLevels: HarakatLevel[];
  alphabetOrderLevels: AlphabetOrderLevel[];
  sukoonLevels: SukoonLevel[];
  timestamp: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  lesson_key: string;
}

export interface CMSClass1Data {
  levels: LetterLevel[];
  letters: ArabicLetter[];
  harakatLevels: HarakatLevel[];
  alphabetOrderLevels: AlphabetOrderLevel[];
  sukoonLevels: SukoonLevel[];
  loading: boolean;
  error: string | null;
  usingCMS: boolean;
}

const HARAKA_MARK_MAP: Record<string, HarakaType> = {
  '\u064E': 'fatha',
  '\u0650': 'kasra',
  '\u064F': 'damma',
};

function parseHarakatItems(rows: { arabic: string; english: string; position: number }[]): HarakatItem[] {
  const items: HarakatItem[] = [];
  for (const row of rows) {
    let baseArabic = '';
    let mark = '';
    for (const letter of ARABIC_LETTERS) {
      if (row.arabic.startsWith(letter.arabic)) {
        baseArabic = letter.arabic;
        mark = row.arabic.slice(letter.arabic.length);
        break;
      }
    }
    const staticLetter = ARABIC_LETTERS.find((l) => l.arabic === baseArabic);
    const haraka = HARAKA_MARK_MAP[mark] || (row.english as HarakaType);
    if (staticLetter && haraka) {
      items.push({ letter: staticLetter, haraka });
    }
  }
  return items;
}

function readCache(): CachedCMSData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedCMSData;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(data: CachedCMSData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function useCMSClass1Data(): CMSClass1Data {
  const [levels, setLevels] = useState<LetterLevel[]>([]);
  const [letters, setLetters] = useState<ArabicLetter[]>([]);
  const [harakatLevels, setHarakatLevels] = useState<HarakatLevel[]>([]);
  const [alphabetOrderLevels, setAlphabetOrderLevels] = useState<AlphabetOrderLevel[]>([]);
  const [sukoonLevels, setSukoonLevels] = useState<SukoonLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingCMS, setUsingCMS] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const cached = readCache();
        if (cached) {
          const cachedLevels = cached.lessons
            .filter((l) => l.lesson_key?.startsWith('set1-level-'))
            .map((l, i) => ({
              level: i + 1,
              letters: cached.letters,
            }));

          if (cachedLevels.length > 0 && cached.letters.length > 0) {
            if (!cancelled) {
              setLevels(cachedLevels);
              setLetters(cached.letters);
              setHarakatLevels(cached.harakatLevels || []);
              setAlphabetOrderLevels(cached.alphabetOrderLevels || []);
              setSukoonLevels(cached.sukoonLevels || []);
              setUsingCMS(true);
              setLoading(false);
            }
            return;
          }

          try {
            localStorage.removeItem(CACHE_KEY);
          } catch {
            // ignore
          }
        }

        const { data: cmsLessons, error: lessonsError } = await supabase
          .from('cms_lessons')
          .select('*')
          .eq('class_level', 1)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (lessonsError || !cmsLessons || cmsLessons.length === 0) {
          if (!cancelled) {
            setError(lessonsError ? `Failed to load CMS lessons: ${lessonsError.message}` : 'No active Class 1 lessons found');
            setLevels(SET1_LEVELS);
            setLetters(ARABIC_LETTERS);
            setHarakatLevels(SET2_LEVELS);
            setAlphabetOrderLevels(SET3_LEVELS);
            setSukoonLevels(SET4_LEVELS);
            setUsingCMS(false);
            setLoading(false);
          }
          return;
        }

        const lessonIds = cmsLessons.map((l) => l.id);
        const { data: cmsLetters, error: lettersError } = await supabase
          .from('cms_lesson_letters')
          .select('*')
          .in('lesson_id', lessonIds)
          .order('position', { ascending: true });

        if (lettersError || !cmsLetters || cmsLetters.length === 0) {
          if (!cancelled) {
            setError(lettersError ? `Failed to load CMS letters: ${lettersError.message}` : 'No CMS letters found');
            setLevels(SET1_LEVELS);
            setLetters(ARABIC_LETTERS);
            setHarakatLevels(SET2_LEVELS);
            setAlphabetOrderLevels(SET3_LEVELS);
            setSukoonLevels(SET4_LEVELS);
            setUsingCMS(false);
            setLoading(false);
          }
          return;
        }

        const lettersByLessonId = new Map<string, ArabicLetter[]>();
        const harakatItemsByLessonId = new Map<string, HarakatItem[]>();
        for (const cl of cmsLetters) {
          if (cl.lesson_id) {
            if (cl.lesson_id.startsWith('set2-level-')) {
              const arr = harakatItemsByLessonId.get(cl.lesson_id) ?? [];
              arr.push(...parseHarakatItems([cl]));
              harakatItemsByLessonId.set(cl.lesson_id, arr);
            } else {
              const arr = lettersByLessonId.get(cl.lesson_id) ?? [];
              const staticLetter = ARABIC_LETTERS.find((l) => l.arabic === cl.arabic);
              arr.push({
                index: staticLetter ? staticLetter.index : cl.position,
                arabic: cl.arabic,
                english: cl.english,
                malayalam: staticLetter ? staticLetter.malayalam : cl.english,
              });
              lettersByLessonId.set(cl.lesson_id, arr);
            }
          }
        }

        const allCMSEntries = cmsLessons.filter((l) => l.lesson_key?.startsWith('set1-level-'));
        const cmsLevels: LetterLevel[] = allCMSEntries.map((l, i) => ({
          level: i + 1,
          letters: lettersByLessonId.get(l.id) ?? [],
        }));

        const set2CMSEntries = cmsLessons.filter((l) => l.lesson_key?.startsWith('set2-level-'));
        const cmsHarakatLevels: HarakatLevel[] = set2CMSEntries.map((l, i) => {
          const items = harakatItemsByLessonId.get(l.id) ?? [];
          const fallback = SET2_LEVELS[i];
          return {
            level: i + 1,
            title: l.title || fallback?.title || `Level ${i + 1}`,
            harakat: fallback?.harakat || [],
            letters: fallback?.letters || [],
            items,
          };
        });

        const set3CMSEntries = cmsLessons.filter((l) => l.lesson_key?.startsWith('set3-level-'));
        const cmsAlphabetOrderLevels: AlphabetOrderLevel[] = set3CMSEntries.map((l, i) => {
          const items = lettersByLessonId.get(l.id) ?? [];
          const fallback = SET3_LEVELS[i];
          return {
            level: i + 1,
            title: l.title || fallback?.title || `Level ${i + 1}`,
            description: l.description || fallback?.description || '',
            items: items.map((letter, idx) => ({
              position: idx + 1,
              arabic: letter.arabic,
              english: letter.english,
            })),
          };
        });

        const set4CMSEntries = cmsLessons.filter((l) => l.lesson_key?.startsWith('set4-level-'));
        const cmsSukoonLevels: SukoonLevel[] = set4CMSEntries.map((l, i) => {
          const items = lettersByLessonId.get(l.id) ?? [];
          const fallback = SET4_LEVELS[i];
          return {
            level: i + 1,
            title: l.title || fallback?.title || `Level ${i + 1}`,
            items: items.map((letter) => ({
              arabic: letter.arabic,
              label: letter.english,
              malayalam: letter.malayalam,
            })),
          };
        });

        if (cmsLevels.length === 0 || cmsLevels.some((lvl) => !Array.isArray(lvl.letters) || lvl.letters.length === 0)) {
          if (!cancelled) {
            setError('CMS Class 1 data is incomplete or invalid');
            setLevels(SET1_LEVELS);
            setLetters(ARABIC_LETTERS);
            setHarakatLevels(SET2_LEVELS);
            setAlphabetOrderLevels(SET3_LEVELS);
            setSukoonLevels(SET4_LEVELS);
            setUsingCMS(false);
            setLoading(false);
          }
          return;
        }

        const allLetters = cmsLevels.flatMap((lvl) => lvl.letters);
        const seen = new Set<string>();
        const uniqueLetters: ArabicLetter[] = [];
        for (const letter of allLetters) {
          if (!seen.has(letter.arabic)) {
            seen.add(letter.arabic);
            uniqueLetters.push(letter);
          }
        }

        writeCache({
          lessons: cmsLessons,
          letters: uniqueLetters,
          harakatLevels: cmsHarakatLevels,
          alphabetOrderLevels: cmsAlphabetOrderLevels,
          sukoonLevels: cmsSukoonLevels,
          timestamp: Date.now(),
        });

        if (!cancelled) {
          setLevels(cmsLevels);
          setLetters(uniqueLetters);
          setHarakatLevels(cmsHarakatLevels);
          setAlphabetOrderLevels(cmsAlphabetOrderLevels);
          setSukoonLevels(cmsSukoonLevels);
          setUsingCMS(true);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setLevels(SET1_LEVELS);
          setLetters(ARABIC_LETTERS);
          setHarakatLevels(SET2_LEVELS);
          setAlphabetOrderLevels(SET3_LEVELS);
          setSukoonLevels(SET4_LEVELS);
          setUsingCMS(false);
          setError('Failed to load CMS data');
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(
    () => ({ levels, letters, harakatLevels, alphabetOrderLevels, sukoonLevels, loading, error, usingCMS }),
    [levels, letters, harakatLevels, alphabetOrderLevels, sukoonLevels, loading, error, usingCMS]
  );
}

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { SET1_LEVELS } from '@/data/learningSets';
import { ARABIC_LETTERS } from '@/data/letters';
import type { ArabicLetter, LetterLevel } from '@/data/learningSets';

const CACHE_KEY = 'cms-class1-cache';
const CACHE_TTL_MS = 30_000;

interface CachedCMSData {
  lessons: Lesson[];
  letters: ArabicLetter[];
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
  loading: boolean;
  error: string | null;
  usingCMS: boolean;
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
            setUsingCMS(false);
            setLoading(false);
          }
          return;
        }

        const lettersByLessonId = new Map<string, ArabicLetter[]>();
        for (const cl of cmsLetters) {
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

        const allCMSEntries = cmsLessons.filter((l) => l.lesson_key?.startsWith('set1-level-'));
        const cmsLevels: LetterLevel[] = allCMSEntries.map((l, i) => ({
          level: i + 1,
          letters: lettersByLessonId.get(l.id) ?? [],
        }));

        if (cmsLevels.length === 0 || cmsLevels.some((lvl) => !Array.isArray(lvl.letters) || lvl.letters.length === 0)) {
          if (!cancelled) {
            setError('CMS Class 1 data is incomplete or invalid');
            setLevels(SET1_LEVELS);
            setLetters(ARABIC_LETTERS);
            setUsingCMS(false);
            setLoading(false);
          }
          return;
        }

        const allLetters = cmsLevels.flatMap((lvl) => lvl.letters);
        // Deduplicate by arabic character
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
          timestamp: Date.now(),
        });

        if (!cancelled) {
          setLevels(cmsLevels);
          setLetters(uniqueLetters);
          setUsingCMS(true);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setLevels(SET1_LEVELS);
          setLetters(ARABIC_LETTERS);
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
    () => ({ levels, letters, loading, error, usingCMS }),
    [levels, letters, loading, error, usingCMS]
  );
}

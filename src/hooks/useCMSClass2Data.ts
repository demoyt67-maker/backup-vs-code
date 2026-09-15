import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { SET5_LEVELS, SET6_LEVELS, type TanweenLevel, type WordLevel } from '@/data/learningSets';
import { ARABIC_LETTERS } from '@/data/letters';
import { ARABIC_WORDS, type ArabicWord } from '@/data/arabicWords';

const CACHE_KEY = 'cms-class2-cache';
const CACHE_TTL_MS = 30_000;
const SET6_WORDS_LESSON_KEY = 'set6-words';

interface CachedCMSData {
  lessons: Lesson[];
  tanweenLevels: TanweenLevel[];
  wordLevels: WordLevel[];
  words: ArabicWord[];
  timestamp: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  lesson_key: string;
}

export interface CMSClass2Data {
  tanweenLevels: TanweenLevel[];
  wordLevels: WordLevel[];
  words: ArabicWord[];
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

export function useCMSClass2Data(): CMSClass2Data {
  const [tanweenLevels, setTanweenLevels] = useState<TanweenLevel[]>([]);
  const [wordLevels, setWordLevels] = useState<WordLevel[]>([]);
  const [words, setWords] = useState<ArabicWord[]>([]);
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
          if (!cancelled) {
            setTanweenLevels(cached.tanweenLevels || SET5_LEVELS);
            setWordLevels(cached.wordLevels || SET6_LEVELS);
            setWords(cached.words || ARABIC_WORDS);
            setUsingCMS(true);
            setLoading(false);
          }
          return;
        }

        const { data: cmsLessons, error: lessonsError } = await supabase
          .from('cms_lessons')
          .select('*')
          .eq('class_level', 2)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (lessonsError || !cmsLessons || cmsLessons.length === 0) {
          if (!cancelled) {
            setError(lessonsError ? `Failed to load CMS lessons: ${lessonsError.message}` : 'No active Class 2 lessons found');
            setTanweenLevels(SET5_LEVELS);
            setWordLevels(SET6_LEVELS);
            setWords(ARABIC_WORDS);
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
            setTanweenLevels(SET5_LEVELS);
            setWordLevels(SET6_LEVELS);
            setWords(ARABIC_WORDS);
            setUsingCMS(false);
            setLoading(false);
          }
          return;
        }

        const lettersByLessonId = new Map<string, any[]>();
        for (const cl of cmsLetters) {
          if (cl.lesson_id) {
            const arr = lettersByLessonId.get(cl.lesson_id) ?? [];
            arr.push(cl);
            lettersByLessonId.set(cl.lesson_id, arr);
          }
        }

        const set5CMSEntries = cmsLessons.filter((l) => l.lesson_key?.startsWith('set5-level-'));
        const cmsTanweenLevels: TanweenLevel[] = set5CMSEntries.map((l, i) => {
          const items = lettersByLessonId.get(l.id) ?? [];
          const fallback = SET5_LEVELS[i];
          return {
            level: i + 1,
            title: l.title || fallback?.title || `Level ${i + 1}`,
            tanween: fallback?.tanween || [],
            letters: fallback?.letters || [],
            items: items.map((cl) => {
              const baseLetter = ARABIC_LETTERS.find((letter) => cl.arabic.startsWith(letter.arabic));
              return {
                letter: baseLetter || { arabic: cl.arabic, english: cl.english, malayalam: '', index: 0 },
                tanween: cl.english as any,
              };
            }),
          };
        });

        const set6CMSEntries = cmsLessons.filter((l) => l.lesson_key?.startsWith('set6-level-'));
        const cmsWordLevels: WordLevel[] = set6CMSEntries.map((l, i) => {
          const fallback = SET6_LEVELS[i];
          return {
            level: i + 1,
            title: l.title || fallback?.title || `Level ${i + 1}`,
            description: l.description || fallback?.description || '',
          };
        });

        const wordsLessonId = cmsLessons.find((l) => l.lesson_key === SET6_WORDS_LESSON_KEY)?.id;
        const cmsWords: ArabicWord[] = wordsLessonId
          ? (lettersByLessonId.get(wordsLessonId) ?? []).map((cl, idx) => {
              const staticWord = ARABIC_WORDS.find((w) => w.arabic === cl.arabic);
              return {
                id: cl.id || `cms-word-${idx}`,
                arabic: cl.arabic,
                malayalam: staticWord?.malayalam || '',
                english: cl.english,
                category: staticWord?.category || 'objects',
              };
            })
          : ARABIC_WORDS;

        writeCache({
          lessons: cmsLessons,
          tanweenLevels: cmsTanweenLevels,
          wordLevels: cmsWordLevels,
          words: cmsWords,
          timestamp: Date.now(),
        });

        if (!cancelled) {
          setTanweenLevels(cmsTanweenLevels);
          setWordLevels(cmsWordLevels);
          setWords(cmsWords);
          setUsingCMS(true);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setTanweenLevels(SET5_LEVELS);
          setWordLevels(SET6_LEVELS);
          setWords(ARABIC_WORDS);
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
    () => ({ tanweenLevels, wordLevels, words, loading, error, usingCMS }),
    [tanweenLevels, wordLevels, words, loading, error, usingCMS]
  );
}

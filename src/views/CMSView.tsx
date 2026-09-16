import { useState, useEffect, useRef } from 'react';
import type { View } from '@/types';
import { CLASS_THEMES } from '@/theme';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { SET1_TITLE, SET1_LEVELS, SET2_TITLE, SET2_LEVELS, SET3_TITLE, SET3_LEVELS, SET4_TITLE, SET4_LEVELS, SUKOON_SYMBOL, withSukoon, SET5_TITLE, SET5_LEVELS, SET6_TITLE, SET6_LEVELS, HARAKAT, TANWEEN, applyHaraka, applyTanween, type LetterLevel, type HarakaType } from '@/data/learningSets';
import { ARABIC_LETTERS } from '@/data/letters';
import { ARABIC_WORDS, type ArabicWord } from '@/data/arabicWords';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
}

type CMSSection = 'class1' | 'class2' | 'class3' | 'quiz' | 'writing';

interface Lesson {
  id: string;
  title: string;
  description: string;
  letters?: { arabic: string; english: string }[];
}

const CMS_SECTIONS: { key: CMSSection; title: string; description: string; icon: string; accent: string }[] = [
  {
    key: 'class1',
    title: 'Class 1 Content',
    description: 'Manage letters, harakat, alphabet order, sukoon, and learning materials for Class 1.',
    icon: '📝',
    accent: 'linear-gradient(135deg, #ffb8c9 0%, #ffd678 50%, #7adbc4 100%)',
  },
  {
    key: 'class2',
    title: 'Class 2 Content',
    description: 'Manage tanween, words, and advanced practice materials for Class 2.',
    icon: '📖',
    accent: 'linear-gradient(135deg, #90b5ff 0%, #5e77ef 48%, #ffc57a 100%)',
  },
  {
    key: 'class3',
    title: 'Class 3 Content',
    description: 'Class 3 is currently empty.',
    icon: '📚',
    accent: 'linear-gradient(135deg, #c9b9ff 0%, #756ae7 48%, #f7bf6d 100%)',
  },
  {
    key: 'quiz',
    title: 'Quiz Questions',
    description: 'Create, edit, and organize quiz questions across all classes.',
    icon: '❓',
    accent: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
  },
  {
    key: 'writing',
    title: 'Writing Practice',
    description: 'Manage writing practice content, letter sequences, and exercises.',
    icon: '✍️',
    accent: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
];

function lettersLabel(letters: { arabic: string; english: string }[]): string {
  return letters.map((l) => `${l.arabic} ${l.english}`).join(', ');
}

function extractBaseLetter(combined: string): string {
  for (const letter of ARABIC_LETTERS) {
    if (combined.startsWith(letter.arabic)) {
      return letter.arabic;
    }
  }
  return combined;
}

function buildClass1Lessons(): Lesson[] {
  const lessons: Lesson[] = [
    {
      id: 'set1',
      title: SET1_TITLE,
      description: `${SET1_LEVELS.length} levels · ${ARABIC_LETTERS.length} letters total`,
    },
    ...SET1_LEVELS.map((level: LetterLevel) => ({
      id: `set1-level-${level.level}`,
      title: `Level ${level.level}`,
      description: lettersLabel(level.letters),
      letters: level.letters.map((l) => ({ arabic: l.arabic, english: l.english })),
    })),
    {
      id: 'set2',
      title: SET2_TITLE,
      description: `${SET2_LEVELS.length} levels · harakat practice`,
    },
    ...SET2_LEVELS.map((level) => ({
      id: `set2-level-${level.level}`,
      title: level.title,
      description: level.items.map((item) => `${item.letter.english} + ${item.haraka}`).join(', '),
    })),
    {
      id: 'set3',
      title: SET3_TITLE,
      description: `${SET3_LEVELS.length} levels · alphabet order`,
    },
    ...SET3_LEVELS.map((level) => ({
      id: `set3-level-${level.level}`,
      title: level.title,
      description: level.items.map((item) => `${item.english} (#${item.position})`).join(', '),
      letters: level.items.map((item) => ({ arabic: item.arabic, english: item.english })),
    })),
    {
      id: 'set4',
      title: SET4_TITLE,
      description: `${SET4_LEVELS.length} levels · sukoon practice`,
    },
    ...SET4_LEVELS.map((level) => ({
      id: `set4-level-${level.level}`,
      title: level.title,
      description: level.items.map((item) => `${item.label} | ${item.malayalam}`).join(', '),
      letters: level.items.map((item) => ({ arabic: item.arabic, english: item.label })),
    })),
    {
      id: 'writing-practice',
      title: 'Writing Practice',
      description: `Trace all ${ARABIC_LETTERS.length} Arabic letters (Alif to Yaa)`,
    },
  ];
  return lessons;
}

function buildClass2Lessons(): Lesson[] {
  const lessons: Lesson[] = [
    {
      id: 'set5',
      title: SET5_TITLE,
      description: `${SET5_LEVELS.length} levels · tanween and reading practice`,
    },
    ...SET5_LEVELS.map((level) => ({
      id: `set5-level-${level.level}`,
      title: level.title,
      description: level.items.map((item) => `${item.letter.english} + ${item.tanween}`).join(', '),
    })),
    {
      id: 'set6',
      title: SET6_TITLE,
      description: `${SET6_LEVELS.length} levels · words & fun activities`,
    },
    ...SET6_LEVELS.map((level) => ({
      id: `set6-level-${level.level}`,
      title: level.title,
      description: level.description,
    })),
    {
      id: 'set6-words',
      title: 'Set 6 Words',
      description: `${ARABIC_WORDS.length} Arabic words with meanings`,
    },
  ];
  return lessons;
}

const FALLBACK_LESSONS = buildClass1Lessons();
const FALLBACK_CLASS2_LESSONS = buildClass2Lessons();

function EditLessonForm({ lesson, theme, onCancel, onSave }: { lesson: Lesson; theme: Theme; onCancel: () => void; onSave: (lessonId: string, title: string, arabicLetters: string[], englishNames: string[]) => Promise<void> }) {
  const isLevel = lesson.id.startsWith('set1-level-');

  const [title, setTitle] = useState(() => lesson.title);
  const [arabicLetters, setArabicLetters] = useState<string[]>(() =>
    isLevel && lesson.letters ? lesson.letters.map((l) => l.arabic) : []
  );
  const [englishNames, setEnglishNames] = useState<string[]>(() =>
    isLevel && lesson.letters ? lesson.letters.map((l) => l.english) : []
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveClick = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(lesson.id, title, arabicLetters, englishNames);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button
          onClick={onCancel}
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: theme.accentSoft }}
        >
          <ArrowLeft size={16} />
          Cancel
        </button>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-primary-900 md:text-3xl">Edit Lesson</h2>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
            Editing mode
          </p>
        </div>
      </div>

      {saveError && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {saveError}
        </div>
      )}

      <div className="liquid-panel overflow-hidden rounded-[1.4rem] border shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
        <div className="border-b px-5 py-4" style={{ borderColor: theme.border, background: theme.accentSoft }}>
          <p className="text-base font-bold text-primary-900">{lesson.title}</p>
          <p className="mt-1 text-xs text-primary-700">{lesson.description}</p>
        </div>

        <div className="p-5">
          {isLevel && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-primary-600">Level Name</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-primary-900 outline-none transition-all focus:ring-2"
                  style={{ borderColor: theme.border, background: theme.surfaceStrong, color: theme.text }}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-primary-600">Arabic Letters</label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {arabicLetters.map((letter, idx) => (
                    <input
                      key={`arabic-${idx}`}
                      value={letter}
                      maxLength={2}
                      onChange={(e) => {
                        const next = [...arabicLetters];
                        next[idx] = e.target.value;
                        setArabicLetters(next);
                      }}
                      className="rounded-xl border px-3 py-2 text-center text-lg font-bold text-primary-900 outline-none transition-all focus:ring-2"
                      style={{ borderColor: theme.border, background: theme.surfaceStrong }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-primary-600">English Letter Names</label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {englishNames.map((name, idx) => (
                    <input
                      key={`english-${idx}`}
                      value={name}
                      onChange={(e) => {
                        const next = [...englishNames];
                        next[idx] = e.target.value;
                        setEnglishNames(next);
                      }}
                      className="rounded-xl border px-3 py-2 text-sm font-semibold text-primary-900 outline-none transition-all focus:ring-2"
                      style={{ borderColor: theme.border, background: theme.surfaceStrong }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isLevel && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-primary-600">Title / Name</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-primary-900 outline-none transition-all focus:ring-2"
                  style={{ borderColor: theme.border, background: theme.surfaceStrong, color: theme.text }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse items-stretch gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end" style={{ borderColor: theme.border }}>
          <button
            onClick={onCancel}
            disabled={saving}
            className="rounded-2xl border px-5 py-2.5 text-sm font-bold text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
            style={{ borderColor: theme.border, background: theme.surfaceStrong }}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            disabled={saving}
            className="rounded-2xl bg-primary-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryStrong} 100%)` }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Class1ContentManagement({ theme, onBack }: { theme: Theme; onBack: () => void }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [managingLessonId, setManagingLessonId] = useState<string | null>(null);
  const [managingLessonTitle, setManagingLessonTitle] = useState<string>('');
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    loadLessons();
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  async function loadLessons() {
    try {
      setLoading(true);
      setSaveStatus(null);

      const { data: cmsLessons, error } = await supabase
        .from('cms_lessons')
        .select('*')
        .eq('class_level', 1)
        .order('sort_order', { ascending: true });

      if (cancelledRef.current) return;

      if (error || !cmsLessons || cmsLessons.length === 0) {
        if (error) {
          setSaveStatus({ type: 'error', message: `Failed to load CMS lessons: ${error.message || 'Unknown error'}` });
        }
        setLessons(FALLBACK_LESSONS);
        setLoading(false);
        return;
      }

      const lessonsWithLetters = await Promise.all(
        cmsLessons.map(async (cmsLesson) => {
          const { data: letters } = await supabase
            .from('cms_lesson_letters')
            .select('*')
            .eq('lesson_id', cmsLesson.id)
            .order('position', { ascending: true });

          if (cancelledRef.current) return { id: cmsLesson.lesson_key, title: cmsLesson.title, description: cmsLesson.description || '' };

          const fallback = FALLBACK_LESSONS.find((l) => l.id === cmsLesson.lesson_key);

          if (cmsLesson.lesson_key.startsWith('set1-level-')) {
            const levelMatch = cmsLesson.lesson_key.match(/^set1-level-(\d+)$/);
            if (levelMatch) {
              const levelNum = Number(levelMatch[1]);
              const level = SET1_LEVELS.find((l) => l.level === levelNum);
              if (level && letters && letters.length > 0) {
                return {
                  id: cmsLesson.lesson_key,
                  title: cmsLesson.title,
                  description: cmsLesson.description || lettersLabel(level.letters),
                  letters: letters.map((l) => ({ arabic: l.arabic, english: l.english })),
                };
              }
            }
          }

          return {
            id: cmsLesson.lesson_key,
            title: cmsLesson.title,
            description: cmsLesson.description || fallback?.description || '',
            letters: letters?.map((l) => ({ arabic: l.arabic, english: l.english })) || fallback?.letters,
          };
        })
      );

      if (cancelledRef.current) return;

      setLessons(lessonsWithLetters);
    } catch (err) {
      if (!cancelledRef.current) {
        setSaveStatus({ type: 'error', message: 'Failed to load CMS data from database' });
        setLessons(FALLBACK_LESSONS);
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }
  }

  async function handleSave(lessonId: string, title: string, arabicLetters: string[], englishNames: string[]) {
    if (arabicLetters.length !== englishNames.length) {
      throw new Error('Letter count mismatch: Arabic letters and English names must have the same length.');
    }

    const existingLesson = lessons.find((l) => l.id === lessonId);
    const sortOrder = existingLesson ? lessons.indexOf(existingLesson) + 1 : lessons.length + 1;

    const { data: savedLesson, error } = await supabase
      .from('cms_lessons')
      .upsert({
        class_level: 1,
        lesson_key: lessonId,
        title,
        description: lettersLabel(arabicLetters.map((a, i) => ({ arabic: a, english: englishNames[i] }))),
        sort_order: sortOrder,
        is_active: true,
      })
      .select()
      .single();

    if (error || !savedLesson) {
      throw new Error(error?.message || 'Failed to save lesson');
    }

    const letterRows = arabicLetters.map((arabic, idx) => ({
      lesson_id: savedLesson.id,
      position: idx + 1,
      arabic,
      english: englishNames[idx],
    }));

    const { data: existingLetters } = await supabase
      .from('cms_lesson_letters')
      .select('*')
      .eq('lesson_id', savedLesson.id);

    await supabase
      .from('cms_lesson_letters')
      .delete()
      .eq('lesson_id', savedLesson.id);

    const { error: lettersError } = await supabase
      .from('cms_lesson_letters')
      .insert(letterRows);

    if (lettersError) {
      if (existingLetters && existingLetters.length > 0) {
        await supabase.from('cms_lesson_letters').insert(existingLetters);
      }
      throw new Error(lettersError.message || 'Failed to save letters');
    }

    setSaveStatus({ type: 'success', message: 'Changes saved successfully!' });
    await loadLessons();
  }

  if (editingLesson) {
    return (
      <EditLessonForm
        lesson={editingLesson}
        theme={theme}
        onCancel={() => {
          setEditingLesson(null);
          setSaveStatus(null);
        }}
        onSave={handleSave}
      />
    );
  }

  if (managingLessonId) {
    return (
      <LetterManagement
        lessonId={managingLessonId}
        lessonTitle={managingLessonTitle}
        theme={theme}
        onBack={() => {
          setManagingLessonId(null);
          setManagingLessonTitle('');
        }}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: theme.accentSoft }}
        >
          <ArrowLeft size={16} />
          Back to Content Management
        </button>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-primary-900 md:text-3xl">Class 1 Content</h2>
            <p className="mt-1 text-sm text-primary-700">
              Manage lessons, activities, and learning materials for Class 1.
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
            style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryStrong} 100%)` }}
          >
            <Plus size={18} />
            Add Lesson
          </button>
        </div>
      </div>

      {saveStatus && (
        <div
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            saveStatus.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {saveStatus.message}
        </div>
      )}

      {loading ? (
        <div className="liquid-panel flex items-center justify-center rounded-[1.4rem] border py-12" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700"></div>
            <p className="text-sm font-medium text-primary-700">Loading CMS data...</p>
          </div>
        </div>
      ) : (
        <div className="liquid-panel overflow-hidden rounded-[1.4rem] border shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          <div className="divide-y" style={{ borderColor: theme.border }}>
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex flex-col gap-3 p-4 transition-all hover:bg-white/50 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-primary-900">{lesson.title}</h3>
                  <p className="mt-1 text-xs text-primary-700">{lesson.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {(lesson.id.startsWith('set1-level-') || lesson.id.startsWith('set2-level-') || lesson.id.startsWith('set3-level-') || lesson.id.startsWith('set4-level-') || lesson.id.startsWith('set5-level-')) && (
                    <button
                      onClick={() => {
                        setManagingLessonId(lesson.id);
                        setManagingLessonTitle(lesson.title);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary-50 px-3 py-2 text-xs font-bold text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      Manage Letters
                    </button>
                  )}
                  <button
                    onClick={() => setEditingLesson(lesson)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Class2ContentManagement({ theme, onBack }: { theme: Theme; onBack: () => void }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [managingWords, setManagingWords] = useState(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    loadLessons();
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  async function loadLessons() {
    try {
      setLoading(true);
      setSaveStatus(null);

      const { data: cmsLessons, error } = await supabase
        .from('cms_lessons')
        .select('*')
        .eq('class_level', 2)
        .order('sort_order', { ascending: true });

      if (cancelledRef.current) return;

      if (error || !cmsLessons || cmsLessons.length === 0) {
        if (error) {
          setSaveStatus({ type: 'error', message: `Failed to load CMS lessons: ${error.message || 'Unknown error'}` });
        }
        setLessons(FALLBACK_CLASS2_LESSONS);
        setLoading(false);
        return;
      }

      const lessonsWithLetters = cmsLessons.map((cmsLesson) => {
        const fallback = FALLBACK_CLASS2_LESSONS.find((l) => l.id === cmsLesson.lesson_key);
        return {
          id: cmsLesson.lesson_key,
          title: cmsLesson.title,
          description: cmsLesson.description || fallback?.description || '',
        };
      });

      if (cancelledRef.current) return;

      setLessons(lessonsWithLetters);
    } catch {
      if (!cancelledRef.current) {
        setSaveStatus({ type: 'error', message: 'Failed to load CMS data from database' });
        setLessons(FALLBACK_CLASS2_LESSONS);
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }
  }

  async function handleSave(lessonId: string, title: string) {
    const existingLesson = lessons.find((l) => l.id === lessonId);
    const sortOrder = existingLesson ? lessons.indexOf(existingLesson) + 1 : lessons.length + 1;

    const { data: savedLesson, error } = await supabase
      .from('cms_lessons')
      .upsert({
        class_level: 2,
        lesson_key: lessonId,
        title,
        description: existingLesson?.description || '',
        sort_order: sortOrder,
        is_active: true,
      })
      .select()
      .single();

    if (error || !savedLesson) {
      throw new Error(error?.message || 'Failed to save lesson');
    }

    setSaveStatus({ type: 'success', message: 'Changes saved successfully!' });
    await loadLessons();
  }

  if (editingLesson) {
    return (
      <EditLessonForm
        lesson={editingLesson}
        theme={theme}
        onCancel={() => {
          setEditingLesson(null);
          setSaveStatus(null);
        }}
        onSave={async (lessonId, title) => {
          await handleSave(lessonId, title);
        }}
      />
    );
  }

  if (managingWords) {
    return (
      <WordManagement
        theme={theme}
        onBack={() => setManagingWords(false)}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: theme.accentSoft }}
        >
          <ArrowLeft size={16} />
          Back to Content Management
        </button>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-primary-900 md:text-3xl">Class 2 Content</h2>
            <p className="mt-1 text-sm text-primary-700">
              Manage tanween, words, and advanced practice materials for Class 2.
            </p>
          </div>
        </div>
      </div>

      {saveStatus && (
        <div
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            saveStatus.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {saveStatus.message}
        </div>
      )}

      {loading ? (
        <div className="liquid-panel flex items-center justify-center rounded-[1.4rem] border py-12" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700"></div>
            <p className="text-sm font-medium text-primary-700">Loading CMS data...</p>
          </div>
        </div>
      ) : (
        <div className="liquid-panel overflow-hidden rounded-[1.4rem] border shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          <div className="divide-y" style={{ borderColor: theme.border }}>
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex flex-col gap-3 p-4 transition-all hover:bg-white/50 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-primary-900">{lesson.title}</h3>
                  <p className="mt-1 text-xs text-primary-700">{lesson.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {lesson.id === 'set6-words' ? (
                    <button
                      onClick={() => setManagingWords(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary-50 px-3 py-2 text-xs font-bold text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      Manage Words
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingLesson(lesson)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface CmsLetterRow {
  id: string;
  position: number;
  arabic: string;
  english: string;
}

function LetterManagement({ lessonId, lessonTitle, theme, onBack }: { lessonId: string; lessonTitle: string; theme: Theme; onBack: () => void }) {
  const [letters, setLetters] = useState<CmsLetterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingLetter, setEditingLetter] = useState<CmsLetterRow | null>(null);
  const [addingLetter, setAddingLetter] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsLetterRow | null>(null);
  const [saving, setSaving] = useState(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    loadLetters();
    return () => {
      cancelledRef.current = true;
    };
  }, [lessonId]);

  async function loadLetters() {
    try {
      setLoading(true);
      setSaveStatus(null);

      const { data, error } = await supabase
        .from('cms_lesson_letters')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('position', { ascending: true });

      if (cancelledRef.current) return;

      if (error) {
        setSaveStatus({ type: 'error', message: `Failed to load letters: ${error.message || 'Unknown error'}` });
        setLetters([]);
        setLoading(false);
        return;
      }

      setLetters(data || []);
      setLoading(false);
    } catch {
      if (!cancelledRef.current) {
        setSaveStatus({ type: 'error', message: 'Failed to load letters' });
        setLetters([]);
        setLoading(false);
      }
    }
  }

  async function handleAddLetter(arabic: string, english: string) {
    if (!arabic.trim() || !english.trim()) {
      throw new Error('Arabic and English fields are required.');
    }

    const maxPosition = letters.length > 0 ? Math.max(...letters.map((l) => l.position)) : 0;
    const { data, error } = await supabase
      .from('cms_lesson_letters')
      .insert({
        lesson_id: lessonId,
        position: maxPosition + 1,
        arabic: arabic.trim(),
        english: english.trim(),
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to add letter');
    }

    await loadLetters();
    setAddingLetter(false);
    setSaveStatus({ type: 'success', message: 'Letter added successfully!' });
  }

  async function handleUpdateLetter(letterId: string, arabic: string, english: string, position: number) {
    if (!arabic.trim() || !english.trim()) {
      throw new Error('Arabic and English fields are required.');
    }

    const { error } = await supabase
      .from('cms_lesson_letters')
      .update({
        arabic: arabic.trim(),
        english: english.trim(),
        position,
      })
      .eq('id', letterId);

    if (error) {
      throw new Error(error.message || 'Failed to update letter');
    }

    await loadLetters();
    setEditingLetter(null);
    setSaveStatus({ type: 'success', message: 'Letter updated successfully!' });
  }

  async function handleDeleteLetter(letterId: string) {
    const { error } = await supabase
      .from('cms_lesson_letters')
      .delete()
      .eq('id', letterId);

    if (error) {
      throw new Error(error.message || 'Failed to delete letter');
    }

    await loadLetters();
    setDeleteTarget(null);
    setSaveStatus({ type: 'success', message: 'Letter deleted successfully!' });
  }

  if (editingLetter) {
    return (
      <LetterForm
        theme={theme}
        lessonId={lessonId}
        initialLetter={editingLetter}
        onCancel={() => setEditingLetter(null)}
        onSave={async (arabic, english, position) => {
          setSaving(true);
          try {
            await handleUpdateLetter(editingLetter.id, arabic, english, position);
          } catch (err) {
            setSaveStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update letter' });
          } finally {
            setSaving(false);
          }
        }}
        saving={saving}
      />
    );
  }

  if (addingLetter) {
    return (
      <LetterForm
        theme={theme}
        lessonId={lessonId}
        onCancel={() => setAddingLetter(false)}
        onSave={async (arabic, english, position) => {
          setSaving(true);
          try {
            await handleAddLetter(arabic, english);
          } catch (err) {
            setSaveStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to add letter' });
          } finally {
            setSaving(false);
          }
        }}
        saving={saving}
      />
    );
  }

  if (deleteTarget) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <button
            onClick={() => setDeleteTarget(null)}
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: theme.accentSoft }}
          >
            <ArrowLeft size={16} />
            Cancel
          </button>
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-primary-900 md:text-3xl">Delete Letter</h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="liquid-panel overflow-hidden rounded-[1.4rem] border shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          <div className="p-5">
            <p className="text-sm font-semibold text-primary-900">
              Are you sure you want to delete this letter?
            </p>
            <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
              <p className="text-sm font-bold text-primary-900">
                {deleteTarget.position}. {deleteTarget.arabic} — {deleteTarget.english}
              </p>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={saving}
                className="rounded-2xl border px-5 py-2.5 text-sm font-bold text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                style={{ borderColor: theme.border, background: theme.surfaceStrong }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSaving(true);
                  try {
                    await handleDeleteLetter(deleteTarget.id);
                  } catch (err) {
                    setSaveStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete letter' });
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete Letter'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: theme.accentSoft }}
        >
          <ArrowLeft size={16} />
          Back to Lessons
        </button>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-primary-900 md:text-3xl">{lessonTitle}</h2>
            <p className="mt-1 text-sm text-primary-700">
              Manage individual letters for this level.
            </p>
          </div>
          <button
            onClick={() => setAddingLetter(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
            style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryStrong} 100%)` }}
          >
            <Plus size={18} />
            Add Letter
          </button>
        </div>
      </div>

      {saveStatus && (
        <div
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            saveStatus.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {saveStatus.message}
        </div>
      )}

      {loading ? (
        <div className="liquid-panel flex items-center justify-center rounded-[1.4rem] border py-12" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700"></div>
            <p className="text-sm font-medium text-primary-700">Loading letters...</p>
          </div>
        </div>
      ) : (
        <div className="liquid-panel overflow-hidden rounded-[1.4rem] border shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          {letters.length === 0 ? (
            <div className="p-6 text-center text-sm text-primary-700">
              No letters yet. Click "Add Letter" to create the first letter for this level.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: theme.border }}>
              {letters.map((letter) => {
                const isSet4 = lessonId.startsWith('set4-level-');
                const isSet5 = lessonId.startsWith('set5-level-');
                const baseArabic = lessonId.startsWith('set2-level-') || isSet4 || isSet5 ? extractBaseLetter(letter.arabic) : letter.arabic;
                const staticBase = ARABIC_LETTERS.find((l) => l.arabic === baseArabic);
                const malayalam = staticBase?.malayalam || '';
                const tanweenType = isSet5 ? letter.english : '';
                return (
                  <div
                    key={letter.id}
                    className="flex flex-col gap-3 p-4 transition-all hover:bg-white/50 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xs font-black text-primary-700">
                        {letter.position}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-primary-900">{letter.arabic}</p>
                        <p className="text-xs text-primary-700">{letter.english}</p>
                        {isSet5 && tanweenType && (
                          <p className="text-[10px] font-bold uppercase tracking-wide text-primary-600">
                            {TANWEEN[tanweenType as keyof typeof TANWEEN]?.name || tanweenType}
                          </p>
                        )}
                        {malayalam && <p className="font-malayalam text-xs text-gold-700">{malayalam}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingLetter(letter)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(letter)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LetterForm({ theme, lessonId, initialLetter, onCancel, onSave, saving }: { theme: Theme; lessonId: string; initialLetter?: CmsLetterRow | null; onCancel: () => void; onSave: (arabic: string, english: string, position: number) => Promise<void>; saving: boolean }) {
  const isSet2 = lessonId.startsWith('set2-level-');
  const isSet4 = lessonId.startsWith('set4-level-');
  const isSet5 = lessonId.startsWith('set5-level-');
  const [baseLetter, setBaseLetter] = useState(() => {
    if ((isSet2 || isSet4 || isSet5) && initialLetter?.arabic) {
      return extractBaseLetter(initialLetter.arabic);
    }
    return initialLetter?.arabic || '';
  });
  const [haraka, setHaraka] = useState<HarakaType>(() => {
    if (isSet2 && initialLetter?.english) {
      return (initialLetter.english as HarakaType) || 'fatha';
    }
    return 'fatha';
  });
  const [addSukoon, setAddSukoon] = useState(() => {
    if (isSet4 && initialLetter?.arabic) {
      return initialLetter.arabic.includes(SUKOON_SYMBOL) || initialLetter.arabic.includes('\u0652');
    }
    return false;
  });
  const [tanweenType, setTanweenType] = useState<string>(() => {
    if (isSet5 && initialLetter?.english) {
      return (initialLetter.english as string) || 'fathatain';
    }
    return 'fathatain';
  });
  const [english, setEnglish] = useState(() => initialLetter?.english || '');
  const [position, setPosition] = useState(() => initialLetter ? String(initialLetter.position) : '');
  const [error, setError] = useState<string | null>(null);

  const combinedArabic = isSet2 && baseLetter ? applyHaraka(baseLetter, haraka) : isSet4 && baseLetter ? (addSukoon ? withSukoon(baseLetter) : baseLetter) : isSet5 && baseLetter ? applyTanween(baseLetter, tanweenType as any) : baseLetter;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const finalArabic = (isSet2 || isSet4 || isSet5) ? combinedArabic : baseLetter;
    const finalEnglish = isSet2 ? haraka : isSet5 ? tanweenType : english;
    if (!finalArabic.trim() || !finalEnglish.trim()) {
      setError('Both Arabic and English fields are required.');
      return;
    }
    const pos = position ? parseInt(position, 10) : 1;
    if (Number.isNaN(pos) || pos < 1) {
      setError('Position must be a positive number.');
      return;
    }
    try {
      await onSave(finalArabic, finalEnglish, pos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save letter');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button
          onClick={onCancel}
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: theme.accentSoft }}
        >
          <ArrowLeft size={16} />
          Cancel
        </button>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-primary-900 md:text-3xl">{initialLetter ? 'Edit Letter' : 'Add Letter'}</h2>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
            {initialLetter ? 'Update letter details' : 'Enter Arabic and English for the new letter'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="liquid-panel overflow-hidden rounded-[1.4rem] border shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          <div className="p-5 space-y-4">
            {isSet2 ? (
              <>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-primary-600">Base Letter</label>
                  <select
                    value={baseLetter}
                    onChange={(e) => setBaseLetter(e.target.value)}
                    className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-primary-900 outline-none transition-all focus:ring-2"
                    style={{ borderColor: theme.border, background: theme.surfaceStrong }}
                  >
                    <option value="">Select a letter</option>
                    {ARABIC_LETTERS.map((l) => (
                      <option key={l.arabic} value={l.arabic}>{l.arabic} — {l.english}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-primary-600">Haraka</label>
                  <select
                    value={haraka}
                    onChange={(e) => setHaraka(e.target.value as HarakaType)}
                    className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-primary-900 outline-none transition-all focus:ring-2"
                    style={{ borderColor: theme.border, background: theme.surfaceStrong }}
                  >
                    {(Object.keys(HARAKAT) as Array<keyof typeof HARAKAT>).map((h) => (
                      <option key={h} value={h}>{HARAKAT[h].name} ({HARAKAT[h].malayalam})</option>
                    ))}
                  </select>
                  {combinedArabic && (
                    <p className="mt-2 text-center font-arabic text-2xl font-bold text-primary-900">
                      {combinedArabic}
                    </p>
                  )}
                </div>
              </>
            ) : isSet4 ? (
              <>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-primary-600">Base Letter</label>
                  <select
                    value={baseLetter}
                    onChange={(e) => setBaseLetter(e.target.value)}
                    className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-primary-900 outline-none transition-all focus:ring-2"
                    style={{ borderColor: theme.border, background: theme.surfaceStrong }}
                  >
                    <option value="">Select a letter</option>
                    {ARABIC_LETTERS.map((l) => (
                      <option key={l.arabic} value={l.arabic}>{l.arabic} — {l.english}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="sukoon-toggle"
                    type="checkbox"
                    checked={addSukoon}
                    onChange={(e) => setAddSukoon(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="sukoon-toggle" className="text-sm font-semibold text-primary-900">
                    Add Sukoon (ْ)
                  </label>
                </div>
                {combinedArabic && (
                  <p className="text-center font-arabic text-2xl font-bold text-primary-900">
                    {combinedArabic}
                  </p>
                )}
              </>
            ) : isSet5 ? (
              <>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-primary-600">Base Letter</label>
                  <select
                    value={baseLetter}
                    onChange={(e) => setBaseLetter(e.target.value)}
                    className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-primary-900 outline-none transition-all focus:ring-2"
                    style={{ borderColor: theme.border, background: theme.surfaceStrong }}
                  >
                    <option value="">Select a letter</option>
                    {ARABIC_LETTERS.map((l) => (
                      <option key={l.arabic} value={l.arabic}>{l.arabic} — {l.english}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-primary-600">Tanween Type</label>
                  <select
                    value={tanweenType}
                    onChange={(e) => setTanweenType(e.target.value)}
                    className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-primary-900 outline-none transition-all focus:ring-2"
                    style={{ borderColor: theme.border, background: theme.surfaceStrong }}
                  >
                    {(Object.keys(TANWEEN) as Array<keyof typeof TANWEEN>).map((t) => (
                      <option key={t} value={t}>{TANWEEN[t].name} ({TANWEEN[t].malayalam})</option>
                    ))}
                  </select>
                  {combinedArabic && (
                    <p className="mt-2 text-center font-arabic text-2xl font-bold text-primary-900">
                      {combinedArabic}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-primary-600">Arabic Letter</label>
                <input
                  value={baseLetter}
                  onChange={(e) => setBaseLetter(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-4 py-2.5 text-lg font-bold text-primary-900 outline-none transition-all focus:ring-2"
                  style={{ borderColor: theme.border, background: theme.surfaceStrong }}
                  placeholder="ا"
                  maxLength={10}
                />
              </div>
            )}
            {!isSet2 && !isSet4 && !isSet5 && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-primary-600">English Name</label>
                <input
                  value={english}
                  onChange={(e) => setEnglish(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-primary-900 outline-none transition-all focus:ring-2"
                  style={{ borderColor: theme.border, background: theme.surfaceStrong }}
                  placeholder="Alif"
                />
              </div>
            )}
            {(isSet2 || isSet4 || isSet5) && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-primary-600">English Label</label>
                <input
                  value={english}
                  onChange={(e) => setEnglish(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-primary-900 outline-none transition-all focus:ring-2"
                  style={{ borderColor: theme.border, background: theme.surfaceStrong }}
                  placeholder="Baa + Sukoon"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-primary-600">Order / Position</label>
              <input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                type="number"
                min="1"
                className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-primary-900 outline-none transition-all focus:ring-2"
                style={{ borderColor: theme.border, background: theme.surfaceStrong }}
                placeholder="1"
              />
              <p className="mt-1 text-[10px] text-primary-700">Leave empty to place at the end when adding.</p>
            </div>
          </div>

          <div className="flex flex-col-reverse items-stretch gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end" style={{ borderColor: theme.border }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-2xl border px-5 py-2.5 text-sm font-bold text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
              style={{ borderColor: theme.border, background: theme.surfaceStrong }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-primary-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryStrong} 100%)` }}
            >
              {saving ? 'Saving...' : initialLetter ? 'Update Letter' : 'Add Letter'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

interface CmsWordRow {
  id: string;
  position: number;
  arabic: string;
  english: string;
}

function WordManagement({ theme, onBack }: { theme: Theme; onBack: () => void }) {
  const [words, setWords] = useState<CmsWordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingWord, setEditingWord] = useState<CmsWordRow | null>(null);
  const [addingWord, setAddingWord] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsWordRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [wordsLessonId, setWordsLessonId] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    loadWords();
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  async function loadWords() {
    try {
      setLoading(true);
      setSaveStatus(null);

      const { data: lessonData } = await supabase
        .from('cms_lessons')
        .select('id')
        .eq('class_level', 2)
        .eq('lesson_key', 'set6-words')
        .maybeSingle();

      const lessonId = lessonData?.id;
      setWordsLessonId(lessonId || null);

      if (!lessonId) {
        setWords([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('cms_lesson_letters')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('position', { ascending: true });

      if (cancelledRef.current) return;

      if (error) {
        setSaveStatus({ type: 'error', message: `Failed to load words: ${error.message || 'Unknown error'}` });
        setWords([]);
        setLoading(false);
        return;
      }

      setWords(data || []);
      setLoading(false);
    } catch {
      if (!cancelledRef.current) {
        setSaveStatus({ type: 'error', message: 'Failed to load words' });
        setWords([]);
        setLoading(false);
      }
    }
  }

  async function handleAddWord(arabic: string, english: string, position: number) {
    if (!arabic.trim() || !english.trim()) {
      throw new Error('Arabic and English fields are required.');
    }

    if (!wordsLessonId) {
      throw new Error('Words lesson not found. Please save the Set 6 lesson first.');
    }

    const maxPosition = words.length > 0 ? Math.max(...words.map((w) => w.position)) : 0;
    const { data, error } = await supabase
      .from('cms_lesson_letters')
      .insert({
        lesson_id: wordsLessonId,
        position: position || maxPosition + 1,
        arabic: arabic.trim(),
        english: english.trim(),
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to add word');
    }

    await loadWords();
    setAddingWord(false);
    setSaveStatus({ type: 'success', message: 'Word added successfully!' });
  }

  async function handleUpdateWord(wordId: string, arabic: string, english: string, position: number) {
    if (!arabic.trim() || !english.trim()) {
      throw new Error('Arabic and English fields are required.');
    }

    const { error } = await supabase
      .from('cms_lesson_letters')
      .update({
        arabic: arabic.trim(),
        english: english.trim(),
        position,
      })
      .eq('id', wordId);

    if (error) {
      throw new Error(error.message || 'Failed to update word');
    }

    await loadWords();
    setEditingWord(null);
    setSaveStatus({ type: 'success', message: 'Word updated successfully!' });
  }

  async function handleDeleteWord(wordId: string) {
    const { error } = await supabase
      .from('cms_lesson_letters')
      .delete()
      .eq('id', wordId);

    if (error) {
      throw new Error(error.message || 'Failed to delete word');
    }

    await loadWords();
    setDeleteTarget(null);
    setSaveStatus({ type: 'success', message: 'Word deleted successfully!' });
  }

  if (editingWord) {
    return (
      <WordForm
        theme={theme}
        initialWord={editingWord}
        onCancel={() => {
          setEditingWord(null);
          setSaveStatus(null);
        }}
        onSave={async (arabic, english, position) => {
          setSaving(true);
          try {
            await handleUpdateWord(editingWord.id, arabic, english, position);
          } catch (err) {
            setSaveStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update word' });
          } finally {
            setSaving(false);
          }
        }}
        saving={saving}
      />
    );
  }

  if (addingWord) {
    return (
      <WordForm
        theme={theme}
        onCancel={() => setAddingWord(false)}
        onSave={async (arabic, english, position) => {
          setSaving(true);
          try {
            await handleAddWord(arabic, english, position);
          } catch (err) {
            setSaveStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to add word' });
          } finally {
            setSaving(false);
          }
        }}
        saving={saving}
      />
    );
  }

  if (deleteTarget) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <button
            onClick={() => setDeleteTarget(null)}
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: theme.accentSoft }}
          >
            <ArrowLeft size={16} />
            Cancel
          </button>
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-primary-900 md:text-3xl">Delete Word</h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="liquid-panel overflow-hidden rounded-[1.4rem] border shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          <div className="p-5">
            <p className="text-sm font-semibold text-primary-900">
              Are you sure you want to delete this word?
            </p>
            <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
              <p className="text-sm font-bold text-primary-900">{deleteTarget.arabic}</p>
              <p className="text-xs text-primary-700">{deleteTarget.english}</p>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={saving}
                className="rounded-2xl border px-5 py-2.5 text-sm font-bold text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                style={{ borderColor: theme.border, background: theme.surfaceStrong }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSaving(true);
                  try {
                    await handleDeleteWord(deleteTarget.id);
                  } catch (err) {
                    setSaveStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete word' });
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete Word'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: theme.accentSoft }}
        >
          <ArrowLeft size={16} />
          Back to Lessons
        </button>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-primary-900 md:text-3xl">Set 6 Words</h2>
            <p className="mt-1 text-sm text-primary-700">
              Manage Arabic words, English meanings, and pronunciations for Class 2 Set 6.
            </p>
          </div>
          <button
            onClick={() => setAddingWord(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
            style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryStrong} 100%)` }}
          >
            <Plus size={18} />
            Add Word
          </button>
        </div>
      </div>

      {saveStatus && (
        <div
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            saveStatus.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {saveStatus.message}
        </div>
      )}

      {loading ? (
        <div className="liquid-panel flex items-center justify-center rounded-[1.4rem] border py-12" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700"></div>
            <p className="text-sm font-medium text-primary-700">Loading words...</p>
          </div>
        </div>
      ) : (
        <div className="liquid-panel overflow-hidden rounded-[1.4rem] border shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          {words.length === 0 ? (
            <div className="p-6 text-center text-sm text-primary-700">
              No words yet. Click "Add Word" to create the first word for Set 6.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: theme.border }}>
              {words.map((word) => {
                const staticWord = ARABIC_WORDS.find((w) => w.arabic === word.arabic);
                const malayalam = staticWord?.malayalam || '';
                return (
                  <div
                    key={word.id}
                    className="flex flex-col gap-3 p-4 transition-all hover:bg-white/50 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xs font-black text-primary-700">
                        {word.position}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-primary-900">{word.arabic}</p>
                        <p className="text-xs text-primary-700">{word.english}</p>
                        {malayalam && <p className="font-malayalam text-xs text-gold-700">{malayalam}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingWord(word)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(word)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WordForm({ theme, initialWord, onCancel, onSave, saving }: { theme: Theme; initialWord?: CmsWordRow | null; onCancel: () => void; onSave: (arabic: string, english: string, position: number) => Promise<void>; saving: boolean }) {
  const [arabic, setArabic] = useState(() => initialWord?.arabic || '');
  const [english, setEnglish] = useState(() => initialWord?.english || '');
  const [position, setPosition] = useState(() => initialWord ? String(initialWord.position) : '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!arabic.trim() || !english.trim()) {
      setError('Both Arabic and English fields are required.');
      return;
    }
    const pos = position ? parseInt(position, 10) : 1;
    if (Number.isNaN(pos) || pos < 1) {
      setError('Position must be a positive number.');
      return;
    }
    try {
      await onSave(arabic, english, pos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save word');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button
          onClick={onCancel}
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: theme.accentSoft }}
        >
          <ArrowLeft size={16} />
          Cancel
        </button>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-primary-900 md:text-3xl">{initialWord ? 'Edit Word' : 'Add Word'}</h2>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
            {initialWord ? 'Update word details' : 'Enter Arabic and English for the new word'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="liquid-panel overflow-hidden rounded-[1.4rem] border shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-primary-600">Arabic Word</label>
              <input
                value={arabic}
                onChange={(e) => setArabic(e.target.value)}
                className="mt-1 w-full rounded-xl border px-4 py-2.5 text-lg font-bold text-primary-900 outline-none transition-all focus:ring-2"
                style={{ borderColor: theme.border, background: theme.surfaceStrong }}
                placeholder="كَتَبَ"
                maxLength={50}
              />
              {arabic && (
                <p className="mt-2 text-center font-arabic text-2xl font-bold text-primary-900">
                  {arabic}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-primary-600">English Meaning</label>
              <input
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
                className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-primary-900 outline-none transition-all focus:ring-2"
                style={{ borderColor: theme.border, background: theme.surfaceStrong }}
                placeholder="He wrote"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-primary-600">Order / Position</label>
              <input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                type="number"
                min="1"
                className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-primary-900 outline-none transition-all focus:ring-2"
                style={{ borderColor: theme.border, background: theme.surfaceStrong }}
                placeholder="1"
              />
              <p className="mt-1 text-[10px] text-primary-700">Leave empty to place at the end when adding.</p>
            </div>
          </div>

          <div className="flex flex-col-reverse items-stretch gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end" style={{ borderColor: theme.border }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-2xl border px-5 py-2.5 text-sm font-bold text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
              style={{ borderColor: theme.border, background: theme.surfaceStrong }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-primary-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryStrong} 100%)` }}
            >
              {saving ? 'Saving...' : initialWord ? 'Update Word' : 'Add Word'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function CMSView({ onNavigate, theme }: Props) {
  const [selectedSection, setSelectedSection] = useState<CMSSection | null>(null);

  if (selectedSection === 'class1') {
    return <Class1ContentManagement theme={theme} onBack={() => setSelectedSection(null)} />;
  }

  if (selectedSection === 'class2') {
    return <Class2ContentManagement theme={theme} onBack={() => setSelectedSection(null)} />;
  }

  return (
    <div className="screen-shell mx-auto max-w-5xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <div className="mb-8">
        <button
          onClick={() => onNavigate('superAdmin')}
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: theme.accentSoft }}
        >
          <ArrowLeft size={16} />
          Back to Control Center
        </button>
        <h1 className="text-3xl font-black text-primary-900 md:text-4xl">Content Management</h1>
        <p className="mt-2 text-sm text-primary-700">
          Manage Arabic learning content, quiz questions, and writing exercises for all classes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CMS_SECTIONS.map((section, index) => {
          const isClickable = section.key === 'class1' || section.key === 'class2';
          return (
            <button
              key={section.key}
              onClick={() => {
                if (isClickable) {
                  setSelectedSection(section.key);
                }
              }}
              disabled={!isClickable}
              className={`liquid-panel overflow-hidden rounded-[1.4rem] text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${isClickable ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
              style={{
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                animationDelay: `${index * 80}ms`,
              }}
            >
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: section.accent }}
                  >
                    {section.icon}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-primary-900">{section.title}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${isClickable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {isClickable ? 'Open' : 'Coming Soon'}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-primary-700">{section.description}</p>
              </div>
              <div
                className="border-t px-5 py-3 text-xs font-semibold text-primary-600"
                style={{ borderColor: theme.border, background: theme.accentSoft }}
              >
                {isClickable ? `Click to manage ${section.title.toLowerCase()}.` : 'Database connection and content editing coming soon.'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

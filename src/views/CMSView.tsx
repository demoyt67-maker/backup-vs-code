import { useState, useEffect, useRef } from 'react';
import type { View } from '@/types';
import { CLASS_THEMES } from '@/theme';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { SET1_TITLE, SET1_LEVELS, type LetterLevel } from '@/data/learningSets';
import { ARABIC_LETTERS } from '@/data/letters';

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
    description: 'Manage letters, words, and learning materials for Class 1.',
    icon: '📝',
    accent: 'linear-gradient(135deg, #ffb8c9 0%, #ffd678 50%, #7adbc4 100%)',
  },
  {
    key: 'class2',
    title: 'Class 2 Content',
    description: 'Manage letters, harakat, and practice materials for Class 2.',
    icon: '📖',
    accent: 'linear-gradient(135deg, #90b5ff 0%, #5e77ef 48%, #ffc57a 100%)',
  },
  {
    key: 'class3',
    title: 'Class 3 Content',
    description: 'Manage advanced practice, quizzes, and word activities for Class 3.',
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
      id: 'writing-practice',
      title: 'Writing Practice',
      description: `Trace all ${ARABIC_LETTERS.length} Arabic letters (Alif to Yaa)`,
    },
  ];
  return lessons;
}

const FALLBACK_LESSONS = buildClass1Lessons();

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

export function CMSView({ onNavigate, theme }: Props) {
  const [selectedSection, setSelectedSection] = useState<CMSSection | null>(null);

  if (selectedSection === 'class1') {
    return <Class1ContentManagement theme={theme} onBack={() => setSelectedSection(null)} />;
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
          const isClickable = section.key === 'class1';
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
                {isClickable ? 'Click to manage Class 1 content.' : 'Database connection and content editing coming soon.'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

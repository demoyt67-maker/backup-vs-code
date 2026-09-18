import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, X, Check } from 'lucide-react';
import { BackHeader } from '@/components/BackHeader';
import { CLASS_THEMES } from '@/theme';
import { getQuizQuestions, createQuizQuestion, updateQuizQuestion, deleteQuizQuestion, type QuizQuestion } from '@/lib/supabaseClient';
import type { View } from '@/types';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  onNavigate: (v: View) => void;
  theme: Theme;
}

type ClassLevel = 1 | 2 | 3;

const CLASS_LEVELS: ClassLevel[] = [1, 2, 3];

export function UstadQuizManager({ onNavigate, theme }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState<ClassLevel | ''>('');
  const [setFilter, setSetFilter] = useState<string>('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formClass, setFormClass] = useState<ClassLevel>(1);
  const [formSetId, setFormSetId] = useState<string>('1');
  const [formQuestionText, setFormQuestionText] = useState('');
  const [formMalayalamText, setFormMalayalamText] = useState('');
  const [formEnglishTransliteration, setFormEnglishTransliteration] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrect, setFormCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [saving, setSaving] = useState(false);

  const [deleteReason, setDeleteReason] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lastDeleted, setLastDeleted] = useState<QuizQuestion | null>(null);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await getQuizQuestions(classFilter || undefined, setFilter || undefined);
      if (error) throw error;
      setQuestions(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadQuestions();
  }, [classFilter, setFilter]);

  const openAdd = () => {
    setEditingId(null);
    setFormClass(classFilter === '' ? 1 : classFilter);
    setFormSetId(setFilter || '1');
    setFormQuestionText('');
    setFormMalayalamText('');
    setFormEnglishTransliteration('');
    setFormOptions(['', '', '', '']);
    setFormCorrect('A');
    setShowForm(true);
  };

  const openEdit = (q: QuizQuestion) => {
    setEditingId(q.id);
    setFormClass(q.class_level as ClassLevel);
    setFormSetId(q.set_id);
    setFormQuestionText(q.question_text);
    setFormMalayalamText(q.malayalam_text);
    setFormEnglishTransliteration(q.english_transliteration);
    setFormOptions([q.option_a, q.option_b, q.option_c, q.option_d]);
    setFormCorrect(q.correct_option);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formQuestionText.trim()) {
      setError('Question text is required');
      return;
    }

    if (!formSetId.trim() || !formMalayalamText.trim() || !formEnglishTransliteration.trim()) {
      setError('Set, Malayalam text, and English transliteration are required');
      return;
    }

    const options = formOptions.map((option) => option.trim());
    if (options.some((option) => !option)) {
      setError('All four options are required');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      class_level: formClass,
      set_id: formSetId.trim(),
      question_text: formQuestionText.trim(),
      malayalam_text: formMalayalamText.trim(),
      english_transliteration: formEnglishTransliteration.trim(),
      option_a: options[0],
      option_b: options[1],
      option_c: options[2],
      option_d: options[3],
      correct_option: formCorrect,
    };

    try {
      if (editingId) {
        console.log('[Quiz] handleSave update start editingId=', editingId, 'payload=', JSON.stringify(payload));
        const { error } = await updateQuizQuestion(editingId, payload);
        console.log('[Quiz] handleSave update result error=', JSON.stringify(error, null, 2));
        if (error) throw error;
      } else {
        const { error } = await createQuizQuestion(payload);
        if (error) throw error;
      }
      setShowForm(false);
      console.log('[Quiz] handleSave loadQuestions start');
      await loadQuestions();
      console.log('[Quiz] handleSave loadQuestions done');
    } catch (err) {
      console.error('[Quiz] handleSave catch err=', err);
      setError(err instanceof Error ? err.message : 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteReason('');
    setError(null);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    if (!deleteReason.trim()) {
      setError('Delete reason is required');
      return;
    }

    const question = questions.find((q) => q.id === deletingId) ?? null;
    setSaving(true);
    setError(null);
    const { error } = await deleteQuizQuestion(deletingId, deleteReason.trim());
    if (error) {
      setError(error.message || 'Failed to delete question');
      setSaving(false);
      return;
    }
    setLastDeleted(question);
    setDeletingId(null);
    setDeleteReason('');
    await loadQuestions();
    setSaving(false);
  };

  const handleUndoDelete = async () => {
    if (!lastDeleted) return;
    setSaving(true);
    setError(null);
    const { error } = await updateQuizQuestion(lastDeleted.id, {
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
      deletion_reason: null,
    } satisfies Partial<QuizQuestion>);
    if (error) {
      setError(error.message || 'Failed to undo delete');
      setSaving(false);
      return;
    }
    setLastDeleted(null);
    await loadQuestions();
    setSaving(false);
  };

  const filteredQuestions = questions;

  return (
    <div className="screen-shell mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Quiz Questions" onBack={() => onNavigate('ustadPanel')} theme={theme} />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {lastDeleted && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
          <span className="text-xs font-semibold text-yellow-900">Question deleted.</span>
          <button
            onClick={handleUndoDelete}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-yellow-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-yellow-700 disabled:opacity-70"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Undo'}
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-primary-700">Class</label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value === '' ? '' : Number(e.target.value) as ClassLevel)}
            className="rounded-xl border border-primary-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          >
            <option value="">All</option>
            {CLASS_LEVELS.map((l) => (
              <option key={l} value={l}>Class {l}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-primary-700">Set</label>
          <input
            type="text"
            value={setFilter}
            onChange={(e) => setSetFilter(e.target.value)}
            placeholder="All"
            className="w-20 rounded-xl border border-primary-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <button
          onClick={openAdd}
          className="ml-auto inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-primary-700"
        >
          <Plus size={16} />
          Add Question
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary-700" />
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="rounded-[1.4rem] border border-primary-100 bg-white p-6 text-center text-sm text-primary-700 shadow-sm">
          No quiz questions found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <div key={q.id} className="rounded-[1.4rem] border border-primary-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-700">
                      Class {q.class_level}
                    </span>
                    <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-600">
                      Set {q.set_id}
                    </span>
                  </div>
                  <p className="mt-3 text-base font-bold text-primary-900">{q.question_text}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {([q.option_a, q.option_b, q.option_c, q.option_d] as const).map((opt, idx) => (
                      <div
                        key={idx}
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                          String.fromCharCode(65 + idx) === q.correct_option
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-primary-100 bg-primary-50 text-primary-700'
                        }`}
                      >
                        {String.fromCharCode(65 + idx) === q.correct_option && <Check size={12} className="mr-1 inline" />}
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => openEdit(q)}
                    className="inline-flex items-center gap-1 rounded-xl border border-primary-200 bg-white px-3 py-2 text-xs font-bold text-primary-900 transition-all hover:bg-primary-50"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(q.id)}
                    className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 transition-all hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20">
          <div className="w-full max-w-lg max-h-[calc(100vh-6rem)] overflow-y-auto rounded-[1.4rem] border border-primary-100 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary-900">{editingId ? 'Edit Question' : 'Add Question'}</h3>
              <button onClick={() => setShowForm(false)} className="rounded-full p-1 text-primary-600 hover:bg-primary-50">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Class</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(Number(e.target.value) as ClassLevel)}
                    className="w-full rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  >
                    {CLASS_LEVELS.map((l) => (
                      <option key={l} value={l}>Class {l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Set</label>
                  <input
                    type="text"
                    value={formSetId}
                    onChange={(e) => setFormSetId(e.target.value)}
                    className="w-full rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Question</label>
                <textarea
                  value={formQuestionText}
                  onChange={(e) => setFormQuestionText(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  placeholder="Enter question text"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Malayalam Text</label>
                <textarea
                  value={formMalayalamText}
                  onChange={(e) => setFormMalayalamText(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  placeholder="Enter Malayalam text"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">English Transliteration</label>
                <input
                  type="text"
                  value={formEnglishTransliteration}
                  onChange={(e) => setFormEnglishTransliteration(e.target.value)}
                  className="w-full rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  placeholder="Enter English transliteration"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Options</label>
                <div className="space-y-2">
                  {formOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary-600 w-6">{idx + 1}.</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const next = [...formOptions];
                          next[idx] = e.target.value;
                          setFormOptions(next);
                        }}
                        className="flex-1 rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        placeholder={`Option ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-800">Correct Answer</label>
                <select
                  value={formCorrect}
                  onChange={(e) => setFormCorrect(e.target.value)}
                  className="w-full rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                >
                  {formOptions.map((opt, idx) => {
                    const optionKey = String.fromCharCode(65 + idx) as 'A' | 'B' | 'C' | 'D';
                    return (
                    <option key={idx} value={idx} disabled={!opt.trim()}>
                      {opt.trim() ? `Option ${idx + 1}: ${opt}` : `Option ${idx + 1} (empty)`}
                    </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-primary-200 px-4 py-2 text-xs font-bold text-primary-900 transition-all hover:bg-primary-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-primary-700 disabled:opacity-70"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {editingId ? 'Save Changes' : 'Add Question'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[1.4rem] border border-primary-100 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-primary-900">Delete Question</h3>
            <p className="mt-2 text-sm text-primary-700">Please provide a reason for deleting this question.</p>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={3}
              className="mt-3 w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="Delete reason"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setDeletingId(null); setDeleteReason(''); }}
                className="rounded-xl border border-primary-200 px-4 py-2 text-xs font-bold text-primary-900 transition-all hover:bg-primary-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-red-700 disabled:opacity-70"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

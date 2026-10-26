import { useState } from 'react';
import { validateStudentName } from '@/lib/studentNameValidation';

interface Props {
  onAccept: (name: string) => void;
}

export function StudentNamePrompt({ onAccept }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const trimmed = value.trim();
  const isValid = validateStudentName(trimmed).ok;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = validateStudentName(trimmed);
    if (!result.ok) {
      setError(result.error ?? 'Please enter your real name.');
      setSubmitting(false);
      return;
    }
    setError(null);
    onAccept(trimmed);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100/95 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
          Set Up Your Student Profile
        </h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          Please enter your real name to continue learning.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="student-name" className="mb-1 block text-sm font-semibold text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="student-name"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. Amina, അബ്ദുള്ള, أحمد"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full rounded-xl bg-primary-700 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Continue Learning'}
          </button>
        </form>
      </div>
    </div>
  );
}
